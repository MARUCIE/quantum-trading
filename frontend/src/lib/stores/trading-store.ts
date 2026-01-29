import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import type {
  Position,
  OrderBookLevel,
  Trade,
  OrderFormData,
} from "@/components/trading";
import { apiClient } from "@/lib/api/client";
import type {
  AccountState,
  Order as ApiOrder,
  OrderRequest,
  Position as ApiPosition,
  Trade as ApiTrade,
} from "@/lib/api/types";

/**
 * Trading Store
 *
 * Centralized state management for trading operations.
 * Handles orders, positions, order book, and trade history.
 */

export type OrderStatus =
  | "pending"
  | "submitted"
  | "partial"
  | "filled"
  | "cancelled"
  | "rejected"
  | "expired";

export interface Order extends ApiOrder {}

interface TradingState {
  // Current trading symbol
  currentSymbol: string;
  marketPrice: number | null;
  priceChange24h: number;

  // Orders
  orders: Order[];
  isSubmittingOrder: boolean;
  orderError: string | null;
  isLoadingOrders: boolean;

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
  isLoadingTrades: boolean;

  // Available balance
  availableBalance: number;

  // Actions
  setCurrentSymbol: (symbol: string) => void;
  setMarketPrice: (price: number, change24h?: number) => void;

  // Order Actions
  submitOrder: (order: OrderFormData) => Promise<Order | null>;
  cancelOrder: (orderId: string) => Promise<boolean>;
  setOrders: (orders: Order[]) => void;
  refreshOrders: () => Promise<void>;

  // Position Actions
  setPositions: (positions: Position[]) => void;
  closePosition: (positionId: string) => Promise<boolean>;
  updatePosition: (positionId: string, updates: Partial<Position>) => void;
  refreshPositions: () => Promise<void>;

  // Order Book Actions
  updateOrderBook: (bids: OrderBookLevel[], asks: OrderBookLevel[]) => void;
  setOrderBookConnected: (connected: boolean) => void;

  // Trade Actions
  setTrades: (trades: Trade[]) => void;
  addTrade: (trade: Trade) => void;
  refreshTrades: () => Promise<void>;

  // Balance Actions
  setAvailableBalance: (balance: number) => void;
  refreshAccountBalance: () => Promise<void>;

  // Reset
  reset: () => void;
}

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

// Initial state data (without actions)
type TradingStateData = Omit<
  TradingState,
  | "setCurrentSymbol"
  | "setMarketPrice"
  | "submitOrder"
  | "cancelOrder"
  | "setOrders"
  | "refreshOrders"
  | "setPositions"
  | "closePosition"
  | "updatePosition"
  | "refreshPositions"
  | "updateOrderBook"
  | "setOrderBookConnected"
  | "setTrades"
  | "addTrade"
  | "refreshTrades"
  | "setAvailableBalance"
  | "refreshAccountBalance"
  | "reset"
>;

const initialState: TradingStateData = {
  currentSymbol: "BTC/USDT",
  marketPrice: 43250.0,
  priceChange24h: 2.45,
  orders: [],
  isSubmittingOrder: false,
  orderError: null,
  isLoadingOrders: false,
  positions: [],
  isLoadingPositions: false,
  bids: mockOrderBook.bids,
  asks: mockOrderBook.asks,
  isOrderBookConnected: true,
  trades: [],
  recentTrades: [],
  isLoadingTrades: false,
  availableBalance: 0,
};

function mapApiPosition(position: ApiPosition): Position {
  return {
    id: `${position.symbol}-${position.side}`,
    symbol: position.symbol,
    side: position.side,
    quantity: position.quantity,
    entryPrice: position.entryPrice,
    currentPrice: position.currentPrice ?? position.markPrice,
    stopLoss: position.stopLoss,
    takeProfit: position.takeProfit,
    openedAt: new Date(),
    leverage: position.leverage,
  };
}

function mapApiTrade(trade: ApiTrade): Trade {
  return {
    id: trade.tradeId,
    symbol: trade.symbol,
    side: trade.side,
    price: trade.price,
    quantity: trade.quantity,
    total: trade.price * trade.quantity,
    timestamp: new Date(trade.timestamp),
  };
}

