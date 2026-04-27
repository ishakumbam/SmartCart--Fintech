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
import { supabase } from '@/lib/supabase';
import { Colors, Typography, Palette, Shadows } from '@/constants/theme';

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
  const date = new Date(receipt.purchase_date).toLocaleDateString('en-US', {
    month: 'short',
    day:   'numeric',
    year:  'numeric',
  });

  return (
    <TouchableOpacity
      style={styles.receiptRow}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.receiptIcon}>
        <Text style={{ fontSize: 22 }}>🧾</Text>
      </View>
      <View style={styles.receiptInfo}>
        <Text style={styles.receiptStore} numberOfLines={1}>
          {receipt.store_name ?? 'Unknown Store'}
        </Text>
        <Text style={styles.receiptDate}>{date}</Text>
        {receipt.item_count !== undefined && (
          <Text style={styles.receiptItems}>
            {receipt.item_count} items
          </Text>
        )}
      </View>
      <View style={styles.receiptRight}>
        <Text style={styles.receiptTotal}>
          ${receipt.total?.toFixed(2) ?? '0.00'}
        </Text>
        <Ionicons name="chevron-forward" size={16} color={Palette.driedGrass} />
      </View>
    </TouchableOpacity>
  );
}

export default function HistoryScreen() {
  const { user }                    = useAuthStore();
  const [receipts, setReceipts]     = useState<Receipt[]>([]);
  const [loading, setLoading]       = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadReceipts = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('receipts')
        .select(`
          *,
          receipt_items(count)
        `)
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

  const onRefresh = () => {
    setRefreshing(true);
    loadReceipts();
  };

  // Group receipts by month
  const grouped: Record<string, Receipt[]> = {};
  for (const receipt of receipts) {
    const month = new Date(receipt.purchase_date).toLocaleDateString('en-US', {
      month: 'long',
      year:  'numeric',
    });
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
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Palette.moss500}
          />
        }
      >
        {/* ── Header ──────────────────────────────────── */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={20} color={Palette.moss500} />
          </TouchableOpacity>
          <Text style={styles.heading}>Receipt History</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* ── Stats card ──────────────────────────────── */}
        {receipts.length > 0 && (
          <View style={styles.statsCard}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{receipts.length}</Text>
              <Text style={styles.statLabel}>Receipts</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                ${totalSpent.toFixed(0)}
              </Text>
              <Text style={styles.statLabel}>Total Spent</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                ${receipts.length > 0 ? (totalSpent / receipts.length).toFixed(0) : '0'}
              </Text>
              <Text style={styles.statLabel}>Avg Trip</Text>
            </View>
          </View>
        )}

        {/* ── Loading ──────────────────────────────────── */}
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Palette.moss500} />
          </View>
        )}

        {/* ── Empty state ──────────────────────────────── */}
        {!loading && receipts.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={{ fontSize: 48, marginBottom: 16 }}>🧾</Text>
            <Text style={styles.emptyTitle}>No receipts yet</Text>
            <Text style={styles.emptyBody}>
              Scan your first receipt to start tracking your shopping history.
            </Text>
          </View>
        )}

        {/* ── Receipt list grouped by month ────────────── */}
        {!loading && Object.entries(grouped).map(([month, monthReceipts]) => (
          <View key={month} style={styles.monthSection}>
            <Text style={styles.monthHeader}>{month}</Text>
            <View style={styles.monthCard}>
              {monthReceipts.map((receipt, index) => (
                <ReceiptRow
                  key={receipt.id}
                  receipt={receipt}
                  onPress={() => {}}
                />
              ))}
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingBottom: 100,
  },
  header: {
    flexDirection:     'row',
    alignItems:        'center',
    justifyContent:    'space-between',
    paddingHorizontal: 20,
    paddingTop:        20,
    paddingBottom:     16,
  },
  backBtn: {
    width:           40,
    height:          40,
    borderRadius:    20,
    backgroundColor: `${Palette.moss500}15`,
    alignItems:      'center',
    justifyContent:  'center',
  },
  heading: {
    fontFamily: Typography.heading,
    fontSize:   Typography['2xl'],
    color:      Palette.loam,
  },
  statsCard: {
    marginHorizontal:        20,
    marginBottom:            24,
    backgroundColor:         '#FEFEFA',
    borderTopLeftRadius:     40,
    borderTopRightRadius:    24,
    borderBottomRightRadius: 40,
    borderBottomLeftRadius:  24,
    padding:                 20,
    flexDirection:           'row',
    alignItems:              'center',
    justifyContent:          'space-around',
    borderWidth:             1,
    borderColor:             `${Palette.rawTimber}55`,
    ...Shadows.soft,
  },
  statItem: {
    alignItems: 'center',
    flex:       1,
  },
  statValue: {
    fontFamily:   Typography.heading,
    fontSize:     Typography['2xl'],
    color:        Palette.moss500,
    marginBottom: 2,
  },
  statLabel: {
    fontFamily: Typography.body,
    fontSize:   Typography.xs,
    color:      Colors.textMuted,
  },
  statDivider: {
    width:           1,
    height:          40,
    backgroundColor: `${Palette.rawTimber}55`,
  },
  loadingContainer: {
    alignItems:      'center',
    paddingVertical: 48,
  },
  emptyState: {
    alignItems:        'center',
    paddingVertical:   48,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontFamily:   Typography.heading,
    fontSize:     Typography['2xl'],
    color:        Palette.loam,
    textAlign:    'center',
    marginBottom: 12,
  },
  emptyBody: {
    fontFamily: Typography.body,
    fontSize:   Typography.base,
    color:      Colors.textMuted,
    textAlign:  'center',
    lineHeight: 22,
  },
  monthSection: {
    marginHorizontal: 20,
    marginBottom:     24,
  },
  monthHeader: {
    fontFamily:    Typography.bodySemi,
    fontSize:      Typography.xs,
    color:         Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom:  10,
    marginLeft:    4,
  },
  monthCard: {
    backgroundColor: '#FEFEFA',
    borderRadius:    20,
    borderWidth:     1,
    borderColor:     `${Palette.rawTimber}55`,
    overflow:        'hidden',
    ...Shadows.subtle,
  },
  receiptRow: {
    flexDirection:     'row',
    alignItems:        'center',
    paddingVertical:   14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: `${Palette.rawTimber}33`,
    gap:               12,
  },
  receiptIcon: {
    width:           44,
    height:          44,
    borderRadius:    22,
    backgroundColor: `${Palette.moss500}12`,
    alignItems:      'center',
    justifyContent:  'center',
    borderWidth:     1,
    borderColor:     `${Palette.moss500}20`,
  },
  receiptInfo: {
    flex: 1,
    gap:  2,
  },
  receiptStore: {
    fontFamily: Typography.bodyBold,
    fontSize:   Typography.base,
    color:      Palette.loam,
  },
  receiptDate: {
    fontFamily: Typography.body,
    fontSize:   Typography.sm,
    color:      Colors.textMuted,
  },
  receiptItems: {
    fontFamily: Typography.body,
    fontSize:   Typography.xs,
    color:      Palette.moss500,
  },
  receiptRight: {
    alignItems: 'center',
    gap:        4,
  },
  receiptTotal: {
    fontFamily: Typography.heading,
    fontSize:   Typography.lg,
    color:      Palette.loam,
  },
});