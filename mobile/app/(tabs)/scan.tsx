import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeScreen } from '@/components/ui/SafeScreen';
import { ReceiptCamera } from '@/components/ui/ReceiptCamera';
import { ParsedReceiptView } from '@/components/ui/ParsedReceiptView';
import { uploadAndParseReceipt, saveReceipt, ParsedReceipt } from '@/lib/receiptService';import { useAuthStore } from '@/store/authStore';
import { supabase } from '@/lib/supabase';
import { Typography, Palette, Colors } from '@/constants/theme';

type ScanState = 'idle' | 'camera' | 'processing' | 'review' | 'done';

export default function ScanScreen() {
  const { user }                          = useAuthStore();
  const [scanState, setScanState]         = useState<ScanState>('idle');
  const [capturedUri, setCapturedUri]     = useState<string | null>(null);
  const [parsedReceipt, setParsedReceipt] = useState<ParsedReceipt | null>(null);
  const [saving, setSaving]               = useState(false);

 const handleCapture = async (uri: string) => {
    setCapturedUri(uri);
    setScanState('processing');

    try {
      if (!user) throw new Error('Not logged in');

      const { imageUrl, parsed } = await uploadAndParseReceipt(uri, user.id);
      setCapturedUri(imageUrl);

      console.log('RAW OCR TEXT:', (parsed as any)._rawText);
      console.log('PARSED ITEMS:', parsed.items.length);

      setParsedReceipt(parsed);
      setScanState('review');
    } catch (err: any) {
      console.error('OCR error:', err);
      Alert.alert('Processing Failed', err.message ?? 'Unknown error. Please try again.');
      setScanState('idle');
    }
  };

  const handleSave = async (parsed: ParsedReceipt) => {
    if (!user || !capturedUri) return;
    try {
      setSaving(true);
      await saveReceipt(user.id, capturedUri, parsed);
      setScanState('done');
    } catch (err: any) {
      Alert.alert('Error', err.message ?? 'Failed to save receipt.');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setCapturedUri(null);
    setParsedReceipt(null);
    setScanState('idle');
  };

  if (scanState === 'done') {
    return (
      <SafeScreen blobs={[
        { variant: 2, color: 'moss', size: 280, top: -80,   right: -100, opacity: 0.25 },
        { variant: 4, color: 'clay', size: 220, bottom: 60, left: -80,   opacity: 0.20 },
      ]}>
        <View style={styles.doneContainer}>
          <View style={styles.doneIcon}>
            <Ionicons name="checkmark-circle" size={64} color={Palette.moss500} />
          </View>
          <Text style={styles.doneTitle}>Receipt Saved!</Text>
          <Text style={styles.doneSub}>
            Your items have been added to your habit profile. Deals will start matching soon.
          </Text>
          <TouchableOpacity style={styles.scanAgainBtn} onPress={handleReset}>
            <Text style={styles.scanAgainText}>Scan Another</Text>
          </TouchableOpacity>
        </View>
      </SafeScreen>
    );
  }

  if (scanState === 'review' && parsedReceipt) {
    return (
      <ParsedReceiptView
        parsed={parsedReceipt}
        onSave={handleSave}
        onDiscard={handleReset}
        saving={saving}
      />
    );
  }

  if (scanState === 'processing') {
    return (
      <SafeScreen blobs={[]}>
        <View style={styles.processingContainer}>
          <ActivityIndicator size="large" color={Palette.moss500} />
          <Text style={styles.processingTitle}>Reading your receipt...</Text>
          <Text style={styles.processingSub}>This usually takes a few seconds</Text>
        </View>
      </SafeScreen>
    );
  }

  if (scanState === 'camera') {
    return (
      <Modal animationType="slide" presentationStyle="fullScreen">
        <ReceiptCamera
          onCapture={handleCapture}
          onClose={() => setScanState('idle')}
        />
      </Modal>
    );
  }

  return (
    <SafeScreen blobs={[
      { variant: 2, color: 'moss', size: 280, top: -80,   right: -100, opacity: 0.25 },
      { variant: 4, color: 'clay', size: 220, bottom: 60, left: -80,   opacity: 0.20 },
    ]}>
      <View style={styles.container}>
        <View style={styles.iconWrap}>
          <Text style={styles.icon}>📷</Text>
        </View>

        <Text style={styles.title}>Scan a Receipt</Text>
        <Text style={styles.subtitle}>
          Point your camera at any grocery or restaurant receipt. SmartCart will read the items and start finding you deals.
        </Text>

        <TouchableOpacity
          style={styles.scanBtn}
          onPress={() => setScanState('camera')}
        >
          <Ionicons name="scan-outline" size={22} color={Palette.paleMist} />
          <Text style={styles.scanBtnText}>Open Camera</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.galleryBtn}
          onPress={async () => {
            const { launchImageLibraryAsync, MediaTypeOptions } = await import('expo-image-picker');
            const result = await launchImageLibraryAsync({
              mediaTypes: MediaTypeOptions.Images,
              quality:    0.8,
            });
            if (!result.canceled && result.assets[0]) {
              handleCapture(result.assets[0].uri);
            }
          }}
        >
          <Ionicons name="images-outline" size={22} color={Palette.moss500} />
          <Text style={styles.galleryBtnText}>Upload from Gallery</Text>
        </TouchableOpacity>
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
    fontFamily:   Typography.body,
    fontSize:     Typography.base,
    color:        Colors.textMuted,
    textAlign:    'center',
    lineHeight:   22,
    marginBottom: 36,
  },
  scanBtn: {
    flexDirection:     'row',
    alignItems:        'center',
    backgroundColor:   Palette.moss500,
    borderRadius:      9999,
    paddingVertical:   16,
    paddingHorizontal: 36,
    gap:               10,
    marginBottom:      14,
    width:             '100%',
    justifyContent:    'center',
  },
  scanBtnText: {
    fontFamily: Typography.bodyBold,
    fontSize:   Typography.base,
    color:      Palette.paleMist,
  },
  galleryBtn: {
    flexDirection:     'row',
    alignItems:        'center',
    backgroundColor:   'transparent',
    borderRadius:      9999,
    paddingVertical:   16,
    paddingHorizontal: 36,
    gap:               10,
    width:             '100%',
    justifyContent:    'center',
    borderWidth:       2,
    borderColor:       Palette.moss500,
  },
  galleryBtnText: {
    fontFamily: Typography.bodyBold,
    fontSize:   Typography.base,
    color:      Palette.moss500,
  },
  processingContainer: {
    flex:           1,
    alignItems:     'center',
    justifyContent: 'center',
    gap:            16,
  },
  processingTitle: {
    fontFamily: Typography.heading,
    fontSize:   Typography.xl,
    color:      Palette.loam,
    marginTop:  8,
  },
  processingSub: {
    fontFamily: Typography.body,
    fontSize:   Typography.sm,
    color:      Colors.textMuted,
  },
  doneContainer: {
    flex:              1,
    alignItems:        'center',
    justifyContent:    'center',
    paddingHorizontal: 32,
  },
  doneIcon: {
    marginBottom: 24,
  },
  doneTitle: {
    fontFamily:   Typography.heading,
    fontSize:     Typography['2xl'],
    color:        Palette.loam,
    marginBottom: 12,
  },
  doneSub: {
    fontFamily:   Typography.body,
    fontSize:     Typography.base,
    color:        Colors.textMuted,
    textAlign:    'center',
    lineHeight:   22,
    marginBottom: 32,
  },
  scanAgainBtn: {
    backgroundColor:   Palette.moss500,
    borderRadius:      9999,
    paddingVertical:   16,
    paddingHorizontal: 36,
  },
  scanAgainText: {
    fontFamily: Typography.bodyBold,
    fontSize:   Typography.base,
    color:      Palette.paleMist,
  },
});