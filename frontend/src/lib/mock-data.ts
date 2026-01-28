import { CandlestickData, Time } from "lightweight-charts";

// Base prices for different symbols
const SYMBOL_BASE_PRICES: Record<string, number> = {
  // Crypto
  "BTC/USDT": 43245.5,
  "ETH/USDT": 2345.67,
  "SOL/USDT": 98.45,
  "BNB/USDT": 312.78,
  // Stocks
  "AAPL": 178.50,
  "NVDA": 485.20,
  "TSLA": 248.30,
  "MSFT": 378.90,
  "GOOGL": 141.25,
  // Futures
  "ES": 4785.25,
  "NQ": 16892.50,
  "CL": 78.45,
  "GC": 2045.30,
  "ZB": 118.75,
  // Options (underlying prices)
  "SPY": 478.50,
  "QQQ": 405.20,
  "IWM": 198.45,
};

// Generate mock OHLCV data
export function generateMockCandlestickData(
  days: number = 90,
  symbol?: string
): CandlestickData<Time>[] {
  const data: CandlestickData<Time>[] = [];
  const now = new Date();
  // Use symbol-specific base price or default to BTC-like price
  let basePrice = symbol ? (SYMBOL_BASE_PRICES[symbol] || 42000) : 42000;

  for (let i = days; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);

    // Random walk
    const change = (Math.random() - 0.48) * basePrice * 0.03;
    basePrice += change;

    const open = basePrice;
    const close = basePrice + (Math.random() - 0.5) * basePrice * 0.02;
    const high = Math.max(open, close) + Math.random() * basePrice * 0.01;
    const low = Math.min(open, close) - Math.random() * basePrice * 0.01;

    data.push({
      time: (date.getTime() / 1000) as Time,
      open: parseFloat(open.toFixed(2)),
      high: parseFloat(high.toFixed(2)),
      low: parseFloat(low.toFixed(2)),
      close: parseFloat(close.toFixed(2)),
    });

    basePrice = close;
  }

  return data;
}

// Generate mock equity curve data
export function generateMockEquityCurve(days: number = 90) {
  const data = [];
  const now = new Date();
  let equity = 100000;

  for (let i = days; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);

    // Slight upward bias
    const dailyReturn = (Math.random() - 0.45) * 0.02;
    equity *= 1 + dailyReturn;

    data.push({
      date: date.toISOString().split("T")[0],
      equity: parseFloat(equity.toFixed(2)),
    });
  }

  return data;
}

// Mock recent trades
export interface RecentTrade {
  id: string;
  symbol: string;
  side: "buy" | "sell";
  price: number;
  quantity: number;
  timestamp: string;
  strategy: string;
}

export const mockRecentTrades: RecentTrade[] = [
  {
    id: "t1",
    symbol: "BTC/USDT",
    side: "buy",
    price: 43245.5,
    quantity: 0.1,
    timestamp: "2026-01-26T08:32:15Z",
    strategy: "BTC Momentum Alpha",
  },
  {
    id: "t2",
    symbol: "ETH/USDT",
    side: "sell",
    price: 2342.8,
    quantity: 2.5,
    timestamp: "2026-01-26T08:28:42Z",
    strategy: "ETH Mean Reversion",
  },
  {
    id: "t3",
    symbol: "SOL/USDT",
    side: "buy",
    price: 95.15,
    quantity: 25,
    timestamp: "2026-01-26T08:15:33Z",
    strategy: "Cross-Market Arbitrage",
  },
  {
    id: "t4",
    symbol: "BTC/USDT",
    side: "sell",
    price: 43198.2,
    quantity: 0.05,
    timestamp: "2026-01-26T07:58:21Z",
    strategy: "BTC Momentum Alpha",
  },
  {
    id: "t5",
    symbol: "ETH/USDT",
    side: "buy",
    price: 2338.5,
    quantity: 1.8,
    timestamp: "2026-01-26T07:45:10Z",
    strategy: "ETH Mean Reversion",
  },
];

// Mock allocation data
export const mockAllocation = [
  { name: "BTC", value: 45, color: "#f7931a" },
  { name: "ETH", value: 30, color: "#627eea" },
  { name: "SOL", value: 10, color: "#00ffa3" },
  { name: "USDT", value: 15, color: "#26a17b" },
];
