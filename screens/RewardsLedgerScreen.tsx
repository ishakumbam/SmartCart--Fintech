import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { AppCard } from '../components/AppCard';
import { EmptyState } from '../components/EmptyState';
import { Screen } from '../components/Screen';
import { useAppData } from '../hooks/useAppData';
import { formatCurrency, formatShortDate } from '../utils/format';
import { palette, spacing } from '../utils/theme';

export function RewardsLedgerScreen() {
  const { state } = useAppData();

  return (
    <Screen
      title="Rewards Ledger"
      subtitle="A clearer transaction history for points earned from scans and SmartCart bonuses."
    >
      {state.rewardsLedger.length === 0 ? (
        <EmptyState
          icon="wallet-outline"
          title="No rewards activity yet"
          message="Scan a receipt and SmartCart will log your points here like a lightweight wallet."
        />
      ) : (
        state.rewardsLedger.map((entry) => (
          <AppCard key={entry.id}>
            <View style={styles.row}>
              <View style={styles.flex}>
                <Text style={styles.title}>{entry.title}</Text>
                <Text style={styles.detail}>{entry.detail}</Text>
                <Text style={styles.date}>{formatShortDate(entry.createdAt)}</Text>
              </View>
              <View style={styles.alignRight}>
                <Text style={styles.points}>
                  {entry.points > 0 ? '+' : ''}
                  {entry.points} pts
                </Text>
                <Text style={styles.cash}>{formatCurrency(entry.cashValue)}</Text>
              </View>
            </View>
          </AppCard>
        ))
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  flex: {
    flex: 1,
  },
  alignRight: {
    alignItems: 'flex-end',
  },
  title: {
    color: palette.text,
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
  },
  detail: {
    marginTop: 4,
    color: palette.textMuted,
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    lineHeight: 19,
  },
  date: {
    marginTop: spacing.sm,
    color: palette.textMuted,
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
  },
  points: {
    color: palette.text,
    fontFamily: 'Inter_700Bold',
    fontSize: 16,
  },
  cash: {
    marginTop: 4,
    color: palette.success,
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
  },
});
