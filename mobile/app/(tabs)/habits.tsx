import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeScreen } from '@/components/ui/SafeScreen';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/store/authStore';
import { getBuyProfile, getPredictions, BuyProfileItem } from '@/lib/habitService';
import { useTheme } from '@/hooks/useTheme';
import { Typography, Palette } from '@/constants/theme';

function FrequencyBar({ score }: { score: number }) {
  const { theme } = useTheme();
  return (
    <View style={[styles.barContainer, { backgroundColor: theme.surfaceAlt }]}>
      <View style={[styles.barFill, { width: `${Math.round(score * 100)}%` }]} />
    </View>
  );
}

function ProfileItem({ item, index }: { item: BuyProfileItem; index: number }) {
  const { theme } = useTheme();
  const emoji = getFrequencyEmoji(item.frequencyScore);
  return (
    <View style={[styles.profileItem, { borderBottomColor: `${theme.border}33` }]}>
      <View style={[styles.profileRank, { backgroundColor: `${Palette.moss500}15` }]}>
        <Text style={styles.profileRankText}>{index + 1}</Text>
      </View>
      <View style={styles.profileInfo}>
        <Text style={[styles.profileName, { color: theme.textPrimary }]} numberOfLines={1}>
          {capitalize(item.item)}
        </Text>
        <Text style={[styles.profileMeta, { color: theme.textMuted }]}>
          Bought {item.purchaseCount}x · Every ~{item.avgFrequencyDays} days
        </Text>
        <FrequencyBar score={item.frequencyScore} />
      </View>
      <Text style={styles.profileEmoji}>{emoji}</Text>
    </View>
  );
}

function PredictionChip({ item }: { item: BuyProfileItem }) {
  const { theme } = useTheme();
  return (
    <View style={[styles.predictionChip, { backgroundColor: theme.cardBackground, borderColor: `${theme.border}55` }]}>
      <Text style={styles.predictionEmoji}>{getCategoryEmoji(item.category)}</Text>
      <Text style={[styles.predictionName, { color: theme.textPrimary }]} numberOfLines={1}>
        {capitalize(item.item)}
      </Text>
      <View style={styles.predictionBadge}>
        <Text style={styles.predictionBadgeText}>Soon</Text>
      </View>
    </View>
  );
}

export default function HabitsScreen() {
  const { user }                            = useAuthStore();
  const { theme }                           = useTheme();
  const [profile, setProfile]               = useState<BuyProfileItem[]>([]);
  const [predictions, setPredictions]       = useState<BuyProfileItem[]>([]);
  const [loading, setLoading]               = useState(true);
  const [refreshing, setRefreshing]         = useState(false);

  const loadData = async () => {
    if (!user) return;
    try {
      const [buyProfile, preds] = await Promise.all([
        getBuyProfile(user.id),
        getPredictions(user.id),
      ]);
      setProfile(buyProfile);
      setPredictions(preds);
    } catch (err) {
      console.error('Error loading habits:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { loadData(); }, [user]);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const categoryMap = new Map<string, number>();
  for (const item of profile) {
    const current = categoryMap.get(item.category) ?? 0;
    categoryMap.set(item.category, current + item.purchaseCount);
  }
  const categories = Array.from(categoryMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
  const totalPurchases = categories.reduce((sum, [, count]) => sum + count, 0);

  return (
    <SafeScreen blobs={[
      { variant: 3, color: 'clay', size: 280, top: -80,   left: -100, opacity: 0.22 },
      { variant: 5, color: 'moss', size: 220, bottom: 60, right: -80, opacity: 0.25 },
    ]}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Palette.moss500} />
        }
      >
        {/* ── Header ──────────────────────────────────── */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.heading, { color: theme.textPrimary }]}>My Habits</Text>
            <Text style={[styles.subheading, { color: theme.textMuted }]}>
              {profile.length > 0 ? `${profile.length} items tracked` : 'Scan receipts to build your profile'}
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.historyBtn, { backgroundColor: `${Palette.moss500}12`, borderColor: `${Palette.moss500}25` }]}
            onPress={() => router.push('/history')}
          >
            <Ionicons name="receipt-outline" size={18} color={Palette.moss500} />
            <Text style={styles.historyBtnText}>History</Text>
          </TouchableOpacity>
        </View>

        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Palette.moss500} />
            <Text style={[styles.loadingText, { color: theme.textMuted }]}>Loading your habits...</Text>
          </View>
        )}

        {!loading && profile.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📊</Text>
            <Text style={[styles.emptyTitle, { color: theme.textPrimary }]}>No habits yet</Text>
            <Text style={[styles.emptyBody, { color: theme.textMuted }]}>
              Scan a few receipts and SmartCart will learn what you buy and how often.
            </Text>
            <Button
              label="Scan a Receipt"
              variant="outline"
              onPress={() => router.push('/(tabs)/scan')}
              size="md"
              style={{ marginTop: 20 }}
            />
          </View>
        )}

        {!loading && profile.length > 0 && (
          <>
            {predictions.length > 0 && (
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Running Low Soon 🔔</Text>
                <Text style={[styles.sectionSub, { color: theme.textMuted }]}>Based on your purchase cycles</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.predictionsRow}>
                  {predictions.map((item) => (
                    <PredictionChip key={item.id} item={item} />
                  ))}
                </ScrollView>
              </View>
            )}

            {categories.length > 0 && (
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Top Categories</Text>
                <Text style={[styles.sectionSub, { color: theme.textMuted }]}>What you buy most</Text>
                <View style={[styles.categoryCard, { backgroundColor: theme.cardBackground, borderColor: `${theme.border}55` }]}>
                  {categories.map(([category, count]) => {
                    const pct = totalPurchases > 0 ? Math.round((count / totalPurchases) * 100) : 0;
                    return (
                      <View key={category} style={styles.categoryRow}>
                        <Text style={styles.categoryEmoji}>{getCategoryEmoji(category)}</Text>
                        <View style={styles.categoryInfo}>
                          <Text style={[styles.categoryName, { color: theme.textPrimary }]}>
                            {capitalize(category)}
                          </Text>
                          <View style={[styles.categoryBarBg, { backgroundColor: theme.surfaceAlt }]}>
                            <View style={[styles.categoryBarFill, { width: `${pct}%` }]} />
                          </View>
                        </View>
                        <Text style={styles.categoryPct}>{pct}%</Text>
                      </View>
                    );
                  })}
                </View>
              </View>
            )}

            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Most Purchased</Text>
              <Text style={[styles.sectionSub, { color: theme.textMuted }]}>Bar shows how soon you'll need it again</Text>
              <View style={[styles.profileCard, { backgroundColor: theme.cardBackground, borderColor: `${theme.border}55` }]}>
                {profile.slice(0, 10).map((item, index) => (
                  <ProfileItem key={item.id} item={item} index={index} />
                ))}
              </View>
            </View>
          </>
        )}
      </ScrollView>
    </SafeScreen>
  );
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function getFrequencyEmoji(score: number): string {
  if (score >= 0.8) return '🔴';
  if (score >= 0.5) return '🟡';
  return '🟢';
}

