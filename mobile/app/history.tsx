import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeScreen } from '@/components/ui/SafeScreen';
import { useAuthStore } from '@/store/authStore';
import { useTheme } from '@/hooks/useTheme';
import { supabase } from '@/lib/supabase';
import { Typography, Palette } from '@/constants/theme';

interface Receipt {
  id:            string;
  store_name:    string;
  purchase_date: string;
  total:         number;
  image_url:     string;
  created_at:    string;
  item_count?:   number;
}

function ReceiptRow({ receipt, onPress }: { receipt: Receipt; onPress: () => void }) {
  const { theme } = useTheme();
  const date = new Date(receipt.purchase_date).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });

  return (
    <TouchableOpacity
      style={[styles.receiptRow, { borderBottomColor: `${theme.border}33` }]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={[styles.receiptIcon, { backgroundColor: `${Palette.moss500}12`, borderColor: `${Palette.moss500}20` }]}>
        <Text style={{ fontSize: 22 }}>🧾</Text>
      </View>
      <View style={styles.receiptInfo}>
        <Text style={[styles.receiptStore, { color: theme.textPrimary }]} numberOfLines={1}>
          {receipt.store_name ?? 'Unknown Store'}
        </Text>
        <Text style={[styles.receiptDate, { color: theme.textMuted }]}>{date}</Text>
        {receipt.item_count !== undefined && (
          <Text style={[styles.receiptItems, { color: Palette.moss500 }]}>
            {receipt.item_count} items
          </Text>
        )}
      </View>
      <View style={styles.receiptRight}>
        <Text style={[styles.receiptTotal, { color: theme.textPrimary }]}>
          ${receipt.total?.toFixed(2) ?? '0.00'}
        </Text>
        <Ionicons name="chevron-forward" size={16} color={theme.textMuted} />
      </View>
    </TouchableOpacity>
  );
}

export default function HistoryScreen() {
  const { user }                    = useAuthStore();
  const { theme }                   = useTheme();
  const [receipts, setReceipts]     = useState<Receipt[]>([]);
  const [loading, setLoading]       = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadReceipts = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('receipts')
        .select('*, receipt_items(count)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      const receiptsWithCount = (data ?? []).map((r: any) => ({
        ...r,
        item_count: r.receipt_items?.[0]?.count ?? 0,
      }));
      setReceipts(receiptsWithCount);
    } catch (err) {
      console.error('Error loading receipts:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { loadReceipts(); }, [user]);

  const onRefresh = () => { setRefreshing(true); loadReceipts(); };

  const grouped: Record<string, Receipt[]> = {};
  for (const receipt of receipts) {
    const month = new Date(receipt.purchase_date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    if (!grouped[month]) grouped[month] = [];
    grouped[month].push(receipt);
  }

  const totalSpent = receipts.reduce((sum, r) => sum + (r.total ?? 0), 0);

  return (
    <SafeScreen blobs={[
      { variant: 2, color: 'clay', size: 260, top: -80,   right: -100, opacity: 0.20 },
      { variant: 4, color: 'moss', size: 200, bottom: 60, left: -70,   opacity: 0.22 },
    ]}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Palette.moss500} />
        }
      >
        <View style={styles.header}>
          <TouchableOpacity style={[styles.backBtn, { backgroundColor: `${Palette.moss500}15` }]} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={20} color={Palette.moss500} />
          </TouchableOpacity>
          <Text style={[styles.heading, { color: theme.textPrimary }]}>Receipt History</Text>
          <View style={{ width: 40 }} />
        </View>

        {receipts.length > 0 && (
          <View style={[styles.statsCard, { backgroundColor: theme.cardBackground, borderColor: `${theme.border}55` }]}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{receipts.length}</Text>
              <Text style={[styles.statLabel, { color: theme.textMuted }]}>Receipts</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: `${theme.border}55` }]} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>${totalSpent.toFixed(0)}</Text>
              <Text style={[styles.statLabel, { color: theme.textMuted }]}>Total Spent</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: `${theme.border}55` }]} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>${receipts.length > 0 ? (totalSpent / receipts.length).toFixed(0) : '0'}</Text>
              <Text style={[styles.statLabel, { color: theme.textMuted }]}>Avg Trip</Text>
            </View>
          </View>
        )}

        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Palette.moss500} />
          </View>
        )}

        {!loading && receipts.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={{ fontSize: 48, marginBottom: 16 }}>🧾</Text>
            <Text style={[styles.emptyTitle, { color: theme.textPrimary }]}>No receipts yet</Text>
            <Text style={[styles.emptyBody, { color: theme.textMuted }]}>
              Scan your first receipt to start tracking your shopping history.
            </Text>
          </View>
        )}

        {!loading && Object.entries(grouped).map(([month, monthReceipts]) => (
          <View key={month} style={styles.monthSection}>
            <Text style={[styles.monthHeader, { color: theme.textMuted }]}>{month}</Text>
            <View style={[styles.monthCard, { backgroundColor: theme.cardBackground, borderColor: `${theme.border}55` }]}>
              {monthReceipts.map((receipt) => (
                <ReceiptRow key={receipt.id} receipt={receipt} onPress={() => {}} />
              ))}
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  scroll:           { paddingBottom: 100 },
  header:           { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 20, paddingBottom: 16 },
  backBtn:          { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  heading:          { fontFamily: Typography.heading, fontSize: Typography['2xl'] },
  statsCard:        { marginHorizontal: 20, marginBottom: 24, borderTopLeftRadius: 40, borderTopRightRadius: 24, borderBottomRightRadius: 40, borderBottomLeftRadius: 24, padding: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', borderWidth: 1 },
  statItem:         { alignItems: 'center', flex: 1 },
  statValue:        { fontFamily: Typography.heading, fontSize: Typography['2xl'], color: Palette.moss500, marginBottom: 2 },
  statLabel:        { fontFamily: Typography.body, fontSize: Typography.xs },
  statDivider:      { width: 1, height: 40 },
  loadingContainer: { alignItems: 'center', paddingVertical: 48 },
  emptyState:       { alignItems: 'center', paddingVertical: 48, paddingHorizontal: 32 },
  emptyTitle:       { fontFamily: Typography.heading, fontSize: Typography['2xl'], textAlign: 'center', marginBottom: 12 },
  emptyBody:        { fontFamily: Typography.body, fontSize: Typography.base, textAlign: 'center', lineHeight: 22 },
  monthSection:     { marginHorizontal: 20, marginBottom: 24 },
  monthHeader:      { fontFamily: Typography.bodySemi, fontSize: Typography.xs, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10, marginLeft: 4 },
  monthCard:        { borderRadius: 20, borderWidth: 1, overflow: 'hidden' },
  receiptRow:       { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 16, borderBottomWidth: 1, gap: 12 },
  receiptIcon:      { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  receiptInfo:      { flex: 1, gap: 2 },
  receiptStore:     { fontFamily: Typography.bodyBold, fontSize: Typography.base },
  receiptDate:      { fontFamily: Typography.body, fontSize: Typography.sm },
  receiptItems:     { fontFamily: Typography.body, fontSize: Typography.xs },
  receiptRight:     { alignItems: 'center', gap: 4 },
  receiptTotal:     { fontFamily: Typography.heading, fontSize: Typography.lg },
});