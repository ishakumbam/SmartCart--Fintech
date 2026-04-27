import React, { useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppCard } from '../components/AppCard';
import { PrimaryButton } from '../components/PrimaryButton';
import { Screen } from '../components/Screen';
import { useAppData } from '../hooks/useAppData';
import { RootStackParamList } from '../navigation/types';
import { parseReceiptImage } from '../services/receiptService';
import { palette, spacing } from '../utils/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'ReceiptPreview'>;

export function ReceiptPreviewScreen({ navigation, route }: Props) {
  const { addReceipt } = useAppData();
  const [processing, setProcessing] = useState(false);

  const processReceipt = async () => {
    setProcessing(true);
    try {
      const parsedReceipt = await parseReceiptImage(route.params.imageUri);
      const savedReceipt = await addReceipt(parsedReceipt, route.params.imageUri);
      navigation.replace('ReceiptDetail', {
        receiptId: savedReceipt.id,
      });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <Screen
      title="Review your capture"
      subtitle="This preview step keeps the scan flow clear and reliable before processing."
    >
      <AppCard style={styles.imageCard}>
        <Image source={{ uri: route.params.imageUri }} style={styles.image} resizeMode="contain" />
      </AppCard>

      <AppCard>
        <Text style={styles.noteTitle}>What happens next</Text>
        <Text style={styles.noteBody}>
          We’ll run a mocked OCR parse, save the receipt locally, award points, and refresh your nearby savings recommendations.
        </Text>
      </AppCard>

      <View style={styles.buttons}>
        <PrimaryButton
          label={processing ? 'Processing receipt...' : 'Use this receipt'}
          onPress={() => void processReceipt()}
          loading={processing}
        />
        <PrimaryButton label="Retake" secondary onPress={() => navigation.replace('Camera')} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  imageCard: {
    padding: spacing.sm,
  },
  image: {
    width: '100%',
    height: 420,
    borderRadius: 18,
    backgroundColor: palette.cardAlt,
  },
  noteTitle: {
    color: palette.text,
    fontFamily: 'Inter_700Bold',
    fontSize: 18,
  },
  noteBody: {
    marginTop: spacing.sm,
    color: palette.textMuted,
    fontFamily: 'Inter_500Medium',
    fontSize: 15,
    lineHeight: 23,
  },
  buttons: {
    gap: spacing.md,
  },
});
