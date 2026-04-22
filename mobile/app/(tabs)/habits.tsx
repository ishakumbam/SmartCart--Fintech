import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeScreen } from '@/components/ui/SafeScreen';
import { Button } from '@/components/ui/Button';
import { Typography, Palette, Colors } from '@/constants/theme';

export default function HabitsScreen() {
  return (
    <SafeScreen blobs={[
      { variant: 3, color: 'clay', size: 280, top: -80,   left: -100,  opacity: 0.22 },
      { variant: 5, color: 'moss', size: 220, bottom: 60, right: -80,  opacity: 0.25 },
    ]}>
      <View style={styles.container}>
        <View style={styles.iconWrap}>
          <Text style={styles.icon}>📊</Text>
        </View>
        <Text style={styles.title}>My Habits</Text>
        <Text style={styles.subtitle}>
          After scanning a few receipts, you'll see charts of your top spending categories and most-purchased items here.
        </Text>
        <Button
          label="Coming in Phase 2"
          variant="outline"
          size="md"
          disabled
          style={{ marginTop: 24 }}
        />
      </View>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex:              1,
    alignItems:        'center',
    justifyContent:    'center',
    paddingHorizontal: 32,
  },
  iconWrap: {
    width:           88,
    height:          88,
    borderRadius:    44,
    backgroundColor: `${Palette.clay500}12`,
    alignItems:      'center',
    justifyContent:  'center',
    borderWidth:     1,
    borderColor:     `${Palette.clay500}20`,
    marginBottom:    24,
  },
  icon: {
    fontSize: 40,
  },
  title: {
    fontFamily:   Typography.heading,
    fontSize:     Typography['2xl'],
    color:        Palette.loam,
    textAlign:    'center',
    marginBottom: 12,
  },
  subtitle: {
    fontFamily: Typography.body,
    fontSize:   Typography.base,
    color:      Colors.textMuted,
    textAlign:  'center',
    lineHeight: 22,
  },
});