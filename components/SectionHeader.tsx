import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { palette, spacing } from '../utils/theme';

export function SectionHeader({
  title,
  actionLabel,
  onAction,
}: {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <View style={styles.row}>
      <Text style={styles.title}>{title}</Text>
      {actionLabel && onAction ? (
        <Pressable onPress={onAction}>
          <Text style={styles.action}>{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  title: {
    color: palette.text,
    fontFamily: 'Inter_600SemiBold',
    fontSize: 19,
  },
  action: {
    color: palette.primary,
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
  },
});
