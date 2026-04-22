import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeScreen } from '@/components/ui/SafeScreen';
import { Button } from '@/components/ui/Button';
import { Typography, Palette, Colors } from '@/constants/theme';

export default function NotificationsScreen() {
  return (
    <SafeScreen blobs={[
      { variant: 1, color: 'sand', size: 280, top: -80,   right: -100, opacity: 0.30 },
      { variant: 3, color: 'moss', size: 220, bottom: 60, left: -80,   opacity: 0.22 },
    ]}>
      <View style={styles.container}>
        <View style={styles.iconWrap}>
          <Text style={styles.icon}>🔔</Text>
        </View>
        <Text style={styles.title}>Deal Alerts</Text>
        <Text style={styles.subtitle}>
          You'll get notified here when your usual items go on sale nearby — before you even think to check.
        </Text>
        <Button
          label="Coming in Phase 4"
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
    backgroundColor: `${Palette.sand}`,
    alignItems:      'center',
    justifyContent:  'center',
    borderWidth:     1,
    borderColor:     `${Palette.rawTimber}`,
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