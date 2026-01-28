import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import type {
  Position,
  OrderBookLevel,
  Trade,
  OrderFormData,
} from "@/components/trading";

/**
 * Trading Store
 *
 * Centralized state management for trading operations.
 * Handles orders, positions, order book, and trade history.
 */

export type OrderStatus =
  | "pending"
  | "open"
  | "filled"
  | "partially_filled"
  | "cancelled"
  | "rejected";

export interface Order extends OrderFormData {
  id: string;
  status: OrderStatus;
  filledQuantity: number;
  averagePrice?: number;
  createdAt: Date;
  updatedAt: Date;
}

interface TradingState {
  // Current trading symbol
  currentSymbol: string;
  marketPrice: number | null;
  priceChange24h: number;

  // Orders
  orders: Order[];
  isSubmittingOrder: boolean;
  orderError: string | null;

  // Positions
  positions: Position[];
  isLoadingPositions: boolean;

  // Order Book
  bids: OrderBookLevel[];
  asks: OrderBookLevel[];
  isOrderBookConnected: boolean;

  // Trade History
  trades: Trade[];
  recentTrades: Trade[];

  // Available balance
  availableBalance: number;

  // Actions
  setCurrentSymbol: (symbol: string) => void;
  setMarketPrice: (price: number, change24h?: number) => void;

  // Order Actions
  submitOrder: (order: OrderFormData) => Promise<Order | null>;
  cancelOrder: (orderId: string) => Promise<boolean>;
  setOrders: (orders: Order[]) => void;

  // Position Actions
  setPositions: (positions: Position[]) => void;
  closePosition: (positionId: string) => Promise<boolean>;
  updatePosition: (positionId: string, updates: Partial<Position>) => void;

  // Order Book Actions
  updateOrderBook: (bids: OrderBookLevel[], asks: OrderBookLevel[]) => void;
  setOrderBookConnected: (connected: boolean) => void;

  // Trade Actions
  setTrades: (trades: Trade[]) => void;
  addTrade: (trade: Trade) => void;

  // Balance Actions
  setAvailableBalance: (balance: number) => void;

  // Reset
  reset: () => void;
}

// Mock data for initial state
const mockPositions: Position[] = [
  {
    id: "pos-1",
    symbol: "BTC/USDT",
    side: "long",
    quantity: 0.5,
    entryPrice: 42150.0,
    currentPrice: 43250.0,
    stopLoss: 40000.0,
    takeProfit: 48000.0,
    openedAt: new Date(Date.now() - 3600000 * 24),
    leverage: 5,
  },
  {
    id: "pos-2",
    symbol: "ETH/USDT",
    side: "short",
    quantity: 2.5,
    entryPrice: 2450.0,
    currentPrice: 2380.0,
    stopLoss: 2600.0,
    takeProfit: 2200.0,
    openedAt: new Date(Date.now() - 3600000 * 12),
    leverage: 3,
  },
];

const mockOrders: Order[] = [
  {
    id: "ord-1",
    symbol: "BTC/USDT",
    side: "buy",
    type: "limit",
    quantity: 0.25,
    price: 41500.0,
    timeInForce: "GTC",
    status: "open",
    filledQuantity: 0,
    createdAt: new Date(Date.now() - 3600000),
    updatedAt: new Date(Date.now() - 3600000),
  },
  {
    id: "ord-2",
    symbol: "ETH/USDT",
    side: "sell",
    type: "stop_limit",
    quantity: 1.0,
    price: 2300.0,
    stopPrice: 2320.0,
    timeInForce: "GTC",
    status: "pending",
    filledQuantity: 0,
    createdAt: new Date(Date.now() - 1800000),
    updatedAt: new Date(Date.now() - 1800000),
  },
];

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

const generateMockOrderBook = (symbol: string = "BTC/USDT"): {
  bids: OrderBookLevel[];
  asks: OrderBookLevel[];
} => {
  const basePrice = SYMBOL_BASE_PRICES[symbol] || 43250;
  // Calculate tick size based on price magnitude
  const tickSize = basePrice > 1000 ? 10 : basePrice > 100 ? 1 : basePrice > 10 ? 0.1 : 0.01;
  const bids: OrderBookLevel[] = [];
  const asks: OrderBookLevel[] = [];

  let bidTotal = 0;
  let askTotal = 0;

  for (let i = 0; i < 15; i++) {
    const bidQty = Math.random() * 5 + 0.1;
    const askQty = Math.random() * 5 + 0.1;
    bidTotal += bidQty;
    askTotal += askQty;

    bids.push({
      price: parseFloat((basePrice - (i + 1) * tickSize).toFixed(4)),
      quantity: bidQty,
      total: bidTotal,
      orders: Math.floor(Math.random() * 10) + 1,
    });

    asks.push({
      price: parseFloat((basePrice + (i + 1) * tickSize).toFixed(4)),
      quantity: askQty,
      total: askTotal,
      orders: Math.floor(Math.random() * 10) + 1,
    });
  }

  return { bids, asks };
};

const mockOrderBook = generateMockOrderBook("BTC/USDT");

