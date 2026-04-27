import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { palette, spacing } from '../utils/theme';

export function BarChart({
  data,
}: {
  data: Array<{ label: string; amount: number }>;
}) {
  const max = Math.max(...data.map((item) => item.amount), 1);

  return (
    <View style={styles.row}>
      {data.map((item) => (
        <View key={item.label} style={styles.column}>
          <View style={styles.track}>
            <View
              style={[
                styles.fill,
                {
                  height: `${Math.max((item.amount / max) * 100, 10)}%`,
                },
              ]}
            />
          </View>
          <Text style={styles.label}>{item.label}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: spacing.sm,
    height: 160,
  },
  column: {
    flex: 1,
    alignItems: 'center',
  },
  track: {
    width: '100%',
    flex: 1,
    justifyContent: 'flex-end',
    borderRadius: 16,
    backgroundColor: palette.surfaceMuted,
    overflow: 'hidden',
  },
  fill: {
    width: '100%',
    minHeight: 12,
    backgroundColor: palette.primary,
    borderRadius: 16,
  },
  label: {
    marginTop: spacing.sm,
    color: palette.textMuted,
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
  },
});
