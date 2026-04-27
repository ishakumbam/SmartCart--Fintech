import { supabase } from '@/lib/supabase';
import { BuyProfileItem } from '@/lib/habitService';

export interface Deal {
  id:             string;
  item:           string;
  category:       string;
  originalPrice:  number;
  dealPrice:      number;
  store:          string;
  storeLogo:      string;
  itemPhoto:      string;
  expiresAt:      string;
  affiliateUrl:   string;
  savingsPercent: number;
  frequencyScore: number;
  rankScore:      number;
  savings:        number;
}

const MOCK_DEALS = [
  { item: 'milk',              category: 'dairy',    store: 'Kroger',  original: 4.99,  deal: 3.49 },
  { item: 'eggs',              category: 'dairy',    store: 'HEB',     original: 5.99,  deal: 3.99 },
  { item: 'butter',            category: 'dairy',    store: 'Walmart', original: 5.49,  deal: 3.99 },
  { item: 'yogurt',            category: 'dairy',    store: 'Kroger',  original: 1.99,  deal: 1.29 },
  { item: 'cheese',            category: 'dairy',    store: 'Target',  original: 6.99,  deal: 4.99 },
  { item: 'condensed milk',    category: 'dairy',    store: 'Walmart', original: 2.99,  deal: 1.99 },
  { item: 'evaporated milk',   category: 'dairy',    store: 'HEB',     original: 2.49,  deal: 1.69 },
  { item: 'bananas',           category: 'produce',  store: 'Kroger',  original: 1.49,  deal: 0.89 },
  { item: 'apples',            category: 'produce',  store: 'HEB',     original: 3.99,  deal: 2.49 },
  { item: 'avocado',           category: 'produce',  store: 'Walmart', original: 1.49,  deal: 0.79 },
  { item: 'spinach',           category: 'produce',  store: 'Target',  original: 3.99,  deal: 2.99 },
  { item: 'orange juice',      category: 'beverage', store: 'Kroger',  original: 5.99,  deal: 3.99 },
  { item: 'water',             category: 'beverage', store: 'Walmart', original: 4.99,  deal: 2.99 },
  { item: 'coconut water',     category: 'beverage', store: 'Kroger',  original: 3.99,  deal: 2.49 },
  { item: 'coffee',            category: 'beverage', store: 'Target',  original: 12.99, deal: 8.99 },
  { item: 'chips',             category: 'snacks',   store: 'Walmart', original: 4.99,  deal: 2.99 },
  { item: 'cheetos',           category: 'snacks',   store: 'HEB',     original: 4.99,  deal: 2.99 },
  { item: 'doritos',           category: 'snacks',   store: 'Kroger',  original: 4.99,  deal: 2.99 },
  { item: 'lays potato chips', category: 'snacks',   store: 'Target',  original: 4.99,  deal: 3.49 },
  { item: 'cookies',           category: 'snacks',   store: 'Walmart', original: 3.99,  deal: 2.49 },
  { item: 'chocolate',         category: 'candy',    store: 'Kroger',  original: 2.99,  deal: 1.99 },
  { item: 'reeses',            category: 'candy',    store: 'Walmart', original: 1.99,  deal: 0.99 },
  { item: 'hershey',           category: 'candy',    store: 'Target',  original: 1.99,  deal: 0.99 },
  { item: 'pizza',             category: 'frozen',   store: 'Kroger',  original: 8.99,  deal: 5.99 },
  { item: 'ice cream',         category: 'frozen',   store: 'HEB',     original: 5.99,  deal: 3.99 },
  { item: 'chicken',           category: 'meat',     store: 'Kroger',  original: 9.99,  deal: 6.99 },
  { item: 'ground beef',       category: 'meat',     store: 'HEB',     original: 8.99,  deal: 5.99 },
  { item: 'bread',             category: 'bakery',   store: 'Kroger',  original: 3.99,  deal: 2.49 },
  { item: 'sugar',             category: 'pantry',   store: 'Walmart', original: 4.99,  deal: 3.49 },
  { item: 'rice',              category: 'pantry',   store: 'HEB',     original: 5.99,  deal: 3.99 },
];

export async function seedDeals() {
  const { count } = await supabase
    .from('deals')
    .select('*', { count: 'exact', head: true });

  if (count && count > 0) return;

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  const deals = MOCK_DEALS.map(d => ({
    item:           d.item,
    category:       d.category,
    original_price: d.original,
    deal_price:     d.deal,
    store:          d.store,
    store_logo:     '🏪',
    location_lat:   33.0198,
    location_lng:  -96.6989,
    expires_at:     expiresAt.toISOString(),
    affiliate_url:  `https://www.kroger.com/search?query=${encodeURIComponent(d.item)}`,
    partner_id:     'mock',
  }));

  await supabase.from('deals').insert(deals);
}

