import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeScreen } from '@/components/ui/SafeScreen';
import { useTheme } from '@/hooks/useTheme';
import { Typography, Palette } from '@/constants/theme';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  const { theme } = useTheme();
  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>{title}</Text>
      {children}
    </View>
  );
}

function Paragraph({ text }: { text: string }) {
  const { theme } = useTheme();
  return <Text style={[styles.paragraph, { color: theme.textSecondary }]}>{text}</Text>;
}

function BulletPoint({ text }: { text: string }) {
  const { theme } = useTheme();
  return (
    <View style={styles.bulletRow}>
      <Text style={styles.bullet}>•</Text>
      <Text style={[styles.bulletText, { color: theme.textSecondary }]}>{text}</Text>
    </View>
  );
}

export default function PrivacyPolicyScreen() {
  const { theme } = useTheme();
  return (
    <SafeScreen blobs={[
      { variant: 2, color: 'moss', size: 260, top: -80,   right: -100, opacity: 0.18 },
      { variant: 4, color: 'sand', size: 200, bottom: 40, left: -70,   opacity: 0.22 },
    ]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity style={[styles.backBtn, { backgroundColor: `${Palette.moss500}15` }]} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={20} color={Palette.moss500} />
          </TouchableOpacity>
          <Text style={[styles.heading, { color: theme.textPrimary }]}>Privacy Policy</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.content}>
          <Text style={[styles.lastUpdated, { color: theme.textMuted }]}>Last updated: April 27, 2026</Text>
          <Paragraph text="SmartCart ('we', 'us', or 'our') is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and share information about you when you use our mobile application." />
          <Section title="1. Information We Collect">
            <Paragraph text="We collect the following types of information:" />
            <BulletPoint text="Account information: name, email address, and password when you register." />
            <BulletPoint text="Receipt data: images and parsed text from receipts you scan, including store names, purchase dates, item names, and prices." />
            <BulletPoint text="Location data: your approximate location to show deals near you (only when you grant permission)." />
            <BulletPoint text="Usage data: how you interact with the app, including which deals you view and click." />
            <BulletPoint text="Device information: device type, operating system, and push notification tokens." />
          </Section>
          <Section title="2. How We Use Your Information">
            <Paragraph text="We use the information we collect to:" />
            <BulletPoint text="Provide and personalize the SmartCart service, including matching deals to your purchase history." />
            <BulletPoint text="Send you push notifications about deals on items you regularly buy." />
            <BulletPoint text="Improve our deal matching algorithms and app features." />
            <BulletPoint text="Communicate with you about your account and app updates." />
            <BulletPoint text="Generate anonymized, aggregated analytics to understand usage patterns." />
          </Section>
          <Section title="3. How We Share Your Information">
            <Paragraph text="We do not sell your personal information. We may share your information in the following circumstances:" />
            <BulletPoint text="With retail partners: we share anonymized, aggregated purchase pattern data with partner retailers to improve deal relevance." />
            <BulletPoint text="Service providers: we use Supabase (database), OCR.space (receipt scanning), and Groq (AI processing) to operate our service." />
            <BulletPoint text="Legal requirements: if required by law or to protect our rights." />
          </Section>
          <Section title="4. Data Storage and Security">
            <Paragraph text="Your data is stored securely using Supabase, which employs industry-standard encryption. We implement Row Level Security (RLS) to ensure you can only access your own data." />
          </Section>
          <Section title="5. Your Receipt Data">
            <BulletPoint text="The image is uploaded to secure cloud storage." />
            <BulletPoint text="OCR technology extracts text from the image." />
            <BulletPoint text="AI processes the text to identify items and prices." />
            <BulletPoint text="You can delete your account and all associated data at any time from Settings." />
          </Section>
          <Section title="6. Location Data">
            <BulletPoint text="Only collected when you grant permission." />
            <BulletPoint text="Used solely to filter deals by proximity." />
            <BulletPoint text="Never shared with third parties in identifiable form." />
          </Section>
          <Section title="7. Your Rights">
            <BulletPoint text="Access the personal data we hold about you." />
            <BulletPoint text="Correct inaccurate data." />
            <BulletPoint text="Delete your account and all associated data." />
            <BulletPoint text="Opt out of marketing communications." />
            <Paragraph text="Contact us at privacy@smartcart.app to exercise these rights." />
          </Section>
          <Section title="8. Contact Us">
            <Paragraph text="Email: privacy@smartcart.app" />
            <Paragraph text="SmartCart Inc. — Plano, TX 75023" />
          </Section>
        </View>
      </ScrollView>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  scroll:       { paddingBottom: 60 },
  header:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 20, paddingBottom: 16 },
  backBtn:      { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  heading:      { fontFamily: Typography.heading, fontSize: Typography['2xl'] },
  content:      { paddingHorizontal: 24 },
  lastUpdated:  { fontFamily: Typography.body, fontSize: Typography.sm, marginBottom: 20, fontStyle: 'italic' },
  section:      { marginBottom: 24 },
  sectionTitle: { fontFamily: Typography.heading, fontSize: Typography.lg, marginBottom: 10 },
  paragraph:    { fontFamily: Typography.body, fontSize: Typography.base, lineHeight: 24, marginBottom: 10 },
  bulletRow:    { flexDirection: 'row', gap: 8, marginBottom: 8, paddingLeft: 4 },
  bullet:       { fontFamily: Typography.body, fontSize: Typography.base, color: Palette.moss500, marginTop: 2 },
  bulletText:   { fontFamily: Typography.body, fontSize: Typography.base, lineHeight: 24, flex: 1 },
});