import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { AppCard } from './AppCard';
import { formatCurrency, formatPoints, formatShortDate } from '../utils/format';
import { Receipt } from '../utils/types';
import { palette, spacing } from '../utils/theme';

export function ReceiptCard({
  receipt,
  onPress,
}: {
  receipt: Receipt;
  onPress?: () => void;
}) {
  return (
    <Pressable onPress={onPress}>
      <AppCard style={styles.card}>
        <View style={styles.row}>
          <View>
            <Text style={styles.store}>{receipt.store}</Text>
            <Text style={styles.date}>{formatShortDate(receipt.date)}</Text>
          </View>
          <View style={styles.alignEnd}>
            <Text style={styles.total}>{formatCurrency(receipt.total)}</Text>
            <Text style={styles.points}>{formatPoints(receipt.pointsEarned)}</Text>
          </View>
        </View>
        <Text style={styles.items}>
          {receipt.items.slice(0, 3).map((item) => item.name).join(' • ')}
          {receipt.items.length > 3 ? ` • +${receipt.items.length - 3} more` : ''}
        </Text>
      </AppCard>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    paddingVertical: spacing.md,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  alignEnd: {
    alignItems: 'flex-end',
  },
  store: {
    color: palette.text,
    fontFamily: 'Inter_600SemiBold',
    fontSize: 17,
  },
  date: {
    marginTop: 4,
    color: palette.textMuted,
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
  },
  total: {
    color: palette.text,
    fontFamily: 'Inter_700Bold',
    fontSize: 18,
  },
  points: {
    marginTop: 4,
    color: palette.success,
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
  },
  items: {
    marginTop: spacing.md,
    color: palette.textMuted,
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    lineHeight: 20,
  },
});