export async function getPersonalizedDeals(
  userId:      string,
  profile:     BuyProfileItem[],
  limit:       number = 20,
  radiusMiles: number = 10,
): Promise<Deal[]> {
  await seedDeals();

  const { data: userProfile } = await supabase
    .from('profiles')
    .select('location_lat, location_lng')
    .eq('id', userId)
    .single();

  const userLat = userProfile?.location_lat;
  const userLng = userProfile?.location_lng;

  const { data: deals, error } = await supabase
    .from('deals')
    .select('*')
    .gt('expires_at', new Date().toISOString())
    .limit(100);

  if (error || !deals) return [];

  // Build keyword map
  const keywordScoreMap  = new Map<string, number>();
  const categoryScoreMap = new Map<string, number>();

  for (const p of profile) {
    const score     = Math.max(p.frequencyScore, 0.1);
    const itemLower = p.item.toLowerCase();
    const category  = p.category?.toLowerCase();

    // Full item name
    keywordScoreMap.set(itemLower, score);

    // All words 3+ chars
    const words = itemLower.split(/\s+/);
    for (const word of words) {
      if (word.length >= 3) {
        keywordScoreMap.set(word, Math.max(keywordScoreMap.get(word) ?? 0, score));
      }
    }

    // Category
    if (category) {
      categoryScoreMap.set(category, Math.max(categoryScoreMap.get(category) ?? 0, score));
    }
  }

  console.log('PROFILE KEYWORDS:', Array.from(keywordScoreMap.keys()).join(', '));

  const scoredDeals = deals
    .filter(deal => {
      if (userLat && userLng && deal.location_lat && deal.location_lng) {
        const distance = getDistanceMiles(
          userLat, userLng,
          deal.location_lat, deal.location_lng,
        );
        return distance <= radiusMiles;
      }
      return true;
    })
    .map(deal => {
      const savingsAmount  = deal.original_price - deal.deal_price;
      const savingsPercent = (savingsAmount / deal.original_price) * 100;
      const dealItem       = deal.item.toLowerCase();
      const dealCategory   = deal.category?.toLowerCase();
      let nameScore        = 0;

      // 1. Exact match
      if (keywordScoreMap.has(dealItem)) {
        nameScore = keywordScoreMap.get(dealItem) ?? 0;
      }

      // 2. Word match
      if (nameScore === 0) {
        const dealWords = dealItem.split(/\s+/);
        for (const word of dealWords) {
          if (word.length >= 3 && keywordScoreMap.has(word)) {
            nameScore = Math.max(nameScore, (keywordScoreMap.get(word) ?? 0) * 0.9);
          }
        }
      }

      // 3. Substring match
      if (nameScore === 0) {
        for (const [keyword, score] of keywordScoreMap.entries()) {
          if (keyword.length >= 4 && (dealItem.includes(keyword) || keyword.includes(dealItem))) {
            nameScore = Math.max(nameScore, score * 0.6);
          }
        }
      }

      // Category boost (ranking only)
      let categoryScore = 0;
      if (dealCategory && categoryScoreMap.has(dealCategory)) {
        categoryScore = (categoryScoreMap.get(dealCategory) ?? 0) * 0.2;
      }

      const frequencyScore = nameScore;
      const rankScore      = (savingsPercent / 100) * 0.6 + (nameScore + categoryScore) * 0.4;

      if (nameScore > 0) {
        console.log(`MATCH: deal="${dealItem}" score=${nameScore.toFixed(2)}`);
      }

      return {
        id:             deal.id,
        item:           deal.item,
        category:       deal.category,
        originalPrice:  deal.original_price,
        dealPrice:      deal.deal_price,
        store:          deal.store,
        storeLogo:      deal.store_logo ?? '🏪',
        itemPhoto:      deal.item_photo ?? '',
        expiresAt:      deal.expires_at,
        affiliateUrl:   deal.affiliate_url,
        savingsPercent: Math.round(savingsPercent),
        frequencyScore: Math.round(frequencyScore * 100) / 100,
        rankScore:      Math.round(rankScore * 100) / 100,
        savings:        Math.round(savingsAmount * 100) / 100,
      };
    });

  console.log('FOR YOU COUNT:', scoredDeals.filter(d => d.frequencyScore > 0).length);
  console.log('OTHER COUNT:', scoredDeals.filter(d => d.frequencyScore === 0).length);

  const personalizedDeals = scoredDeals
    .filter(d => d.frequencyScore > 0)
    .sort((a, b) => b.rankScore - a.rankScore);

  const generalDeals = scoredDeals
    .filter(d => d.frequencyScore === 0)
    .sort((a, b) => b.savingsPercent - a.savingsPercent);

    return [...personalizedDeals, ...generalDeals].slice(0, 50);
}

function getDistanceMiles(
  lat1: number, lng1: number,
  lat2: number, lng2: number,
): number {
  const R    = 3958.8;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a    =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}

export async function logDealClick(userId: string, dealId: string) {
  await supabase
    .from('deal_clicks')
    .insert({ user_id: userId, deal_id: dealId });
}