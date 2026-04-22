import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeScreen } from '@/components/ui/SafeScreen';
import { useAuthStore } from '@/store/authStore';
import { Colors, Typography, Palette, Shadows } from '@/constants/theme';

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
  const { user, clearAuth } = useAuthStore();

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

  return (
    <SafeScreen blobs={[
      { variant: 4, color: 'moss', size: 260, top: -80,  right: -100, opacity: 0.20 },
      { variant: 2, color: 'sand', size: 200, bottom: 40, left: -70,  opacity: 0.25 },
    ]}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.heading}>Settings</Text>
        </View>

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
          <TouchableOpacity style={styles.editBtn}>
            <Ionicons name="pencil-outline" size={16} color={Palette.moss500} />
          </TouchableOpacity>
        </View>

        <SettingSection title="Deal Preferences">
          <SettingRow icon="location-outline"  label="Search Radius" value="10 miles" onPress={() => {}} />
          <SettingRow icon="pricetag-outline"  label="Categories"    value="All"      onPress={() => {}} last />
        </SettingSection>

        <SettingSection title="Notifications">
          <SettingRow icon="notifications-outline" label="Deal Alerts"    toggle toggled={true}  onToggle={() => {}} />
          <SettingRow icon="refresh-outline"       label="Weekly Digest"  toggle toggled={false} onToggle={() => {}} last />
        </SettingSection>

        <SettingSection title="App">
          <SettingRow icon="moon-outline"              label="Dark Mode"       toggle toggled={false} onToggle={() => {}} />
          <SettingRow icon="shield-checkmark-outline"  label="Privacy Policy"  onPress={() => {}} />
          <SettingRow icon="document-text-outline"     label="Terms of Service" onPress={() => {}} last />
        </SettingSection>

        <SettingSection title="Account">
          <SettingRow icon="log-out-outline" label="Sign Out"       onPress={handleSignOut}                                    danger />
          <SettingRow icon="trash-outline"   label="Delete Account" onPress={() => Alert.alert('Coming soon')} danger last />
        </SettingSection>

        <Text style={styles.version}>SmartCart v1.0.0</Text>
      </ScrollView>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingBottom: 48,
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
  editBtn: {
    width:           36,
    height:          36,
    borderRadius:    18,
    backgroundColor: `${Palette.moss500}12`,
    alignItems:      'center',
    justifyContent:  'center',
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
  version: {
    fontFamily: Typography.body,
    fontSize:   Typography.xs,
    color:      Colors.textMuted,
    textAlign:  'center',
    marginTop:  8,
  },
});