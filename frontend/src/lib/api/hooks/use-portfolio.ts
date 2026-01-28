/**
 * Portfolio API Hooks
 *
 * TanStack Query hooks for portfolio data.
 * Includes mock data fallback when backend is unavailable.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../client';
import type { AccountState, Position, PortfolioStats } from '../types';

// Mock data for development/demo mode
const MOCK_PORTFOLIO_STATS: PortfolioStats = {
  totalValue: 125000,
  totalPnl: 15750,
  totalPnlPercent: 12.6,
  dayPnl: 2340,
  dayPnlPercent: 1.9,
  cashBalance: 25000,
};

const MOCK_ACCOUNT: AccountState = {
  totalEquity: 125000,
  equity: 125000,
  cash: 25000,
  margin: 100000,
  marginLevel: 500,
  unrealizedPnl: 15750,
  realizedPnl: 8500,
  dailyPnl: 2340,
  weeklyPnl: 5800,
  peakEquity: 128000,
  drawdown: 3000,
  drawdownPct: 2.34,
  openPositions: 3,
  positions: [],
  timestamp: Date.now(),
};

// Query Keys
export const portfolioKeys = {
  all: ['portfolio'] as const,
  account: () => [...portfolioKeys.all, 'account'] as const,
  positions: () => [...portfolioKeys.all, 'positions'] as const,
  stats: () => [...portfolioKeys.all, 'stats'] as const,
};

// API Functions with mock fallback
async function fetchAccount(): Promise<AccountState> {
  try {
    return await apiClient.get<AccountState>('/api/portfolio/account');
  } catch {
    // Return mock data when backend is unavailable
    return MOCK_ACCOUNT;
  }
}

async function fetchPositions(): Promise<Position[]> {
  try {
    return await apiClient.get<Position[]>('/api/portfolio/positions');
  } catch {
    // Return empty array when backend is unavailable
    return [];
  }
}

async function fetchStats(): Promise<PortfolioStats> {
  try {
    return await apiClient.get<PortfolioStats>('/api/portfolio/stats');
  } catch {
    // Return mock data when backend is unavailable
    return MOCK_PORTFOLIO_STATS;
  }
}

async function closePosition(symbol: string): Promise<void> {
  return apiClient.post('/api/portfolio/positions/close', { symbol });
}

// Hooks
export function useAccount() {
  return useQuery({
    queryKey: portfolioKeys.account(),
    queryFn: fetchAccount,
    refetchInterval: 5000, // Refresh every 5 seconds
    staleTime: 2000,
    retry: 1, // Reduce retry spam when backend unavailable
    placeholderData: MOCK_ACCOUNT, // Show mock data while loading
  });
}

export function usePositions() {
  return useQuery({
    queryKey: portfolioKeys.positions(),
    queryFn: fetchPositions,
    refetchInterval: 5000,
    staleTime: 2000,
    retry: 1,
    placeholderData: [], // Empty array as placeholder
  });
}

export function usePortfolioStats() {
  return useQuery({
    queryKey: portfolioKeys.stats(),
    queryFn: fetchStats,
    refetchInterval: 10000, // Refresh every 10 seconds
    staleTime: 5000,
    retry: 1,
    placeholderData: MOCK_PORTFOLIO_STATS, // Show mock stats while loading
  });
}

export function useClosePosition() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: closePosition,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: portfolioKeys.all });
    },
  });
}
