import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/useTheme';
import { OrganicBlob, GrainOverlay, BlobVariant, BlobColor } from './OrganicBlob';

interface SafeScreenProps {
  children:    React.ReactNode;
  blobs?: Array<{
    variant:  BlobVariant;
    color:    BlobColor;
    size:     number;
    top?:     number;
    bottom?:  number;
    left?:    number;
    right?:   number;
    opacity?: number;
  }>;
  grain?:      boolean;
  innerStyle?: object;
}

const DEFAULT_BLOBS: SafeScreenProps['blobs'] = [
  { variant: 1, color: 'moss', size: 300, top: -80,   right: -100, opacity: 0.35 },
  { variant: 3, color: 'clay', size: 240, bottom: -60, left: -80,   opacity: 0.28 },
];

export function SafeScreen({
  children,
  blobs    = DEFAULT_BLOBS,
  grain    = true,
  innerStyle,
}: SafeScreenProps) {
  const { theme } = useTheme();

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]}>
      {blobs?.map((blob, i) => (
        <View
          key={i}
          style={[StyleSheet.absoluteFillObject, { zIndex: 0 }]}
          pointerEvents="none"
        >
          <OrganicBlob
            variant={blob.variant}
            color={blob.color}
            size={blob.size}
            opacity={blob.opacity ?? 0.4}
            style={{
              position: 'absolute',
              top:      blob.top,
              bottom:   blob.bottom,
              left:     blob.left,
              right:    blob.right,
            }}
          />
        </View>
      ))}
      {grain && <GrainOverlay opacity={0.03} />}
      <View style={[styles.inner, innerStyle]}>
        {children}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex:     1,
    overflow: 'hidden',
  },
  inner: {
    flex:   1,
    zIndex: 1,
  },
});