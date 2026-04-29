import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeScreen } from '@/components/ui/SafeScreen';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/store/authStore';
import { useTheme } from '@/hooks/useTheme';
import { supabase } from '@/lib/supabase';
import { Typography, Palette, Shadows } from '@/constants/theme';

export default function EditProfileScreen() {
  const { user, updateUser } = useAuthStore();
  const { theme }            = useTheme();
  const [name, setName]      = useState(user?.name ?? '');
  const [email, setEmail]    = useState(user?.email ?? '');
  const [saving, setSaving]  = useState(false);

  const handleSave = async () => {
    if (!user) return;
    if (!name.trim()) { Alert.alert('Error', 'Name cannot be empty.'); return; }
    if (!email.trim()) { Alert.alert('Error', 'Email cannot be empty.'); return; }

    try {
      setSaving(true);

      const { error: profileError } = await supabase
        .from('profiles')
        .update({ name: name.trim() })
        .eq('id', user.id);
      if (profileError) throw profileError;

      if (email !== user.email) {
        const { error: emailError } = await supabase.auth.updateUser({ email });
        if (emailError) throw emailError;
        Alert.alert('Email Update', 'A confirmation email has been sent to your new address.');
      }

      updateUser({ name: name.trim(), email });
      Alert.alert('Success', 'Profile updated.', [{ text: 'OK', onPress: () => router.back() }]);
    } catch (err: any) {
      Alert.alert('Error', err.message ?? 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeScreen blobs={[
      { variant: 2, color: 'moss', size: 260, top: -80,   right: -100, opacity: 0.20 },
      { variant: 4, color: 'sand', size: 200, bottom: 40, left: -70,   opacity: 0.22 },
    ]}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <TouchableOpacity style={[styles.backBtn, { backgroundColor: `${Palette.moss500}15` }]} onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={20} color={Palette.moss500} />
            </TouchableOpacity>
            <Text style={[styles.heading, { color: theme.textPrimary }]}>Edit Profile</Text>
            <View style={{ width: 40 }} />
          </View>

          <View style={styles.avatarSection}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{name?.charAt(0).toUpperCase() ?? '?'}</Text>
            </View>
            <Text style={[styles.avatarHint, { color: theme.textMuted }]}>Your initial is used as your avatar</Text>
          </View>

          <View style={[styles.formCard, { backgroundColor: theme.cardBackground, borderColor: `${theme.border}55` }]}>
            <Input
              label="Full Name"
              placeholder="Alex Johnson"
              autoCapitalize="words"
              leftIcon="person-outline"
              onChangeText={setName}
              value={name}
            />
            <Input
              label="Email Address"
              placeholder="you@example.com"
              keyboardType="email-address"
              leftIcon="mail-outline"
              onChangeText={setEmail}
              value={email}
              hint="Changing email requires confirmation"
            />
            <Button
              label="Save Changes"
              onPress={handleSave}
              loading={saving}
              fullWidth
              size="lg"
              style={{ marginTop: 8 }}
            />
          </View>

          <View style={styles.passwordSection}>
            <TouchableOpacity
              style={[styles.passwordBtn, { backgroundColor: theme.cardBackground, borderColor: `${theme.border}55` }]}
              onPress={async () => {
                if (!user?.email) return;
                try {
                  await supabase.auth.resetPasswordForEmail(user.email);
                  Alert.alert('Password Reset', 'A password reset link has been sent to your email.');
                } catch {
                  Alert.alert('Error', 'Failed to send reset email.');
                }
              }}
            >
              <Ionicons name="lock-closed-outline" size={18} color={Palette.moss500} />
              <Text style={[styles.passwordBtnText, { color: theme.textPrimary }]}>Send Password Reset Email</Text>
              <Ionicons name="chevron-forward" size={16} color={theme.textMuted} />
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  scroll:          { paddingBottom: 60 },
  header:          { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 20, paddingBottom: 16 },
  backBtn:         { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  heading:         { fontFamily: Typography.heading, fontSize: Typography['2xl'] },
  avatarSection:   { alignItems: 'center', paddingVertical: 24, gap: 12 },
  avatar:          { width: 88, height: 88, borderRadius: 44, backgroundColor: Palette.moss500, alignItems: 'center', justifyContent: 'center', ...Shadows.float },
  avatarText:      { fontFamily: Typography.heading, fontSize: Typography['3xl'], color: Palette.paleMist },
  avatarHint:      { fontFamily: Typography.body, fontSize: Typography.sm },
  formCard:        { marginHorizontal: 20, borderTopLeftRadius: 32, borderTopRightRadius: 48, borderBottomRightRadius: 32, borderBottomLeftRadius: 48, padding: 24, borderWidth: 1, marginBottom: 20 },
  passwordSection: { marginHorizontal: 20 },
  passwordBtn:     { flexDirection: 'row', alignItems: 'center', borderRadius: 16, padding: 16, gap: 12, borderWidth: 1 },
  passwordBtnText: { fontFamily: Typography.bodySemi, fontSize: Typography.base, flex: 1 },
});