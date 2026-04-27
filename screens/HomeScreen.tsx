import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppCard } from '../components/AppCard';
import { EmptyState } from '../components/EmptyState';
import { PrimaryButton } from '../components/PrimaryButton';
import { ReceiptCard } from '../components/ReceiptCard';
import { Screen } from '../components/Screen';
import { SectionHeader } from '../components/SectionHeader';
import { useAppData } from '../hooks/useAppData';
import { formatCurrency, formatPoints } from '../utils/format';
import { palette, radius, spacing } from '../utils/theme';
import { MainTabParamList, RootStackParamList } from '../navigation/types';

type Props = BottomTabScreenProps<MainTabParamList, 'Home'>;

export function HomeScreen({ navigation }: Props) {
  const { analytics, state } = useAppData();
  const latestReceipt = state.receipts[0];
  const featuredDeal = state.recommendations[0];
  const rootNavigation = navigation.getParent<NativeStackNavigationProp<RootStackParamList>>();
  const heroCopy = latestReceipt
    ? `Last scan from ${latestReceipt.store} unlocked ${latestReceipt.pointsEarned} new points.`
    : 'Scan your first grocery receipt to unlock rewards, recommendations, and shopping analytics.';

  return (
    <Screen
      title="SmartCart"
      subtitle="Turn every grocery run into smarter savings."
    >
      <AppCard style={styles.hero}>
        <Text style={styles.heroEyebrow}>Rewards balance</Text>
        <Text style={styles.heroPoints}>{formatPoints(state.profile.points)}</Text>
        <Text style={styles.heroBody}>{heroCopy}</Text>
        <View style={styles.heroStats}>
          <View style={styles.heroStat}>
            <Text style={styles.heroStatLabel}>This month</Text>
            <Text style={styles.heroStatValue}>{formatCurrency(analytics.totalSpent)}</Text>
          </View>
          <View style={styles.heroStat}>
            <Text style={styles.heroStatLabel}>Receipts</Text>
            <Text style={styles.heroStatValue}>{analytics.totalReceipts}</Text>
          </View>
          <View style={styles.heroStat}>
            <Text style={styles.heroStatLabel}>Average</Text>
            <Text style={styles.heroStatValue}>{formatCurrency(analytics.averageBasket)}</Text>
          </View>
        </View>
        <View style={styles.heroActions}>
          <PrimaryButton label="Scan receipt" onPress={() => rootNavigation?.navigate('Camera')} style={styles.flex} />
          <PrimaryButton
            label="Price watch"
            secondary
            onPress={() => rootNavigation?.navigate('Recommendations')}
            style={styles.flex}
          />
        </View>
      </AppCard>

      <SectionHeader title="Quick actions" />
      <View style={styles.quickGrid}>
        <PressableCard
          title="Scan now"
          detail="Capture a grocery receipt"
          icon="scan-outline"
          onPress={() => rootNavigation?.navigate('Camera')}
        />
        <PressableCard
          title="Set budget"
          detail="Update your monthly target"
          icon="wallet-outline"
          onPress={() => rootNavigation?.navigate('BudgetSetup')}
        />
        <PressableCard
          title="Savings hub"
          detail="Budget, ledger, and trends"
          icon="stats-chart-outline"
          onPress={() => navigation.navigate('Habits')}
        />
        <PressableCard
          title="Nearby deals map"
          detail="Open stores and local savings"
          icon="map-outline"
          onPress={() => navigation.navigate('Map')}
        />
      </View>

      <SectionHeader
        title="Featured savings"
        actionLabel="Open hub"
        onAction={() => rootNavigation?.navigate('Recommendations')}
      />
      {!featuredDeal ? (
        <EmptyState
          icon="pricetag-outline"
          title="No recommendations yet"
          message="Once you scan a receipt, SmartCart will surface cheaper nearby alternatives."
        />
      ) : (
        <AppCard style={styles.featuredDealCard}>
          <View style={styles.dealRow}>
            <View style={styles.dealBadge}>
              <Text style={styles.dealBadgeText}>{featuredDeal.distanceMiles.toFixed(1)} mi</Text>
            </View>
            <View style={styles.flex}>
              <Text style={styles.dealTitle}>{featuredDeal.itemName}</Text>
              <Text style={styles.dealStore}>{featuredDeal.store}</Text>
            </View>
            <View style={styles.alignRight}>
              <Text style={styles.dealPrice}>{formatCurrency(featuredDeal.dealPrice)}</Text>
              <Text style={styles.dealRegular}>was {formatCurrency(featuredDeal.regularPrice)}</Text>
            </View>
          </View>
          <Text style={styles.dealNote}>{featuredDeal.note}</Text>
        </AppCard>
      )}

      <SectionHeader
        title="Recent receipt"
        actionLabel={analytics.totalReceipts > 0 ? 'View trends' : undefined}
        onAction={analytics.totalReceipts > 0 ? () => rootNavigation?.navigate('Analytics') : undefined}
      />
      {state.receipts.length === 0 ? (
        <EmptyState
          icon="receipt-outline"
          title="No receipts yet"
          message="Use the Scan tab or live camera to capture your first grocery trip."
        />
      ) : (
        <ReceiptCard
          receipt={state.receipts[0]}
          onPress={() => rootNavigation?.navigate('ReceiptDetail', { receiptId: state.receipts[0].id })}
        />
      )}
    </Screen>
  );
}

