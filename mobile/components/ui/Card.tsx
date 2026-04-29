import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  TouchableOpacityProps,
} from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { Radius, Shadows } from '@/constants/theme';

export type CardOrganic = 1 | 2 | 3 | 4 | 5 | 6 | 'default';

interface CardProps {
  children:     React.ReactNode;
  organic?:     CardOrganic;
  onPress?:     () => void;
  style?:       object;
  accentColor?: string;
  padded?:      boolean;
  pressProps?:  Omit<TouchableOpacityProps, 'onPress' | 'style'>;
}

const ORGANIC_RADII: Record<Exclude<CardOrganic, 'default'>, object> = {
  1: Radius.organic1,
  2: Radius.organic2,
  3: Radius.organic3,
  4: Radius.organic4,
  5: Radius.organic5,
  6: Radius.organic6,
};

export function Card({
  children,
  organic     = 'default',
  onPress,
  style,
  accentColor,
  padded      = true,
  pressProps,
}: CardProps) {
  const { theme } = useTheme();
  const radiusStyle = organic === 'default'
    ? { borderRadius: Radius['2xl'] }
    : ORGANIC_RADII[organic];

  const cardStyle = [
    styles.card,
    radiusStyle,
    {
      backgroundColor: theme.cardBackground,
      borderColor:     theme.borderSubtle,
    },
    padded && styles.padded,
    accentColor && { borderLeftWidth: 3, borderLeftColor: accentColor },
    style,
  ];

  if (onPress) {
    return (
      <TouchableOpacity
        style={cardStyle}
        onPress={onPress}
        activeOpacity={0.92}
        {...pressProps}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={cardStyle}>{children}</View>;
}

export function SectionCard({
  children,
  style,
}: {
  children: React.ReactNode;
  style?:   object;
}) {
  const { theme } = useTheme();
  return (
    <View style={[
      styles.section,
      {
        backgroundColor: theme.background,
        borderColor:     `${theme.border}55`,
      },
      style,
    ]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    overflow:    'hidden',
    ...Shadows.soft,
  },
  padded: {
    padding: 20,
  },
  section: {
    borderRadius: Radius['3xl'],
    padding:      20,
    borderWidth:  1,
    ...Shadows.subtle,
  },
});