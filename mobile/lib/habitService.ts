import { supabase } from '@/lib/supabase';

export interface BuyProfileItem {
  id:               string;
  item:             string;
  category:         string;
  purchaseCount:    number;
  avgFrequencyDays: number;
  lastPurchasedAt:  string;
  frequencyScore:   number;
}

// ── Update buy profile after a receipt is saved ────────────
export async function updateBuyProfile(userId: string, receiptId: string) {
  // Get items from this receipt
  const { data: items, error } = await supabase
    .from('receipt_items')
    .select('*')
    .eq('receipt_id', receiptId);

  if (error || !items) return;

  for (const item of items) {
    const name = item.normalized_name?.toLowerCase().trim();
    if (!name) continue;

    // Check if item exists in buy profile
    const { data: existing } = await supabase
      .from('user_buy_profile')
      .select('*')
      .eq('user_id', userId)
      .eq('item', name)
      .single();

    if (existing) {
      // Update existing profile entry
      const daysSinceLast = existing.last_purchased_at
        ? Math.floor(
            (Date.now() - new Date(existing.last_purchased_at).getTime()) /
            (1000 * 60 * 60 * 24)
          )
        : 30;

      const newAvgFrequency = Math.round(
        (existing.avg_frequency_days * existing.purchase_count + daysSinceLast) /
        (existing.purchase_count + 1)
      );

      await supabase
        .from('user_buy_profile')
        .update({
          purchase_count:     existing.purchase_count + 1,
          avg_frequency_days: newAvgFrequency,
          last_purchased_at:  new Date().toISOString(),
        })
        .eq('id', existing.id);
    } else {
      // Create new profile entry
      await supabase
        .from('user_buy_profile')
        .insert({
          user_id:            userId,
          item:               name,
          category:           item.category ?? 'general',
          purchase_count:     1,
          avg_frequency_days: 14,
          last_purchased_at:  new Date().toISOString(),
        });
    }
  }
}

// ── Get user's buy profile sorted by frequency ────────────
export async function getBuyProfile(userId: string): Promise<BuyProfileItem[]> {
  const { data, error } = await supabase
    .from('user_buy_profile')
    .select('*')
    .eq('user_id', userId)
    .order('purchase_count', { ascending: false })
    .limit(50);

  if (error || !data) return [];

  return data.map(item => ({
    id:               item.id,
    item:             item.item,
    category:         item.category,
    purchaseCount:    item.purchase_count,
    avgFrequencyDays: item.avg_frequency_days,
    lastPurchasedAt:  item.last_purchased_at,
    frequencyScore:   calculateFrequencyScore(item),
  }));
}

// ── Calculate how likely user needs this item now ─────────
function calculateFrequencyScore(item: any): number {
  if (!item.last_purchased_at) return 0.5;

  const daysSinceLast = Math.floor(
    (Date.now() - new Date(item.last_purchased_at).getTime()) /
    (1000 * 60 * 60 * 24)
  );

  const avgFreq = item.avg_frequency_days || 14;
  const score   = Math.min(daysSinceLast / avgFreq, 1.0);
  return Math.round(score * 100) / 100;
}

// ── Get items predicted to run out soon ───────────────────
export async function getPredictions(userId: string): Promise<BuyProfileItem[]> {
  const profile = await getBuyProfile(userId);
  return profile
    .filter(item => item.frequencyScore >= 0.7)
    .slice(0, 10);
}