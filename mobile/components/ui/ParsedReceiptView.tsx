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
import { Palette, Typography, Colors } from '@/constants/theme';

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
  const [receipt, setReceipt] = useState<ParsedReceipt>(parsed);

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
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onDiscard} style={styles.discardBtn}>
          <Ionicons name="arrow-back" size={20} color={Palette.moss500} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Review Receipt</Text>
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
        {/* Store info */}
        <View style={styles.storeCard}>
          <View style={styles.storeRow}>
            <Text style={styles.storeLabel}>Store</Text>
            <Text style={styles.storeValue}>
              {receipt.storeName || 'Unknown Store'}
            </Text>
          </View>
          <View style={styles.storeRow}>
            <Text style={styles.storeLabel}>Date</Text>
            <Text style={styles.storeValue}>
              {receipt.purchaseDate || 'Unknown Date'}
            </Text>
          </View>
          <View style={[styles.storeRow, { borderBottomWidth: 0 }]}>
            <Text style={styles.storeLabel}>Total</Text>
            <Text style={styles.storeTotalValue}>
              ${receipt.total?.toFixed(2) ?? '0.00'}
            </Text>
          </View>
        </View>

        {/* Items */}
        <Text style={styles.sectionTitle}>
          Line Items ({receipt.items.length})
        </Text>
        <Text style={styles.sectionHint}>
          Tap any item to edit or remove it
        </Text>

        {receipt.items.map((item, index) => (
          <View key={index} style={styles.itemCard}>
            <View style={styles.itemRow}>
              <TextInput
                style={styles.itemName}
                value={item.rawName}
                onChangeText={(text) => updateItem(index, { rawName: text })}
                placeholder="Item name"
                placeholderTextColor={Palette.driedGrass}
              />
              <TouchableOpacity
                onPress={() => removeItem(index)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="trash-outline" size={16} color={Palette.burntSienna} />
              </TouchableOpacity>
            </View>
            <View style={styles.itemMeta}>
              <Text style={styles.itemMetaLabel}>Qty:</Text>
              <TextInput
                style={styles.itemMetaInput}
                value={String(item.quantity)}
                onChangeText={(text) => updateItem(index, { quantity: parseFloat(text) || 1 })}
                keyboardType="numeric"
              />
              <Text style={styles.itemMetaLabel}>Price:</Text>
              <TextInput
                style={styles.itemMetaInput}
                value={String(item.unitPrice)}
                onChangeText={(text) => updateItem(index, { unitPrice: parseFloat(text) || 0 })}
                keyboardType="numeric"
              />
            </View>
          </View>
        ))}

        {receipt.items.length === 0 && (
          <View style={styles.emptyItems}>
            <Text style={styles.emptyItemsText}>
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
    flex:            1,
    backgroundColor: Palette.ricePaper,
  },
  header: {
    flexDirection:     'row',
    alignItems:        'center',
    justifyContent:    'space-between',
    paddingHorizontal: 20,
    paddingTop:        60,
    paddingBottom:     16,
    backgroundColor:   Palette.ricePaper,
    borderBottomWidth: 1,
    borderBottomColor: `${Palette.rawTimber}55`,
  },
  discardBtn: {
    width:           40,
    height:          40,
    borderRadius:    20,
    backgroundColor: `${Palette.moss500}15`,
    alignItems:      'center',
    justifyContent:  'center',
  },
  headerTitle: {
    fontFamily: Typography.heading,
    fontSize:   Typography.xl,
    color:      Palette.loam,
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
    backgroundColor: '#FEFEFA',
    borderRadius:    20,
    borderWidth:     1,
    borderColor:     `${Palette.rawTimber}55`,
    marginBottom:    24,
    overflow:        'hidden',
  },
  storeRow: {
    flexDirection:     'row',
    justifyContent:    'space-between',
    alignItems:        'center',
    paddingVertical:   12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: `${Palette.rawTimber}33`,
  },
  storeLabel: {
    fontFamily: Typography.bodySemi,
    fontSize:   Typography.sm,
    color:      Colors.textMuted,
  },
  storeValue: {
    fontFamily: Typography.bodySemi,
    fontSize:   Typography.sm,
    color:      Palette.loam,
  },
  storeTotalValue: {
    fontFamily: Typography.heading,
    fontSize:   Typography.lg,
    color:      Palette.moss500,
  },
  sectionTitle: {
    fontFamily:   Typography.heading,
    fontSize:     Typography.lg,
    color:        Palette.loam,
    marginBottom: 4,
  },
  sectionHint: {
    fontFamily:   Typography.body,
    fontSize:     Typography.xs,
    color:        Colors.textMuted,
    marginBottom: 16,
  },
  itemCard: {
    backgroundColor: '#FEFEFA',
    borderRadius:    16,
    borderWidth:     1,
    borderColor:     `${Palette.rawTimber}55`,
    padding:         12,
    marginBottom:    10,
  },
  itemRow: {
    flexDirection:  'row',
    alignItems:     'center',
    justifyContent: 'space-between',
    marginBottom:   8,
  },
  itemName: {
    fontFamily: Typography.bodySemi,
    fontSize:   Typography.sm,
    color:      Palette.loam,
    flex:       1,
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
    color:      Colors.textMuted,
  },
  itemMetaInput: {
    fontFamily:        Typography.bodySemi,
    fontSize:          Typography.xs,
    color:             Palette.loam,
    backgroundColor:   Palette.stone,
    borderRadius:      8,
    paddingHorizontal: 8,
    paddingVertical:   4,
    minWidth:          48,
  },
  emptyItems: {
    alignItems:   'center',
    paddingVertical: 32,
  },
  emptyItemsText: {
    fontFamily: Typography.body,
    fontSize:   Typography.sm,
    color:      Colors.textMuted,
    textAlign:  'center',
    lineHeight: 20,
  },
});