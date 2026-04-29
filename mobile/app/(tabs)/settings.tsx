import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  useColorScheme,
  Appearance,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { SafeScreen } from '@/components/ui/SafeScreen';
import { useAuthStore } from '@/store/authStore';
import { supabase } from '@/lib/supabase';
import { Colors, Typography, Palette, Shadows } from '@/constants/theme';
import { router } from 'expo-router';

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
  return (
    <TouchableOpacity
      style={[styles.row, !last && styles.rowBorder]}
      onPress={onPress}
      activeOpacity={toggle ? 1 : 0.7}
    >
      <View style={[styles.rowIcon, danger && styles.rowIconDanger]}>
        <Ionicons
          name={icon}
          size={18}
          color={danger ? Palette.burntSienna : Palette.moss500}
        />
      </View>
      <Text style={[styles.rowLabel, danger && styles.rowLabelDanger]}>{label}</Text>
      <View style={styles.rowRight}>
        {value && <Text style={styles.rowValue}>{value}</Text>}
        {toggle !== undefined && (
          <Switch
            value={toggled}
            onValueChange={onToggle}
            trackColor={{ false: Palette.rawTimber, true: `${Palette.moss400}80` }}
            thumbColor={toggled ? Palette.moss500 : Palette.driedGrass}
          />
        )}
        {!toggle && !value && (
          <Ionicons name="chevron-forward" size={16} color={Palette.driedGrass} />
        )}
      </View>
    </TouchableOpacity>
  );
}

function SettingSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionCard}>{children}</View>
    </View>
  );
}

