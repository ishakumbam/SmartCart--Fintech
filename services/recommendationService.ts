import { ReceiptItem, Recommendation } from '../utils/types';
import { seededRecommendations } from '../utils/mockData';

const categoryDealMap: Record<
  string,
  Omit<Recommendation, 'id' | 'itemName'>
> = {
  Produce: {
    store: 'Green Grocer',
    regularPrice: 4.19,
    dealPrice: 2.99,
    distanceMiles: 2.1,
    latitude: 41.8894,
    longitude: -87.6222,
    note: 'Fresh produce markdown within your usual radius.',
  },
  Dairy: {
    store: 'Market Square',
    regularPrice: 5.49,
    dealPrice: 4.09,
    distanceMiles: 1.7,
    latitude: 41.8934,
    longitude: -87.6359,
    note: 'Strong match for your frequent dairy staples.',
  },
  Protein: {
    store: 'Value Foods',
    regularPrice: 12.99,
    dealPrice: 9.99,
    distanceMiles: 3.4,
    latitude: 41.9011,
    longitude: -87.6291,
    note: 'Weekly ad shows the best protein savings nearby.',
  },
  Pantry: {
    store: 'Saver Market',
    regularPrice: 3.99,
    dealPrice: 2.79,
    distanceMiles: 4.2,
    latitude: 41.8848,
    longitude: -87.6482,
    note: 'Pantry refill deal with consistent price savings.',
  },
  Bakery: {
    store: 'Daily Bread',
    regularPrice: 4.29,
    dealPrice: 3.19,
    distanceMiles: 1.4,
    latitude: 41.8964,
    longitude: -87.6212,
    note: 'Good stop for bread and grab-and-go add-ons.',
  },
  Beverages: {
    store: 'Corner Market',
    regularPrice: 5.99,
    dealPrice: 4.69,
    distanceMiles: 2.8,
    latitude: 41.9072,
    longitude: -87.6349,
    note: 'Beverage promo is running through the weekend.',
  },
};

export function getRecommendationsForItems(items: ReceiptItem[]): Recommendation[] {
  const uniqueItems = items.slice(0, 4);
  const dynamicDeals = uniqueItems.map((item, index) => {
    const template = categoryDealMap[item.category] ?? categoryDealMap.Produce;
    return {
      id: `${item.id}-deal-${index}`,
      itemName: item.name,
      ...template,
      regularPrice: Math.max(item.price + 0.6, template.regularPrice),
      dealPrice: Math.max(item.price - 0.4, 0.99),
    };
  });

  return [...dynamicDeals, ...seededRecommendations].slice(0, 6);
}
