/**
 * Strategies API Hooks
 *
 * TanStack Query hooks for strategy management.
 * Includes mock data fallback when backend is unavailable.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../client';
import type { Strategy, StrategyStatus, StrategySignal } from '../types';

// Mock strategies for development/demo mode
const MOCK_STRATEGIES: Strategy[] = [
  {
    id: 'strat-1',
    name: 'BTC Momentum',
    description: 'Trend-following strategy for Bitcoin',
    status: 'active' as StrategyStatus,
    type: 'momentum',
    symbols: ['BTC/USDT'],
    pnl: 5250,
    pnlPercent: 12.5,
    sharpeRatio: 1.85,
    maxDrawdown: 8.5,
    winRate: 62,
    tradesCount: 45,
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'strat-2',
    name: 'ETH Grid Trading',
    description: 'Grid trading strategy for Ethereum',
    status: 'active' as StrategyStatus,
    type: 'grid',
    symbols: ['ETH/USDT'],
    pnl: 1850,
    pnlPercent: 8.2,
    sharpeRatio: 1.42,
    maxDrawdown: 5.2,
    winRate: 71,
    tradesCount: 128,
    createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'strat-3',
    name: 'Multi-Asset Breakout',
    description: 'Breakout strategy across multiple assets',
    status: 'paused' as StrategyStatus,
    type: 'breakout',
    symbols: ['BTC/USDT', 'ETH/USDT', 'SOL/USDT'],
    pnl: 1400,
    pnlPercent: 5.8,
    sharpeRatio: 1.15,
    maxDrawdown: 12.3,
    winRate: 56,
    tradesCount: 32,
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// Query Keys
export const strategyKeys = {
  all: ['strategies'] as const,
  lists: () => [...strategyKeys.all, 'list'] as const,
  list: (filters: string) => [...strategyKeys.lists(), filters] as const,
  details: () => [...strategyKeys.all, 'detail'] as const,
  detail: (id: string) => [...strategyKeys.details(), id] as const,
  signals: (id: string) => [...strategyKeys.all, 'signals', id] as const,
};

// API Functions with mock fallback
async function fetchStrategies(): Promise<Strategy[]> {
  try {
    return await apiClient.get<Strategy[]>('/api/strategies');
  } catch {
    // Return mock data when backend is unavailable
    return MOCK_STRATEGIES;
  }
}

async function fetchStrategy(id: string): Promise<Strategy> {
  try {
    return await apiClient.get<Strategy>(`/api/strategies/${id}`);
  } catch {
    // Return mock data when backend is unavailable
    return MOCK_STRATEGIES.find(s => s.id === id) || MOCK_STRATEGIES[0];
  }
}

async function fetchSignals(strategyId: string): Promise<StrategySignal[]> {
  try {
    return await apiClient.get<StrategySignal[]>(`/api/strategies/${strategyId}/signals`);
  } catch {
    // Return empty array when backend is unavailable
    return [];
  }
}

async function updateStrategyStatus(data: {
  id: string;
  status: StrategyStatus;
}): Promise<Strategy> {
  return apiClient.put<Strategy>(`/api/strategies/${data.id}/status`, {
    status: data.status,
  });
}

async function createStrategy(data: Partial<Strategy>): Promise<Strategy> {
  return apiClient.post<Strategy>('/api/strategies', data);
}

async function deleteStrategy(id: string): Promise<void> {
  return apiClient.delete(`/api/strategies/${id}`);
}

// Hooks
export function useStrategies() {
  return useQuery({
    queryKey: strategyKeys.lists(),
    queryFn: fetchStrategies,
    staleTime: 30000, // 30 seconds
    retry: 1,
    placeholderData: MOCK_STRATEGIES, // Show mock strategies while loading
  });
}

export function useStrategy(id: string) {
  return useQuery({
    queryKey: strategyKeys.detail(id),
    queryFn: () => fetchStrategy(id),
    enabled: !!id,
    staleTime: 10000,
    retry: 1,
    placeholderData: MOCK_STRATEGIES.find(s => s.id === id),
  });
}

export function useStrategySignals(strategyId: string) {
  return useQuery({
    queryKey: strategyKeys.signals(strategyId),
    queryFn: () => fetchSignals(strategyId),
    enabled: !!strategyId,
    refetchInterval: 5000,
    retry: 1,
    placeholderData: [], // Empty array as placeholder
  });
}

export function useUpdateStrategyStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateStrategyStatus,
    onSuccess: (data) => {
      queryClient.setQueryData(strategyKeys.detail(data.id), data);
      queryClient.invalidateQueries({ queryKey: strategyKeys.lists() });
    },
  });
}

export function useCreateStrategy() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createStrategy,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: strategyKeys.lists() });
    },
  });
}

export function useDeleteStrategy() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteStrategy,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: strategyKeys.lists() });
    },
  });
}
