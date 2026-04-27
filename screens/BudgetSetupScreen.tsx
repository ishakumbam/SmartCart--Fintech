import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppCard } from '../components/AppCard';
import { PrimaryButton } from '../components/PrimaryButton';
import { Screen } from '../components/Screen';
import { useAppData } from '../hooks/useAppData';
import { RootStackParamList } from '../navigation/types';
import { formatCurrency } from '../utils/format';
import { palette, radius, spacing } from '../utils/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'BudgetSetup'>;

const thresholdOptions = [
  { label: '75%', value: 0.75 },
  { label: '80%', value: 0.8 },
  { label: '90%', value: 0.9 },
];

export function BudgetSetupScreen({ navigation }: Props) {
  const { state, updateBudget } = useAppData();
  const [monthlyTarget, setMonthlyTarget] = useState(String(state.budget.monthlyTarget));
  const [warningThreshold, setWarningThreshold] = useState(state.budget.warningThreshold);

  const parsedTarget = useMemo(() => {
    const normalized = Number(monthlyTarget.replace(/[^0-9.]/g, ''));
    return Number.isFinite(normalized) && normalized > 0 ? normalized : 0;
  }, [monthlyTarget]);

  const saveBudget = () => {
    if (!parsedTarget) {
      return;
    }
    updateBudget(parsedTarget, warningThreshold);
    navigation.goBack();
  };

  return (
    <Screen
      title="Budget Setup"
      subtitle="Set the monthly grocery target and the warning point where SmartCart should start nudging you."
    >
      <AppCard>
        <Text style={styles.label}>Monthly grocery target</Text>
        <TextInput
          value={monthlyTarget}
          onChangeText={setMonthlyTarget}
          keyboardType="decimal-pad"
          placeholder="600"
          placeholderTextColor={palette.textMuted}
          style={styles.input}
        />
        <Text style={styles.help}>
          This drives the progress bar, budget alerts, and forward-looking spend forecast.
        </Text>
      </AppCard>

      <AppCard>
        <Text style={styles.label}>Budget warning threshold</Text>
        <View style={styles.optionRow}>
          {thresholdOptions.map((option) => {
            const selected = option.value === warningThreshold;
            return (
              <Text
                key={option.label}
                onPress={() => setWarningThreshold(option.value)}
                style={[styles.option, selected && styles.optionSelected]}
              >
                {option.label}
              </Text>
            );
          })}
        </View>
        <Text style={styles.help}>
          SmartCart will treat {Math.round(warningThreshold * 100)}% as your yellow-line budget moment.
        </Text>
      </AppCard>

      <AppCard>
        <Text style={styles.previewTitle}>Preview</Text>
        <Text style={styles.previewValue}>{formatCurrency(parsedTarget || 0)}</Text>
        <Text style={styles.help}>
          If you keep your current pacing, SmartCart compares it against this target every month.
        </Text>
      </AppCard>

      <View style={styles.buttonGroup}>
        <PrimaryButton label="Save budget" onPress={saveBudget} disabled={!parsedTarget} />
        <PrimaryButton label="Cancel" secondary onPress={() => navigation.goBack()} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  label: {
    color: palette.text,
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
  },
  input: {
    marginTop: spacing.md,
    minHeight: 54,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: palette.border,
    backgroundColor: palette.cardAlt,
    paddingHorizontal: spacing.md,
    color: palette.text,
    fontFamily: 'Inter_600SemiBold',
    fontSize: 22,
  },
  help: {
    marginTop: spacing.sm,
    color: palette.textMuted,
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    lineHeight: 21,
  },
  optionRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  option: {
    overflow: 'hidden',
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: palette.border,
    backgroundColor: palette.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    color: palette.primary,
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
  },
  optionSelected: {
    backgroundColor: palette.primary,
    borderColor: palette.primary,
    color: '#FFFFFF',
  },
  previewTitle: {
    color: palette.textMuted,
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.7,
  },
  previewValue: {
    marginTop: spacing.sm,
    color: palette.text,
    fontFamily: 'Inter_700Bold',
    fontSize: 28,
  },
  buttonGroup: {
    gap: spacing.md,
  },
});