function getCategoryEmoji(category: string): string {
  const map: Record<string, string> = {
    dairy: '🥛', produce: '🥦', beverage: '🧃', snacks: '🍿',
    candy: '🍫', frozen: '🧊', meat: '🥩', bakery: '🍞', pantry: '🫙', general: '🛒',
  };
  return map[category] ?? '🛒';
}

const styles = StyleSheet.create({
  scroll:           { paddingBottom: 100 },
  header:           { paddingHorizontal: 24, paddingTop: 20, paddingBottom: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  heading:          { fontFamily: Typography.heading, fontSize: Typography['3xl'] },
  subheading:       { fontFamily: Typography.body, fontSize: Typography.sm, marginTop: 4 },
  historyBtn:       { flexDirection: 'row', alignItems: 'center', borderRadius: 9999, paddingVertical: 8, paddingHorizontal: 14, gap: 6, borderWidth: 1, marginTop: 4 },
  historyBtnText:   { fontFamily: Typography.bodySemi, fontSize: Typography.sm, color: Palette.moss500 },
  loadingContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 48, gap: 12 },
  loadingText:      { fontFamily: Typography.body, fontSize: Typography.sm },
  emptyState:       { marginHorizontal: 24, alignItems: 'center', paddingVertical: 32 },
  emptyIcon:        { fontSize: 48, marginBottom: 16 },
  emptyTitle:       { fontFamily: Typography.heading, fontSize: Typography['2xl'], textAlign: 'center', marginBottom: 12 },
  emptyBody:        { fontFamily: Typography.body, fontSize: Typography.base, textAlign: 'center', lineHeight: 22 },
  section:          { marginHorizontal: 20, marginBottom: 28 },
  sectionTitle:     { fontFamily: Typography.heading, fontSize: Typography.xl, marginBottom: 2 },
  sectionSub:       { fontFamily: Typography.body, fontSize: Typography.sm, marginBottom: 14 },
  predictionsRow:   { gap: 10, paddingRight: 20 },
  predictionChip:   { borderRadius: 20, padding: 14, alignItems: 'center', minWidth: 100, borderWidth: 1, gap: 6 },
  predictionEmoji:  { fontSize: 28 },
  predictionName:   { fontFamily: Typography.bodySemi, fontSize: Typography.xs, textAlign: 'center' },
  predictionBadge:  { backgroundColor: `${Palette.clay500}20`, borderRadius: 9999, paddingVertical: 2, paddingHorizontal: 8 },
  predictionBadgeText: { fontFamily: Typography.bodyBold, fontSize: 9, color: Palette.clay500 },
  categoryCard:     { borderRadius: 20, padding: 16, borderWidth: 1, gap: 14 },
  categoryRow:      { flexDirection: 'row', alignItems: 'center', gap: 10 },
  categoryEmoji:    { fontSize: 20, width: 28 },
  categoryInfo:     { flex: 1, gap: 4 },
  categoryName:     { fontFamily: Typography.bodySemi, fontSize: Typography.sm },
  categoryBarBg:    { height: 6, borderRadius: 3, overflow: 'hidden' },
  categoryBarFill:  { height: 6, backgroundColor: Palette.moss500, borderRadius: 3 },
  categoryPct:      { fontFamily: Typography.bodyBold, fontSize: Typography.xs, color: Palette.moss500, width: 32, textAlign: 'right' },
  profileCard:      { borderRadius: 20, borderWidth: 1, overflow: 'hidden' },
  profileItem:      { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 16, borderBottomWidth: 1, gap: 12 },
  profileRank:      { width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  profileRankText:  { fontFamily: Typography.bodyBold, fontSize: Typography.xs, color: Palette.moss500 },
  profileInfo:      { flex: 1, gap: 3 },
  profileName:      { fontFamily: Typography.bodySemi, fontSize: Typography.sm },
  profileMeta:      { fontFamily: Typography.body, fontSize: Typography.xs },
  barContainer:     { height: 4, borderRadius: 2, overflow: 'hidden', marginTop: 2 },
  barFill:          { height: 4, backgroundColor: Palette.moss500, borderRadius: 2 },
  profileEmoji:     { fontSize: 16 },
});