function PressableCard({
  title,
  detail,
  icon,
  onPress,
}: {
  title: string;
  detail: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={styles.quickPressable}>
      <AppCard style={styles.quickCard}>
        <View style={styles.quickIconWrap}>
          <Ionicons name={icon} size={18} color={palette.primary} />
        </View>
        <Text style={styles.quickCardTitle}>{title}</Text>
        <Text style={styles.quickCardDetail}>{detail}</Text>
      </AppCard>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  hero: {
    backgroundColor: palette.primaryDark,
    borderColor: '#235844',
  },
  heroEyebrow: {
    color: '#BFDCCF',
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  heroPoints: {
    marginTop: spacing.sm,
    color: '#FFFFFF',
    fontFamily: 'Inter_700Bold',
    fontSize: 34,
  },
  heroBody: {
    marginTop: spacing.sm,
    color: '#E5F2EC',
    fontFamily: 'Inter_500Medium',
    fontSize: 15,
    lineHeight: 22,
  },
  heroActions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  heroStats: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  heroStat: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: radius.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
  },
  heroStatLabel: {
    color: '#BFDCCF',
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
  },
  heroStatValue: {
    marginTop: 6,
    color: '#FFFFFF',
    fontFamily: 'Inter_700Bold',
    fontSize: 16,
  },
  quickGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: spacing.md,
  },
  quickPressable: {
    width: '48%',
  },
  quickCard: {
    height: 112,
    minHeight: 100,
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
  },
  quickIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.surfaceMuted,
  },
  quickCardTitle: {
    color: palette.text,
    fontFamily: 'Inter_700Bold',
    fontSize: 15,
  },
  quickCardDetail: {
    marginTop: spacing.xs,
    color: palette.textMuted,
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    lineHeight: 19,
  },
  featuredDealCard: {
    paddingVertical: spacing.md,
  },
  dealRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  dealBadge: {
    backgroundColor: palette.surfaceMuted,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 8,
  },
  dealBadgeText: {
    color: palette.primary,
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
  },
  dealTitle: {
    color: palette.text,
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
  },
  dealStore: {
    color: palette.textMuted,
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    marginTop: 2,
  },
  alignRight: {
    alignItems: 'flex-end',
  },
  dealPrice: {
    color: palette.text,
    fontFamily: 'Inter_700Bold',
    fontSize: 16,
  },
  dealRegular: {
    color: palette.textMuted,
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    marginTop: 2,
  },
  dealNote: {
    marginTop: spacing.md,
    color: palette.textMuted,
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    lineHeight: 20,
  },
  flex: {
    flex: 1,
  },
});
