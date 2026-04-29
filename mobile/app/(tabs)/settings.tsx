import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Appearance,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { SafeScreen } from '@/components/ui/SafeScreen';
import { useAuthStore } from '@/store/authStore';
import { supabase } from '@/lib/supabase';
import { useTheme } from '@/hooks/useTheme';
import { Typography, Palette } from '@/constants/theme';

interface SettingRowProps {
  icon:      keyof typeof Ionicons.glyphMap;
  label:     string;
  value?:    string;
  toggle?:   boolean;
  toggled?:  boolean;
  onToggle?: (v: boolean) => void;
  onPress?:  () => void;
  danger?:   boolean;
  last?:     boolean;
}

function SettingRow({ icon, label, value, toggle, toggled, onToggle, onPress, danger, last }: SettingRowProps) {
  const { theme } = useTheme();
  return (
    <TouchableOpacity
      style={[styles.row, !last && { borderBottomWidth: 1, borderBottomColor: `${theme.border}40` }]}
      onPress={onPress}
      activeOpacity={toggle ? 1 : 0.7}
    >
      <View style={[styles.rowIcon, { backgroundColor: danger ? `${Palette.burntSienna}10` : `${Palette.moss500}10` }]}>
        <Ionicons name={icon} size={18} color={danger ? Palette.burntSienna : Palette.moss500} />
      </View>
      <Text style={[styles.rowLabel, { color: danger ? Palette.burntSienna : theme.textPrimary }]}>{label}</Text>
      <View style={styles.rowRight}>
        {value && <Text style={[styles.rowValue, { color: theme.textMuted }]}>{value}</Text>}
        {toggle !== undefined && (
          <Switch
            value={toggled}
            onValueChange={onToggle}
            trackColor={{ false: theme.border, true: `${Palette.moss400}80` }}
            thumbColor={toggled ? Palette.moss500 : theme.textMuted}
          />
        )}
        {!toggle && !value && (
          <Ionicons name="chevron-forward" size={16} color={theme.textMuted} />
        )}
      </View>
    </TouchableOpacity>
  );
}

function SettingSection({ title, children }: { title: string; children: React.ReactNode }) {
  const { theme } = useTheme();
  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: theme.textMuted }]}>{title}</Text>
      <View style={[styles.sectionCard, { backgroundColor: theme.cardBackground, borderColor: `${theme.border}55` }]}>
        {children}
      </View>
    </View>
  );
}

