import React, { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { AppCard } from '../components/AppCard';
import { EmptyState } from '../components/EmptyState';
import { PrimaryButton } from '../components/PrimaryButton';
import { ReceiptCard } from '../components/ReceiptCard';
import { Screen } from '../components/Screen';
import { SectionHeader } from '../components/SectionHeader';
import { useAppData } from '../hooks/useAppData';
import { MainTabParamList } from '../navigation/types';
import { palette, spacing } from '../utils/theme';

type Props = BottomTabScreenProps<MainTabParamList, 'Scan'>;

export function ScanScreen({ navigation }: Props) {
  const { state } = useAppData();
  const [busy, setBusy] = useState(false);

  const pickFromLibrary = async () => {
    setBusy(true);
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Photos access needed', 'Please allow photo access to import a receipt image.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 0.9,
        allowsEditing: false,
      });

      if (!result.canceled) {
        navigation.getParent()?.navigate('ReceiptPreview', {
          imageUri: result.assets[0].uri,
        });
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen
      title="Scan"
      subtitle="Use live camera capture or import from Photos. Everything stays Expo Go friendly."
    >
      <AppCard>
        <Text style={styles.title}>Receipt scanning flow</Text>
        <Text style={styles.body}>
          1. Capture or import a receipt image.
          {'\n'}
          2. Review the image preview.
          {'\n'}
          3. Run mock parsing and save your rewards instantly.
        </Text>
        <View style={styles.buttons}>
          <PrimaryButton label="Open camera" onPress={() => navigation.getParent()?.navigate('Camera')} />
          <PrimaryButton label="Choose photo" onPress={pickFromLibrary} secondary loading={busy} />
        </View>
      </AppCard>

      <SectionHeader title="Recent scans" />
      {state.receipts.length === 0 ? (
        <EmptyState
          icon="scan-circle-outline"
          title="Ready for your first receipt"
          message="Use the camera on a real iPhone in Expo Go and SmartCart will save the parsed result locally."
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
  title: {
    color: palette.text,
    fontFamily: 'Inter_700Bold',
    fontSize: 20,
  },
  body: {
    marginTop: spacing.md,
    color: palette.textMuted,
    fontFamily: 'Inter_500Medium',
    fontSize: 15,
    lineHeight: 24,
  },
  buttons: {
    gap: spacing.md,
    marginTop: spacing.lg,
  },
});
