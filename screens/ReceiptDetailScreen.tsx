import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppCard } from '../components/AppCard';
import { EmptyState } from '../components/EmptyState';
import { PrimaryButton } from '../components/PrimaryButton';
import { Screen } from '../components/Screen';
import { useAppData } from '../hooks/useAppData';
import { RootStackParamList } from '../navigation/types';
import { formatCurrency, formatPoints, formatShortDate } from '../utils/format';
import { palette, spacing } from '../utils/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'ReceiptDetail'>;

export function ReceiptDetailScreen({ navigation, route }: Props) {
  const { getReceiptById } = useAppData();
  const receipt = getReceiptById(route.params.receiptId);

  if (!receipt) {
    return (
      <Screen title="Receipt Summary" subtitle="We couldn't find that saved receipt.">
        <EmptyState
          icon="help-circle-outline"
          title="Receipt not found"
          message="Try scanning another receipt or open the most recent one from Home."
        />
      </Screen>
    );
  }

  return (
    <Screen title={receipt.store} subtitle={`Scanned on ${formatShortDate(receipt.date)}`}>
      <AppCard>
        <View style={styles.summaryRow}>
          <View>
            <Text style={styles.label}>Receipt total</Text>
            <Text style={styles.total}>{formatCurrency(receipt.total)}</Text>
          </View>
          <View style={styles.alignRight}>
            <Text style={styles.label}>Rewards earned</Text>
            <Text style={styles.points}>{formatPoints(receipt.pointsEarned)}</Text>
          </View>
        </View>
        <View style={styles.actions}>
          <PrimaryButton label="See price watch" onPress={() => navigation.navigate('Recommendations')} style={styles.flex} />
          <PrimaryButton label="View trends" secondary onPress={() => navigation.navigate('Analytics')} style={styles.flex} />
        </View>
      </AppCard>

      <AppCard>
        <Text style={styles.sectionTitle}>Detected items</Text>
        {receipt.items.map((item) => (
          <View key={item.id} style={styles.itemRow}>
            <View style={styles.flex}>
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.itemMeta}>
                {item.category} • qty {item.quantity}
              </Text>
            </View>
            <Text style={styles.itemPrice}>{formatCurrency(item.price * item.quantity)}</Text>
          </View>
        ))}
      </AppCard>
    </Screen>
  );
}

const styles = StyleSheet.create({
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.lg,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  alignRight: {
    alignItems: 'flex-end',
  },
  label: {
    color: palette.textMuted,
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.7,
  },
  total: {
    marginTop: spacing.sm,
    color: palette.text,
    fontFamily: 'Inter_700Bold',
    fontSize: 28,
  },
  points: {
    marginTop: spacing.sm,
    color: palette.success,
    fontFamily: 'Inter_700Bold',
    fontSize: 22,
  },
  sectionTitle: {
    color: palette.text,
    fontFamily: 'Inter_700Bold',
    fontSize: 19,
    marginBottom: spacing.md,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: palette.border,
  },
  flex: {
    flex: 1,
  },
  itemName: {
    color: palette.text,
    fontFamily: 'Inter_600SemiBold',
    fontSize: 15,
  },
  itemMeta: {
    color: palette.textMuted,
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    marginTop: 3,
  },
  itemPrice: {
    color: palette.text,
    fontFamily: 'Inter_600SemiBold',
    fontSize: 15,
  },
});
