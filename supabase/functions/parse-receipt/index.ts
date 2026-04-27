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

    const OCR_API_KEY  = Deno.env.get('OCR_SPACE_API_KEY');
    const GROQ_API_KEY = Deno.env.get('GROQ_API_KEY');

    // ── Step 1: OCR with OCR.space ─────────────────────
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

    console.log('OCR TEXT:', fullText);

    if (!fullText) throw new Error('Could not read receipt text');

    // ── Step 2: Parse with Groq AI ─────────────────────
    const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method:  'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type':  'application/json',
      },
      body: JSON.stringify({
        model:       'llama-3.1-8b-instant',
        temperature: 0.1,
        max_tokens:  2048,
        messages: [
          {
            role:    'system',
            content: `You are a receipt parser. Extract structured data from receipt text and return ONLY valid JSON with no markdown, no explanation, no backticks.

Return this exact structure:
{
  "storeName": "store name",
  "purchaseDate": "YYYY-MM-DD",
  "total": 0.00,
  "items": [
    { "rawName": "item name", "quantity": 1, "unitPrice": 0.00 }
  ]
}

Rules:
- storeName: the store or restaurant name
- purchaseDate: in YYYY-MM-DD format, use today if not found
- total: the final amount paid (grand total, balance, payment amount)
- items: only real purchased products with prices greater than 0
- EXCLUDE: tax lines, subtotal lines, discount/savings lines, change due, payment method info, store address, cashier info, loyalty points, member savings
- quantity: number of units purchased (default 1)
- unitPrice: price per unit
- Return ONLY the JSON object, nothing else`,
          },
          {
            role:    'user',
            content: `Parse this receipt:\n\n${fullText}`,
          },
        ],
      }),
    });

    const groqData  = await groqResponse.json();
    console.log('GROQ RESPONSE:', JSON.stringify(groqData));

    const rawOutput = groqData.choices?.[0]?.message?.content ?? '';
    console.log('RAW OUTPUT:', rawOutput);

    // Clean and parse JSON
    const cleanJson = rawOutput
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();

    let parsed;
    try {
      parsed = JSON.parse(cleanJson);
    } catch {
      console.error('JSON parse error:', cleanJson);
      throw new Error('Failed to parse AI response');
    }

    // Validate and clean
    if (!parsed.items)        parsed.items        = [];
    if (!parsed.storeName)    parsed.storeName    = 'Unknown Store';
    if (!parsed.purchaseDate) parsed.purchaseDate = new Date().toISOString().split('T')[0];
    if (!parsed.total)        parsed.total        = 0;

    parsed.items = parsed.items
      .filter((item: any) => item.rawName && item.rawName.length > 1)
      .map((item: any) => ({
        rawName:   String(item.rawName),
        quantity:  Number(item.quantity)  || 1,
        unitPrice: Number(item.unitPrice) || 0,
      }));

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