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
import { Colors, Typography, Palette, Shadows } from '@/constants/theme';

function FrequencyBar({ score }: { score: number }) {
  return (
    <View style={styles.barContainer}>
      <View style={[styles.barFill, { width: `${Math.round(score * 100)}%` }]} />
    </View>
  );
}

function ProfileItem({ item, index }: { item: BuyProfileItem; index: number }) {
  const emoji = getFrequencyEmoji(item.frequencyScore);
  return (
    <View style={styles.profileItem}>
      <View style={styles.profileRank}>
        <Text style={styles.profileRankText}>{index + 1}</Text>
      </View>
      <View style={styles.profileInfo}>
        <Text style={styles.profileName} numberOfLines={1}>
          {capitalize(item.item)}
        </Text>
        <Text style={styles.profileMeta}>
          Bought {item.purchaseCount}x · Every ~{item.avgFrequencyDays} days
        </Text>
        <FrequencyBar score={item.frequencyScore} />
      </View>
      <Text style={styles.profileEmoji}>{emoji}</Text>
    </View>
  );
}

function PredictionChip({ item }: { item: BuyProfileItem }) {
  return (
    <View style={styles.predictionChip}>
      <Text style={styles.predictionEmoji}>
        {getCategoryEmoji(item.category)}
      </Text>
      <Text style={styles.predictionName} numberOfLines={1}>
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

  // ── Category breakdown ─────────────────────────────────
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
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Palette.moss500}
          />
        }
      >
        {/* ── Header ──────────────────────────────────── */}
        <View style={styles.header}>
          <Text style={styles.heading}>My Habits</Text>
          <Text style={styles.subheading}>
            {profile.length > 0
              ? `${profile.length} items tracked`
              : 'Scan receipts to build your profile'
            }
          </Text>
        </View>

        {/* ── Loading ──────────────────────────────────── */}
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Palette.moss500} />
            <Text style={styles.loadingText}>Loading your habits...</Text>
          </View>
        )}

        {/* ── Empty state ──────────────────────────────── */}
        {!loading && profile.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📊</Text>
            <Text style={styles.emptyTitle}>No habits yet</Text>
            <Text style={styles.emptyBody}>
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
            {/* ── Running low predictions ──────────────── */}
            {predictions.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Running Low Soon 🔔</Text>
                <Text style={styles.sectionSub}>Based on your purchase cycles</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.predictionsRow}
                >
                  {predictions.map((item) => (
                    <PredictionChip key={item.id} item={item} />
                  ))}
                </ScrollView>
              </View>
            )}

            {/* ── Category breakdown ───────────────────── */}
            {categories.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Top Categories</Text>
                <Text style={styles.sectionSub}>What you buy most</Text>
                <View style={styles.categoryCard}>
                  {categories.map(([category, count]) => {
                    const pct = totalPurchases > 0
                      ? Math.round((count / totalPurchases) * 100)
                      : 0;
                    return (
                      <View key={category} style={styles.categoryRow}>
                        <Text style={styles.categoryEmoji}>
                          {getCategoryEmoji(category)}
                        </Text>
                        <View style={styles.categoryInfo}>
                          <Text style={styles.categoryName}>
                            {capitalize(category)}
                          </Text>
                          <View style={styles.categoryBarBg}>
                            <View
                              style={[styles.categoryBarFill, { width: `${pct}%` }]}
                            />
                          </View>
                        </View>
                        <Text style={styles.categoryPct}>{pct}%</Text>
                      </View>
                    );
                  })}
                </View>
              </View>
            )}

            {/* ── Top items ────────────────────────────── */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Most Purchased</Text>
              <Text style={styles.sectionSub}>
                Bar shows how soon you'll need it again
              </Text>
              <View style={styles.profileCard}>
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
    dairy:    '🥛',
    produce:  '🥦',
    beverage: '🧃',
    snacks:   '🍿',
    candy:    '🍫',
    frozen:   '🧊',
    meat:     '🥩',
    bakery:   '🍞',
    pantry:   '🫙',
    general:  '🛒',
  };
  return map[category] ?? '🛒';
}

