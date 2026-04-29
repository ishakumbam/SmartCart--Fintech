import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeScreen } from '@/components/ui/SafeScreen';
import { Typography, Palette, Colors } from '@/constants/theme';

interface SectionProps {
  title:    string;
  children: React.ReactNode;
}

function Section({ title, children }: SectionProps) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function Paragraph({ text }: { text: string }) {
  return <Text style={styles.paragraph}>{text}</Text>;
}

function BulletPoint({ text }: { text: string }) {
  return (
    <View style={styles.bulletRow}>
      <Text style={styles.bullet}>•</Text>
      <Text style={styles.bulletText}>{text}</Text>
    </View>
  );
}

export default function TermsOfServiceScreen() {
  const lastUpdated = 'April 27, 2026';

  return (
    <SafeScreen blobs={[
      { variant: 3, color: 'clay', size: 260, top: -80,   right: -100, opacity: 0.18 },
      { variant: 1, color: 'moss', size: 200, bottom: 40, left: -70,   opacity: 0.22 },
    ]}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header ──────────────────────────────────── */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={20} color={Palette.moss500} />
          </TouchableOpacity>
          <Text style={styles.heading}>Terms of Service</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.content}>
          <Text style={styles.lastUpdated}>Last updated: {lastUpdated}</Text>

          <Paragraph text="Welcome to SmartCart. By downloading, installing, or using our mobile application, you agree to be bound by these Terms of Service. Please read them carefully." />

          <Section title="1. Acceptance of Terms">
            <Paragraph text="By accessing or using SmartCart, you confirm that you are at least 13 years of age, have read and understood these Terms, and agree to be bound by them. If you do not agree to these Terms, do not use SmartCart." />
          </Section>

          <Section title="2. Description of Service">
            <Paragraph text="SmartCart is a personalized deal-finding application that:" />
            <BulletPoint text="Scans and parses grocery receipts using OCR and AI technology." />
            <BulletPoint text="Builds a personal purchase profile based on your shopping history." />
            <BulletPoint text="Matches deals from partner retailers to your purchase habits." />
            <BulletPoint text="Earns commission when you click affiliate links to partner stores." />
            <Paragraph text="SmartCart is free to use. We earn revenue through affiliate commissions when you click 'Get Deal' links." />
          </Section>

          <Section title="3. User Accounts">
            <Paragraph text="To use SmartCart, you must create an account. You agree to:" />
            <BulletPoint text="Provide accurate and complete registration information." />
            <BulletPoint text="Maintain the security of your account credentials." />
            <BulletPoint text="Notify us immediately of any unauthorized use of your account." />
            <BulletPoint text="Be responsible for all activity that occurs under your account." />
            <Paragraph text="We reserve the right to terminate accounts that violate these Terms." />
          </Section>

          <Section title="4. Receipt Scanning">
            <Paragraph text="When you scan receipts using SmartCart:" />
            <BulletPoint text="You grant us a license to process, store, and analyze the receipt data to provide our service." />
            <BulletPoint text="You confirm the receipts belong to you or you have permission to scan them." />
            <BulletPoint text="You understand that OCR and AI parsing may not be 100% accurate." />
            <BulletPoint text="You are responsible for reviewing and correcting parsed items before saving." />
          </Section>

          <Section title="5. Affiliate Links and Deals">
            <Paragraph text="SmartCart displays deals and affiliate links to partner retailers. Please note:" />
            <BulletPoint text="Deal availability, prices, and terms are controlled by the retailers." />
            <BulletPoint text="SmartCart earns a commission when you click affiliate links." />
            <BulletPoint text="We do not guarantee the accuracy or availability of any deal." />
            <BulletPoint text="Transactions completed through partner links are subject to the retailer's terms." />
            <BulletPoint text="SmartCart is not responsible for any purchases made through affiliate links." />
          </Section>

          <Section title="6. Prohibited Conduct">
            <Paragraph text="You agree not to:" />
            <BulletPoint text="Use SmartCart for any unlawful purpose." />
            <BulletPoint text="Scan receipts that do not belong to you." />
            <BulletPoint text="Attempt to reverse engineer, hack, or disrupt our service." />
            <BulletPoint text="Create multiple accounts to abuse our service." />
            <BulletPoint text="Use automated tools to access or scrape our service." />
            <BulletPoint text="Misrepresent your identity or affiliation." />
          </Section>

          <Section title="7. Intellectual Property">
            <Paragraph text="SmartCart and its content, features, and functionality are owned by SmartCart Inc. and are protected by copyright, trademark, and other intellectual property laws." />
            <Paragraph text="You may not copy, modify, distribute, sell, or lease any part of our service without our written permission." />
          </Section>

          <Section title="8. Disclaimer of Warranties">
            <Paragraph text="SmartCart is provided 'as is' and 'as available' without warranties of any kind. We do not warrant that:" />
            <BulletPoint text="The service will be uninterrupted or error-free." />
            <BulletPoint text="Receipt parsing will be 100% accurate." />
            <BulletPoint text="Deals shown will be available when you visit a retailer." />
            <BulletPoint text="The service will meet your specific requirements." />
          </Section>

          <Section title="9. Limitation of Liability">
            <Paragraph text="To the maximum extent permitted by law, SmartCart Inc. shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the service, including but not limited to loss of data, loss of profits, or any other losses." />
          </Section>

          <Section title="10. Indemnification">
            <Paragraph text="You agree to indemnify and hold harmless SmartCart Inc. and its officers, directors, employees, and agents from any claims, damages, or expenses arising from your use of the service or violation of these Terms." />
          </Section>

          <Section title="11. Changes to Terms">
            <Paragraph text="We may update these Terms from time to time. We will notify you of significant changes through the app or by email. Your continued use of SmartCart after changes constitutes acceptance of the updated Terms." />
          </Section>

          <Section title="12. Termination">
            <Paragraph text="We may suspend or terminate your account at any time for violation of these Terms. You may delete your account at any time from the Settings screen. Upon termination, your right to use SmartCart ceases immediately." />
          </Section>

          <Section title="13. Governing Law">
            <Paragraph text="These Terms are governed by the laws of the State of Texas, United States, without regard to conflict of law principles. Any disputes shall be resolved in the courts of Collin County, Texas." />
          </Section>

          <Section title="14. Contact Us">
            <Paragraph text="If you have questions about these Terms, please contact us at:" />
            <Paragraph text="Email: legal@smartcart.app" />
            <Paragraph text="SmartCart Inc.\nPlano, TX 75023" />
          </Section>
        </View>
      </ScrollView>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingBottom: 60,
  },
  header: {
    flexDirection:     'row',
    alignItems:        'center',
    justifyContent:    'space-between',
    paddingHorizontal: 20,
    paddingTop:        20,
    paddingBottom:     16,
  },
  backBtn: {
    width:           40,
    height:          40,
    borderRadius:    20,
    backgroundColor: `${Palette.moss500}15`,
    alignItems:      'center',
    justifyContent:  'center',
  },
  heading: {
    fontFamily: Typography.heading,
    fontSize:   Typography['2xl'],
    color:      Palette.loam,
  },
  content: {
    paddingHorizontal: 24,
  },
  lastUpdated: {
    fontFamily:   Typography.body,
    fontSize:     Typography.sm,
    color:        Colors.textMuted,
    marginBottom: 20,
    fontStyle:    'italic',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontFamily:   Typography.heading,
    fontSize:     Typography.lg,
    color:        Palette.loam,
    marginBottom: 10,
  },
  paragraph: {
    fontFamily:   Typography.body,
    fontSize:     Typography.base,
    color:        Colors.textSecondary,
    lineHeight:   24,
    marginBottom: 10,
  },
  bulletRow: {
    flexDirection:  'row',
    gap:            8,
    marginBottom:   8,
    paddingLeft:    4,
  },
  bullet: {
    fontFamily: Typography.body,
    fontSize:   Typography.base,
    color:      Palette.moss500,
    marginTop:  2,
  },
  bulletText: {
    fontFamily: Typography.body,
    fontSize:   Typography.base,
    color:      Colors.textSecondary,
    lineHeight: 24,
    flex:       1,
  },
});