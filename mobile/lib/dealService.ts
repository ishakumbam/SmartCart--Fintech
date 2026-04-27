import { supabase } from '@/lib/supabase';
import { BuyProfileItem } from '@/lib/habitService';

export interface Deal {
  id:            string;
  item:          string;
  category:      string;
  originalPrice: number;
  dealPrice:     number;
  store:         string;
  storeLogo:     string;
  itemPhoto:     string;
  expiresAt:     string;
  affiliateUrl:  string;
  savingsPercent: number;
  frequencyScore: number;
  rankScore:     number;
  savings:       number;
}

// ── Mock deals data ────────────────────────────────────────
const MOCK_DEALS = [
  // Dairy
  { item: 'milk',              category: 'dairy',    store: 'Kroger',  original: 4.99,  deal: 3.49,  logo: '🏪' },
  { item: 'eggs',              category: 'dairy',    store: 'HEB',     original: 5.99,  deal: 3.99,  logo: '🏪' },
  { item: 'butter',            category: 'dairy',    store: 'Walmart', original: 5.49,  deal: 3.99,  logo: '🏪' },
  { item: 'yogurt',            category: 'dairy',    store: 'Kroger',  original: 1.99,  deal: 1.29,  logo: '🏪' },
  { item: 'cheese',            category: 'dairy',    store: 'Target',  original: 6.99,  deal: 4.99,  logo: '🏪' },
  { item: 'cream cheese',      category: 'dairy',    store: 'HEB',     original: 3.49,  deal: 2.49,  logo: '🏪' },
  // Produce
  { item: 'bananas',           category: 'produce',  store: 'Kroger',  original: 1.49,  deal: 0.89,  logo: '🏪' },
  { item: 'apples',            category: 'produce',  store: 'HEB',     original: 3.99,  deal: 2.49,  logo: '🏪' },
  { item: 'avocado',           category: 'produce',  store: 'Walmart', original: 1.49,  deal: 0.79,  logo: '🏪' },
  { item: 'spinach',           category: 'produce',  store: 'Target',  original: 3.99,  deal: 2.99,  logo: '🏪' },
  { item: 'tomatoes',          category: 'produce',  store: 'Kroger',  original: 2.99,  deal: 1.99,  logo: '🏪' },
  { item: 'broccoli',          category: 'produce',  store: 'HEB',     original: 2.49,  deal: 1.49,  logo: '🏪' },
  // Beverages
  { item: 'orange juice',      category: 'beverage', store: 'Kroger',  original: 5.99,  deal: 3.99,  logo: '🏪' },
  { item: 'water',             category: 'beverage', store: 'Walmart', original: 4.99,  deal: 2.99,  logo: '🏪' },
  { item: 'coffee',            category: 'beverage', store: 'Target',  original: 12.99, deal: 8.99,  logo: '🏪' },
  { item: 'soda',              category: 'beverage', store: 'HEB',     original: 6.99,  deal: 4.49,  logo: '🏪' },
  { item: 'coconut water',     category: 'beverage', store: 'Kroger',  original: 3.99,  deal: 2.49,  logo: '🏪' },
  // Snacks
  { item: 'chips',             category: 'snacks',   store: 'Walmart', original: 4.99,  deal: 2.99,  logo: '🏪' },
  { item: 'cheetos',           category: 'snacks',   store: 'HEB',     original: 4.99,  deal: 2.99,  logo: '🏪' },
  { item: 'doritos',           category: 'snacks',   store: 'Kroger',  original: 4.99,  deal: 2.99,  logo: '🏪' },
  { item: 'lays potato chips', category: 'snacks',   store: 'Target',  original: 4.99,  deal: 3.49,  logo: '🏪' },
  { item: 'cookies',           category: 'snacks',   store: 'Walmart', original: 3.99,  deal: 2.49,  logo: '🏪' },
  { item: 'crackers',          category: 'snacks',   store: 'HEB',     original: 3.49,  deal: 2.29,  logo: '🏪' },
  // Candy
  { item: 'chocolate',         category: 'candy',    store: 'Kroger',  original: 2.99,  deal: 1.99,  logo: '🏪' },
  { item: 'reeses',            category: 'candy',    store: 'Walmart', original: 1.99,  deal: 0.99,  logo: '🏪' },
  { item: 'hershey',           category: 'candy',    store: 'Target',  original: 1.99,  deal: 0.99,  logo: '🏪' },
  { item: 'skittles',          category: 'candy',    store: 'HEB',     original: 1.99,  deal: 1.29,  logo: '🏪' },
  // Frozen
  { item: 'pizza',             category: 'frozen',   store: 'Kroger',  original: 8.99,  deal: 5.99,  logo: '🏪' },
  { item: 'ice cream',         category: 'frozen',   store: 'HEB',     original: 5.99,  deal: 3.99,  logo: '🏪' },
  { item: 'frozen vegetables', category: 'frozen',   store: 'Walmart', original: 2.99,  deal: 1.79,  logo: '🏪' },
  // Meat
  { item: 'chicken',           category: 'meat',     store: 'Kroger',  original: 9.99,  deal: 6.99,  logo: '🏪' },
  { item: 'ground beef',       category: 'meat',     store: 'HEB',     original: 8.99,  deal: 5.99,  logo: '🏪' },
  { item: 'bacon',             category: 'meat',     store: 'Walmart', original: 7.99,  deal: 5.49,  logo: '🏪' },
  // Bread
  { item: 'bread',             category: 'bakery',   store: 'Kroger',  original: 3.99,  deal: 2.49,  logo: '🏪' },
  { item: 'tortillas',         category: 'bakery',   store: 'HEB',     original: 3.49,  deal: 2.29,  logo: '🏪' },
  // Pantry
  { item: 'sugar',             category: 'pantry',   store: 'Walmart', original: 4.99,  deal: 3.49,  logo: '🏪' },
  { item: 'flour',             category: 'pantry',   store: 'Kroger',  original: 3.99,  deal: 2.99,  logo: '🏪' },
  { item: 'rice',              category: 'pantry',   store: 'HEB',     original: 5.99,  deal: 3.99,  logo: '🏪' },
  { item: 'pasta',             category: 'pantry',   store: 'Target',  original: 2.49,  deal: 1.49,  logo: '🏪' },
  { item: 'olive oil',         category: 'pantry',   store: 'Kroger',  original: 8.99,  deal: 5.99,  logo: '🏪' },
  { item: 'condensed milk',    category: 'dairy',    store: 'Walmart', original: 2.99,  deal: 1.99,  logo: '🏪' },
  { item: 'evaporated milk',   category: 'dairy',    store: 'HEB',     original: 2.49,  deal: 1.69,  logo: '🏪' },
];

