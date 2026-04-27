import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { imageBase64 } = await req.json();
    if (!imageBase64) throw new Error('No image provided');

    const OCR_API_KEY = Deno.env.get('OCR_SPACE_API_KEY');

    const formData = new FormData();
    formData.append('base64Image',       `data:image/jpeg;base64,${imageBase64}`);
    formData.append('language',          'eng');
    formData.append('isOverlayRequired', 'false');
    formData.append('detectOrientation', 'true');
    formData.append('scale',             'true');
    formData.append('OCREngine',         '2');

    const ocrResponse = await fetch('https://api.ocr.space/parse/image', {
      method:  'POST',
      headers: { 'apikey': OCR_API_KEY ?? '' },
      body:    formData,
    });

    const ocrData  = await ocrResponse.json();
    const fullText = ocrData.ParsedResults?.[0]?.ParsedText ?? '';

    console.log('FULL TEXT:', fullText);

    const parsed = parseReceiptText(fullText);
    console.log('PARSED ITEMS:', parsed.items.length);

    return new Response(JSON.stringify({ ...parsed, _rawText: fullText }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function extractPrice(str: string): number | null {
  const match = str.match(/\$?(\d+[\.,]\d{2})/);
  if (!match) return null;
  const val = parseFloat(match[1].replace(',', '.'));
  return val > 0 && val < 500 ? val : null;
}

function isOnlyPrice(line: string): boolean {
  return /^\$?\d+[\.,]\d{2}\s*[SBTsbt01$]?\s*$/.test(line.trim());
}

function isSkipLine(line: string): boolean {
  return (
    /\(\d{3}\)\s*\d{3}/.test(line) ||
    /\d+\s+[A-Z].*\s+(DRIVE|DR|STREET|ST|AVE|BLVD|ROAD|RD|WAY|LN|COURT|CT|PKWY)/i.test(line) ||
    /[A-Z]{2,}\s+[A-Z]{2}\s+\d{5}/.test(line) ||
    /^store\s+\d+/i.test(line) ||
    /cashier|manager|dir |rx:/i.test(line) ||
    /^\d{7,}$/.test(line) ||
    /^(price|prics|you pay|grocery|refrig|frozen|baked goods|produce|deli|meat|bakery|seafood|beverage|additional|for [ui] store|coupon)$/i.test(line) ||
    /card #|ref:|auth:|payment|debit|credit purchase|visa|master|aid |tvr |change|subtotal|coupon|saving|discount|member|for u |for i /i.test(line) ||
    /thank|welcome|survey|transaction|^\*+/.test(line)
  );
}

function isItemName(line: string): boolean {
  if (line.length < 3 || line.length > 50) return false;
  if (isOnlyPrice(line)) return false;
  if (isSkipLine(line)) return false;
  if (!/[a-zA-Z]/.test(line)) return false;
  if ((line.match(/\d/g) ?? []).length > line.length * 0.6) return false;
  return true;
}

function cleanName(name: string): string {
  return name
    .replace(/^\d{5,}\s*/, '')
    .replace(/^\d+[a-zA-Z]?\s+/, '')
    .replace(/^[#*@\-D0O]+\s+/, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

function parseReceiptText(text: string) {
  const lines = text.split('\n').map((l: string) => l.trim()).filter(Boolean);

  // ── Store name ────────────────────────────────────────
  const knownStores = /walmart|kroger|tom thumb|safeway|costco|target|whole foods|trader joe|aldi|publix|heb|meijer|cvs|walgreens|sprouts|food lion|giant|wegmans|winco|ralphs|vons|stater|harris teeter|winn.dixie|shoprite|market basket|mcdonald|burger king|taco bell|wendy|chick.fil|subway|chipotle|panera|starbucks|dunkin|sonic|whataburger|popeyes|olive garden|applebee|chili|denny|ihop/i;
  const storeLine   = lines.find(l => knownStores.test(l));
  const storeName   = storeLine ?? 'Unknown Store';

  // ── Date ─────────────────────────────────────────────
  let purchaseDate = new Date().toISOString().split('T')[0];
  const dateMatch  = text.match(/(\d{1,2}\/\d{1,2}\/\d{2,4})/);
  if (dateMatch) {
    try {
      const d = new Date(dateMatch[1]);
      if (!isNaN(d.getTime())) purchaseDate = d.toISOString().split('T')[0];
    } catch { /* skip */ }
  }

  // ── Total ─────────────────────────────────────────────
  let total = 0;
  const totalPatterns = [
    /payment[-\s]*am[o0]unt[:\s]*\$?\s*(\d+[\.,]\d{2})/i,
    /(?:grand\s+total|total\s+due|amount\s+due)[:\s]*\$?\s*(\d+[\.,]\d{2})/i,
    /\*+\s*balance[\s\S]{0,10}?(\d+[\.,]\d{2})/i,
  ];
  for (const pattern of totalPatterns) {
    const match = text.match(pattern);
    if (match) { total = parseFloat(match[1].replace(',', '.')); break; }
  }

  const items: Array<{ rawName: string; quantity: number; unitPrice: number }> = [];
  const seen = new Set<string>();

  // ── Find item names section ───────────────────────────
  // Items start after GROCERY/cashier header
  let itemStartIdx = 0;
  for (let i = 0; i < lines.length; i++) {
    if (/^grocery$/i.test(lines[i]) || /cashier/i.test(lines[i])) {
      itemStartIdx = i + 1;
      break;
    }
  }

  // Items end when we hit credit card / payment section
  let itemEndIdx = lines.length;
  for (let i = itemStartIdx; i < lines.length; i++) {
    if (/credit purchase|payment am[o0]unt|card #|al us debit/i.test(lines[i])) {
      itemEndIdx = i;
      break;
    }
  }

  const fullSection = lines.slice(itemStartIdx, itemEndIdx);

  // ── Find Price column header ──────────────────────────
  const priceHeaderIdx = fullSection.findIndex(l => /^pric[e]?[s]?$/i.test(l));
  const youPayIdx      = fullSection.findIndex(l => /^you\s*pay$/i.test(l));

  // Names are before "Price" header
  const nameEndIdx = priceHeaderIdx > 0 ? priceHeaderIdx : fullSection.length;

  // Prices are between "Price" header and "You Pay"
  const priceStartIdx = priceHeaderIdx > 0 ? priceHeaderIdx + 1 : -1;
  const priceEndIdx   = youPayIdx > priceStartIdx ? youPayIdx : fullSection.length;

  // ── Collect item names ────────────────────────────────
  const itemNames: string[] = [];
  for (let i = 0; i < nameEndIdx; i++) {
    const cleaned = cleanName(fullSection[i]);
    if (isItemName(cleaned)) {
      itemNames.push(cleaned);
    }
  }

  // ── Collect prices from Price column ─────────────────
  const priceValues: number[] = [];
  if (priceStartIdx > 0) {
    for (let i = priceStartIdx; i < priceEndIdx; i++) {
      const line = fullSection[i];
      if (/tax|subtotal|coupon|saving|balance|additional/i.test(line)) continue;
      if (isOnlyPrice(line)) {
        const price = extractPrice(line);
        if (price) priceValues.push(price);
      }
    }
  }

  // ── If no Price column found, try You Pay column ──────
  if (priceValues.length === 0 && youPayIdx > 0) {
    for (let i = youPayIdx + 1; i < fullSection.length; i++) {
      const line = fullSection[i];
      if (/change|total|subtotal|tax|payment/i.test(line)) continue;
      const priceMatch = line.match(/^(\d+[\.,]\d{2})\s*[SBTsbt01$]?\s*$/);
      if (priceMatch) {
        const price = parseFloat(priceMatch[1].replace(',', '.'));
        if (price > 0 && price < 500) priceValues.push(price);
      }
    }
  }

  // ── Pair names with prices ────────────────────────────
  if (itemNames.length > 0 && priceValues.length > 0) {
    const pairCount = Math.min(itemNames.length, priceValues.length);
    for (let i = 0; i < pairCount; i++) {
      const name  = itemNames[i];
      const price = priceValues[i];
      if (!seen.has(name) && price > 0 && price < 500) {
        items.push({ rawName: name, quantity: 1, unitPrice: price });
        seen.add(name);
      }
    }
  }

  // ── Fallback: inline prices ───────────────────────────
  if (items.length < 3) {
    for (const line of fullSection) {
      if (isSkipLine(line)) continue;
      const match = line.match(/^(.{2,45}?)\s{2,}\$?(\d+[\.,]\d{2})\s*[SBTsbt01]?\s*$/);
      if (match) {
        const name  = cleanName(match[1]);
        const price = parseFloat(match[2].replace(',', '.'));
        if (name.length > 1 && price > 0 && price < 500 && isItemName(name) && !seen.has(name)) {
          items.push({ rawName: name, quantity: 1, unitPrice: price });
          seen.add(name);
        }
      }
    }
  }

  return { storeName, purchaseDate, total, items };
}