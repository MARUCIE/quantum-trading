/**
 * Market Data Types - Canonical Contracts
 *
 * These types define the standardized data contracts used across
 * the entire system. All data sources must transform their data
 * to match these interfaces.
 */

/** Unified OHLCV bar contract */
export interface OHLCVBar {
  timestamp: number;      // Unix ms
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  symbol: string;
  exchange: string;
  interval: KlineInterval;
}

/** Unified ticker contract */
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

/** Unified trade contract */
export interface Trade {
  timestamp: number;
  symbol: string;
  exchange: string;
  price: number;
  quantity: number;
  side: 'buy' | 'sell';
  tradeId: string;
}

/** Order book price level */
export interface OrderBookLevel {
  price: number;
  size: number;
}

/** Unified order book contract */
export interface OrderBook {
  timestamp: number;
  symbol: string;
  exchange: string;
  bids: OrderBookLevel[];  // Sorted descending by price (best bid first)
  asks: OrderBookLevel[];  // Sorted ascending by price (best ask first)
  lastUpdateId: number;
}

/** Supported kline intervals */
export type KlineInterval =
  | '1m' | '3m' | '5m' | '15m' | '30m'
  | '1h' | '2h' | '4h' | '6h' | '8h' | '12h'
  | '1d' | '3d' | '1w' | '1M';

/** Supported exchanges */
export type Exchange = 'binance' | 'okx' | 'bybit';

/** Data quality metrics */
export interface DataQualityMetrics {
  latencyMs: number;
  missingCount: number;
  duplicateCount: number;
  outlierCount: number;
  lastUpdate: number;
}

/** Data source configuration */
export interface DataSourceConfig {
  exchange: Exchange;
  symbols: string[];
  intervals: KlineInterval[];
  websocketUrl?: string;
  restUrl?: string;
  apiKey?: string;
  apiSecret?: string;
  testnet: boolean;
}
