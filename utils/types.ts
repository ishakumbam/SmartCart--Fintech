export type ReceiptItem = {
  id: string;
  name: string;
  category: string;
  price: number;
  quantity: number;
};

export type ParsedReceipt = {
  items: ReceiptItem[];
  total: number;
  store: string;
  date: string;
};

export type Receipt = ParsedReceipt & {
  id: string;
  imageUri: string;
  createdAt: string;
  pointsEarned: number;
};

export type Recommendation = {
  id: string;
  itemName: string;
  store: string;
  regularPrice: number;
  dealPrice: number;
  distanceMiles: number;
  latitude: number;
  longitude: number;
  note: string;
};

export type StoreDealMarker = {
  id: string;
  title: string;
  subtitle: string;
  latitude: number;
  longitude: number;
};

export type Profile = {
  name: string;
  points: number;
  memberSince: string;
  homeStore: string;
};

export type BudgetSettings = {
  monthlyTarget: number;
  warningThreshold: number;
};

export type RewardsLedgerEntry = {
  id: string;
  title: string;
  detail: string;
  points: number;
  cashValue: number;
  type: 'earned' | 'bonus' | 'redeemed';
  createdAt: string;
};

export type AppState = {
  profile: Profile;
  budget: BudgetSettings;
  rewardsLedger: RewardsLedgerEntry[];
  receipts: Receipt[];
  recommendations: Recommendation[];
};

export type AnalyticsSummary = {
  totalSpent: number;
  totalReceipts: number;
  averageBasket: number;
  topItems: Array<{ name: string; quantity: number }>;
  categoryBreakdown: Array<{ category: string; amount: number; share: number }>;
  monthlySpend: Array<{ label: string; amount: number }>;
};
