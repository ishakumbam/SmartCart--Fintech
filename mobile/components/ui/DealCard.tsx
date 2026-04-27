import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Deal } from '@/lib/dealService';
import { logDealClick } from '@/lib/dealService';
import { useAuthStore } from '@/store/authStore';
import { Palette, Typography, Shadows, Radius } from '@/constants/theme';

interface DealCardProps {
  deal:    Deal;
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

export function DealCard({ deal, organic = 1 }: DealCardProps) {
  const { user } = useAuthStore();
  const radii     = ORGANIC_RADII[(organic - 1) % ORGANIC_RADII.length];

  const handleGetDeal = async () => {
    if (user) await logDealClick(user.id, deal.id);
    Linking.openURL(deal.affiliateUrl);
  };

  const isPersonalized = deal.frequencyScore > 0;

  return (
    <TouchableOpacity
      style={[styles.card, radii]}
      onPress={handleGetDeal}
      activeOpacity={0.92}
    >
      {/* Image area */}
      <View style={styles.imageArea}>
        <View style={styles.imagePlaceholder}>
          <Text style={styles.itemEmoji}>{getCategoryEmoji(deal.category)}</Text>
        </View>

        {/* Savings badge */}
        <View style={styles.savingsBadge}>
          <Text style={styles.savingsText}>{deal.savingsPercent}% OFF</Text>
        </View>

        {/* Personalized badge */}
        {isPersonalized && (
          <View style={styles.personalizedBadge}>
            <Ionicons name="person" size={10} color={Palette.moss500} />
            <Text style={styles.personalizedText}>For You</Text>
          </View>
        )}
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.itemName} numberOfLines={1}>
          {capitalize(deal.item)}
        </Text>
        <Text style={styles.storeName}>{deal.store}</Text>

        <View style={styles.priceRow}>
          <View>
            <Text style={styles.dealPrice}>${deal.dealPrice.toFixed(2)}</Text>
            <Text style={styles.originalPrice}>${deal.originalPrice.toFixed(2)}</Text>
          </View>
          <TouchableOpacity style={styles.getDealBtn} onPress={handleGetDeal}>
            <Text style={styles.getDealText}>Get Deal</Text>
          </TouchableOpacity>
        </View>

        {/* Expiry */}
        <Text style={styles.expiry}>
          Expires {new Date(deal.expiresAt).toLocaleDateString()}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function getCategoryEmoji(category: string): string {
  const map: Record<string, string> = {
    dairy:    '🥛',
    produce:  '🥦',
    beverage: '🧃',
    snacks:   '🍿',
    candy:    '🍫',
    frozen:   '🧊',
    meat:     '🥩',
    bakery:   '🍞',
    pantry:   '🫙',
    general:  '🛒',
  };
  return map[category] ?? '🛒';
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FEFEFA',
    borderWidth:     1,
    borderColor:     `${Palette.rawTimber}80`,
    overflow:        'hidden',
    marginBottom:    14,
    ...Shadows.soft,
  },
  imageArea: {
    height:          130,
    backgroundColor: Palette.stone,
    alignItems:      'center',
    justifyContent:  'center',
    position:        'relative',
  },
  imagePlaceholder: {
    width:           80,
    height:          80,
    borderRadius:    40,
    backgroundColor: `${Palette.moss500}15`,
    alignItems:      'center',
    justifyContent:  'center',
  },
  itemEmoji: {
    fontSize: 36,
  },
  savingsBadge: {
    position:        'absolute',
    top:             12,
    right:           12,
    backgroundColor: Palette.moss500,
    borderRadius:    9999,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  savingsText: {
    fontFamily: Typography.bodyBold,
    fontSize:   Typography.xs,
    color:      Palette.paleMist,
  },
  personalizedBadge: {
    position:        'absolute',
    top:             12,
    left:            12,
    backgroundColor: `${Palette.moss500}15`,
    borderRadius:    9999,
    paddingVertical: 4,
    paddingHorizontal: 8,
    flexDirection:   'row',
    alignItems:      'center',
    gap:             3,
    borderWidth:     1,
    borderColor:     `${Palette.moss500}30`,
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
    color:        Palette.loam,
    marginBottom: 2,
  },
  storeName: {
    fontFamily:   Typography.body,
    fontSize:     Typography.sm,
    color:        Palette.driedGrass,
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
    color:      Palette.moss500,
  },
  originalPrice: {
    fontFamily:      Typography.body,
    fontSize:        Typography.sm,
    color:           Palette.driedGrass,
    textDecorationLine: 'line-through',
  },
  getDealBtn: {
    backgroundColor:   Palette.moss500,
    borderRadius:      9999,
    paddingVertical:   10,
    paddingHorizontal: 20,
    ...Shadows.soft,
  },
  getDealText: {
    fontFamily: Typography.bodyBold,
    fontSize:   Typography.sm,
    color:      Palette.paleMist,
  },
  expiry: {
    fontFamily: Typography.body,
    fontSize:   Typography.xs,
    color:      Palette.driedGrass,
  },
});