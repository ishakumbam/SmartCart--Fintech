import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { AppCard } from '../components/AppCard';
import { EmptyState } from '../components/EmptyState';
import { Screen } from '../components/Screen';
import { useAppData } from '../hooks/useAppData';
import { formatCurrency } from '../utils/format';
import { palette, radius, spacing } from '../utils/theme';

export function RecommendationsScreen() {
  const { state } = useAppData();

  return (
    <Screen
      title="Price Watch"
      subtitle="A simpler view of the best nearby item-level savings based on your latest scans."
    >
      {state.recommendations.length === 0 ? (
        <EmptyState
          icon="pricetags-outline"
          title="Nothing to recommend yet"
          message="Scan a receipt and SmartCart will match your items to nearby cheaper deals."
        />
      ) : (
        state.recommendations.map((item) => (
          <AppCard key={item.id}>
            <View style={styles.row}>
              <View style={styles.pill}>
                <Text style={styles.pillText}>{item.distanceMiles.toFixed(1)} mi</Text>
              </View>
              <View style={styles.flex}>
                <Text style={styles.title}>{item.itemName}</Text>
                <Text style={styles.store}>{item.store}</Text>
              </View>
              <View style={styles.alignRight}>
                <Text style={styles.deal}>{formatCurrency(item.dealPrice)}</Text>
                <Text style={styles.regular}>vs {formatCurrency(item.regularPrice)}</Text>
              </View>
            </View>
            <Text style={styles.note}>{item.note}</Text>
          </AppCard>
        ))
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  pill: {
    borderRadius: radius.pill,
    backgroundColor: palette.accentSoft,
    paddingHorizontal: spacing.sm,
    paddingVertical: 8,
  },
  pillText: {
    color: palette.accent,
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
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
    fontSize: 17,
  },
  store: {
    color: palette.textMuted,
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    marginTop: 3,
  },
  deal: {
    color: palette.text,
    fontFamily: 'Inter_700Bold',
    fontSize: 17,
  },
  regular: {
    color: palette.textMuted,
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    marginTop: 3,
  },
  note: {
    marginTop: spacing.md,
    color: palette.textMuted,
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    lineHeight: 21,
  },
});
