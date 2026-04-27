import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { loadAppState, persistReceiptImage, saveAppState } from '../services/storageService';
import { calculateReceiptPoints } from '../services/rewardsService';
import { getRecommendationsForItems } from '../services/recommendationService';
import {
  AnalyticsSummary,
  AppState,
  ParsedReceipt,
  Receipt,
  RewardsLedgerEntry,
} from '../utils/types';
import { defaultAppState, seededRecommendations } from '../utils/mockData';
import { formatMonthLabel } from '../utils/format';

type AppDataContextValue = {
  ready: boolean;
  state: AppState;
  analytics: AnalyticsSummary;
  addReceipt: (parsedReceipt: ParsedReceipt, imageUri: string) => Promise<Receipt>;
  getReceiptById: (receiptId: string) => Receipt | undefined;
  updateBudget: (monthlyTarget: number, warningThreshold: number) => void;
};

const AppDataContext = createContext<AppDataContextValue | null>(null);

function buildAnalytics(receipts: Receipt[]): AnalyticsSummary {
  const totalSpent = receipts.reduce((sum, receipt) => sum + receipt.total, 0);
  const totalReceipts = receipts.length;
  const averageBasket = totalReceipts > 0 ? totalSpent / totalReceipts : 0;

  const itemMap = new Map<string, number>();
  const categoryTotals = new Map<string, number>();
  const monthlyTotals = new Map<string, number>();

  receipts.forEach((receipt) => {
    const monthKey = new Date(receipt.date).toISOString().slice(0, 7);
    monthlyTotals.set(monthKey, (monthlyTotals.get(monthKey) ?? 0) + receipt.total);

    receipt.items.forEach((item) => {
      itemMap.set(item.name, (itemMap.get(item.name) ?? 0) + item.quantity);
      categoryTotals.set(
        item.category,
        (categoryTotals.get(item.category) ?? 0) + item.price * item.quantity,
      );
    });
  });

  const topItems = [...itemMap.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, quantity]) => ({ name, quantity }));

  const categoryBreakdown = [...categoryTotals.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([category, amount]) => ({
      category,
      amount,
      share: totalSpent > 0 ? amount / totalSpent : 0,
    }));

  const monthlySpend = [...monthlyTotals.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .slice(-4)
    .map(([label, amount]) => ({
      label: formatMonthLabel(`${label}-01T00:00:00.000Z`),
      amount,
    }));

  return {
    totalSpent,
    totalReceipts,
    averageBasket,
    topItems,
    categoryBreakdown,
    monthlySpend,
  };
}

export function AppDataProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>({
    ...defaultAppState,
    recommendations: seededRecommendations,
  });
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;

    (async () => {
      const nextState = await loadAppState();
      if (!active) {
        return;
      }
      setState({
        ...nextState,
        budget: {
          ...defaultAppState.budget,
          ...nextState.budget,
        },
        rewardsLedger: nextState.rewardsLedger?.length
          ? nextState.rewardsLedger
          : defaultAppState.rewardsLedger,
        recommendations:
          nextState.recommendations.length > 0 ? nextState.recommendations : seededRecommendations,
      });
      setReady(true);
    })();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!ready) {
      return;
    }
    void saveAppState(state).catch(() => undefined);
  }, [ready, state]);

  const analytics = useMemo(() => buildAnalytics(state.receipts), [state.receipts]);

  const value = useMemo<AppDataContextValue>(
    () => ({
      ready,
      state,
      analytics,
      async addReceipt(parsedReceipt, imageUri) {
        const storedUri = await persistReceiptImage(imageUri);
        const pointsEarned = calculateReceiptPoints(
          parsedReceipt.total,
          parsedReceipt.items.reduce((sum, item) => sum + item.quantity, 0),
        );

        const nextReceipt: Receipt = {
          ...parsedReceipt,
          id: `receipt-${Date.now()}`,
          imageUri: storedUri,
          createdAt: new Date().toISOString(),
          pointsEarned,
        };

        const nextRecommendations = getRecommendationsForItems(parsedReceipt.items);
        const ledgerEntry: RewardsLedgerEntry = {
          id: `ledger-${Date.now()}`,
          title: `Receipt reward from ${parsedReceipt.store}`,
          detail: `${parsedReceipt.items.length} items scanned • ${parsedReceipt.items.reduce(
            (sum, item) => sum + item.quantity,
            0,
          )} units captured`,
          points: pointsEarned,
          cashValue: pointsEarned / 100,
          type: 'earned',
          createdAt: new Date().toISOString(),
        };

        setState((current) => ({
          ...current,
          profile: {
            ...current.profile,
            points: current.profile.points + pointsEarned,
          },
          rewardsLedger: [ledgerEntry, ...current.rewardsLedger].slice(0, 20),
          receipts: [nextReceipt, ...current.receipts],
          recommendations: nextRecommendations,
        }));

        return nextReceipt;
      },
      getReceiptById(receiptId) {
        return state.receipts.find((receipt) => receipt.id === receiptId);
      },
      updateBudget(monthlyTarget, warningThreshold) {
        setState((current) => ({
          ...current,
          budget: {
            monthlyTarget,
            warningThreshold,
          },
        }));
      },
    }),
    [analytics, ready, state],
  );

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData() {
  const context = useContext(AppDataContext);
  if (!context) {
    throw new Error('useAppData must be used inside AppDataProvider');
  }
  return context;
}
