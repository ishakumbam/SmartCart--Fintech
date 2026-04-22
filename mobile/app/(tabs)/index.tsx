import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeScreen } from '@/components/ui/SafeScreen';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useAuthStore } from '@/store/authStore';
import { Colors, Typography, Palette, Shadows } from '@/constants/theme';

function SkeletonDealCard({ organic }: { organic: 1 | 2 | 3 }) {
  return (
    <Card organic={organic} style={styles.skeletonCard}>
      <View style={styles.skeletonImageArea}>
        <View style={styles.skeletonImage} />
        <View style={styles.skeletonBadge} />
      </View>
      <View style={{ padding: 14 }}>
        <View style={[styles.skeletonLine, { width: '60%', marginBottom: 6 }]} />
        <View style={[styles.skeletonLine, { width: '40%', height: 10 }]} />
        <View style={styles.skeletonPriceRow}>
          <View style={[styles.skeletonLine, { width: 50, height: 18 }]} />
          <View style={[styles.skeletonLine, { width: 70, height: 14 }]} />
        </View>
      </View>
    </Card>
  );
}

function StepChip({ num, label, done }: { num: number; label: string; done: boolean }) {
  return (
    <View style={[styles.stepChip, done && styles.stepChipDone]}>
      <View style={[styles.stepNum, done && styles.stepNumDone]}>
        {done
          ? <Ionicons name="checkmark" size={11} color={Palette.paleMist} />
          : <Text style={styles.stepNumText}>{num}</Text>
        }
      </View>
      <Text style={[styles.stepLabel, done && styles.stepLabelDone]}>{label}</Text>
    </View>
  );
}

