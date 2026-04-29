import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ParsedReceipt, ParsedItem } from '@/lib/receiptService';
import { useTheme } from '@/hooks/useTheme';
import { Palette, Typography } from '@/constants/theme';

interface ParsedReceiptViewProps {
  parsed:    ParsedReceipt;
  onSave:    (parsed: ParsedReceipt) => void;
  onDiscard: () => void;
  saving:    boolean;
}

export function ParsedReceiptView({
  parsed,
  onSave,
  onDiscard,
  saving,
}: ParsedReceiptViewProps) {
  const { theme }                     = useTheme();
  const [receipt, setReceipt]         = useState<ParsedReceipt>(parsed);

  const updateItem = (index: number, updates: Partial<ParsedItem>) => {
    const items = [...receipt.items];
    items[index] = { ...items[index], ...updates };
    setReceipt({ ...receipt, items });
  };

  const removeItem = (index: number) => {
    const items = receipt.items.filter((_, i) => i !== index);
    setReceipt({ ...receipt, items });
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* ── Header ──────────────────────────────────── */}
      <View style={[styles.header, { backgroundColor: theme.background, borderBottomColor: `${theme.border}55` }]}>
        <TouchableOpacity
          onPress={onDiscard}
          style={[styles.discardBtn, { backgroundColor: `${Palette.moss500}15` }]}
        >
          <Ionicons name="arrow-back" size={20} color={Palette.moss500} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>Review Receipt</Text>
        <TouchableOpacity
          style={[styles.saveBtn, saving && { opacity: 0.6 }]}
          onPress={() => onSave(receipt)}
          disabled={saving}
        >
          {saving
            ? <ActivityIndicator size="small" color={Palette.paleMist} />
            : <Text style={styles.saveBtnText}>Save</Text>
          }
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Store info ──────────────────────────────── */}
        <View style={[styles.storeCard, { backgroundColor: theme.cardBackground, borderColor: `${theme.border}55` }]}>
          <View style={[styles.storeRow, { borderBottomColor: `${theme.border}33` }]}>
            <Text style={[styles.storeLabel, { color: theme.textMuted }]}>Store</Text>
            <Text style={[styles.storeValue, { color: theme.textPrimary }]}>
              {receipt.storeName || 'Unknown Store'}
            </Text>
          </View>
          <View style={[styles.storeRow, { borderBottomColor: `${theme.border}33` }]}>
            <Text style={[styles.storeLabel, { color: theme.textMuted }]}>Date</Text>
            <Text style={[styles.storeValue, { color: theme.textPrimary }]}>
              {receipt.purchaseDate || 'Unknown Date'}
            </Text>
          </View>
          <View style={[styles.storeRow, { borderBottomWidth: 0 }]}>
            <Text style={[styles.storeLabel, { color: theme.textMuted }]}>Total</Text>
            <Text style={styles.storeTotalValue}>
              ${receipt.total?.toFixed(2) ?? '0.00'}
            </Text>
          </View>
        </View>

        {/* ── Items ───────────────────────────────────── */}
        <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
          Line Items ({receipt.items.length})
        </Text>
        <Text style={[styles.sectionHint, { color: theme.textMuted }]}>
          Tap any item to edit or remove it
        </Text>

        {receipt.items.map((item, index) => (
          <View key={index} style={[styles.itemCard, { backgroundColor: theme.cardBackground, borderColor: `${theme.border}55` }]}>
            <View style={styles.itemRow}>
              <TextInput
                style={[styles.itemName, { color: theme.textPrimary }]}
                value={item.rawName}
                onChangeText={(text) => updateItem(index, { rawName: text })}
                placeholder="Item name"
                placeholderTextColor={theme.textMuted}
              />
              <TouchableOpacity
                onPress={() => removeItem(index)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="trash-outline" size={16} color={Palette.burntSienna} />
              </TouchableOpacity>
            </View>
            <View style={styles.itemMeta}>
              <Text style={[styles.itemMetaLabel, { color: theme.textMuted }]}>Qty:</Text>
              <TextInput
                style={[styles.itemMetaInput, { color: theme.textPrimary, backgroundColor: theme.surfaceAlt }]}
                value={String(item.quantity)}
                onChangeText={(text) => updateItem(index, { quantity: parseFloat(text) || 1 })}
                keyboardType="numeric"
              />
              <Text style={[styles.itemMetaLabel, { color: theme.textMuted }]}>Price:</Text>
              <TextInput
                style={[styles.itemMetaInput, { color: theme.textPrimary, backgroundColor: theme.surfaceAlt }]}
                value={String(item.unitPrice)}
                onChangeText={(text) => updateItem(index, { unitPrice: parseFloat(text) || 0 })}
                keyboardType="numeric"
              />
            </View>
          </View>
        ))}

        {receipt.items.length === 0 && (
          <View style={styles.emptyItems}>
            <Text style={[styles.emptyItemsText, { color: theme.textMuted }]}>
              No items detected. Try scanning again with better lighting.
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection:     'row',
    alignItems:        'center',
    justifyContent:    'space-between',
    paddingHorizontal: 20,
    paddingTop:        60,
    paddingBottom:     16,
    borderBottomWidth: 1,
  },
  discardBtn: {
    width:          40,
    height:         40,
    borderRadius:   20,
    alignItems:     'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontFamily: Typography.heading,
    fontSize:   Typography.xl,
  },
  saveBtn: {
    backgroundColor:   Palette.moss500,
    borderRadius:      9999,
    paddingVertical:   8,
    paddingHorizontal: 20,
    minWidth:          60,
    alignItems:        'center',
  },
  saveBtnText: {
    fontFamily: Typography.bodyBold,
    fontSize:   Typography.sm,
    color:      Palette.paleMist,
  },
  scroll: {
    padding:       20,
    paddingBottom: 48,
  },
  storeCard: {
    borderRadius: 20,
    borderWidth:  1,
    marginBottom: 24,
    overflow:     'hidden',
  },
  storeRow: {
    flexDirection:     'row',
    justifyContent:    'space-between',
    alignItems:        'center',
    paddingVertical:   12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  storeLabel: {
    fontFamily: Typography.bodySemi,
    fontSize:   Typography.sm,
  },
  storeValue: {
    fontFamily: Typography.bodySemi,
    fontSize:   Typography.sm,
  },
  storeTotalValue: {
    fontFamily: Typography.heading,
    fontSize:   Typography.lg,
    color:      Palette.moss500,
  },
  sectionTitle: {
    fontFamily:   Typography.heading,
    fontSize:     Typography.lg,
    marginBottom: 4,
  },
  sectionHint: {
    fontFamily:   Typography.body,
    fontSize:     Typography.xs,
    marginBottom: 16,
  },
  itemCard: {
    borderRadius: 16,
    borderWidth:  1,
    padding:      12,
    marginBottom: 10,
  },
  itemRow: {
    flexDirection:  'row',
    alignItems:     'center',
    justifyContent: 'space-between',
    marginBottom:   8,
  },
  itemName: {
    fontFamily:  Typography.bodySemi,
    fontSize:    Typography.sm,
    flex:        1,
    marginRight: 8,
  },
  itemMeta: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           6,
  },
  itemMetaLabel: {
    fontFamily: Typography.body,
    fontSize:   Typography.xs,
  },
  itemMetaInput: {
    fontFamily:        Typography.bodySemi,
    fontSize:          Typography.xs,
    borderRadius:      8,
    paddingHorizontal: 8,
    paddingVertical:   4,
    minWidth:          48,
  },
  emptyItems: {
    alignItems:      'center',
    paddingVertical: 32,
  },
  emptyItemsText: {
    fontFamily: Typography.body,
    fontSize:   Typography.sm,
    textAlign:  'center',
    lineHeight: 20,
  },
});