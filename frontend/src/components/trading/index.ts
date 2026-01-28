/**
 * Trading Components Library
 *
 * Core trading UI components for the Quantum X platform.
 * Includes order management, position tracking, and market data display.
 */

// Order Form Components
export {
  OrderForm,
  QuickOrderForm,
  type OrderFormData,
  type OrderFormProps,
  type QuickOrderFormProps,
  type OrderSide,
  type OrderType,
  type TimeInForce,
} from "./order-form";

// Position Manager Components
export {
  PositionManager,
  PositionSummary,
  type Position,
  type PositionManagerProps,
  type PositionSummaryProps,
} from "./position-manager";

// Order Book Components
export {
  OrderBook,
  HorizontalOrderBook,
  DepthChart,
  type OrderBookLevel,
  type OrderBookProps,
  type HorizontalOrderBookProps,
  type DepthChartProps,
} from "./order-book";

// Trade History Components
export {
  TradeHistory,
  RecentTrades,
  TradeStats,
  type Trade,
  type TradeHistoryProps,
  type TradeFilters,
  type RecentTradesProps,
  type TradeStatsProps,
} from "./trade-history";
