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

const defaultStrategies: Strategy[] = [];

export const useStrategyStore = create<StrategyState>((set) => ({
  strategies: defaultStrategies,
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
