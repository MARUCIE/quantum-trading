/**
 * API Types
 *
 * Shared types between frontend and backend.
 */

// Market Data Types
export interface OHLCVBar {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  symbol: string;
  exchange: string;
  interval: string;
}

export interface Ticker {
  timestamp: number;
  symbol: string;
  exchange: string;
  bid: number;
  ask: number;
  bidSize: number;
  askSize: number;
  last: number;
  lastSize: number;
}

// Portfolio Types
export interface Position {
  symbol: string;
  side: 'long' | 'short';
  quantity: number;
  entryPrice: number;
  currentPrice: number;
  markPrice: number;
  unrealizedPnl: number;
  unrealizedPnlPct: number;
  leverage: number;
  marginUsed: number;
  stopLoss?: number;
  takeProfit?: number;
}

export interface AccountState {
  totalEquity: number;
  equity: number;
  cash: number;
  margin: number;
  marginLevel: number;
  unrealizedPnl: number;
  realizedPnl: number;
  dailyPnl: number;
  weeklyPnl: number;
  peakEquity: number;
  drawdown: number;
  drawdownPct: number;
  openPositions: number;
  positions: Position[];
  timestamp: number;
}

export interface PortfolioStats {
  totalValue: number;
  totalPnl: number;
  totalPnlPercent: number;
  dayPnl: number;
  dayPnlPercent: number;
  cashBalance: number;
}

// Strategy Types
export type StrategyStatus = 'active' | 'paused' | 'stopped' | 'error';

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

export interface StrategySignal {
  strategyId: string;
  symbol: string;
  type: string;
  direction: 'long' | 'short' | 'neutral';
  strength: number;
  confidence: number;
  timestamp: number;
}

// Risk Types
export interface RiskEvent {
  timestamp: number;
  type: 'check' | 'breach' | 'action';
  level: 'info' | 'warning' | 'critical';
  category: 'account' | 'strategy' | 'trade' | 'system';
  message: string;
  data: Record<string, unknown>;
}

export interface RiskMetrics {
  currentDrawdown: number;
  maxDrawdown: number;
  dailyVaR: number;
  sharpeRatio: number;
  marginLevel: number;
  riskEvents: RiskEvent[];
}

export interface RiskLimits {
  account: {
    dailyLossLimitPct: number;
    maxLeverage: number;
    maxDrawdownPct: number;
  };
  trade: {
    maxPositionPct: number;
    maxOrderSize: number;
  };
}

// Order Types
export interface Order {
  id: string;
  symbol: string;
  side: 'buy' | 'sell';
  type: 'market' | 'limit' | 'stop';
  status: 'pending' | 'open' | 'filled' | 'cancelled' | 'rejected';
  quantity: number;
  filledQuantity: number;
  price?: number;
  avgFillPrice?: number;
  stopPrice?: number;
  strategyId?: string;
  createdAt: number;
  updatedAt: number;
}

export interface Trade {
  tradeId: string;
  symbol: string;
  exchange: string;
  side: 'buy' | 'sell';
  price: number;
  quantity: number;
  timestamp: number;
}

// Backtest Types
export interface BacktestConfig {
  strategyId: string;
  symbol: string;
  startDate: string;
  endDate: string;
  initialCapital: number;
  commission: number;
  slippage: number;
}

export interface BacktestResult {
  id: string;
  config: BacktestConfig;
  metrics: {
    totalReturn: number;
    sharpeRatio: number;
    maxDrawdown: number;
    winRate: number;
    tradesCount: number;
    profitFactor: number;
  };
  equityCurve: Array<{ date: string; equity: number }>;
  trades: Trade[];
  status: 'running' | 'completed' | 'failed';
  createdAt: string;
}
