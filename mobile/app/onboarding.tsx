import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Animated,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeScreen } from '@/components/ui/SafeScreen';
import { Button } from '@/components/ui/Button';
import { OrganicBlob } from '@/components/ui/OrganicBlob';
import { useAuthStore } from '@/store/authStore';
import { supabase } from '@/lib/supabase';
import { Typography, Palette, Colors } from '@/constants/theme';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface Step {
  id:          number;
  emoji:       string;
  title:       string;
  subtitle:    string;
  description: string;
  action?:     string;
}

const STEPS: Step[] = [
  {
    id:          1,
    emoji:       '🛒',
    title:       'Welcome to SmartCart',
    subtitle:    'The Expedia of everyday shopping',
    description: 'SmartCart learns what you buy and automatically finds the best deals on those exact items — so you never overpay again.',
    action:      'Get Started',
  },
  {
    id:          2,
    emoji:       '📍',
    title:       'Find deals near you',
    subtitle:    'Location helps us find local deals',
    description: 'Allow location access so SmartCart can show you deals at stores within your area. We never share your location with third parties.',
    action:      'Allow Location',
  },
  {
    id:          3,
    emoji:       '🔔',
    title:       'Never miss a deal',
    subtitle:    'Get notified when your items go on sale',
    description: "When your usual orange juice goes on sale at Kroger, we'll send you a notification before your next shopping trip.",
    action:      'Allow Notifications',
  },
];

