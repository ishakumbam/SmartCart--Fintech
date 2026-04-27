import React, { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { PrimaryButton } from '../components/PrimaryButton';
import { RootStackParamList } from '../navigation/types';
import { palette, spacing } from '../utils/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Camera'>;

export function CameraScreen({ navigation }: Props) {
  const cameraRef = useRef<CameraView | null>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [ready, setReady] = useState(false);
  const [capturing, setCapturing] = useState(false);

  const captureReceipt = async () => {
    if (!cameraRef.current || capturing || !ready) {
      return;
    }

    setCapturing(true);
    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.85,
      });

      if (photo?.uri) {
        navigation.replace('ReceiptPreview', {
          imageUri: photo.uri,
        });
      }
    } catch (error) {
      Alert.alert(
        'Camera capture failed',
        error instanceof Error ? error.message : 'Please try again.',
      );
    } finally {
      setCapturing(false);
    }
  };

  if (!permission) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={palette.primary} />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.permissionScreen}>
        <Text style={styles.permissionTitle}>Allow camera access</Text>
        <Text style={styles.permissionBody}>
          SmartCart uses the iPhone camera to scan grocery receipts directly inside Expo Go.
        </Text>
        <PrimaryButton label="Grant permission" onPress={() => void requestPermission()} />
        <PrimaryButton label="Back" secondary onPress={() => navigation.goBack()} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        ref={cameraRef}
        style={StyleSheet.absoluteFill}
        facing="back"
        mode="picture"
        onCameraReady={() => setReady(true)}
      />

      <View style={styles.overlay}>
        <Text style={styles.overlayTitle}>Line up the full receipt inside the guide</Text>
        <View style={styles.frame}>
          <View style={[styles.corner, styles.topLeft]} />
          <View style={[styles.corner, styles.topRight]} />
          <View style={[styles.corner, styles.bottomLeft]} />
          <View style={[styles.corner, styles.bottomRight]} />
        </View>
        <View style={styles.footer}>
          <PrimaryButton
            label={capturing ? 'Capturing...' : ready ? 'Capture receipt' : 'Starting camera...'}
            onPress={captureReceipt}
            disabled={!ready}
            loading={capturing}
            style={styles.captureButton}
          />
          <PrimaryButton label="Cancel" secondary onPress={() => navigation.goBack()} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.background,
  },
  permissionScreen: {
    flex: 1,
    justifyContent: 'center',
    padding: spacing.xl,
    gap: spacing.md,
    backgroundColor: palette.background,
  },
  permissionTitle: {
    color: palette.text,
    fontFamily: 'Inter_700Bold',
    fontSize: 28,
  },
  permissionBody: {
    color: palette.textMuted,
    fontFamily: 'Inter_500Medium',
    fontSize: 16,
    lineHeight: 24,
    marginBottom: spacing.sm,
  },
  overlay: {
    flex: 1,
    justifyContent: 'space-between',
    paddingTop: 72,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
    backgroundColor: 'rgba(10, 18, 14, 0.18)',
  },
  overlayTitle: {
    color: '#FFFFFF',
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    textAlign: 'center',
  },
  frame: {
    alignSelf: 'center',
    width: '88%',
    aspectRatio: 0.72,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 34,
    height: 34,
    borderWidth: 4,
    borderColor: '#FFFFFF',
  },
  topLeft: {
    top: 0,
    left: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  topRight: {
    top: 0,
    right: 0,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderRightWidth: 0,
    borderTopWidth: 0,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
  footer: {
    gap: spacing.md,
  },
  captureButton: {
    backgroundColor: '#FFFFFF',
  },
});
