import { create } from "zustand";

export interface Position {
  symbol: string;
  side: "long" | "short";
  quantity: number;
  entryPrice: number;
  currentPrice: number;
  unrealizedPnl: number;
  unrealizedPnlPercent: number;
}

export interface PortfolioStats {
  totalValue: number;
  totalPnl: number;
  totalPnlPercent: number;
  dayPnl: number;
  dayPnlPercent: number;
  cashBalance: number;
}

interface PortfolioState {
  stats: PortfolioStats;
  positions: Position[];
  isLoading: boolean;
  error: string | null;
  setStats: (stats: PortfolioStats) => void;
  setPositions: (positions: Position[]) => void;
  updatePosition: (symbol: string, updates: Partial<Position>) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

// Mock initial data
const mockStats: PortfolioStats = {
  totalValue: 125847.32,
  totalPnl: 15847.32,
  totalPnlPercent: 14.41,
  dayPnl: 2341.56,
  dayPnlPercent: 1.89,
  cashBalance: 45234.12,
};

const mockPositions: Position[] = [
  {
    symbol: "BTC/USDT",
    side: "long",
    quantity: 0.5,
    entryPrice: 42500,
    currentPrice: 43250,
    unrealizedPnl: 375,
    unrealizedPnlPercent: 1.76,
  },
  {
    symbol: "ETH/USDT",
    side: "long",
    quantity: 5.2,
    entryPrice: 2280,
    currentPrice: 2345,
    unrealizedPnl: 338,
    unrealizedPnlPercent: 2.85,
  },
  {
    symbol: "SOL/USDT",
    side: "short",
    quantity: 50,
    entryPrice: 98.5,
    currentPrice: 95.2,
    unrealizedPnl: 165,
    unrealizedPnlPercent: 3.35,
  },
];

export const usePortfolioStore = create<PortfolioState>((set) => ({
  stats: mockStats,
  positions: mockPositions,
  isLoading: false,
  error: null,
  setStats: (stats) => set({ stats }),
  setPositions: (positions) => set({ positions }),
  updatePosition: (symbol, updates) =>
    set((state) => ({
      positions: state.positions.map((p) =>
        p.symbol === symbol ? { ...p, ...updates } : p
      ),
    })),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
}));
