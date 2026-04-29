import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Deal, logDealClick } from '@/lib/dealService';
import { useAuthStore } from '@/store/authStore';
import { useTheme } from '@/hooks/useTheme';
import { Palette, Typography, Shadows } from '@/constants/theme';

interface DealCardProps {
  deal:     Deal;
  organic?: 1 | 2 | 3 | 4 | 5 | 6;
}

const ORGANIC_RADII = [
  { borderTopLeftRadius: 48, borderTopRightRadius: 24, borderBottomRightRadius: 56, borderBottomLeftRadius: 32 },
  { borderTopLeftRadius: 32, borderTopRightRadius: 56, borderBottomRightRadius: 24, borderBottomLeftRadius: 48 },
  { borderTopLeftRadius: 56, borderTopRightRadius: 32, borderBottomRightRadius: 40, borderBottomLeftRadius: 24 },
  { borderTopLeftRadius: 24, borderTopRightRadius: 48, borderBottomRightRadius: 32, borderBottomLeftRadius: 56 },
  { borderTopLeftRadius: 40, borderTopRightRadius: 40, borderBottomRightRadius: 56, borderBottomLeftRadius: 24 },
  { borderTopLeftRadius: 64, borderTopRightRadius: 24, borderBottomRightRadius: 48, borderBottomLeftRadius: 40 },
];

interface CategoryStyle {
  emoji:  string;
  bg:     string;
  darkBg: string;
  accent: string;
  label:  string;
}

const CATEGORY_STYLES: Record<string, CategoryStyle> = {
  dairy:         { emoji: '🥛', bg: '#EEF6FF', darkBg: '#1A2535', accent: '#3B82F6', label: 'Dairy'         },
  produce:       { emoji: '🥦', bg: '#ECFDF5', darkBg: '#0F2820', accent: '#10B981', label: 'Fresh Produce'  },
  beverage:      { emoji: '🧃', bg: '#FFF7ED', darkBg: '#2A1F10', accent: '#F97316', label: 'Beverages'      },
  snacks:        { emoji: '🍿', bg: '#FFFBEB', darkBg: '#2A2310', accent: '#F59E0B', label: 'Snacks'         },
  candy:         { emoji: '🍫', bg: '#FDF4FF', darkBg: '#231525', accent: '#A855F7', label: 'Candy'          },
  frozen:        { emoji: '🧊', bg: '#EFF6FF', darkBg: '#131E2E', accent: '#60A5FA', label: 'Frozen'         },
  meat:          { emoji: '🥩', bg: '#FFF1F2', darkBg: '#2A1015', accent: '#F43F5E', label: 'Meat'           },
  bakery:        { emoji: '🍞', bg: '#FEF9C3', darkBg: '#2A2510', accent: '#EAB308', label: 'Bakery'         },
  pantry:        { emoji: '🫙', bg: '#F5F5F4', darkBg: '#1E1E1C', accent: '#78716C', label: 'Pantry'         },
  household:     { emoji: '🧹', bg: '#F0FDF4', darkBg: '#0F2018', accent: '#22C55E', label: 'Household'      },
  personal_care: { emoji: '🧴', bg: '#FDF2F8', darkBg: '#2A1020', accent: '#EC4899', label: 'Personal Care'  },
  general:       { emoji: '🛒', bg: '#F0FDF4', darkBg: '#141F16', accent: '#5D7052', label: 'Grocery'        },
};

export function DealCard({ deal, organic = 1 }: DealCardProps) {
  const { user }          = useAuthStore();
  const { theme, isDark } = useTheme();
  const radii             = ORGANIC_RADII[(organic - 1) % ORGANIC_RADII.length];
  const catStyle          = CATEGORY_STYLES[deal.category] ?? CATEGORY_STYLES.general;
  const isPersonalized    = deal.frequencyScore > 0;
  const imageBg           = isDark ? catStyle.darkBg : catStyle.bg;

  const handleGetDeal = async () => {
    if (user) await logDealClick(user.id, deal.id);
    Linking.openURL(deal.affiliateUrl);
  };

  return (
    <TouchableOpacity
      style={[styles.card, radii, { backgroundColor: theme.cardBackground, borderColor: theme.borderSubtle }]}
      onPress={handleGetDeal}
      activeOpacity={0.92}
    >
      <View style={[styles.imageArea, { backgroundColor: imageBg }]}>
        <View style={[styles.decorCircle1, { backgroundColor: `${catStyle.accent}20` }]} />
        <View style={[styles.decorCircle2, { backgroundColor: `${catStyle.accent}15` }]} />

        <View style={[styles.categoryLabel, { backgroundColor: `${catStyle.accent}25` }]}>
          <Text style={[styles.categoryLabelText, { color: catStyle.accent }]}>
            {catStyle.label}
          </Text>
        </View>

        <View style={[styles.emojiContainer, { backgroundColor: `${catStyle.accent}20` }]}>
          <Text style={styles.mainEmoji}>{catStyle.emoji}</Text>
        </View>

        <View style={[styles.storeBadge, {
          backgroundColor: isDark ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.85)',
        }]}>
          <Text style={[styles.storeBadgeText, { color: theme.textPrimary }]}>
            {deal.store}
          </Text>
        </View>

        <View style={[styles.savingsBadge, { backgroundColor: catStyle.accent }]}>
          <Text style={styles.savingsText}>{deal.savingsPercent}% OFF</Text>
        </View>

        {isPersonalized && (
          <View style={styles.personalizedBadge}>
            <Ionicons name="person" size={10} color={Palette.moss500} />
            <Text style={styles.personalizedText}>For You</Text>
          </View>
        )}
      </View>

      <View style={styles.content}>
        <Text style={[styles.itemName, { color: theme.textPrimary }]} numberOfLines={1}>
          {capitalize(deal.item)}
        </Text>
        <View style={styles.priceRow}>
          <View>
            <Text style={[styles.dealPrice, { color: catStyle.accent }]}>
              ${deal.dealPrice.toFixed(2)}
            </Text>
            <Text style={[styles.originalPrice, { color: theme.textMuted }]}>
              ${deal.originalPrice.toFixed(2)}
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.getDealBtn, { backgroundColor: catStyle.accent }]}
            onPress={handleGetDeal}
          >
            <Text style={styles.getDealText}>Get Deal</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.footer}>
          <Text style={[styles.savings, { color: Palette.moss500 }]}>
            Save ${deal.savings.toFixed(2)}
          </Text>
          <Text style={[styles.expiry, { color: theme.textMuted }]}>
            Expires {new Date(deal.expiresAt).toLocaleDateString()}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

