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

export default function TermsOfServiceScreen() {
  const { theme } = useTheme();
  return (
    <SafeScreen blobs={[
      { variant: 3, color: 'clay', size: 260, top: -80,   right: -100, opacity: 0.18 },
      { variant: 1, color: 'moss', size: 200, bottom: 40, left: -70,   opacity: 0.22 },
    ]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity style={[styles.backBtn, { backgroundColor: `${Palette.moss500}15` }]} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={20} color={Palette.moss500} />
          </TouchableOpacity>
          <Text style={[styles.heading, { color: theme.textPrimary }]}>Terms of Service</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.content}>
          <Text style={[styles.lastUpdated, { color: theme.textMuted }]}>Last updated: April 27, 2026</Text>
          <Paragraph text="Welcome to SmartCart. By downloading, installing, or using our mobile application, you agree to be bound by these Terms of Service." />
          <Section title="1. Acceptance of Terms">
            <Paragraph text="By accessing or using SmartCart, you confirm that you are at least 13 years of age, have read and understood these Terms, and agree to be bound by them." />
          </Section>
          <Section title="2. Description of Service">
            <Paragraph text="SmartCart is a personalized deal-finding application that:" />
            <BulletPoint text="Scans and parses grocery receipts using OCR and AI technology." />
            <BulletPoint text="Builds a personal purchase profile based on your shopping history." />
            <BulletPoint text="Matches deals from partner retailers to your purchase habits." />
            <BulletPoint text="Earns commission when you click affiliate links to partner stores." />
          </Section>
          <Section title="3. User Accounts">
            <BulletPoint text="Provide accurate and complete registration information." />
            <BulletPoint text="Maintain the security of your account credentials." />
            <BulletPoint text="Be responsible for all activity that occurs under your account." />
          </Section>
          <Section title="4. Receipt Scanning">
            <BulletPoint text="You grant us a license to process, store, and analyze the receipt data to provide our service." />
            <BulletPoint text="You confirm the receipts belong to you or you have permission to scan them." />
            <BulletPoint text="You understand that OCR and AI parsing may not be 100% accurate." />
          </Section>
          <Section title="5. Affiliate Links and Deals">
            <BulletPoint text="Deal availability, prices, and terms are controlled by the retailers." />
            <BulletPoint text="SmartCart earns a commission when you click affiliate links." />
            <BulletPoint text="We do not guarantee the accuracy or availability of any deal." />
          </Section>
          <Section title="6. Prohibited Conduct">
            <BulletPoint text="Use SmartCart for any unlawful purpose." />
            <BulletPoint text="Attempt to reverse engineer, hack, or disrupt our service." />
            <BulletPoint text="Create multiple accounts to abuse our service." />
          </Section>
          <Section title="7. Disclaimer of Warranties">
            <Paragraph text="SmartCart is provided 'as is' without warranties of any kind. We do not warrant that the service will be uninterrupted, error-free, or that deal information will always be accurate." />
          </Section>
          <Section title="8. Governing Law">
            <Paragraph text="These Terms are governed by the laws of the State of Texas. Any disputes shall be resolved in the courts of Collin County, Texas." />
          </Section>
          <Section title="9. Contact Us">
            <Paragraph text="Email: legal@smartcart.app" />
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