const styles = StyleSheet.create({
  scroll: {
    paddingBottom: 100,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop:        20,
    paddingBottom:     20,
  },
  heading: {
    fontFamily: Typography.heading,
    fontSize:   Typography['3xl'],
    color:      Palette.loam,
  },
  subheading: {
    fontFamily: Typography.body,
    fontSize:   Typography.sm,
    color:      Colors.textMuted,
    marginTop:  4,
  },
  loadingContainer: {
    alignItems:      'center',
    justifyContent:  'center',
    paddingVertical: 48,
    gap:             12,
  },
  loadingText: {
    fontFamily: Typography.body,
    fontSize:   Typography.sm,
    color:      Colors.textMuted,
  },
  emptyState: {
    marginHorizontal: 24,
    alignItems:       'center',
    paddingVertical:  32,
  },
  emptyIcon: {
    fontSize:     48,
    marginBottom: 16,
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
  section: {
    marginHorizontal: 20,
    marginBottom:     28,
  },
  sectionTitle: {
    fontFamily:   Typography.heading,
    fontSize:     Typography.xl,
    color:        Palette.loam,
    marginBottom: 2,
  },
  sectionSub: {
    fontFamily:   Typography.body,
    fontSize:     Typography.sm,
    color:        Colors.textMuted,
    marginBottom: 14,
  },
  predictionsRow: {
    gap:            10,
    paddingRight:   20,
  },
  predictionChip: {
    backgroundColor:   '#FEFEFA',
    borderRadius:      20,
    padding:           14,
    alignItems:        'center',
    minWidth:          100,
    borderWidth:       1,
    borderColor:       `${Palette.rawTimber}55`,
    gap:               6,
    ...Shadows.subtle,
  },
  predictionEmoji: {
    fontSize: 28,
  },
  predictionName: {
    fontFamily: Typography.bodySemi,
    fontSize:   Typography.xs,
    color:      Palette.loam,
    textAlign:  'center',
  },
  predictionBadge: {
    backgroundColor:   `${Palette.clay500}20`,
    borderRadius:      9999,
    paddingVertical:   2,
    paddingHorizontal: 8,
  },
  predictionBadgeText: {
    fontFamily: Typography.bodyBold,
    fontSize:   9,
    color:      Palette.clay500,
  },
  categoryCard: {
    backgroundColor: '#FEFEFA',
    borderRadius:    20,
    padding:         16,
    borderWidth:     1,
    borderColor:     `${Palette.rawTimber}55`,
    gap:             14,
    ...Shadows.subtle,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           10,
  },
  categoryEmoji: {
    fontSize: 20,
    width:    28,
  },
  categoryInfo: {
    flex: 1,
    gap:  4,
  },
  categoryName: {
    fontFamily: Typography.bodySemi,
    fontSize:   Typography.sm,
    color:      Palette.loam,
  },
  categoryBarBg: {
    height:          6,
    backgroundColor: Palette.stone,
    borderRadius:    3,
    overflow:        'hidden',
  },
  categoryBarFill: {
    height:          6,
    backgroundColor: Palette.moss500,
    borderRadius:    3,
  },
  categoryPct: {
    fontFamily: Typography.bodyBold,
    fontSize:   Typography.xs,
    color:      Palette.moss500,
    width:      32,
    textAlign:  'right',
  },
  profileCard: {
    backgroundColor: '#FEFEFA',
    borderRadius:    20,
    borderWidth:     1,
    borderColor:     `${Palette.rawTimber}55`,
    overflow:        'hidden',
    ...Shadows.subtle,
  },
  profileItem: {
    flexDirection:     'row',
    alignItems:        'center',
    paddingVertical:   12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: `${Palette.rawTimber}33`,
    gap:               12,
  },
  profileRank: {
    width:           24,
    height:          24,
    borderRadius:    12,
    backgroundColor: `${Palette.moss500}15`,
    alignItems:      'center',
    justifyContent:  'center',
  },
  profileRankText: {
    fontFamily: Typography.bodyBold,
    fontSize:   Typography.xs,
    color:      Palette.moss500,
  },
  profileInfo: {
    flex: 1,
    gap:  3,
  },
  profileName: {
    fontFamily: Typography.bodySemi,
    fontSize:   Typography.sm,
    color:      Palette.loam,
  },
  profileMeta: {
    fontFamily: Typography.body,
    fontSize:   Typography.xs,
    color:      Colors.textMuted,
  },
  barContainer: {
    height:          4,
    backgroundColor: Palette.stone,
    borderRadius:    2,
    overflow:        'hidden',
    marginTop:       2,
  },
  barFill: {
    height:          4,
    backgroundColor: Palette.moss500,
    borderRadius:    2,
  },
  profileEmoji: {
    fontSize: 16,
  },
});