export default function SettingsScreen() {
  const { user, clearAuth, updateUser } = useAuthStore();

  // Settings state
  const [radius,        setRadius]        = useState(10);
  const [dealAlerts,    setDealAlerts]    = useState(true);
  const [weeklyDigest,  setWeeklyDigest]  = useState(false);
  const [darkMode,      setDarkMode]      = useState(false);
  const [saving,        setSaving]        = useState(false);

  // Load settings from Supabase on mount
  useEffect(() => {
    loadSettings();
  }, [user]);

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
    await supabase
      .from('profiles')
      .update({ radius_miles: value })
      .eq('id', user.id);
  };

  const handleDarkMode = (value: boolean) => {
    setDarkMode(value);
    Appearance.setColorScheme(value ? 'dark' : 'light');
  };

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign Out', style: 'destructive', onPress: clearAuth },
      ],
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This will permanently delete your account and all data. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text:    'Delete',
          style:   'destructive',
          onPress: async () => {
            try {
              await supabase.from('profiles').delete().eq('id', user!.id);
              await supabase.auth.signOut();
              clearAuth();
            } catch (err) {
              Alert.alert('Error', 'Failed to delete account. Please try again.');
            }
          },
        },
      ],
    );
  };

  return (
    <SafeScreen blobs={[
      { variant: 4, color: 'moss', size: 260, top: -80,   right: -100, opacity: 0.20 },
      { variant: 2, color: 'sand', size: 200, bottom: 40, left: -70,   opacity: 0.25 },
    ]}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header ──────────────────────────────────── */}
        <View style={styles.header}>
          <Text style={styles.heading}>Settings</Text>
        </View>

        {/* ── Profile card ────────────────────────────── */}
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.name?.charAt(0).toUpperCase() ?? '?'}
            </Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.profileName}>{user?.name ?? 'Anonymous'}</Text>
            <Text style={styles.profileEmail}>{user?.email}</Text>
          </View>
        </View>

        {/* ── Deal Preferences ────────────────────────── */}
        <SettingSection title="Deal Preferences">
          {/* Radius slider */}
          <View style={styles.sliderRow}>
            <View style={styles.sliderHeader}>
              <View style={[styles.rowIcon]}>
                <Ionicons name="location-outline" size={18} color={Palette.moss500} />
              </View>
              <Text style={styles.rowLabel}>Search Radius</Text>
              <Text style={styles.radiusValue}>{radius} mi</Text>
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
              maximumTrackTintColor={Palette.rawTimber}
              thumbTintColor={Palette.moss500}
            />
            <View style={styles.sliderLabels}>
              <Text style={styles.sliderLabel}>1 mi</Text>
              <Text style={styles.sliderLabel}>50 mi</Text>
            </View>
          </View>
        </SettingSection>

        {/* ── Notifications ───────────────────────────── */}
        <SettingSection title="Notifications">
          <SettingRow
            icon="notifications-outline"
            label="Deal Alerts"
            toggle
            toggled={dealAlerts}
            onToggle={(v) => {
              setDealAlerts(v);
              Alert.alert(v ? 'Deal alerts enabled' : 'Deal alerts disabled');
            }}
          />
          <SettingRow
            icon="refresh-outline"
            label="Weekly Digest"
            toggle
            toggled={weeklyDigest}
            onToggle={(v) => {
              setWeeklyDigest(v);
              Alert.alert(v ? 'Weekly digest enabled' : 'Weekly digest disabled');
            }}
            last
          />
        </SettingSection>

        {/* ── App ─────────────────────────────────────── */}
        <SettingSection title="App">
          <SettingRow
            icon="moon-outline"
            label="Dark Mode"
            toggle
            toggled={darkMode}
            onToggle={handleDarkMode}
          />
          <SettingRow
            icon="shield-checkmark-outline"
            label="Privacy Policy"
            onPress={() => router.push('/privacy')}
          />
         <SettingRow
            icon="document-text-outline"
            label="Terms of Service"
            onPress={() => router.push('/terms')}
            last
          />
        </SettingSection>

        {/* ── Account ─────────────────────────────────── */}
        <SettingSection title="Account">
          <SettingRow
            icon="log-out-outline"
            label="Sign Out"
            onPress={handleSignOut}
            danger
          />
          <SettingRow
            icon="trash-outline"
            label="Delete Account"
            onPress={handleDeleteAccount}
            danger
            last
          />
        </SettingSection>

        <Text style={styles.version}>SmartCart v1.0.0</Text>
      </ScrollView>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingBottom: 100,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop:        20,
    paddingBottom:     20,
  },
  heading: {
    fontFamily: Typography.heading,
    fontSize:   Typography['3xl'],
    color:      Palette.loam,
  },
  profileCard: {
    marginHorizontal:        20,
    marginBottom:            24,
    backgroundColor:         '#FEFEFA',
    borderTopLeftRadius:     40,
    borderTopRightRadius:    24,
    borderBottomRightRadius: 40,
    borderBottomLeftRadius:  24,
    padding:                 20,
    flexDirection:           'row',
    alignItems:              'center',
    gap:                     16,
    borderWidth:             1,
    borderColor:             `${Palette.rawTimber}55`,
    ...Shadows.soft,
  },
  avatar: {
    width:           52,
    height:          52,
    borderRadius:    26,
    backgroundColor: Palette.moss500,
    alignItems:      'center',
    justifyContent:  'center',
  },
  avatarText: {
    fontFamily: Typography.heading,
    fontSize:   Typography.xl,
    color:      Palette.paleMist,
  },
  profileName: {
    fontFamily: Typography.bodyBold,
    fontSize:   Typography.md,
    color:      Palette.loam,
  },
  profileEmail: {
    fontFamily: Typography.body,
    fontSize:   Typography.sm,
    color:      Colors.textMuted,
    marginTop:  2,
  },
  section: {
    marginHorizontal: 20,
    marginBottom:     20,
  },
  sectionTitle: {
    fontFamily:    Typography.bodySemi,
    fontSize:      Typography.xs,
    color:         Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom:  8,
    marginLeft:    4,
  },
  sectionCard: {
    backgroundColor: '#FEFEFA',
    borderRadius:    20,
    borderWidth:     1,
    borderColor:     `${Palette.rawTimber}55`,
    overflow:        'hidden',
    ...Shadows.subtle,
  },
  row: {
    flexDirection:     'row',
    alignItems:        'center',
    paddingVertical:   14,
    paddingHorizontal: 16,
    gap:               12,
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: `${Palette.rawTimber}40`,
  },
  rowIcon: {
    width:           34,
    height:          34,
    borderRadius:    12,
    backgroundColor: `${Palette.moss500}10`,
    alignItems:      'center',
    justifyContent:  'center',
  },
  rowIconDanger: {
    backgroundColor: `${Palette.burntSienna}10`,
  },
  rowLabel: {
    fontFamily: Typography.bodySemi,
    fontSize:   Typography.base,
    color:      Palette.loam,
    flex:       1,
  },
  rowLabelDanger: {
    color: Palette.burntSienna,
  },
  rowRight: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           6,
  },
  rowValue: {
    fontFamily: Typography.body,
    fontSize:   Typography.sm,
    color:      Colors.textMuted,
  },
  sliderRow: {
    paddingHorizontal: 16,
    paddingVertical:   14,
  },
  sliderHeader: {
    flexDirection:  'row',
    alignItems:     'center',
    gap:            12,
    marginBottom:   12,
  },
  radiusValue: {
    fontFamily: Typography.bodyBold,
    fontSize:   Typography.sm,
    color:      Palette.moss500,
  },
  slider: {
    width:  '100%',
    height: 40,
  },
  sliderLabels: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    marginTop:      -8,
  },
  sliderLabel: {
    fontFamily: Typography.body,
    fontSize:   Typography.xs,
    color:      Colors.textMuted,
  },
  version: {
    fontFamily: Typography.body,
    fontSize:   Typography.xs,
    color:      Colors.textMuted,
    textAlign:  'center',
    marginTop:  8,
  },
});