// ── Seed deals into Supabase ───────────────────────────────
export async function seedDeals() {
  const { count } = await supabase
    .from('deals')
    .select('*', { count: 'exact', head: true });

  if (count && count > 0) return; // already seeded

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  const deals = MOCK_DEALS.map(d => ({
    item:           d.item,
    category:       d.category,
    original_price: d.original,
    deal_price:     d.deal,
    store:          d.store,
    store_logo:     d.logo,
    location_lat:   33.0198,  // Plano, TX
    location_lng:  -96.6989,
    expires_at:     expiresAt.toISOString(),
    affiliate_url:  `https://www.kroger.com/search?query=${encodeURIComponent(d.item)}`,
    partner_id:     'mock',
  }));

  await supabase.from('deals').insert(deals);
}

// ── Get personalized deal feed ─────────────────────────────
export async function getPersonalizedDeals(
  userId:  string,
  profile: BuyProfileItem[],
  limit:   number = 20,
): Promise<Deal[]> {
  // Seed deals if needed
  await seedDeals();

  // Get all available deals
  const { data: deals, error } = await supabase
    .from('deals')
    .select('*')
    .gt('expires_at', new Date().toISOString())
    .limit(100);

  if (error || !deals) return [];

  // Build a map of user's items for quick lookup
  const profileMap = new Map<string, number>();
  for (const p of profile) {
    profileMap.set(p.item.toLowerCase(), p.frequencyScore);
    // Also match partial names
    const words = p.item.toLowerCase().split(' ');
    for (const word of words) {
      if (word.length > 3) {
        profileMap.set(word, Math.max(profileMap.get(word) ?? 0, p.frequencyScore * 0.7));
      }
    }
  }

  // Score and rank deals
  const scoredDeals = deals.map(deal => {
    const savingsAmount  = deal.original_price - deal.deal_price;
    const savingsPercent = (savingsAmount / deal.original_price) * 100;

    // Match deal to user's profile
    const dealItem     = deal.item.toLowerCase();
    let frequencyScore = 0;

    // Exact match
    if (profileMap.has(dealItem)) {
      frequencyScore = profileMap.get(dealItem) ?? 0;
    } else {
      // Partial match
      for (const [profileItem, score] of profileMap.entries()) {
        if (dealItem.includes(profileItem) || profileItem.includes(dealItem)) {
          frequencyScore = Math.max(frequencyScore, score * 0.8);
        }
      }
    }

    // Rank score: 60% savings, 40% frequency
    const rankScore = (savingsPercent / 100) * 0.6 + frequencyScore * 0.4;

    return {
      id:            deal.id,
      item:          deal.item,
      category:      deal.category,
      originalPrice: deal.original_price,
      dealPrice:     deal.deal_price,
      store:         deal.store,
      storeLogo:     deal.store_logo ?? '🏪',
      itemPhoto:     deal.item_photo ?? '',
      expiresAt:     deal.expires_at,
      affiliateUrl:  deal.affiliate_url,
      savingsPercent: Math.round(savingsPercent),
      frequencyScore: Math.round(frequencyScore * 100) / 100,
      rankScore:     Math.round(rankScore * 100) / 100,
      savings:       Math.round(savingsAmount * 100) / 100,
    };
  });

  // Sort by rank score — personalized items first
  return scoredDeals
    .sort((a, b) => b.rankScore - a.rankScore)
    .slice(0, limit);
}

// ── Log a deal click ───────────────────────────────────────
export async function logDealClick(userId: string, dealId: string) {
  await supabase
    .from('deal_clicks')
    .insert({ user_id: userId, deal_id: dealId });
}