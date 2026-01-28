/**
 * Market Data API Hooks
 *
 * TanStack Query hooks for market data.
 * Includes mock data fallback when backend is unavailable.
 */

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../client';
import type { OHLCVBar, Ticker, Trade } from '../types';

// Generate mock OHLCV data for charts
function generateMockKlines(symbol: string, count: number = 100, intervalStr: string = '1d'): OHLCVBar[] {
  const basePrice = symbol.includes('BTC') ? 67500 :
                    symbol.includes('ETH') ? 3450 :
                    symbol.includes('SOL') ? 185 :
                    symbol.includes('AAPL') ? 189 :
                    symbol.includes('NVDA') ? 875 :
                    symbol.includes('TSLA') ? 248 : 100;

  const now = Date.now();
  const intervalMs = 24 * 60 * 60 * 1000; // 1 day

  return Array.from({ length: count }, (_, i) => {
    const timestamp = now - (count - i) * intervalMs;
    const volatility = 0.02;
    const change = (Math.random() - 0.5) * volatility;
    const open = basePrice * (1 + change);
    const close = open * (1 + (Math.random() - 0.5) * volatility);
    const high = Math.max(open, close) * (1 + Math.random() * 0.01);
    const low = Math.min(open, close) * (1 - Math.random() * 0.01);
    const volume = Math.random() * 1000000;

    return {
      timestamp,
      open,
      high,
      low,
      close,
      volume,
      symbol,
      exchange: 'mock',
      interval: intervalStr,
    };
  });
}

// Generate mock recent trades
function generateMockTrades(symbol: string, count: number = 10): Trade[] {
  const basePrice = symbol.includes('BTC') ? 67500 :
                    symbol.includes('ETH') ? 3450 :
                    symbol.includes('SOL') ? 185 :
                    symbol.includes('AAPL') ? 189 :
                    symbol.includes('NVDA') ? 875 :
                    symbol.includes('TSLA') ? 248 : 100;

  const now = Date.now();

  return Array.from({ length: count }, (_, i) => ({
    tradeId: `mock-${now}-${i}`,
    symbol,
    exchange: 'mock',
    price: basePrice * (1 + (Math.random() - 0.5) * 0.001),
    quantity: Math.random() * 10,
    side: (Math.random() > 0.5 ? 'buy' : 'sell') as 'buy' | 'sell',
    timestamp: now - i * 5000,
  }));
}

// Query Keys
export const marketKeys = {
  all: ['market'] as const,
  klines: (symbol: string, interval: string) =>
    [...marketKeys.all, 'klines', symbol, interval] as const,
  ticker: (symbol: string) => [...marketKeys.all, 'ticker', symbol] as const,
  tickers: () => [...marketKeys.all, 'tickers'] as const,
  trades: (symbol: string) => [...marketKeys.all, 'trades', symbol] as const,
};

// API Functions with mock fallback
async function fetchKlines(
  symbol: string,
  interval: string,
  limit: number = 100
): Promise<OHLCVBar[]> {
  try {
    return await apiClient.get<OHLCVBar[]>(
      `/api/market/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`
    );
  } catch {
    // Return mock data when backend is unavailable
    return generateMockKlines(symbol, limit, interval);
  }
}

async function fetchTicker(symbol: string): Promise<Ticker> {
  try {
    return await apiClient.get<Ticker>(`/api/market/ticker?symbol=${symbol}`);
  } catch {
    // Return mock ticker when backend is unavailable
    const basePrice = symbol.includes('BTC') ? 67500 :
                      symbol.includes('ETH') ? 3450 :
                      symbol.includes('SOL') ? 185 : 100;
    const spread = basePrice * 0.0001; // 0.01% spread
    return {
      timestamp: Date.now(),
      symbol,
      exchange: 'mock',
      bid: basePrice - spread,
      ask: basePrice + spread,
      bidSize: Math.random() * 10,
      askSize: Math.random() * 10,
      last: basePrice,
      lastSize: Math.random() * 5,
    };
  }
}

async function fetchAllTickers(): Promise<Ticker[]> {
  try {
    return await apiClient.get<Ticker[]>('/api/market/tickers');
  } catch {
    // Return empty array when backend is unavailable
    return [];
  }
}

async function fetchRecentTrades(symbol: string, limit: number = 50): Promise<Trade[]> {
  try {
    return await apiClient.get<Trade[]>(
      `/api/market/trades?symbol=${symbol}&limit=${limit}`
    );
  } catch {
    // Return mock trades when backend is unavailable
    return generateMockTrades(symbol, Math.min(limit, 10));
  }
}

// Hooks
export function useKlines(
  symbol: string,
  interval: string = '1h',
  limit: number = 100
) {
  return useQuery({
    queryKey: marketKeys.klines(symbol, interval),
    queryFn: () => fetchKlines(symbol, interval, limit),
    enabled: !!symbol,
    staleTime: 60000, // 1 minute
    refetchInterval: 60000, // Refresh every minute
    retry: 1, // Reduce retry spam
    placeholderData: () => generateMockKlines(symbol, limit, interval), // Show mock chart data
  });
}

export function useTicker(symbol: string) {
  return useQuery({
    queryKey: marketKeys.ticker(symbol),
    queryFn: () => fetchTicker(symbol),
    enabled: !!symbol,
    staleTime: 1000,
    refetchInterval: 2000, // Refresh every 2 seconds
    retry: 1,
  });
}

export function useAllTickers() {
  return useQuery({
    queryKey: marketKeys.tickers(),
    queryFn: fetchAllTickers,
    staleTime: 2000,
    refetchInterval: 5000, // Refresh every 5 seconds
    retry: 1,
    placeholderData: [], // Empty array as placeholder
  });
}

export function useRecentTrades(symbol: string, limit: number = 50) {
  return useQuery({
    queryKey: marketKeys.trades(symbol),
    queryFn: () => fetchRecentTrades(symbol, limit),
    enabled: !!symbol,
    staleTime: 5000,
    refetchInterval: 5000,
    retry: 1,
    placeholderData: () => generateMockTrades(symbol, Math.min(limit, 10)), // Show mock trades
  });
}
