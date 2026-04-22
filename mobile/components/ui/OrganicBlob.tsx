import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Path, Defs, RadialGradient, Stop } from 'react-native-svg';
import { Palette } from '@/constants/theme';

export type BlobVariant = 1 | 2 | 3 | 4 | 5;
export type BlobColor   = 'moss' | 'clay' | 'sand' | 'stone';

interface OrganicBlobProps {
  variant?:  BlobVariant;
  color?:    BlobColor;
  size?:     number;
  opacity?:  number;
  style?:    object;
}

const BLOB_PATHS: Record<BlobVariant, string> = {
  1: 'M44.2,-55.6C56.4,-47.3,64.7,-31.7,67.8,-14.9C70.9,1.9,68.7,20,60.7,34C52.7,47.9,39,57.7,24.2,63.1C9.4,68.5,-6.5,69.6,-22.3,65.7C-38.1,61.8,-53.9,52.9,-62.8,39.5C-71.8,26.2,-73.9,8.4,-69.1,-7.2C-64.3,-22.8,-52.5,-36.2,-39.7,-44.6C-26.9,-53,-13.4,-56.4,2.4,-59.4C18.2,-62.4,32,-63.9,44.2,-55.6Z',
  2: 'M52.3,-63.1C67.5,-54.7,79.1,-38.6,81.1,-21.6C83.2,-4.6,75.7,13.3,65.9,28.2C56.1,43.1,44,55,29.8,62.1C15.6,69.2,-0.7,71.5,-16.6,67.9C-32.5,64.3,-47.9,54.8,-58.1,41.4C-68.3,28,-73.2,10.7,-71.8,-6.1C-70.4,-23,-62.5,-39.3,-50.3,-48.3C-38.1,-57.2,-21.5,-58.6,-3.6,-54.5C14.3,-50.3,37.1,-71.5,52.3,-63.1Z',
  3: 'M38.9,-51.4C51.1,-44.3,62.4,-33.5,67.2,-20.1C72,-6.7,70.3,9.3,63.9,23.1C57.5,36.9,46.3,48.5,33.1,56.2C19.8,63.9,4.5,67.7,-11.6,67.2C-27.7,66.6,-44.6,61.7,-56.4,51.3C-68.1,40.9,-74.7,25,-74.4,9.4C-74.1,-6.2,-66.9,-21.5,-56.8,-33.2C-46.7,-44.8,-33.7,-52.8,-20.4,-59.5C-7,-66.2,6.6,-71.7,19.2,-69.5C31.9,-67.2,26.7,-58.5,38.9,-51.4Z',
  4: 'M55.6,-67.9C71.5,-57.2,82.8,-39.6,84.4,-21.5C86,-3.4,77.8,15.2,67.3,30.8C56.7,46.4,43.7,59.1,28.7,67.3C13.6,75.5,-3.5,79.2,-19.5,75.2C-35.5,71.1,-50.5,59.3,-60.9,44.5C-71.2,29.7,-77,11.9,-75.2,-5.3C-73.4,-22.5,-64,-39.1,-51,-50.5C-38,-61.9,-21.4,-68.1,-3.5,-64C14.5,-59.9,39.7,-78.6,55.6,-67.9Z',
  5: 'M46.1,-58.3C59.8,-49.2,70.7,-35.1,74.1,-19.5C77.4,-3.9,73.2,13.1,65.3,27.7C57.4,42.3,45.8,54.5,32,62.5C18.2,70.4,2.2,74.1,-14.7,72.4C-31.7,70.7,-49.5,63.6,-61.5,51.5C-73.5,39.4,-79.7,22.3,-78.9,5.8C-78.1,-10.7,-70.4,-26.5,-59.8,-38.8C-49.3,-51.1,-36,-59.9,-22,-64.3C-8,-68.6,6.7,-68.5,20.4,-65.6C34.1,-62.6,32.4,-67.4,46.1,-58.3Z',
};

const COLOR_MAP: Record<BlobColor, { start: string; end: string }> = {
  moss:  { start: `${Palette.moss200}99`,  end: `${Palette.moss100}40` },
  clay:  { start: `${Palette.clay200}88`,  end: `${Palette.clay100}33` },
  sand:  { start: `${Palette.sand}CC`,     end: `${Palette.sand}44` },
  stone: { start: `${Palette.stone}BB`,    end: `${Palette.stone}44` },
};

export function OrganicBlob({
  variant = 1,
  color   = 'moss',
  size    = 280,
  opacity = 0.6,
  style,
}: OrganicBlobProps) {
  const { start, end } = COLOR_MAP[color];
  const gradientId     = `blob-grad-${variant}-${color}`;

  return (
    <View style={[{ width: size, height: size }, style]} pointerEvents="none">
      <Svg
        width={size}
        height={size}
        viewBox="-100 -100 200 200"
        opacity={opacity}
      >
        <Defs>
          <RadialGradient id={gradientId} cx="50%" cy="50%" r="50%">
            <Stop offset="0%"   stopColor={start} />
            <Stop offset="100%" stopColor={end}   />
          </RadialGradient>
        </Defs>
        <Path d={BLOB_PATHS[variant]} fill={`url(#${gradientId})`} />
      </Svg>
    </View>
  );
}

export function GrainOverlay({ opacity = 0.035 }: { opacity?: number }) {
  return (
    <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
      <Svg width="100%" height="100%" opacity={opacity}>
        {Array.from({ length: 40 }, (_, i) =>
          Array.from({ length: 80 }, (_, j) => {
            const x       = j * 5;
            const y       = i * 5;
            const o       = Math.random() > 0.7 ? 0.15 : 0;
            return o > 0 ? (
              <Path
                key={`${i}-${j}`}
                d={`M${x},${y} h3 v3 h-3 Z`}
                fill="#2C2C24"
                opacity={o}
              />
            ) : null;
          })
        )}
      </Svg>
    </View>
  );
}