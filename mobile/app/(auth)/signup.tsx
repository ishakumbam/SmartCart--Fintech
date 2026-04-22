import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  StyleSheet,
} from 'react-native';
import { router } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Ionicons } from '@expo/vector-icons';
import { SafeScreen } from '@/components/ui/SafeScreen';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { OrganicBlob } from '@/components/ui/OrganicBlob';
import { useAuthStore } from '@/store/authStore';
import { Colors, Typography, Palette } from '@/constants/theme';
import { supabase } from '@/lib/supabase';

const signupSchema = z.object({
  name:            z.string().min(2, 'Name must be at least 2 characters'),
  email:           z.string().email('Enter a valid email address'),
  password:        z.string().min(8, 'At least 8 characters'),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: 'Passwords do not match',
  path:    ['confirmPassword'],
});
type SignupForm = z.infer<typeof signupSchema>;

const PERKS = [
  { icon: '🔍', text: 'Personalized deals only' },
  { icon: '📷', text: 'Scan any grocery receipt' },
  { icon: '💰', text: 'Free, forever' },
];

export default function SignupScreen() {
  const [loading, setLoading] = useState(false);
  const { setAuth } = useAuthStore();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupForm>({ resolver: zodResolver(signupSchema) });

  const onSubmit = async (data: SignupForm) => {
    try {
      setLoading(true);
      const { data: authData, error } = await supabase.auth.signUp({
        email:    data.email,
        password: data.password,
        options: {
          data: { name: data.name },
        },
      });

      if (error) throw error;

      setAuth({
        id:        authData.user!.id,
        name:      data.name,
        email:     data.email,
        createdAt: authData.user!.created_at,
      });

      router.replace('/(tabs)');
    } catch (err: any) {
      Alert.alert('Sign Up Failed', err.message ?? 'Sign up failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeScreen blobs={[]} grain>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
          <OrganicBlob variant={5} color="clay" size={320} opacity={0.22}
            style={{ position: 'absolute', top: -80, left: -110 }} />
          <OrganicBlob variant={2} color="moss" size={280} opacity={0.25}
            style={{ position: 'absolute', bottom: 20, right: -90 }} />
          <OrganicBlob variant={3} color="sand" size={180} opacity={0.35}
            style={{ position: 'absolute', top: 280, right: -50 }} />
        </View>

        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.navRow}>
            <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={20} color={Palette.moss500} />
            </TouchableOpacity>
          </View>

          <View style={styles.header}>
            <Text style={styles.eyebrow}>Join SmartCart</Text>
            <Text style={styles.heading}>Start saving{'\n'}in 60 seconds.</Text>
          </View>

          <View style={styles.perksRow}>
            {PERKS.map((perk, i) => (
              <View key={i} style={styles.perkChip}>
                <Text style={styles.perkIcon}>{perk.icon}</Text>
                <Text style={styles.perkText}>{perk.text}</Text>
              </View>
            ))}
          </View>

          <View style={styles.formCard}>
            <Controller
              control={control}
              name="name"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Your name"
                  placeholder="Alex Johnson"
                  autoCapitalize="words"
                  leftIcon="person-outline"
                  onChangeText={onChange}
                  onBlur={onBlur}
                  value={value}
                  error={errors.name?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Email address"
                  placeholder="you@example.com"
                  keyboardType="email-address"
                  leftIcon="mail-outline"
                  onChangeText={onChange}
                  onBlur={onBlur}
                  value={value}
                  error={errors.email?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Password"
                  placeholder="At least 8 characters"
                  secureTextEntry
                  leftIcon="lock-closed-outline"
                  onChangeText={onChange}
                  onBlur={onBlur}
                  value={value}
                  error={errors.password?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="confirmPassword"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Confirm password"
                  placeholder="••••••••"
                  secureTextEntry
                  leftIcon="shield-checkmark-outline"
                  onChangeText={onChange}
                  onBlur={onBlur}
                  value={value}
                  error={errors.confirmPassword?.message}
                />
              )}
            />

            <Button
              label="Create My Account"
              onPress={handleSubmit(onSubmit)}
              loading={loading}
              fullWidth
              size="lg"
              style={{ marginTop: 4 }}
            />

            <Text style={styles.terms}>
              By signing up you agree to our{' '}
              <Text style={styles.termsLink}>Terms</Text>
              {' '}and{' '}
              <Text style={styles.termsLink}>Privacy Policy</Text>.
            </Text>
          </View>

          <View style={styles.loginRow}>
            <Text style={styles.loginPrompt}>Already have an account? </Text>
            <TouchableOpacity onPress={() => router.back()}>
              <Text style={styles.loginLink}>Sign in →</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flexGrow:      1,
    paddingBottom: 40,
  },
  navRow: {
    paddingHorizontal: 20,
    paddingTop:        16,
  },
  backBtn: {
    width:           40,
    height:          40,
    borderRadius:    20,
    backgroundColor: `${Palette.moss500}15`,
    alignItems:      'center',
    justifyContent:  'center',
  },
  header: {
    paddingHorizontal: 28,
    paddingTop:        20,
    paddingBottom:     24,
  },
  eyebrow: {
    fontFamily:    Typography.bodySemi,
    fontSize:      Typography.sm,
    color:         Palette.clay500,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom:  8,
  },
  heading: {
    fontFamily: Typography.heading,
    fontSize:   44,
    lineHeight: 48,
    color:      Palette.loam,
  },
  perksRow: {
    paddingHorizontal: 24,
    flexDirection:     'row',
    flexWrap:          'wrap',
    gap:               8,
    marginBottom:      24,
  },
  perkChip: {
    flexDirection:     'row',
    alignItems:        'center',
    backgroundColor:   `${Palette.moss500}12`,
    borderRadius:      9999,
    paddingVertical:   6,
    paddingHorizontal: 12,
    gap:               6,
    borderWidth:       1,
    borderColor:       `${Palette.moss500}25`,
  },
  perkIcon: {
    fontSize: 13,
  },
  perkText: {
    fontFamily: Typography.bodySemi,
    fontSize:   Typography.xs,
    color:      Palette.moss600,
  },
  formCard: {
    marginHorizontal:        20,
    backgroundColor:         'rgba(254,254,250,0.90)',
    borderRadius:            32,
    borderTopLeftRadius:     24,
    borderTopRightRadius:    48,
    borderBottomRightRadius: 32,
    borderBottomLeftRadius:  56,
    padding:                 24,
    borderWidth:             1,
    borderColor:             `${Palette.rawTimber}55`,
    shadowColor:             Palette.clay500,
    shadowOffset:            { width: 0, height: 8 },
    shadowOpacity:           0.10,
    shadowRadius:            24,
    elevation:               6,
  },
  terms: {
    fontFamily:        Typography.body,
    fontSize:          Typography.xs,
    color:             Colors.textMuted,
    textAlign:         'center',
    marginTop:         14,
    lineHeight:        18,
    paddingHorizontal: 8,
  },
  termsLink: {
    color:      Palette.clay500,
    fontFamily: Typography.bodySemi,
  },
  loginRow: {
    flexDirection:  'row',
    justifyContent: 'center',
    alignItems:     'center',
    marginTop:      24,
  },
  loginPrompt: {
    fontFamily: Typography.body,
    fontSize:   Typography.sm,
    color:      Colors.textMuted,
  },
  loginLink: {
    fontFamily: Typography.bodyBold,
    fontSize:   Typography.sm,
    color:      Palette.moss500,
  },
});