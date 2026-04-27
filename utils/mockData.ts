import { AppState, Recommendation, StoreDealMarker } from './types';

export const defaultAppState: AppState = {
  profile: {
    name: 'Alex Carter',
    points: 240,
    memberSince: '2026-01-12T08:30:00.000Z',
    homeStore: 'Fresh Basket',
  },
  budget: {
    monthlyTarget: 600,
    warningThreshold: 0.8,
  },
  rewardsLedger: [
    {
      id: 'ledger-welcome',
      title: 'Welcome bonus',
      detail: 'Starter balance for your first SmartCart scans',
      points: 240,
      cashValue: 2.4,
      type: 'bonus',
      createdAt: '2026-01-12T08:30:00.000Z',
    },
  ],
  receipts: [],
  recommendations: [],
};

export const seededRecommendations: Recommendation[] = [
  {
    id: 'seed-1',
    itemName: 'Organic Milk',
    store: 'Market Square',
    regularPrice: 5.49,
    dealPrice: 4.29,
    distanceMiles: 1.8,
    latitude: 41.8934,
    longitude: -87.6359,
    note: '18% cheaper than your recent average.',
  },
  {
    id: 'seed-2',
    itemName: 'Bananas',
    store: 'Green Grocer',
    regularPrice: 1.29,
    dealPrice: 0.79,
    distanceMiles: 2.4,
    latitude: 41.8894,
    longitude: -87.6222,
    note: 'Perfect quick win for weekly produce runs.',
  },
  {
    id: 'seed-3',
    itemName: 'Greek Yogurt',
    store: 'Value Foods',
    regularPrice: 6.99,
    dealPrice: 5.49,
    distanceMiles: 3.1,
    latitude: 41.9011,
    longitude: -87.6291,
    note: 'Bundle promo available this week.',
  },
];

export const fallbackMarkers: StoreDealMarker[] = seededRecommendations.map((deal) => ({
  id: deal.id,
  title: deal.store,
  subtitle: `${deal.itemName} for $${deal.dealPrice.toFixed(2)}`,
  latitude: deal.latitude,
  longitude: deal.longitude,
}));
