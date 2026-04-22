import React, { useRef } from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  TouchableOpacityProps,
  View,
  StyleSheet,
  Animated,
} from 'react-native';
import { Colors, Typography, Shadows, Palette } from '@/constants/theme';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'sand' | 'danger';
export type ButtonSize    = 'sm' | 'md' | 'lg';

interface ButtonProps extends Omit<TouchableOpacityProps, 'style'> {
  label:      string;
  variant?:   ButtonVariant;
  size?:      ButtonSize;
  loading?:   boolean;
  icon?:      React.ReactNode;
  iconRight?:  React.ReactNode;
  fullWidth?: boolean;
  style?:     object;
}

const VARIANT_STYLES = {
  primary:   { container: { backgroundColor: Palette.moss500, ...Shadows.soft },          text: { color: Palette.paleMist },      loaderColor: Palette.paleMist },
  secondary: { container: { backgroundColor: Palette.clay500, ...Shadows.soft },          text: { color: Palette.white },         loaderColor: Palette.white },
  outline:   { container: { backgroundColor: 'transparent', borderWidth: 2, borderColor: Palette.clay500 }, text: { color: Palette.clay500 }, loaderColor: Palette.clay500 },
  ghost:     { container: { backgroundColor: 'transparent' },                             text: { color: Palette.moss500 },       loaderColor: Palette.moss500 },
  sand:      { container: { backgroundColor: Palette.sand, ...Shadows.subtle },           text: { color: Palette.bark },          loaderColor: Palette.bark },
  danger:    { container: { backgroundColor: Palette.burntSienna, ...Shadows.soft },      text: { color: Palette.white },         loaderColor: Palette.white },
};

const SIZE_STYLES = {
  sm: { container: { height: 40, paddingHorizontal: 20 }, text: { fontSize: Typography.sm } },
  md: { container: { height: 48, paddingHorizontal: 28 }, text: { fontSize: Typography.base } },
  lg: { container: { height: 56, paddingHorizontal: 36 }, text: { fontSize: Typography.lg } },
};

export function Button({
  label,
  variant   = 'primary',
  size      = 'md',
  loading   = false,
  icon,
  iconRight,
  fullWidth = false,
  disabled,
  style,
  onPressIn,
  onPressOut,
  ...props
}: ButtonProps) {
  const scale = useRef(new Animated.Value(1)).current;
  const { container, text, loaderColor } = VARIANT_STYLES[variant];
  const { container: sizeCont, text: sizeText } = SIZE_STYLES[size];
  const isDisabled = disabled || loading;

  const handlePressIn = (e: any) => {
    Animated.spring(scale, {
      toValue: 0.96, useNativeDriver: true, speed: 50, bounciness: 0,
    }).start();
    onPressIn?.(e);
  };

  const handlePressOut = (e: any) => {
    Animated.spring(scale, {
      toValue: 1, useNativeDriver: true, speed: 30, bounciness: 4,
    }).start();
    onPressOut?.(e);
  };

  return (
    <Animated.View style={{ transform: [{ scale }], opacity: isDisabled ? 0.5 : 1 }}>
      <TouchableOpacity
        style={[styles.base, container, sizeCont, fullWidth && styles.fullWidth, style]}
        disabled={isDisabled}
        activeOpacity={0.92}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        {...props}
      >
        {loading ? (
          <ActivityIndicator size="small" color={loaderColor} />
        ) : (
          <>
            {icon && <View style={styles.iconLeft}>{icon}</View>}
            <Text style={[styles.label, text, sizeText]}>{label}</Text>
            {iconRight && <View style={styles.iconRight}>{iconRight}</View>}
          </>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius:   9999,
    flexDirection:  'row',
    alignItems:     'center',
    justifyContent: 'center',
  },
  fullWidth: {
    width: '100%',
  },
  label: {
    fontFamily:    Typography.bodyBold,
    letterSpacing: 0.2,
  },
  iconLeft: {
    marginRight: 8,
  },
  iconRight: {
    marginLeft: 8,
  },
});