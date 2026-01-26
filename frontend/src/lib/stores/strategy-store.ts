import { create } from "zustand";

export type StrategyStatus = "active" | "paused" | "stopped" | "error";

export interface Strategy {
  id: string;
  name: string;
  description: string;
  status: StrategyStatus;
  type: string;
  symbols: string[];
  pnl: number;
  pnlPercent: number;
  sharpeRatio: number;
  maxDrawdown: number;
  winRate: number;
  tradesCount: number;
  createdAt: string;
  updatedAt: string;
}

interface StrategyState {
  strategies: Strategy[];
  selectedStrategy: Strategy | null;
  isLoading: boolean;
  error: string | null;
  setStrategies: (strategies: Strategy[]) => void;
  selectStrategy: (strategy: Strategy | null) => void;
  updateStrategy: (id: string, updates: Partial<Strategy>) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

// Mock data
const mockStrategies: Strategy[] = [
  {
    id: "1",
    name: "BTC Momentum Alpha",
    description: "Trend-following strategy using momentum indicators",
    status: "active",
    type: "Momentum",
    symbols: ["BTC/USDT"],
    pnl: 8245.67,
    pnlPercent: 12.34,
    sharpeRatio: 1.85,
    maxDrawdown: -8.2,
    winRate: 58.3,
    tradesCount: 142,
    createdAt: "2025-11-15T10:00:00Z",
    updatedAt: "2026-01-26T08:30:00Z",
  },
  {
    id: "2",
    name: "ETH Mean Reversion",
    description: "Statistical arbitrage on ETH price deviations",
    status: "active",
    type: "Mean Reversion",
    symbols: ["ETH/USDT", "ETH/BTC"],
    pnl: 4521.89,
    pnlPercent: 8.67,
    sharpeRatio: 2.12,
    maxDrawdown: -5.4,
    winRate: 62.1,
    tradesCount: 89,
    createdAt: "2025-12-01T14:00:00Z",
    updatedAt: "2026-01-26T08:30:00Z",
  },
  {
    id: "3",
    name: "Cross-Market Arbitrage",
    description: "Exploiting price differences across exchanges",
    status: "paused",
    type: "Arbitrage",
    symbols: ["BTC/USDT", "ETH/USDT", "SOL/USDT"],
    pnl: 2134.45,
    pnlPercent: 4.21,
    sharpeRatio: 3.45,
    maxDrawdown: -2.1,
    winRate: 78.5,
    tradesCount: 456,
    createdAt: "2026-01-05T09:00:00Z",
    updatedAt: "2026-01-25T16:00:00Z",
  },
  {
    id: "4",
    name: "ML Factor Model",
    description: "Machine learning based multi-factor strategy",
    status: "stopped",
    type: "ML/Factor",
    symbols: ["BTC/USDT", "ETH/USDT"],
    pnl: -1245.32,
    pnlPercent: -3.12,
    sharpeRatio: 0.45,
    maxDrawdown: -15.6,
    winRate: 42.3,
    tradesCount: 67,
    createdAt: "2026-01-10T11:00:00Z",
    updatedAt: "2026-01-20T10:00:00Z",
  },
];

export const useStrategyStore = create<StrategyState>((set) => ({
  strategies: mockStrategies,
  selectedStrategy: null,
  isLoading: false,
  error: null,
  setStrategies: (strategies) => set({ strategies }),
  selectStrategy: (selectedStrategy) => set({ selectedStrategy }),
  updateStrategy: (id, updates) =>
    set((state) => ({
      strategies: state.strategies.map((s) =>
        s.id === id ? { ...s, ...updates } : s
      ),
    })),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
}));
