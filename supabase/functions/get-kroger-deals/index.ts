import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function getKrogerToken(clientId: string, clientSecret: string): Promise<string> {
  const credentials = btoa(`${clientId}:${clientSecret}`);
  const response    = await fetch('https://api.kroger.com/v1/connect/oauth2/token', {
    method:  'POST',
    headers: {
      'Authorization': `Basic ${credentials}`,
      'Content-Type':  'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials&scope=product.compact',
  });

  const data = await response.json();
  console.log('TOKEN RESPONSE:', JSON.stringify(data));
  if (!data.access_token) throw new Error('Failed to get Kroger token');
  return data.access_token;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { term, locationId } = await req.json();
    if (!term) throw new Error('No search term provided');

    const CLIENT_ID     = Deno.env.get('KROGER_CLIENT_ID');
    const CLIENT_SECRET = Deno.env.get('KROGER_CLIENT_SECRET');

    console.log('CLIENT_ID:', CLIENT_ID?.slice(0, 10) + '...');
    console.log('CLIENT_SECRET exists:', !!CLIENT_SECRET);

    if (!CLIENT_ID || !CLIENT_SECRET) throw new Error('Kroger credentials not set');

    // Get access token
    const token = await getKrogerToken(CLIENT_ID, CLIENT_SECRET);

    // Search for products
    const params = new URLSearchParams({
      'filter.term':  term,
      'filter.limit': '5',
    });

    if (locationId) {
      params.append('filter.locationId', locationId);
    }

    const response = await fetch(
      `https://api.kroger.com/v1/products?${params.toString()}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept':        'application/json',
        },
      }
    );

    const data = await response.json();
    console.log('KROGER RESPONSE:', JSON.stringify(data).slice(0, 500));

    const products = data.data ?? [];

    const deals = products
      .filter((p: any) => p.items?.[0]?.price)
      .map((p: any) => {
        const item       = p.items?.[0];
        const price      = item?.price;
        const regular    = price?.regular ?? 0;
        const promo      = price?.promo ?? regular;
        const savings    = regular - promo;
        const savingsPct = regular > 0 ? Math.round((savings / regular) * 100) : 0;

        return {
          item:           p.description?.toLowerCase() ?? term,
          category:       'general',
          originalPrice:  regular,
          dealPrice:      promo > 0 ? promo : regular,
          store:          'Kroger',
          savingsPercent: savingsPct,
          savings:        savings,
          imageUrl:       p.images?.[0]?.sizes?.[0]?.url ?? null,
          affiliateUrl:   `https://www.kroger.com/p/${p.description?.toLowerCase().replace(/\s+/g, '-')}/${p.productId}`,
        };
      })
      .filter((d: any) => d.originalPrice > 0);

    return new Response(JSON.stringify({ deals }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message, deals: [] }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});