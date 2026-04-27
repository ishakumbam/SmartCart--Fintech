import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { AppCard } from '../components/AppCard';
import { Screen } from '../components/Screen';
import { SectionHeader } from '../components/SectionHeader';
import { useAppData } from '../hooks/useAppData';
import { formatCurrency, formatPoints } from '../utils/format';
import { palette, spacing } from '../utils/theme';
import { MainTabParamList } from '../navigation/types';

function formatPercent(value: number): string {
  return `${Math.round(value * 100)}%`;
}

type Props = BottomTabScreenProps<MainTabParamList, 'Habits'>;

export function HabitsScreen({ navigation }: Props) {
  const { analytics, state } = useAppData();
  const budgetTarget = state.budget.monthlyTarget;
  const budgetWarningThreshold = state.budget.warningThreshold;
  const currentMonthSpend = analytics.monthlySpend[analytics.monthlySpend.length - 1]?.amount ?? 0;
  const budgetRatio = budgetTarget > 0 ? Math.min(currentMonthSpend / budgetTarget, 1) : 0;
  const remainingBudget = Math.max(budgetTarget - currentMonthSpend, 0);
  const projectedSavings = state.recommendations.reduce(
    (sum, item) => sum + Math.max(item.regularPrice - item.dealPrice, 0),
    0,
  );
  const projectedAnnualSavings = projectedSavings * 52;
  const monthlyForecast = currentMonthSpend;
  const budgetVariance = budgetTarget - monthlyForecast;
  const budgetStatus =
    budgetRatio >= 1 ? 'Over budget' : budgetRatio >= budgetWarningThreshold ? 'Approaching limit' : 'On track';
  const topPriceWatch = state.recommendations[0];
  const latestLedger = state.rewardsLedger[0];

  return (
    <Screen
      title="Savings"
      subtitle="Everything money-related in one place: budget, rewards, price watch, and spending trends."
    >
      <View style={styles.heroRow}>
        <AppCard style={[styles.heroCard, styles.walletCard]}>
          <Text style={[styles.heroLabel, styles.walletLabel]}>Savings wallet</Text>
          <Text style={[styles.heroValue, styles.walletValue]}>{formatPoints(state.profile.points)}</Text>
          <Text style={[styles.heroMeta, styles.walletMeta]}>
            Projected weekly savings: {formatCurrency(projectedSavings)}
          </Text>
        </AppCard>
        <AppCard style={[styles.heroCard, styles.netCard]}>
          <Text style={styles.heroLabel}>Net grocery cost</Text>
          <Text style={styles.heroValue}>{formatCurrency(analytics.totalSpent - projectedSavings)}</Text>
          <Text style={styles.heroMeta}>After current nearby deal opportunities</Text>
        </AppCard>
      </View>

      <SectionHeader title="Money tools" />
      <View style={styles.toolsGrid}>
        <HubCard
          title="Budget"
          value={`${formatPercent(budgetRatio)} used`}
          detail={`${formatCurrency(remainingBudget)} left • ${budgetStatus}`}
          onPress={() => navigation.getParent()?.navigate('BudgetSetup')}
        />
        <HubCard
          title="Rewards ledger"
          value={latestLedger ? `${latestLedger.points > 0 ? '+' : ''}${latestLedger.points} pts` : 'No activity'}
          detail={latestLedger ? latestLedger.title : 'Your scan rewards will land here'}
          onPress={() => navigation.getParent()?.navigate('RewardsLedger')}
        />
        <HubCard
          title="Price watch"
          value={topPriceWatch ? topPriceWatch.itemName : 'No items yet'}
          detail={topPriceWatch ? `${topPriceWatch.store} • ${formatCurrency(topPriceWatch.dealPrice)}` : 'Scan a receipt to start tracking'}
          onPress={() => navigation.getParent()?.navigate('Recommendations')}
        />
        <HubCard
          title="Spending trends"
          value={formatCurrency(monthlyForecast)}
          detail="Open the full trend and category view"
          onPress={() => navigation.getParent()?.navigate('Analytics')}
        />
      </View>

      <SectionHeader
        title="Budget snapshot"
        actionLabel="Edit"
        onAction={() => navigation.getParent()?.navigate('BudgetSetup')}
      />
      <AppCard>
        <View style={styles.budgetHeader}>
          <View>
            <Text style={styles.cardTitle}>Monthly grocery budget</Text>
            <Text style={styles.cardCaption}>
              {formatCurrency(currentMonthSpend)} spent of {formatCurrency(budgetTarget)}
            </Text>
          </View>
          <Text style={styles.budgetValue}>{formatPercent(budgetRatio)}</Text>
        </View>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${Math.max(budgetRatio * 100, 8)}%` }]} />
        </View>
        <Text style={styles.budgetStatus}>{budgetStatus}</Text>
        <Text style={styles.cardFoot}>
          {remainingBudget > 0
            ? `${formatCurrency(remainingBudget)} remains in your current grocery budget.`
            : 'You have reached your current monthly grocery budget.'}
        </Text>
      </AppCard>

      <View style={styles.statsRow}>
        <AppCard style={styles.statCard}>
          <Text style={styles.statLabel}>Annual savings forecast</Text>
          <Text style={styles.statValue}>{formatCurrency(projectedAnnualSavings)}</Text>
        </AppCard>
        <AppCard style={styles.statCard}>
          <Text style={styles.statLabel}>Average basket</Text>
          <Text style={styles.statValue}>{formatCurrency(analytics.averageBasket)}</Text>
        </AppCard>
      </View>

      <SectionHeader title="Forward spend forecast" />
      <AppCard>
        <View style={styles.forecastRow}>
          <View style={styles.forecastBlock}>
            <Text style={styles.statLabel}>Current monthly pace</Text>
            <Text style={styles.statValue}>{formatCurrency(monthlyForecast)}</Text>
          </View>
          <View style={styles.forecastBlock}>
            <Text style={styles.statLabel}>Vs budget target</Text>
            <Text
              style={[
                styles.statValue,
                budgetVariance < 0 ? styles.negativeValue : styles.positiveValue,
              ]}
            >
              {budgetVariance < 0 ? '-' : '+'}
              {formatCurrency(Math.abs(budgetVariance))}
            </Text>
          </View>
        </View>
        <Text style={styles.cardFoot}>
          Based on your current scan history, SmartCart expects this month to finish{' '}
          {budgetVariance < 0 ? 'above' : 'below'} budget. Nearby deal switching could recover about{' '}
          {formatCurrency(projectedSavings)} this week.
        </Text>
      </AppCard>
    </Screen>
  );
}

function HubCard({
  title,
  value,
  detail,
  onPress,
}: {
  title: string;
  value: string;
  detail: string;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={styles.hubPressable}>
      <AppCard style={styles.hubCard}>
        <Text style={styles.hubTitle}>{title}</Text>
        <Text style={styles.hubValue}>{value}</Text>
        <Text style={styles.hubDetail}>{detail}</Text>
      </AppCard>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  heroRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  toolsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  hubPressable: {
    width: '47%',
  },
  hubCard: {
    minHeight: 128,
    justifyContent: 'space-between',
  },
  hubTitle: {
    color: palette.textMuted,
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  hubValue: {
    marginTop: spacing.sm,
    color: palette.text,
    fontFamily: 'Inter_700Bold',
    fontSize: 18,
  },
  hubDetail: {
    marginTop: spacing.sm,
    color: palette.textMuted,
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    lineHeight: 19,
  },
  heroCard: {
    flex: 1,
  },
  walletCard: {
    backgroundColor: palette.primary,
    borderColor: palette.primary,
  },
  netCard: {
    backgroundColor: palette.accentSoft,
    borderColor: palette.accentSoft,
  },
  heroLabel: {
    color: palette.textMuted,
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  heroValue: {
    marginTop: spacing.sm,
    color: palette.text,
    fontFamily: 'Inter_700Bold',
    fontSize: 24,
  },
  heroMeta: {
    marginTop: spacing.sm,
    color: palette.textMuted,
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    lineHeight: 19,
  },
  walletLabel: {
    color: '#D7EEE4',
  },
  walletValue: {
    color: '#FFFFFF',
  },
  walletMeta: {
    color: '#E7F4EE',
  },
  budgetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  cardTitle: {
    color: palette.text,
    fontFamily: 'Inter_700Bold',
    fontSize: 18,
  },
  cardCaption: {
    marginTop: 4,
    color: palette.textMuted,
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
  },
  budgetValue: {
    color: palette.primary,
    fontFamily: 'Inter_700Bold',
    fontSize: 22,
  },
  budgetStatus: {
    marginTop: spacing.md,
    color: palette.primary,
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  progressTrack: {
    marginTop: spacing.md,
    width: '100%',
    height: 12,
    borderRadius: 999,
    overflow: 'hidden',
    backgroundColor: palette.surfaceMuted,
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: palette.primary,
  },
  cardFoot: {
    marginTop: spacing.md,
    color: palette.textMuted,
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    lineHeight: 21,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  forecastRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  forecastBlock: {
    flex: 1,
  },
  statCard: {
    flex: 1,
  },
  statLabel: {
    color: palette.textMuted,
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
  },
  statValue: {
    marginTop: spacing.sm,
    color: palette.text,
    fontFamily: 'Inter_700Bold',
    fontSize: 22,
  },
  positiveValue: {
    color: palette.success,
  },
  negativeValue: {
    color: palette.danger,
  },
});