function mapApiOrder(order: ApiOrder): Order {
  return order;
}

export const useTradingStore = create<TradingState>()(
  subscribeWithSelector((set, get) => ({
    ...initialState,

    setCurrentSymbol: (symbol) => {
      // Regenerate mock data for the new symbol
      const newOrderBook = generateMockOrderBook(symbol);
      const newMarketPrice = SYMBOL_BASE_PRICES[symbol] || 43250;

      set({
        currentSymbol: symbol,
        marketPrice: newMarketPrice,
        bids: newOrderBook.bids,
        asks: newOrderBook.asks,
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
        // Map timeInForce - API only accepts GTC/IOC/FOK, DAY maps to GTC
        const apiTimeInForce =
          orderData.timeInForce === "DAY" ? "GTC" : orderData.timeInForce;
        const request: OrderRequest = {
          symbol: orderData.symbol,
          side: orderData.side,
          type: orderData.type,
          quantity: orderData.quantity,
          price: orderData.price,
          stopPrice: orderData.stopPrice,
          timeInForce: apiTimeInForce as "GTC" | "IOC" | "FOK" | undefined,
        };
        const response = await apiClient.post<ApiOrder>("/api/orders", request);
        const newOrder = mapApiOrder(response);

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
        await apiClient.post(`/api/orders/${orderId}/cancel`, {});
        set((state) => ({
          orders: state.orders.map((o) =>
            o.orderId === orderId ? { ...o, status: "cancelled" as OrderStatus } : o
          ),
        }));

        return true;
      } catch {
        return false;
      }
    },

    setOrders: (orders) => set({ orders }),

    refreshOrders: async () => {
      set({ isLoadingOrders: true });
      try {
        const orders = await apiClient.get<ApiOrder[]>("/api/orders");
        set({ orders: orders.map(mapApiOrder), isLoadingOrders: false });
      } catch {
        set({ isLoadingOrders: false });
      }
    },

    setPositions: (positions) => set({ positions }),

    refreshPositions: async () => {
      set({ isLoadingPositions: true });
      try {
        const positions = await apiClient.get<ApiPosition[]>("/api/portfolio/positions");
        set({ positions: positions.map(mapApiPosition), isLoadingPositions: false });
      } catch {
        set({ isLoadingPositions: false });
      }
    },

    closePosition: async (positionId) => {
      const position = get().positions.find((p) => p.id === positionId);
      const symbol = position?.symbol ?? positionId;
      try {
        await apiClient.post("/api/portfolio/positions/close", { symbol });
        set((state) => ({
          positions: state.positions.filter((p) => p.id !== positionId && p.symbol !== symbol),
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

    refreshTrades: async () => {
      set({ isLoadingTrades: true });
      try {
        const trades = await apiClient.get<ApiTrade[]>("/api/trades?limit=50");
        const mapped = trades.map(mapApiTrade);
        set({ trades: mapped, recentTrades: mapped.slice(0, 10), isLoadingTrades: false });
      } catch {
        set({ isLoadingTrades: false });
      }
    },

    setAvailableBalance: (balance) => set({ availableBalance: balance }),

    refreshAccountBalance: async () => {
      try {
        const account = await apiClient.get<AccountState>("/api/portfolio/account");
        set({ availableBalance: account.cash });
      } catch {
        // leave balance unchanged on error
      }
    },

    reset: () => set(initialState),
  }))
);

// Selectors for optimized re-renders
export const selectCurrentSymbol = (state: TradingState) => state.currentSymbol;
export const selectMarketPrice = (state: TradingState) => state.marketPrice;
export const selectPositions = (state: TradingState) => state.positions;
export const selectOpenOrders = (state: TradingState) =>
  state.orders.filter((o) =>
    ["pending", "submitted", "partial"].includes(o.status)
  );
export const selectOrderBook = (state: TradingState) => ({
  bids: state.bids,
  asks: state.asks,
});
