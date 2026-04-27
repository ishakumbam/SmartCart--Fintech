import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { AppCard } from '../components/AppCard';
import { EmptyState } from '../components/EmptyState';
import { ReceiptCard } from '../components/ReceiptCard';
import { Screen } from '../components/Screen';
import { useAppData } from '../hooks/useAppData';
import { MainTabParamList } from '../navigation/types';
import { formatPoints, formatShortDate } from '../utils/format';
import { palette, radius, spacing } from '../utils/theme';

type Props = BottomTabScreenProps<MainTabParamList, 'Profile'>;

export function ProfileScreen({ navigation }: Props) {
  const { state } = useAppData();

  return (
    <Screen title="Profile" subtitle="Member details, rewards progress, and your saved receipt history.">
      <AppCard style={styles.profileCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {state.profile.name
              .split(' ')
              .map((part) => part[0])
              .join('')
              .slice(0, 2)
              .toUpperCase()}
          </Text>
        </View>
        <Text style={styles.name}>{state.profile.name}</Text>
        <Text style={styles.meta}>Member since {formatShortDate(state.profile.memberSince)}</Text>
        <View style={styles.rewardsBadge}>
          <Text style={styles.rewardsText}>{formatPoints(state.profile.points)}</Text>
        </View>
      </AppCard>

      <View style={styles.statsRow}>
        <AppCard style={styles.statCard}>
          <Text style={styles.statLabel}>Home store</Text>
          <Text style={styles.statValue}>{state.profile.homeStore}</Text>
        </AppCard>
        <AppCard style={styles.statCard}>
          <Text style={styles.statLabel}>Saved receipts</Text>
          <Text style={styles.statValue}>{state.receipts.length}</Text>
        </AppCard>
      </View>

      <Text style={styles.historyTitle}>Past receipts</Text>
      {state.receipts.length === 0 ? (
        <EmptyState
          icon="person-outline"
          title="Your profile is ready"
          message="Once you scan receipts, your purchase history will show up here."
        />
      ) : (
        state.receipts.map((receipt) => (
          <ReceiptCard
            key={receipt.id}
            receipt={receipt}
            onPress={() =>
              navigation.getParent()?.navigate('ReceiptDetail', { receiptId: receipt.id })
            }
          />
        ))
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  profileCard: {
    alignItems: 'center',
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: palette.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: palette.primary,
    fontFamily: 'Inter_700Bold',
    fontSize: 28,
  },
  name: {
    marginTop: spacing.md,
    color: palette.text,
    fontFamily: 'Inter_700Bold',
    fontSize: 24,
  },
  meta: {
    marginTop: 4,
    color: palette.textMuted,
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
  },
  rewardsBadge: {
    marginTop: spacing.md,
    backgroundColor: palette.primary,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.lg,
    paddingVertical: 10,
  },
  rewardsText: {
    color: '#FFFFFF',
    fontFamily: 'Inter_600SemiBold',
    fontSize: 15,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.md,
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
    fontSize: 20,
  },
  historyTitle: {
    color: palette.text,
    fontFamily: 'Inter_600SemiBold',
    fontSize: 19,
  },
});