export default function HomeScreen() {
  const { user } = useAuthStore();
  const firstName = user?.name?.split(' ')[0] ?? 'there';

  return (
    <SafeScreen blobs={[
      { variant: 1, color: 'moss', size: 320, top: -100, right: -120, opacity: 0.25 },
      { variant: 3, color: 'sand', size: 220, bottom: 80, left: -80,  opacity: 0.30 },
    ]}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Hey {firstName} 👋</Text>
            <Text style={styles.tagline}>The Expedia of everyday shopping</Text>
          </View>
          <TouchableOpacity style={styles.locationChip}>
            <Ionicons name="location-outline" size={14} color={Palette.moss500} />
            <Text style={styles.locationText}>Nearby</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.onboardCard}>
          <Text style={styles.onboardTitle}>Get your first deals</Text>
          <Text style={styles.onboardSub}>Complete 3 quick steps</Text>
          <View style={styles.stepsRow}>
            <StepChip num={1} label="Signed up"    done={true} />
            <StepChip num={2} label="Scan receipt" done={false} />
            <StepChip num={3} label="See deals"    done={false} />
          </View>
          <Button
            label="Scan Your First Receipt"
            onPress={() => router.push('/(tabs)/scan')}
            fullWidth
            size="md"
            icon={<Ionicons name="scan-outline" size={18} color={Palette.paleMist} />}
            style={{ marginTop: 16 }}
          />
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Your Deal Feed</Text>
          <Text style={styles.sectionSub}>Personalized after your first scan</Text>
        </View>

        <View style={styles.dealGrid}>
          <View style={{ opacity: 0.45 }}><SkeletonDealCard organic={1} /></View>
          <View style={{ opacity: 0.30 }}><SkeletonDealCard organic={2} /></View>
          <View style={{ opacity: 0.18 }}><SkeletonDealCard organic={3} /></View>
        </View>

        <View style={styles.emptyState}>
          <View style={styles.emptyIcon}>
            <Text style={{ fontSize: 36 }}>🌿</Text>
          </View>
          <Text style={styles.emptyTitle}>Deals grow from receipts</Text>
          <Text style={styles.emptyBody}>
            Scan your first grocery receipt and SmartCart will surface deals on the exact items you buy — ranked by how often you buy them.
          </Text>
          <Button
            label="Scan a Receipt"
            variant="outline"
            onPress={() => router.push('/(tabs)/scan')}
            size="md"
            style={{ marginTop: 20 }}
          />
        </View>
      </ScrollView>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingBottom: 40,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop:        20,
    paddingBottom:     16,
    flexDirection:     'row',
    justifyContent:    'space-between',
    alignItems:        'flex-start',
  },
  greeting: {
    fontFamily: Typography.heading,
    fontSize:   Typography['2xl'],
    color:      Palette.loam,
    lineHeight: 30,
  },
  tagline: {
    fontFamily: Typography.body,
    fontSize:   Typography.sm,
    color:      Colors.textMuted,
    marginTop:  2,
  },
  locationChip: {
    flexDirection:     'row',
    alignItems:        'center',
    backgroundColor:   `${Palette.moss500}12`,
    borderRadius:      9999,
    paddingVertical:   6,
    paddingHorizontal: 12,
    gap:               4,
    borderWidth:       1,
    borderColor:       `${Palette.moss500}25`,
    marginTop:         4,
  },
  locationText: {
    fontFamily: Typography.bodySemi,
    fontSize:   Typography.xs,
    color:      Palette.moss500,
  },
  onboardCard: {
    marginHorizontal:        20,
    marginBottom:            28,
    backgroundColor:         Palette.moss500,
    borderTopLeftRadius:     48,
    borderTopRightRadius:    24,
    borderBottomRightRadius: 48,
    borderBottomLeftRadius:  32,
    padding:                 24,
    shadowColor:             Palette.moss700,
    shadowOffset:            { width: 0, height: 8 },
    shadowOpacity:           0.25,
    shadowRadius:            20,
    elevation:               8,
    overflow:                'hidden',
  },
  onboardTitle: {
    fontFamily:   Typography.heading,
    fontSize:     Typography.xl,
    color:        Palette.paleMist,
    marginBottom: 4,
  },
  onboardSub: {
    fontFamily:   Typography.body,
    fontSize:     Typography.sm,
    color:        `${Palette.paleMist}AA`,
    marginBottom: 16,
  },
  stepsRow: {
    flexDirection: 'row',
    gap:           8,
    flexWrap:      'wrap',
  },
  stepChip: {
    flexDirection:     'row',
    alignItems:        'center',
    gap:               6,
    backgroundColor:   `${Palette.white}18`,
    borderRadius:      9999,
    paddingVertical:   5,
    paddingHorizontal: 10,
    borderWidth:       1,
    borderColor:       `${Palette.white}25`,
  },
  stepChipDone: {
    backgroundColor: `${Palette.white}28`,
  },
  stepNum: {
    width:           18,
    height:          18,
    borderRadius:    9,
    backgroundColor: `${Palette.white}30`,
    alignItems:      'center',
    justifyContent:  'center',
  },
  stepNumDone: {
    backgroundColor: Palette.clay500,
  },
  stepNumText: {
    fontFamily: Typography.bodyBold,
    fontSize:   10,
    color:      Palette.paleMist,
  },
  stepLabel: {
    fontFamily: Typography.bodySemi,
    fontSize:   Typography.xs,
    color:      `${Palette.paleMist}CC`,
  },
  stepLabelDone: {
    color: Palette.paleMist,
  },
  sectionHeader: {
    paddingHorizontal: 24,
    marginBottom:      16,
  },
  sectionTitle: {
    fontFamily: Typography.heading,
    fontSize:   Typography.xl,
    color:      Palette.loam,
  },
  sectionSub: {
    fontFamily: Typography.body,
    fontSize:   Typography.sm,
    color:      Colors.textMuted,
    marginTop:  2,
  },
  dealGrid: {
    paddingHorizontal: 20,
    gap:               14,
    marginBottom:      28,
  },
  skeletonCard: {
    overflow: 'hidden',
  },
  skeletonImageArea: {
    height:          120,
    backgroundColor: Palette.stone,
    position:        'relative',
  },
  skeletonImage: {
    position:        'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: Palette.sand,
  },
  skeletonBadge: {
    position:        'absolute',
    top:             12,
    right:           12,
    width:           52,
    height:          24,
    borderRadius:    12,
    backgroundColor: Palette.moss200,
  },
  skeletonLine: {
    height:          12,
    borderRadius:    6,
    backgroundColor: Palette.stone,
    marginBottom:    4,
  },
  skeletonPriceRow: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    alignItems:     'center',
    marginTop:      8,
  },
  emptyState: {
    marginHorizontal: 24,
    alignItems:       'center',
    paddingVertical:  8,
  },
  emptyIcon: {
    width:           80,
    height:          80,
    borderRadius:    40,
    backgroundColor: `${Palette.moss500}12`,
    alignItems:      'center',
    justifyContent:  'center',
    borderWidth:     1,
    borderColor:     `${Palette.moss500}20`,
    marginBottom:    20,
  },
  emptyTitle: {
    fontFamily:   Typography.heading,
    fontSize:     Typography['2xl'],
    color:        Palette.loam,
    textAlign:    'center',
    marginBottom: 12,
  },
  emptyBody: {
    fontFamily: Typography.body,
    fontSize:   Typography.base,
    color:      Colors.textMuted,
    textAlign:  'center',
    lineHeight: 22,
  },
});