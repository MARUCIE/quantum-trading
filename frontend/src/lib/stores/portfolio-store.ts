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

const defaultStats: PortfolioStats = {
  totalValue: 0,
  totalPnl: 0,
  totalPnlPercent: 0,
  dayPnl: 0,
  dayPnlPercent: 0,
  cashBalance: 0,
};

export const usePortfolioStore = create<PortfolioState>((set) => ({
  stats: defaultStats,
  positions: [],
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
