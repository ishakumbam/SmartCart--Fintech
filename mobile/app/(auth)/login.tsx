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
import { SafeScreen } from '@/components/ui/SafeScreen';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { OrganicBlob } from '@/components/ui/OrganicBlob';
import { useAuthStore } from '@/store/authStore';
import { Colors, Typography, Palette } from '@/constants/theme';
import { supabase } from '@/lib/supabase';

const loginSchema = z.object({
  email:    z.string().email('Enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});
type LoginForm = z.infer<typeof loginSchema>;

export default function LoginScreen() {
  const [loading, setLoading] = useState(false);
  const { setAuth } = useAuthStore();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (data: LoginForm) => {
    try {
      setLoading(true);
      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email:    data.email,
        password: data.password,
      });

      if (error) throw error;

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authData.user.id)
        .single();

      setAuth({
        id:        authData.user.id,
        name:      profile?.name ?? 'User',
        email:     authData.user.email ?? '',
        createdAt: authData.user.created_at,
      });

      router.replace('/(tabs)');
    } catch (err: any) {
      Alert.alert('Sign In Failed', err.message ?? 'Login failed. Please try again.');
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
          <OrganicBlob variant={2} color="moss" size={340} opacity={0.28}
            style={{ position: 'absolute', top: -100, right: -120 }} />
          <OrganicBlob variant={4} color="clay" size={260} opacity={0.22}
            style={{ position: 'absolute', bottom: 40, left: -100 }} />
          <OrganicBlob variant={1} color="sand" size={200} opacity={0.30}
            style={{ position: 'absolute', top: 180, left: -60 }} />
        </View>

        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.heroSection}>
            <View style={styles.logoMark}>
              <Text style={styles.logoEmoji}>🛒</Text>
            </View>
            <Text style={styles.wordmark}>SmartCart</Text>
            <Text style={styles.heroHeading}>Welcome{'\n'}back.</Text>
            <Text style={styles.heroSub}>Your deals are waiting for you</Text>
          </View>

          <View style={styles.formCard}>
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
                  placeholder="••••••••"
                  secureTextEntry
                  leftIcon="lock-closed-outline"
                  onChangeText={onChange}
                  onBlur={onBlur}
                  value={value}
                  error={errors.password?.message}
                />
              )}
            />

            <TouchableOpacity style={styles.forgotRow}>
              <Text style={styles.forgotText}>Forgot your password?</Text>
            </TouchableOpacity>

            <Button
              label="Sign In"
              onPress={handleSubmit(onSubmit)}
              loading={loading}
              fullWidth
              size="lg"
              style={{ marginTop: 8 }}
            />

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or continue with</Text>
              <View style={styles.dividerLine} />
            </View>

            <Button
              label="Continue with Google"
              variant="sand"
              fullWidth
              size="md"
              icon={<Text style={{ fontSize: 18 }}>G</Text>}
              onPress={() => Alert.alert('Coming soon', 'Google sign-in in Phase 2')}
            />
          </View>

          <View style={styles.signupRow}>
            <Text style={styles.signupPrompt}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/signup')}>
              <Text style={styles.signupLink}>Create one →</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flexGrow:    1,
    paddingBottom: 40,
  },
  heroSection: {
    paddingHorizontal: 28,
    paddingTop:        52,
    paddingBottom:     36,
  },
  logoMark: {
    width:           52,
    height:          52,
    borderRadius:    16,
    backgroundColor: Palette.moss500,
    alignItems:      'center',
    justifyContent:  'center',
    marginBottom:    20,
    shadowColor:     Palette.moss500,
    shadowOffset:    { width: 0, height: 6 },
    shadowOpacity:   0.35,
    shadowRadius:    12,
    elevation:       6,
  },
  logoEmoji: {
    fontSize: 24,
  },
  wordmark: {
    fontFamily:    Typography.bodySemi,
    fontSize:      Typography.sm,
    color:         Palette.moss500,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom:  10,
  },
  heroHeading: {
    fontFamily:   Typography.heading,
    fontSize:     52,
    lineHeight:   56,
    color:        Palette.loam,
    marginBottom: 10,
  },
  heroSub: {
    fontFamily: Typography.body,
    fontSize:   Typography.base,
    color:      Colors.textMuted,
    lineHeight: 22,
  },
  formCard: {
    marginHorizontal:        20,
    backgroundColor:         'rgba(254,254,250,0.88)',
    borderRadius:            32,
    borderTopLeftRadius:     48,
    borderTopRightRadius:    24,
    borderBottomRightRadius: 40,
    borderBottomLeftRadius:  32,
    padding:                 24,
    borderWidth:             1,
    borderColor:             `${Palette.rawTimber}60`,
    shadowColor:             Palette.moss500,
    shadowOffset:            { width: 0, height: 8 },
    shadowOpacity:           0.10,
    shadowRadius:            24,
    elevation:               6,
  },
  forgotRow: {
    alignSelf:    'flex-end',
    marginBottom: 8,
    marginTop:    -4,
  },
  forgotText: {
    fontFamily: Typography.bodySemi,
    fontSize:   Typography.sm,
    color:      Palette.clay500,
  },
  divider: {
    flexDirection:  'row',
    alignItems:     'center',
    marginVertical: 20,
    gap:            12,
  },
  dividerLine: {
    flex:            1,
    height:          1,
    backgroundColor: `${Palette.rawTimber}80`,
  },
  dividerText: {
    fontFamily: Typography.body,
    fontSize:   Typography.xs,
    color:      Colors.textMuted,
  },
  signupRow: {
    flexDirection:     'row',
    justifyContent:    'center',
    alignItems:        'center',
    marginTop:         24,
    paddingHorizontal: 28,
  },
  signupPrompt: {
    fontFamily: Typography.body,
    fontSize:   Typography.sm,
    color:      Colors.textMuted,
  },
  signupLink: {
    fontFamily: Typography.bodyBold,
    fontSize:   Typography.sm,
    color:      Palette.moss500,
  },
});