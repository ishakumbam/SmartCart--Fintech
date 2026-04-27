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
import { Button } from '@/components/ui/Button';
import { DealCard } from '@/components/ui/DealCard';
import { useAuthStore } from '@/store/authStore';
import { getBuyProfile, BuyProfileItem } from '@/lib/habitService';
import { getPersonalizedDeals, Deal } from '@/lib/dealService';
import { Colors, Typography, Palette } from '@/constants/theme';

export default function HomeScreen() {
  const { user }                        = useAuthStore();
  const firstName                       = user?.name?.split(' ')[0] ?? 'there';
  const [deals, setDeals]               = useState<Deal[]>([]);
  const [profile, setProfile]           = useState<BuyProfileItem[]>([]);
  const [loading, setLoading]           = useState(true);
  const [refreshing, setRefreshing]     = useState(false);
  const [hasScanned, setHasScanned]     = useState(false);

  const loadData = async () => {
    if (!user) return;
    try {
      const buyProfile = await getBuyProfile(user.id);
      setProfile(buyProfile);
      setHasScanned(buyProfile.length > 0);

      const personalizedDeals = await getPersonalizedDeals(user.id, buyProfile);
      setDeals(personalizedDeals);
    } catch (err) {
      console.error('Error loading deals:', err);
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

  const personalizedCount = deals.filter(d => d.frequencyScore > 0).length;

  return (
    <SafeScreen blobs={[
      { variant: 1, color: 'moss', size: 320, top: -100, right: -120, opacity: 0.22 },
      { variant: 3, color: 'sand', size: 220, bottom: 80, left: -80,  opacity: 0.28 },
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
          <View>
            <Text style={styles.greeting}>Hey {firstName} 👋</Text>
            <Text style={styles.tagline}>
              {hasScanned
                ? `${personalizedCount} deals matched to your habits`
                : 'The Expedia of everyday shopping'
              }
            </Text>
          </View>
          <TouchableOpacity style={styles.locationChip}>
            <Ionicons name="location-outline" size={14} color={Palette.moss500} />
            <Text style={styles.locationText}>Nearby</Text>
          </TouchableOpacity>
        </View>

        {/* ── No scan yet — onboarding card ───────────── */}
        {!hasScanned && (
          <View style={styles.onboardCard}>
            <Text style={styles.onboardTitle}>Get your first deals</Text>
            <Text style={styles.onboardSub}>
              Scan a receipt to unlock personalized deals
            </Text>
            <Button
              label="Scan Your First Receipt"
              onPress={() => router.push('/(tabs)/scan')}
              fullWidth
              size="md"
              variant="sand"
              icon={<Ionicons name="scan-outline" size={18} color={Palette.bark} />}
              style={{ marginTop: 16 }}
            />
          </View>
        )}

        {/* ── Deal feed section header ─────────────────── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            {hasScanned ? 'Your Deals' : 'Featured Deals'}
          </Text>
          <Text style={styles.sectionSub}>
            {hasScanned
              ? 'Ranked by your shopping habits'
              : 'Scan a receipt to personalize'
            }
          </Text>
        </View>

        {/* ── Loading state ────────────────────────────── */}
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Palette.moss500} />
            <Text style={styles.loadingText}>Finding your deals...</Text>
          </View>
        )}

        {/* ── Deal cards ───────────────────────────────── */}
        {!loading && deals.length > 0 && (
          <View style={styles.dealGrid}>
            {deals.map((deal, index) => (
              <DealCard
                key={deal.id}
                deal={deal}
                organic={((index % 6) + 1) as 1 | 2 | 3 | 4 | 5 | 6}
              />
            ))}
          </View>
        )}

        {/* ── Empty state ──────────────────────────────── */}
        {!loading && deals.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🌿</Text>
            <Text style={styles.emptyTitle}>No deals yet</Text>
            <Text style={styles.emptyBody}>
              Scan a receipt to start seeing personalized deals on items you already buy.
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
      </ScrollView>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingBottom: 100,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop:        20,
    paddingBottom:     16,
    flexDirection:     'row',
    justifyContent:    'space-between',
    alignItems:        'flex-start',
  },
  greeting: {
    fontFamily: Typography.heading,
    fontSize:   Typography['2xl'],
    color:      Palette.loam,
    lineHeight: 30,
  },
  tagline: {
    fontFamily: Typography.body,
    fontSize:   Typography.sm,
    color:      Colors.textMuted,
    marginTop:  2,
  },
  locationChip: {
    flexDirection:     'row',
    alignItems:        'center',
    backgroundColor:   `${Palette.moss500}12`,
    borderRadius:      9999,
    paddingVertical:   6,
    paddingHorizontal: 12,
    gap:               4,
    borderWidth:       1,
    borderColor:       `${Palette.moss500}25`,
    marginTop:         4,
  },
  locationText: {
    fontFamily: Typography.bodySemi,
    fontSize:   Typography.xs,
    color:      Palette.moss500,
  },
  onboardCard: {
    marginHorizontal:        20,
    marginBottom:            24,
    backgroundColor:         Palette.moss500,
    borderTopLeftRadius:     48,
    borderTopRightRadius:    24,
    borderBottomRightRadius: 48,
    borderBottomLeftRadius:  32,
    padding:                 24,
    shadowColor:             Palette.moss700,
    shadowOffset:            { width: 0, height: 8 },
    shadowOpacity:           0.25,
    shadowRadius:            20,
    elevation:               8,
  },
  onboardTitle: {
    fontFamily:   Typography.heading,
    fontSize:     Typography.xl,
    color:        Palette.paleMist,
    marginBottom: 4,
  },
  onboardSub: {
    fontFamily: Typography.body,
    fontSize:   Typography.sm,
    color:      `${Palette.paleMist}AA`,
  },
  sectionHeader: {
    paddingHorizontal: 24,
    marginBottom:      16,
  },
  sectionTitle: {
    fontFamily: Typography.heading,
    fontSize:   Typography.xl,
    color:      Palette.loam,
  },
  sectionSub: {
    fontFamily: Typography.body,
    fontSize:   Typography.sm,
    color:      Colors.textMuted,
    marginTop:  2,
  },
  loadingContainer: {
    alignItems:     'center',
    justifyContent: 'center',
    paddingVertical: 48,
    gap:            12,
  },
  loadingText: {
    fontFamily: Typography.body,
    fontSize:   Typography.sm,
    color:      Colors.textMuted,
  },
  dealGrid: {
    paddingHorizontal: 20,
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
});