export default function SettingsScreen() {
  const { user, clearAuth } = useAuthStore();
  const { theme }           = useTheme();
  const [radius,       setRadius]       = useState(10);
  const [dealAlerts,   setDealAlerts]   = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(false);
  const [darkMode,     setDarkMode]     = useState(false);

  useEffect(() => { loadSettings(); }, [user]);

  const loadSettings = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('profiles')
      .select('radius_miles')
      .eq('id', user.id)
      .single();
    if (data?.radius_miles) setRadius(data.radius_miles);
  };

  const saveRadius = async (value: number) => {
    if (!user) return;
    setRadius(value);
    await supabase.from('profiles').update({ radius_miles: value }).eq('id', user.id);
  };

  const handleDarkMode = async (value: boolean) => {
    setDarkMode(value);
    Appearance.setColorScheme(value ? 'dark' : 'light');
  };

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: clearAuth },
    ]);
  };

  const handleDeleteAccount = () => {
    Alert.alert('Delete Account', 'This will permanently delete your account and all data.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: async () => {
          try {
            await supabase.from('profiles').delete().eq('id', user!.id);
            await supabase.auth.signOut();
            clearAuth();
          } catch {
            Alert.alert('Error', 'Failed to delete account.');
          }
        },
      },
    ]);
  };

  return (
    <SafeScreen blobs={[
      { variant: 4, color: 'moss', size: 260, top: -80,   right: -100, opacity: 0.20 },
      { variant: 2, color: 'sand', size: 200, bottom: 40, left: -70,   opacity: 0.25 },
    ]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={[styles.heading, { color: theme.textPrimary }]}>Settings</Text>
        </View>

        {/* Profile card */}
        <TouchableOpacity
          style={[styles.profileCard, { backgroundColor: theme.cardBackground, borderColor: `${theme.border}55` }]}
          onPress={() => router.push('/edit-profile')}
          activeOpacity={0.85}
        >
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{user?.name?.charAt(0).toUpperCase() ?? '?'}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.profileName, { color: theme.textPrimary }]}>{user?.name ?? 'Anonymous'}</Text>
            <Text style={[styles.profileEmail, { color: theme.textMuted }]}>{user?.email}</Text>
            <Text style={styles.profileEditHint}>Tap to edit profile</Text>
          </View>
          <View style={[styles.editBtn, { backgroundColor: `${Palette.moss500}12` }]}>
            <Ionicons name="pencil-outline" size={16} color={Palette.moss500} />
          </View>
        </TouchableOpacity>

        {/* Deal Preferences */}
        <SettingSection title="DEAL PREFERENCES">
          <View style={styles.sliderRow}>
            <View style={styles.sliderHeader}>
              <View style={[styles.rowIcon, { backgroundColor: `${Palette.moss500}10` }]}>
                <Ionicons name="location-outline" size={18} color={Palette.moss500} />
              </View>
              <Text style={[styles.rowLabel, { color: theme.textPrimary }]}>Search Radius</Text>
              <Text style={[styles.radiusValue]}>{radius} mi</Text>
            </View>
            <Slider
              style={styles.slider}
              minimumValue={1}
              maximumValue={50}
              step={1}
              value={radius}
              onSlidingComplete={saveRadius}
              onValueChange={setRadius}
              minimumTrackTintColor={Palette.moss500}
              maximumTrackTintColor={theme.border}
              thumbTintColor={Palette.moss500}
            />
            <View style={styles.sliderLabels}>
              <Text style={[styles.sliderLabel, { color: theme.textMuted }]}>1 mi</Text>
              <Text style={[styles.sliderLabel, { color: theme.textMuted }]}>50 mi</Text>
            </View>
          </View>
        </SettingSection>

        {/* Notifications */}
        <SettingSection title="NOTIFICATIONS">
          <SettingRow icon="notifications-outline" label="Deal Alerts"   toggle toggled={dealAlerts}   onToggle={(v) => { setDealAlerts(v);   Alert.alert(v ? 'Deal alerts enabled' : 'Disabled'); }} />
          <SettingRow icon="refresh-outline"       label="Weekly Digest" toggle toggled={weeklyDigest} onToggle={(v) => { setWeeklyDigest(v); Alert.alert(v ? 'Weekly digest enabled' : 'Disabled'); }} last />
        </SettingSection>

        {/* App */}
        <SettingSection title="APP">
          <SettingRow icon="moon-outline"             label="Dark Mode"       toggle toggled={darkMode} onToggle={handleDarkMode} />
          <SettingRow icon="shield-checkmark-outline" label="Privacy Policy"  onPress={() => router.push('/privacy')} />
          <SettingRow icon="document-text-outline"    label="Terms of Service" onPress={() => router.push('/terms')} last />
        </SettingSection>

        {/* Account */}
        <SettingSection title="ACCOUNT">
          <SettingRow icon="log-out-outline" label="Sign Out"       onPress={handleSignOut}       danger />
          <SettingRow icon="trash-outline"   label="Delete Account" onPress={handleDeleteAccount} danger last />
        </SettingSection>

        <Text style={[styles.version, { color: theme.textMuted }]}>SmartCart v1.0.0</Text>
      </ScrollView>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  scroll:          { paddingBottom: 100 },
  header:          { paddingHorizontal: 24, paddingTop: 20, paddingBottom: 20 },
  heading:         { fontFamily: Typography.heading, fontSize: Typography['3xl'] },
  profileCard:     { marginHorizontal: 20, marginBottom: 24, borderTopLeftRadius: 40, borderTopRightRadius: 24, borderBottomRightRadius: 40, borderBottomLeftRadius: 24, padding: 20, flexDirection: 'row', alignItems: 'center', gap: 16, borderWidth: 1 },
  avatar:          { width: 52, height: 52, borderRadius: 26, backgroundColor: Palette.moss500, alignItems: 'center', justifyContent: 'center' },
  avatarText:      { fontFamily: Typography.heading, fontSize: Typography.xl, color: Palette.paleMist },
  profileName:     { fontFamily: Typography.bodyBold, fontSize: Typography.md },
  profileEmail:    { fontFamily: Typography.body, fontSize: Typography.sm, marginTop: 2 },
  profileEditHint: { fontFamily: Typography.body, fontSize: Typography.xs, color: Palette.moss500, marginTop: 4 },
  editBtn:         { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  section:         { marginHorizontal: 20, marginBottom: 20 },
  sectionTitle:    { fontFamily: Typography.bodySemi, fontSize: Typography.xs, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8, marginLeft: 4 },
  sectionCard:     { borderRadius: 20, borderWidth: 1, overflow: 'hidden' },
  row:             { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 16, gap: 12 },
  rowIcon:         { width: 34, height: 34, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  rowLabel:        { fontFamily: Typography.bodySemi, fontSize: Typography.base, flex: 1 },
  rowRight:        { flexDirection: 'row', alignItems: 'center', gap: 6 },
  rowValue:        { fontFamily: Typography.body, fontSize: Typography.sm },
  sliderRow:       { paddingHorizontal: 16, paddingVertical: 14 },
  sliderHeader:    { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  radiusValue:     { fontFamily: Typography.bodyBold, fontSize: Typography.sm, color: Palette.moss500 },
  slider:          { width: '100%', height: 40 },
  sliderLabels:    { flexDirection: 'row', justifyContent: 'space-between', marginTop: -8 },
  sliderLabel:     { fontFamily: Typography.body, fontSize: Typography.xs },
  version:         { fontFamily: Typography.body, fontSize: Typography.xs, textAlign: 'center', marginTop: 8 },
});