/*
 * Global Subscription State Context
 * Tracks which APIs the user has purchased, their plans, API keys, and usage data.
 * Shared across MarketplacePage, ApiDetailPage, and WorkspacePage.
 */

import { createContext, useContext, useState, ReactNode } from 'react';

export interface SubscribedApi {
  apiId: string;
  apiName: string;
  apiLogo: string;
  planId: string;
  planName: string;
  planPrice: number;
  requestLimit: number;
  apiKey: string;
  subscribedAt: string;
  renewsAt: string;
  // Usage data (mock)
  usageThisMonth: number;
  usageHistory: { date: string; calls: number }[];
  status: 'active' | 'suspended' | 'cancelled';
}

interface SubscriptionContextValue {
  subscriptions: SubscribedApi[];
  addSubscription: (sub: SubscribedApi) => void;
  removeSubscription: (apiId: string) => void;
  getSubscription: (apiId: string) => SubscribedApi | undefined;
  isSubscribed: (apiId: string) => boolean;
}

const SubscriptionContext = createContext<SubscriptionContextValue | null>(null);

// Generate mock usage history for the last 30 days
function generateUsageHistory(limit: number): { date: string; calls: number }[] {
  const history = [];
  const now = new Date();
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    // Simulate realistic usage pattern
    const base = Math.floor(limit / 30 * 0.4);
    const variance = Math.floor(base * 0.8 * Math.random());
    const spike = Math.random() > 0.85 ? Math.floor(base * 1.5) : 0;
    history.push({ date: dateStr, calls: base + variance + spike });
  }
  return history;
}

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const [subscriptions, setSubscriptions] = useState<SubscribedApi[]>([]);

  const addSubscription = (sub: SubscribedApi) => {
    setSubscriptions(prev => {
      // Replace if already exists
      const exists = prev.find(s => s.apiId === sub.apiId);
      if (exists) return prev.map(s => s.apiId === sub.apiId ? sub : s);
      return [...prev, sub];
    });
  };

  const removeSubscription = (apiId: string) => {
    setSubscriptions(prev => prev.filter(s => s.apiId !== apiId));
  };

  const getSubscription = (apiId: string) =>
    subscriptions.find(s => s.apiId === apiId);

  const isSubscribed = (apiId: string) =>
    subscriptions.some(s => s.apiId === apiId);

  return (
    <SubscriptionContext.Provider value={{
      subscriptions,
      addSubscription,
      removeSubscription,
      getSubscription,
      isSubscribed,
    }}>
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  const ctx = useContext(SubscriptionContext);
  if (!ctx) throw new Error('useSubscription must be used within SubscriptionProvider');
  return ctx;
}

export { generateUsageHistory };
