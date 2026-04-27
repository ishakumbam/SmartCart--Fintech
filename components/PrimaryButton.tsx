import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  ViewStyle,
} from 'react-native';
import { palette, radius, spacing } from '../utils/theme';

export function PrimaryButton({
  label,
  onPress,
  disabled,
  loading,
  secondary,
  style,
}: {
  label: string;
  onPress?: () => void;
  disabled?: boolean;
  loading?: boolean;
  secondary?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const inactive = disabled || loading;

  return (
    <Pressable
      disabled={inactive}
      onPress={onPress}
      style={[
        styles.button,
        secondary ? styles.secondary : styles.primary,
        inactive && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={secondary ? palette.primary : '#FFFFFF'} />
      ) : (
        <Text style={[styles.label, secondary ? styles.secondaryLabel : styles.primaryLabel]}>
          {label}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 54,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  primary: {
    backgroundColor: palette.primary,
  },
  secondary: {
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.border,
  },
  disabled: {
    opacity: 0.55,
  },
  label: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
  },
  primaryLabel: {
    color: '#FFFFFF',
  },
  secondaryLabel: {
    color: palette.primary,
  },
});
