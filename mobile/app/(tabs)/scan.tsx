import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeScreen } from '@/components/ui/SafeScreen';
import { Button } from '@/components/ui/Button';
import { Typography, Palette, Colors } from '@/constants/theme';

export default function ScanScreen() {
  return (
    <SafeScreen blobs={[
      { variant: 2, color: 'moss', size: 280, top: -80,   right: -100, opacity: 0.25 },
      { variant: 4, color: 'clay', size: 220, bottom: 60, left: -80,   opacity: 0.20 },
    ]}>
      <View style={styles.container}>
        <View style={styles.iconWrap}>
          <Text style={styles.icon}>📷</Text>
        </View>
        <Text style={styles.title}>Receipt Scanner</Text>
        <Text style={styles.subtitle}>
          Scan any grocery or restaurant receipt to start building your personal deal profile.
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
    flex:            1,
    alignItems:      'center',
    justifyContent:  'center',
    paddingHorizontal: 32,
  },
  iconWrap: {
    width:           88,
    height:          88,
    borderRadius:    44,
    backgroundColor: `${Palette.moss500}12`,
    alignItems:      'center',
    justifyContent:  'center',
    borderWidth:     1,
    borderColor:     `${Palette.moss500}20`,
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