export default function OnboardingScreen() {
  const { user } = useAuthStore();
  const [currentStep, setCurrentStep]   = useState(0);
  const [loading, setLoading]           = useState(false);
  const scrollRef                        = useRef<ScrollView>(null);

  const goToStep = (index: number) => {
    setCurrentStep(index);
    scrollRef.current?.scrollTo({ x: index * SCREEN_WIDTH, animated: true });
  };

  const handleAction = async () => {
    setLoading(true);
    try {
      if (currentStep === 1) {
        // Request location
        await Location.requestForegroundPermissionsAsync();
      } else if (currentStep === 2) {
        // Request notifications
        await Notifications.requestPermissionsAsync();
        // Mark onboarding complete
        if (user) {
          await supabase
            .from('profiles')
            .update({ onboarding_complete: true } as any)
            .eq('id', user.id);
        }
        router.replace('/(tabs)');
        return;
      }
      goToStep(currentStep + 1);
    } catch (err) {
      goToStep(currentStep + 1);
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    if (currentStep === STEPS.length - 1) {
      router.replace('/(tabs)');
    } else {
      goToStep(currentStep + 1);
    }
  };

  const step = STEPS[currentStep];

  return (
    <SafeScreen blobs={[]} grain>
      {/* Background blobs change per step */}
      <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
        {currentStep === 0 && (
          <>
            <OrganicBlob variant={2} color="moss" size={340} opacity={0.28}
              style={{ position: 'absolute', top: -100, right: -120 }} />
            <OrganicBlob variant={4} color="clay" size={260} opacity={0.22}
              style={{ position: 'absolute', bottom: 40, left: -100 }} />
          </>
        )}
        {currentStep === 1 && (
          <>
            <OrganicBlob variant={3} color="clay" size={320} opacity={0.25}
              style={{ position: 'absolute', top: -80, left: -110 }} />
            <OrganicBlob variant={1} color="moss" size={240} opacity={0.22}
              style={{ position: 'absolute', bottom: 60, right: -90 }} />
          </>
        )}
        {currentStep === 2 && (
          <>
            <OrganicBlob variant={5} color="moss" size={300} opacity={0.25}
              style={{ position: 'absolute', top: -90, right: -100 }} />
            <OrganicBlob variant={2} color="sand" size={220} opacity={0.30}
              style={{ position: 'absolute', bottom: 40, left: -80 }} />
          </>
        )}
      </View>

      <View style={styles.container}>
        {/* ── Skip button ─────────────────────────────── */}
        <View style={styles.topRow}>
          <View style={{ flex: 1 }} />
          {currentStep < STEPS.length - 1 && (
            <TouchableOpacity style={styles.skipBtn} onPress={handleSkip}>
              <Text style={styles.skipText}>Skip</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* ── Step indicator ──────────────────────────── */}
        <View style={styles.dotsRow}>
          {STEPS.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                index === currentStep && styles.dotActive,
              ]}
            />
          ))}
        </View>

        {/* ── Content ─────────────────────────────────── */}
        <View style={styles.content}>
          {/* Big emoji */}
          <View style={styles.emojiWrap}>
            <Text style={styles.emoji}>{step.emoji}</Text>
          </View>

          <Text style={styles.title}>{step.title}</Text>
          <Text style={styles.subtitle}>{step.subtitle}</Text>
          <Text style={styles.description}>{step.description}</Text>

          {/* Feature list for step 1 */}
          {currentStep === 0 && (
            <View style={styles.featureList}>
              {[
                { icon: '📷', text: 'Scan any grocery receipt' },
                { icon: '🎯', text: 'Get deals on items you actually buy' },
                { icon: '💰', text: 'Free forever — no subscriptions' },
              ].map((f, i) => (
                <View key={i} style={styles.featureItem}>
                  <Text style={styles.featureEmoji}>{f.icon}</Text>
                  <Text style={styles.featureText}>{f.text}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Permission illustration for steps 2 & 3 */}
          {currentStep === 1 && (
            <View style={styles.permissionCard}>
              <Ionicons name="location" size={32} color={Palette.moss500} />
              <Text style={styles.permissionText}>
                "SmartCart would like to use your location to find nearby deals"
              </Text>
            </View>
          )}

          {currentStep === 2 && (
            <View style={styles.permissionCard}>
              <Ionicons name="notifications" size={32} color={Palette.clay500} />
              <Text style={styles.permissionText}>
                "SmartCart would like to send you notifications about deals on your usual items"
              </Text>
            </View>
          )}
        </View>

        {/* ── Action button ───────────────────────────── */}
        <View style={styles.bottomSection}>
          <Button
            label={step.action ?? 'Continue'}
            onPress={handleAction}
            loading={loading}
            fullWidth
            size="lg"
            icon={
              currentStep === 0
                ? <Ionicons name="arrow-forward" size={20} color={Palette.paleMist} />
                : currentStep === 1
                  ? <Ionicons name="location-outline" size={20} color={Palette.paleMist} />
                  : <Ionicons name="notifications-outline" size={20} color={Palette.paleMist} />
            }
          />

          {currentStep > 0 && (
            <TouchableOpacity
              style={styles.laterBtn}
              onPress={handleSkip}
            >
              <Text style={styles.laterText}>
                {currentStep === STEPS.length - 1 ? 'Skip for now' : 'Maybe later'}
              </Text>
            </TouchableOpacity>
          )}

          {/* Step counter */}
          <Text style={styles.stepCounter}>
            {currentStep + 1} of {STEPS.length}
          </Text>
        </View>
      </View>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex:              1,
    paddingHorizontal: 24,
  },
  topRow: {
    flexDirection:  'row',
    alignItems:     'center',
    paddingTop:     16,
    paddingBottom:  8,
  },
  skipBtn: {
    paddingVertical:   8,
    paddingHorizontal: 16,
    backgroundColor:   `${Palette.moss500}12`,
    borderRadius:      9999,
    borderWidth:       1,
    borderColor:       `${Palette.moss500}25`,
  },
  skipText: {
    fontFamily: Typography.bodySemi,
    fontSize:   Typography.sm,
    color:      Palette.moss500,
  },
  dotsRow: {
    flexDirection:  'row',
    justifyContent: 'center',
    gap:            8,
    marginBottom:   40,
    marginTop:      8,
  },
  dot: {
    width:           8,
    height:          8,
    borderRadius:    4,
    backgroundColor: Palette.rawTimber,
  },
  dotActive: {
    width:           24,
    backgroundColor: Palette.moss500,
  },
  content: {
    flex:      1,
    alignItems: 'center',
  },
  emojiWrap: {
    width:           100,
    height:          100,
    borderRadius:    50,
    backgroundColor: `${Palette.moss500}12`,
    alignItems:      'center',
    justifyContent:  'center',
    borderWidth:     1,
    borderColor:     `${Palette.moss500}20`,
    marginBottom:    32,
  },
  emoji: {
    fontSize: 48,
  },
  title: {
    fontFamily:   Typography.heading,
    fontSize:     Typography['3xl'],
    color:        Palette.loam,
    textAlign:    'center',
    marginBottom: 8,
    lineHeight:   38,
  },
  subtitle: {
    fontFamily:   Typography.bodySemi,
    fontSize:     Typography.sm,
    color:        Palette.clay500,
    textAlign:    'center',
    letterSpacing: 0.5,
    marginBottom: 16,
  },
  description: {
    fontFamily:   Typography.body,
    fontSize:     Typography.base,
    color:        Colors.textMuted,
    textAlign:    'center',
    lineHeight:   24,
    marginBottom: 32,
    paddingHorizontal: 8,
  },
  featureList: {
    width:   '100%',
    gap:     12,
  },
  featureItem: {
    flexDirection:     'row',
    alignItems:        'center',
    backgroundColor:   '#FEFEFA',
    borderRadius:      16,
    padding:           14,
    gap:               12,
    borderWidth:       1,
    borderColor:       `${Palette.rawTimber}55`,
  },
  featureEmoji: {
    fontSize: 24,
  },
  featureText: {
    fontFamily: Typography.bodySemi,
    fontSize:   Typography.base,
    color:      Palette.loam,
  },
  permissionCard: {
    backgroundColor:   '#FEFEFA',
    borderRadius:      20,
    padding:           20,
    alignItems:        'center',
    gap:               12,
    borderWidth:       1,
    borderColor:       `${Palette.rawTimber}55`,
    width:             '100%',
  },
  permissionText: {
    fontFamily: Typography.body,
    fontSize:   Typography.sm,
    color:      Colors.textSecondary,
    textAlign:  'center',
    lineHeight: 20,
    fontStyle:  'italic',
  },
  bottomSection: {
    paddingBottom:  40,
    gap:            12,
    alignItems:     'center',
  },
  laterBtn: {
    paddingVertical: 8,
  },
  laterText: {
    fontFamily: Typography.body,
    fontSize:   Typography.sm,
    color:      Colors.textMuted,
  },
  stepCounter: {
    fontFamily: Typography.body,
    fontSize:   Typography.xs,
    color:      Colors.textMuted,
  },
});