const styles = StyleSheet.create({
  card: {
    borderWidth:  1,
    overflow:     'hidden',
    marginBottom: 14,
    ...Shadows.soft,
  },
  imageArea: {
    height:         160,
    alignItems:     'center',
    justifyContent: 'center',
    position:       'relative',
    overflow:       'hidden',
  },
  decorCircle1: {
    position:     'absolute',
    width:        180,
    height:       180,
    borderRadius: 90,
    top:          -60,
    right:        -60,
  },
  decorCircle2: {
    position:     'absolute',
    width:        120,
    height:       120,
    borderRadius: 60,
    bottom:       -40,
    left:         -30,
  },
  categoryLabel: {
    position:          'absolute',
    bottom:            12,
    left:              12,
    borderRadius:      9999,
    paddingVertical:   4,
    paddingHorizontal: 10,
  },
  categoryLabelText: {
    fontFamily:    Typography.bodySemi,
    fontSize:      10,
    letterSpacing: 0.3,
  },
  emojiContainer: {
    width:           80,
    height:          80,
    borderRadius:    40,
    alignItems:      'center',
    justifyContent:  'center',
  },
  mainEmoji: {
    fontSize: 40,
  },
  storeBadge: {
    position:          'absolute',
    top:               12,
    left:              12,
    borderRadius:      9999,
    paddingVertical:   4,
    paddingHorizontal: 10,
  },
  storeBadgeText: {
    fontFamily: Typography.bodySemi,
    fontSize:   10,
  },
  savingsBadge: {
    position:          'absolute',
    top:               12,
    right:             12,
    borderRadius:      9999,
    paddingVertical:   4,
    paddingHorizontal: 10,
  },
  savingsText: {
    fontFamily: Typography.bodyBold,
    fontSize:   Typography.xs,
    color:      '#FFFFFF',
  },
  personalizedBadge: {
    position:          'absolute',
    bottom:            12,
    right:             12,
    backgroundColor:   `${Palette.moss500}25`,
    borderRadius:      9999,
    paddingVertical:   4,
    paddingHorizontal: 8,
    flexDirection:     'row',
    alignItems:        'center',
    gap:               3,
    borderWidth:       1,
    borderColor:       `${Palette.moss500}40`,
  },
  personalizedText: {
    fontFamily: Typography.bodySemi,
    fontSize:   10,
    color:      Palette.moss500,
  },
  content: {
    padding: 14,
  },
  itemName: {
    fontFamily:   Typography.heading,
    fontSize:     Typography.lg,
    marginBottom: 10,
  },
  priceRow: {
    flexDirection:  'row',
    alignItems:     'center',
    justifyContent: 'space-between',
    marginBottom:   8,
  },
  dealPrice: {
    fontFamily: Typography.heading,
    fontSize:   Typography.xl,
  },
  originalPrice: {
    fontFamily:         Typography.body,
    fontSize:           Typography.sm,
    textDecorationLine: 'line-through',
  },
  getDealBtn: {
    borderRadius:      9999,
    paddingVertical:   10,
    paddingHorizontal: 20,
  },
  getDealText: {
    fontFamily: Typography.bodyBold,
    fontSize:   Typography.sm,
    color:      '#FFFFFF',
  },
  footer: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    alignItems:     'center',
  },
  savings: {
    fontFamily: Typography.bodySemi,
    fontSize:   Typography.xs,
  },
  expiry: {
    fontFamily: Typography.body,
    fontSize:   Typography.xs,
  },
});