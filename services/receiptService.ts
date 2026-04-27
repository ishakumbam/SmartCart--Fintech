import { ParsedReceipt, ReceiptItem } from '../utils/types';

const sampleReceipts: Array<{
  store: string;
  items: Array<Omit<ReceiptItem, 'id'>>;
}> = [
  {
    store: 'Fresh Basket',
    items: [
      { name: 'Bananas', category: 'Produce', price: 1.28, quantity: 6 },
      { name: 'Avocado', category: 'Produce', price: 1.99, quantity: 2 },
      { name: 'Greek Yogurt', category: 'Dairy', price: 5.49, quantity: 1 },
      { name: 'Whole Grain Bread', category: 'Bakery', price: 3.79, quantity: 1 },
      { name: 'Organic Milk', category: 'Dairy', price: 4.99, quantity: 1 },
    ],
  },
  {
    store: 'Market Square',
    items: [
      { name: 'Chicken Breast', category: 'Protein', price: 10.48, quantity: 2 },
      { name: 'Spinach', category: 'Produce', price: 3.49, quantity: 1 },
      { name: 'Strawberries', category: 'Produce', price: 4.29, quantity: 1 },
      { name: 'Sparkling Water', category: 'Beverages', price: 5.99, quantity: 1 },
      { name: 'Cheddar Cheese', category: 'Dairy', price: 4.79, quantity: 1 },
    ],
  },
  {
    store: 'Green Grocer',
    items: [
      { name: 'Blueberries', category: 'Produce', price: 3.99, quantity: 1 },
      { name: 'Eggs', category: 'Dairy', price: 4.49, quantity: 1 },
      { name: 'Salmon Fillet', category: 'Protein', price: 13.99, quantity: 1 },
      { name: 'Brown Rice', category: 'Pantry', price: 2.99, quantity: 1 },
      { name: 'Tomatoes', category: 'Produce', price: 3.29, quantity: 4 },
    ],
  },
];

function buildItems(templateItems: Array<Omit<ReceiptItem, 'id'>>): ReceiptItem[] {
  return templateItems.map((item, index) => ({
    ...item,
    id: `item-${Date.now()}-${index}`,
  }));
}

export async function parseReceiptImage(imageUri: string): Promise<ParsedReceipt> {
  await new Promise((resolve) => setTimeout(resolve, 1200));

  const seed = imageUri.length % sampleReceipts.length;
  const template = sampleReceipts[seed];
  const items = buildItems(template.items);
  const total =
    Math.round(items.reduce((sum, item) => sum + item.price * item.quantity, 0) * 100) / 100;

  return {
    store: template.store,
    date: new Date().toISOString(),
    total,
    items,
  };
}