const generateMockTrades = (symbol: string = "BTC/USDT"): Trade[] => {
  const basePrice = SYMBOL_BASE_PRICES[symbol] || 43250;
  const priceVariance = basePrice * 0.002; // 0.2% variance

  return Array.from({ length: 20 }, (_, i) => {
    const side: "buy" | "sell" = Math.random() > 0.5 ? "buy" : "sell";
    const price = basePrice + (Math.random() - 0.5) * priceVariance;
    const quantity = Math.random() * 2 + 0.01;
    return {
      id: `trade-${symbol}-${i + 1}`,
      symbol,
      side,
      price: parseFloat(price.toFixed(4)),
      quantity: parseFloat(quantity.toFixed(6)),
      total: parseFloat((price * quantity).toFixed(2)),
      fee: Math.random() * 0.5,
      feeCurrency: symbol.includes("/") ? symbol.split("/")[1] : "USD",
      timestamp: new Date(Date.now() - i * 60000),
    };
  });
};

const mockTrades = generateMockTrades("BTC/USDT");

const initialState = {
  currentSymbol: "BTC/USDT",
  marketPrice: 43250.0,
  priceChange24h: 2.45,
  orders: mockOrders,
  isSubmittingOrder: false,
  orderError: null,
  positions: mockPositions,
  isLoadingPositions: false,
  bids: mockOrderBook.bids,
  asks: mockOrderBook.asks,
  isOrderBookConnected: true,
  trades: mockTrades,
  recentTrades: mockTrades.slice(0, 10),
  availableBalance: 50000.0,
};

export const useTradingStore = create<TradingState>()(
  subscribeWithSelector((set, get) => ({
    ...initialState,

    setCurrentSymbol: (symbol) => {
      // Regenerate mock data for the new symbol
      const newOrderBook = generateMockOrderBook(symbol);
      const newTrades = generateMockTrades(symbol);
      const newMarketPrice = SYMBOL_BASE_PRICES[symbol] || 43250;

      set({
        currentSymbol: symbol,
        marketPrice: newMarketPrice,
        bids: newOrderBook.bids,
        asks: newOrderBook.asks,
        trades: newTrades,
        recentTrades: newTrades.slice(0, 10),
      });
    },

    setMarketPrice: (price, change24h) =>
      set({
        marketPrice: price,
        ...(change24h !== undefined && { priceChange24h: change24h }),
      }),

    submitOrder: async (orderData) => {
      set({ isSubmittingOrder: true, orderError: null });

      try {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000));

        const newOrder: Order = {
          ...orderData,
          id: `ord-${Date.now()}`,
          status: orderData.type === "market" ? "filled" : "open",
          filledQuantity: orderData.type === "market" ? orderData.quantity : 0,
          averagePrice: orderData.type === "market" ? get().marketPrice ?? undefined : undefined,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        set((state) => ({
          orders: [newOrder, ...state.orders],
          isSubmittingOrder: false,
        }));

        return newOrder;
      } catch (error) {
        set({
          isSubmittingOrder: false,
          orderError: error instanceof Error ? error.message : "Order failed",
        });
        return null;
      }
    },

    cancelOrder: async (orderId) => {
      try {
        await new Promise((resolve) => setTimeout(resolve, 500));

        set((state) => ({
          orders: state.orders.map((o) =>
            o.id === orderId ? { ...o, status: "cancelled" as OrderStatus } : o
          ),
        }));

        return true;
      } catch {
        return false;
      }
    },

    setOrders: (orders) => set({ orders }),

    setPositions: (positions) => set({ positions }),

    closePosition: async (positionId) => {
      try {
        await new Promise((resolve) => setTimeout(resolve, 500));

        set((state) => ({
          positions: state.positions.filter((p) => p.id !== positionId),
        }));

        return true;
      } catch {
        return false;
      }
    },

    updatePosition: (positionId, updates) =>
      set((state) => ({
        positions: state.positions.map((p) =>
          p.id === positionId ? { ...p, ...updates } : p
        ),
      })),

    updateOrderBook: (bids, asks) => set({ bids, asks }),

    setOrderBookConnected: (connected) =>
      set({ isOrderBookConnected: connected }),

    setTrades: (trades) =>
      set({ trades, recentTrades: trades.slice(0, 10) }),

    addTrade: (trade) =>
      set((state) => {
        const newTrades = [trade, ...state.trades];
        return {
          trades: newTrades,
          recentTrades: newTrades.slice(0, 10),
        };
      }),

    setAvailableBalance: (balance) => set({ availableBalance: balance }),

    reset: () => set(initialState),
  }))
);

// Selectors for optimized re-renders
export const selectCurrentSymbol = (state: TradingState) => state.currentSymbol;
export const selectMarketPrice = (state: TradingState) => state.marketPrice;
export const selectPositions = (state: TradingState) => state.positions;
export const selectOpenOrders = (state: TradingState) =>
  state.orders.filter((o) => o.status === "open" || o.status === "pending");
export const selectOrderBook = (state: TradingState) => ({
  bids: state.bids,
  asks: state.asks,
});
