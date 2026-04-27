import { supabase } from '@/lib/supabase';
import * as FileSystem from 'expo-file-system/legacy';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';

export interface ParsedItem {
  rawName:   string;
  quantity:  number;
  unitPrice: number;
}

export interface ParsedReceipt {
  storeName:    string;
  purchaseDate: string;
  total:        number;
  items:        ParsedItem[];
}

export async function uploadReceiptImage(uri: string, userId: string): Promise<string> {
  const compressed = await manipulateAsync(
    uri,
    [{ resize: { width: 1200 } }],
    { compress: 0.7, format: SaveFormat.JPEG }
  );

  const fileName = `${userId}/${Date.now()}.jpg`;
  const fileData = await FileSystem.readAsStringAsync(compressed.uri, {
    encoding: 'base64',
  });

  const { error } = await supabase.storage
    .from('receipts')
    .upload(fileName, decode(fileData), {
      contentType: 'image/jpeg',
      upsert:      false,
    });

  if (error) throw error;

  const { data: urlData } = supabase.storage
    .from('receipts')
    .getPublicUrl(fileName);

  return urlData.publicUrl;
}

export async function uploadAndParseReceipt(uri: string, userId: string): Promise<{ imageUrl: string; parsed: ParsedReceipt }> {
  // Compress image
  const compressed = await manipulateAsync(
    uri,
    [{ resize: { width: 1200 } }],
    { compress: 0.7, format: SaveFormat.JPEG }
  );

  // Read as base64
  const base64 = await FileSystem.readAsStringAsync(compressed.uri, {
    encoding: 'base64',
  });

  // Upload to storage
  const fileName = `${userId}/${Date.now()}.jpg`;
  const { error } = await supabase.storage
    .from('receipts')
    .upload(fileName, decode(base64), {
      contentType: 'image/jpeg',
      upsert:      false,
    });

  if (error) throw error;

  const { data: urlData } = supabase.storage
    .from('receipts')
    .getPublicUrl(fileName);

  const imageUrl = urlData.publicUrl;

  // Send base64 directly to edge function
  const { data, error: fnError } = await supabase.functions.invoke('parse-receipt', {
    body: { imageBase64: base64 },
  });

  if (fnError) throw new Error(fnError.message);

  return { imageUrl, parsed: data as ParsedReceipt };
}

function decode(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const bytes        = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

export async function saveReceipt(
  userId:   string,
  imageUrl: string,
  parsed:   ParsedReceipt,
) {
  const { data: receipt, error: receiptError } = await supabase
    .from('receipts')
    .insert({
      user_id:       userId,
      store_name:    parsed.storeName,
      purchase_date: parsed.purchaseDate || new Date().toISOString().split('T')[0],
      total:         parsed.total,
      image_url:     imageUrl,
    })
    .select()
    .single();

  if (receiptError) throw receiptError;

  if (parsed.items.length > 0) {
    const items = parsed.items.map((item) => ({
      receipt_id:      receipt.id,
      raw_name:        item.rawName,
      normalized_name: item.rawName.toLowerCase().trim(),
      category:        'general',
      quantity:        item.quantity,
      unit_price:      item.unitPrice,
    }));

    const { error: itemsError } = await supabase
      .from('receipt_items')
      .insert(items);

    if (itemsError) throw itemsError;
  }

  return receipt;
}