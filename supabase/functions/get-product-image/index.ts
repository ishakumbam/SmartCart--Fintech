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
    const { query } = await req.json();
    if (!query) throw new Error('No query provided');

    // Try Open Food Facts first — real product images, free, no key needed
    const searchUrl = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(query)}&search_simple=1&action=process&json=1&page_size=5&fields=product_name,image_url,image_front_url`;

    const response = await fetch(searchUrl, {
      headers: { 'User-Agent': 'SmartCart/1.0 (smartcart@example.com)' },
    });

    const data = await response.json();
    console.log('OPEN FOOD FACTS results:', data.products?.length ?? 0);

    // Find first product with a real image
    let imageUrl = null;
    if (data.products && data.products.length > 0) {
      for (const product of data.products) {
        const img = product.image_front_url || product.image_url;
        if (img && img.startsWith('https://')) {
          imageUrl = img;
          break;
        }
      }
    }

    // Fallback to Google Custom Search if no Open Food Facts result
    if (!imageUrl) {
      const API_KEY   = Deno.env.get('GOOGLE_SEARCH_API_KEY');
      const ENGINE_ID = Deno.env.get('GOOGLE_SEARCH_ENGINE_ID');
      const googleUrl = `https://www.googleapis.com/customsearch/v1?key=${API_KEY}&cx=${ENGINE_ID}&q=${encodeURIComponent(query + ' product')}&searchType=image&num=1&imgSize=medium&imgType=photo&safe=active`;

      const googleRes  = await fetch(googleUrl);
      const googleData = await googleRes.json();
      imageUrl = googleData.items?.[0]?.link ?? null;
    }

    console.log('FINAL IMAGE URL:', imageUrl);

    return new Response(JSON.stringify({ imageUrl }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message, imageUrl: null }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});