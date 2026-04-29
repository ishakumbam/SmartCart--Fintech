import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { Palette, Typography } from '@/constants/theme';

interface ReceiptCameraProps {
  onCapture: (uri: string) => void;
  onClose:   () => void;
}

export function ReceiptCamera({ onCapture, onClose }: ReceiptCameraProps) {
  const [permission, requestPermission] = useCameraPermissions();
  const [facing]                        = useState<CameraType>('back');
  const [capturing, setCapturing]       = useState(false);
  const cameraRef                       = useRef<CameraView>(null);

  const takePicture = async () => {
    if (!cameraRef.current) return;
    try {
      setCapturing(true);
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        base64:  false,
      });
      if (photo?.uri) onCapture(photo.uri);
    } catch {
      Alert.alert('Error', 'Failed to take picture. Please try again.');
    } finally {
      setCapturing(false);
    }
  };

  const pickFromGallery = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality:    0.8,
    });
    if (!result.canceled && result.assets[0]) {
      onCapture(result.assets[0].uri);
    }
  };

  if (!permission) {
    return <View style={styles.container} />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionTitle}>Camera Access Needed</Text>
        <Text style={styles.permissionText}>
          SmartCart needs camera access to scan your receipts.
        </Text>
        <TouchableOpacity style={styles.permissionBtn} onPress={requestPermission}>
          <Text style={styles.permissionBtnText}>Grant Access</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Camera — no children */}
      <CameraView ref={cameraRef} style={styles.camera} facing={facing} />

      {/* Header — absolutely positioned over camera */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
          <Ionicons name="close" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Scan Receipt</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Alignment overlay — absolutely positioned */}
      <View style={styles.overlay} pointerEvents="none">
        <View style={styles.scanFrame}>
          <View style={[styles.corner, styles.topLeft]} />
          <View style={[styles.corner, styles.topRight]} />
          <View style={[styles.corner, styles.bottomLeft]} />
          <View style={[styles.corner, styles.bottomRight]} />
        </View>
        <Text style={styles.hint}>Align receipt within the frame</Text>
      </View>

      {/* Controls — absolutely positioned */}
      <View style={styles.controls}>
        <TouchableOpacity style={styles.galleryBtn} onPress={pickFromGallery}>
          <Ionicons name="images-outline" size={24} color="white" />
          <Text style={styles.galleryText}>Gallery</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.captureBtn}
          onPress={takePicture}
          disabled={capturing}
        >
          {capturing
            ? <ActivityIndicator color={Palette.moss500} />
            : <View style={styles.captureBtnInner} />
          }
        </TouchableOpacity>

        <View style={{ width: 64 }} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex:            1,
    backgroundColor: '#000',
  },
  camera: {
    ...StyleSheet.absoluteFillObject,
  },
  header: {
    position:          'absolute',
    top:               0,
    left:              0,
    right:             0,
    flexDirection:     'row',
    alignItems:        'center',
    justifyContent:    'space-between',
    paddingHorizontal: 20,
    paddingTop:        60,
    paddingBottom:     20,
  },
  closeBtn: {
    width:           40,
    height:          40,
    borderRadius:    20,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems:      'center',
    justifyContent:  'center',
  },
  headerTitle: {
    fontFamily: Typography.bodyBold,
    fontSize:   Typography.md,
    color:      'white',
  },
  overlay: {
    position:       'absolute',
    top:            0,
    left:           0,
    right:          0,
    bottom:         0,
    alignItems:     'center',
    justifyContent: 'center',
  },
  scanFrame: {
    width:    300,
    height:   400,
    position: 'relative',
  },
  corner: {
    position:    'absolute',
    width:       30,
    height:      30,
    borderColor: 'white',
    borderWidth: 3,
  },
  topLeft: {
    top:              0,
    left:             0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  topRight: {
    top:             0,
    right:           0,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
  },
  bottomLeft: {
    bottom:           0,
    left:             0,
    borderRightWidth: 0,
    borderTopWidth:   0,
  },
  bottomRight: {
    bottom:          0,
    right:           0,
    borderLeftWidth: 0,
    borderTopWidth:  0,
  },
  hint: {
    fontFamily: Typography.body,
    fontSize:   Typography.sm,
    color:      'rgba(255,255,255,0.8)',
    marginTop:  16,
  },
  controls: {
    position:          'absolute',
    bottom:            0,
    left:              0,
    right:             0,
    flexDirection:     'row',
    alignItems:        'center',
    justifyContent:    'space-between',
    paddingHorizontal: 40,
    paddingBottom:     50,
    paddingTop:        20,
  },
  galleryBtn: {
    alignItems: 'center',
    gap:        4,
  },
  galleryText: {
    fontFamily: Typography.body,
    fontSize:   Typography.xs,
    color:      'white',
  },
  captureBtn: {
    width:           72,
    height:          72,
    borderRadius:    36,
    backgroundColor: 'white',
    alignItems:      'center',
    justifyContent:  'center',
    borderWidth:     4,
    borderColor:     'rgba(255,255,255,0.5)',
  },
  captureBtnInner: {
    width:           56,
    height:          56,
    borderRadius:    28,
    backgroundColor: 'white',
  },
  permissionContainer: {
    flex:              1,
    alignItems:        'center',
    justifyContent:    'center',
    backgroundColor:   Palette.ricePaper,
    paddingHorizontal: 32,
  },
  permissionTitle: {
    fontFamily:   Typography.heading,
    fontSize:     Typography.xl,
    color:        Palette.loam,
    marginBottom: 12,
    textAlign:    'center',
  },
  permissionText: {
    fontFamily:   Typography.body,
    fontSize:     Typography.base,
    color:        Palette.driedGrass,
    textAlign:    'center',
    marginBottom: 24,
    lineHeight:   22,
  },
  permissionBtn: {
    backgroundColor:   Palette.moss500,
    borderRadius:      9999,
    paddingVertical:   14,
    paddingHorizontal: 32,
  },
  permissionBtnText: {
    fontFamily: Typography.bodyBold,
    fontSize:   Typography.base,
    color:      Palette.paleMist,
  },
});