/**
 * Multi-Asset Mock Data
 *
 * Sample data for Crypto, Stocks, Futures, and Options
 */

import { Asset, AssetClass, MultiAssetPosition } from './types';

// ==================== CRYPTO ====================
export const CRYPTO_ASSETS: Asset[] = [
  { symbol: 'BTC/USDT', name: 'Bitcoin', assetClass: 'crypto', exchange: 'Binance', currency: 'USDT', baseAsset: 'BTC', quoteAsset: 'USDT' },
  { symbol: 'ETH/USDT', name: 'Ethereum', assetClass: 'crypto', exchange: 'Binance', currency: 'USDT', baseAsset: 'ETH', quoteAsset: 'USDT' },
  { symbol: 'SOL/USDT', name: 'Solana', assetClass: 'crypto', exchange: 'Binance', currency: 'USDT', baseAsset: 'SOL', quoteAsset: 'USDT' },
  { symbol: 'BNB/USDT', name: 'BNB', assetClass: 'crypto', exchange: 'Binance', currency: 'USDT', baseAsset: 'BNB', quoteAsset: 'USDT' },
  { symbol: 'XRP/USDT', name: 'Ripple', assetClass: 'crypto', exchange: 'Binance', currency: 'USDT', baseAsset: 'XRP', quoteAsset: 'USDT' },
  { symbol: 'ADA/USDT', name: 'Cardano', assetClass: 'crypto', exchange: 'Binance', currency: 'USDT', baseAsset: 'ADA', quoteAsset: 'USDT' },
  { symbol: 'DOGE/USDT', name: 'Dogecoin', assetClass: 'crypto', exchange: 'Binance', currency: 'USDT', baseAsset: 'DOGE', quoteAsset: 'USDT' },
  { symbol: 'AVAX/USDT', name: 'Avalanche', assetClass: 'crypto', exchange: 'Binance', currency: 'USDT', baseAsset: 'AVAX', quoteAsset: 'USDT' },
];

export const CRYPTO_POSITIONS: MultiAssetPosition[] = [
  { id: 'c1', symbol: 'BTC/USDT', name: 'Bitcoin', assetClass: 'crypto', exchange: 'Binance', side: 'long', quantity: 0.5, entryPrice: 42000, currentPrice: 67500, unrealizedPnl: 12750, unrealizedPnlPct: 60.71, leverage: 3, marginUsed: 7000 },
  { id: 'c2', symbol: 'ETH/USDT', name: 'Ethereum', assetClass: 'crypto', exchange: 'Binance', side: 'long', quantity: 5, entryPrice: 2800, currentPrice: 3450, unrealizedPnl: 3250, unrealizedPnlPct: 23.21, leverage: 2, marginUsed: 7000 },
  { id: 'c3', symbol: 'SOL/USDT', name: 'Solana', assetClass: 'crypto', exchange: 'Binance', side: 'short', quantity: 20, entryPrice: 195, currentPrice: 185, unrealizedPnl: 200, unrealizedPnlPct: 5.13, leverage: 5, marginUsed: 780 },
];

// ==================== STOCKS ====================
export const STOCK_ASSETS: Asset[] = [
  { symbol: 'AAPL', name: 'Apple Inc.', assetClass: 'stocks', exchange: 'NASDAQ', currency: 'USD', sector: 'Technology', industry: 'Consumer Electronics', marketCap: 2800000000000 },
  { symbol: 'MSFT', name: 'Microsoft Corp.', assetClass: 'stocks', exchange: 'NASDAQ', currency: 'USD', sector: 'Technology', industry: 'Software', marketCap: 2900000000000 },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', assetClass: 'stocks', exchange: 'NASDAQ', currency: 'USD', sector: 'Technology', industry: 'Internet Services', marketCap: 1800000000000 },
  { symbol: 'AMZN', name: 'Amazon.com Inc.', assetClass: 'stocks', exchange: 'NASDAQ', currency: 'USD', sector: 'Consumer Cyclical', industry: 'E-Commerce', marketCap: 1600000000000 },
  { symbol: 'NVDA', name: 'NVIDIA Corp.', assetClass: 'stocks', exchange: 'NASDAQ', currency: 'USD', sector: 'Technology', industry: 'Semiconductors', marketCap: 1200000000000 },
  { symbol: 'TSLA', name: 'Tesla Inc.', assetClass: 'stocks', exchange: 'NASDAQ', currency: 'USD', sector: 'Consumer Cyclical', industry: 'Auto Manufacturers', marketCap: 800000000000 },
  { symbol: 'META', name: 'Meta Platforms', assetClass: 'stocks', exchange: 'NASDAQ', currency: 'USD', sector: 'Technology', industry: 'Social Media', marketCap: 900000000000 },
  { symbol: 'JPM', name: 'JPMorgan Chase', assetClass: 'stocks', exchange: 'NYSE', currency: 'USD', sector: 'Financial', industry: 'Banking', marketCap: 450000000000 },
];

export const STOCK_POSITIONS: MultiAssetPosition[] = [
  { id: 's1', symbol: 'AAPL', name: 'Apple Inc.', assetClass: 'stocks', exchange: 'NASDAQ', side: 'long', quantity: 100, entryPrice: 175.50, currentPrice: 189.25, unrealizedPnl: 1375, unrealizedPnlPct: 7.84 },
  { id: 's2', symbol: 'NVDA', name: 'NVIDIA Corp.', assetClass: 'stocks', exchange: 'NASDAQ', side: 'long', quantity: 50, entryPrice: 450.00, currentPrice: 875.50, unrealizedPnl: 21275, unrealizedPnlPct: 94.56 },
  { id: 's3', symbol: 'TSLA', name: 'Tesla Inc.', assetClass: 'stocks', exchange: 'NASDAQ', side: 'short', quantity: 30, entryPrice: 265.00, currentPrice: 248.75, unrealizedPnl: 487.5, unrealizedPnlPct: 6.13 },
  { id: 's4', symbol: 'MSFT', name: 'Microsoft Corp.', assetClass: 'stocks', exchange: 'NASDAQ', side: 'long', quantity: 75, entryPrice: 380.25, currentPrice: 415.80, unrealizedPnl: 2666.25, unrealizedPnlPct: 9.35 },
];

// ==================== FUTURES ====================
export const FUTURES_ASSETS: Asset[] = [
  { symbol: 'ES', name: 'E-mini S&P 500', assetClass: 'futures', exchange: 'CME', currency: 'USD', contractSize: 50, tickSize: 0.25, expirationDate: '2025-03-21' },
  { symbol: 'NQ', name: 'E-mini NASDAQ-100', assetClass: 'futures', exchange: 'CME', currency: 'USD', contractSize: 20, tickSize: 0.25, expirationDate: '2025-03-21' },
  { symbol: 'CL', name: 'Crude Oil WTI', assetClass: 'futures', exchange: 'NYMEX', currency: 'USD', contractSize: 1000, tickSize: 0.01, expirationDate: '2025-02-20' },
  { symbol: 'GC', name: 'Gold', assetClass: 'futures', exchange: 'COMEX', currency: 'USD', contractSize: 100, tickSize: 0.10, expirationDate: '2025-04-28' },
  { symbol: 'SI', name: 'Silver', assetClass: 'futures', exchange: 'COMEX', currency: 'USD', contractSize: 5000, tickSize: 0.005, expirationDate: '2025-03-27' },
  { symbol: 'ZB', name: '30-Year T-Bond', assetClass: 'futures', exchange: 'CBOT', currency: 'USD', contractSize: 100000, tickSize: 0.03125, expirationDate: '2025-03-20' },
  { symbol: '6E', name: 'Euro FX', assetClass: 'futures', exchange: 'CME', currency: 'USD', contractSize: 125000, tickSize: 0.00005, expirationDate: '2025-03-17' },
  { symbol: 'ZC', name: 'Corn', assetClass: 'futures', exchange: 'CBOT', currency: 'USD', contractSize: 5000, tickSize: 0.25, expirationDate: '2025-03-14' },
];

export const FUTURES_POSITIONS: MultiAssetPosition[] = [
  { id: 'f1', symbol: 'ES', name: 'E-mini S&P 500', assetClass: 'futures', exchange: 'CME', side: 'long', quantity: 2, entryPrice: 4850.00, currentPrice: 4925.50, unrealizedPnl: 7550, unrealizedPnlPct: 1.56, leverage: 20, marginUsed: 24250, expiryDate: '2025-03-21' },
  { id: 'f2', symbol: 'GC', name: 'Gold', assetClass: 'futures', exchange: 'COMEX', side: 'long', quantity: 1, entryPrice: 2050.00, currentPrice: 2125.80, unrealizedPnl: 7580, unrealizedPnlPct: 3.70, leverage: 15, marginUsed: 13667, expiryDate: '2025-04-28' },
  { id: 'f3', symbol: 'CL', name: 'Crude Oil WTI', assetClass: 'futures', exchange: 'NYMEX', side: 'short', quantity: 3, entryPrice: 78.50, currentPrice: 75.25, unrealizedPnl: 9750, unrealizedPnlPct: 4.14, leverage: 10, marginUsed: 23550, expiryDate: '2025-02-20' },
];

// ==================== OPTIONS ====================
export const OPTIONS_ASSETS: Asset[] = [
  { symbol: 'AAPL 250221C190', name: 'AAPL Call $190', assetClass: 'options', exchange: 'CBOE', currency: 'USD', underlying: 'AAPL', strikePrice: 190, optionType: 'call', expiryDate: '2025-02-21' },
  { symbol: 'AAPL 250221P180', name: 'AAPL Put $180', assetClass: 'options', exchange: 'CBOE', currency: 'USD', underlying: 'AAPL', strikePrice: 180, optionType: 'put', expiryDate: '2025-02-21' },
  { symbol: 'SPY 250321C500', name: 'SPY Call $500', assetClass: 'options', exchange: 'CBOE', currency: 'USD', underlying: 'SPY', strikePrice: 500, optionType: 'call', expiryDate: '2025-03-21' },
  { symbol: 'SPY 250321P480', name: 'SPY Put $480', assetClass: 'options', exchange: 'CBOE', currency: 'USD', underlying: 'SPY', strikePrice: 480, optionType: 'put', expiryDate: '2025-03-21' },
  { symbol: 'TSLA 250221C260', name: 'TSLA Call $260', assetClass: 'options', exchange: 'CBOE', currency: 'USD', underlying: 'TSLA', strikePrice: 260, optionType: 'call', expiryDate: '2025-02-21' },
  { symbol: 'NVDA 250321C900', name: 'NVDA Call $900', assetClass: 'options', exchange: 'CBOE', currency: 'USD', underlying: 'NVDA', strikePrice: 900, optionType: 'call', expiryDate: '2025-03-21' },
  { symbol: 'QQQ 250221C430', name: 'QQQ Call $430', assetClass: 'options', exchange: 'CBOE', currency: 'USD', underlying: 'QQQ', strikePrice: 430, optionType: 'call', expiryDate: '2025-02-21' },
  { symbol: 'MSFT 250321P400', name: 'MSFT Put $400', assetClass: 'options', exchange: 'CBOE', currency: 'USD', underlying: 'MSFT', strikePrice: 400, optionType: 'put', expiryDate: '2025-03-21' },
];

export const OPTIONS_POSITIONS: MultiAssetPosition[] = [
  { id: 'o1', symbol: 'AAPL 250221C190', name: 'AAPL Call $190', assetClass: 'options', exchange: 'CBOE', side: 'long', quantity: 10, entryPrice: 5.50, currentPrice: 8.25, unrealizedPnl: 2750, unrealizedPnlPct: 50.0, delta: 0.65, gamma: 0.08, theta: -0.15, vega: 0.12, impliedVolatility: 0.32, expiryDate: '2025-02-21' },
  { id: 'o2', symbol: 'SPY 250321C500', name: 'SPY Call $500', assetClass: 'options', exchange: 'CBOE', side: 'long', quantity: 5, entryPrice: 12.80, currentPrice: 15.45, unrealizedPnl: 1325, unrealizedPnlPct: 20.70, delta: 0.55, gamma: 0.05, theta: -0.22, vega: 0.18, impliedVolatility: 0.18, expiryDate: '2025-03-21' },
  { id: 'o3', symbol: 'TSLA 250221C260', name: 'TSLA Call $260', assetClass: 'options', exchange: 'CBOE', side: 'short', quantity: 5, entryPrice: 8.20, currentPrice: 6.50, unrealizedPnl: 850, unrealizedPnlPct: 20.73, delta: -0.45, gamma: -0.06, theta: 0.18, vega: -0.14, impliedVolatility: 0.55, expiryDate: '2025-02-21' },
];

// ==================== HELPERS ====================

export function getAssetsByClass(assetClass: AssetClass): Asset[] {
  switch (assetClass) {
    case 'crypto': return CRYPTO_ASSETS;
    case 'stocks': return STOCK_ASSETS;
    case 'futures': return FUTURES_ASSETS;
    case 'options': return OPTIONS_ASSETS;
    default: return CRYPTO_ASSETS;
  }
}

export function getPositionsByClass(assetClass: AssetClass): MultiAssetPosition[] {
  switch (assetClass) {
    case 'crypto': return CRYPTO_POSITIONS;
    case 'stocks': return STOCK_POSITIONS;
    case 'futures': return FUTURES_POSITIONS;
    case 'options': return OPTIONS_POSITIONS;
    default: return CRYPTO_POSITIONS;
  }
}

export function getAllAssets(): Asset[] {
  return [...CRYPTO_ASSETS, ...STOCK_ASSETS, ...FUTURES_ASSETS, ...OPTIONS_ASSETS];
}

export function getAllPositions(): MultiAssetPosition[] {
  return [...CRYPTO_POSITIONS, ...STOCK_POSITIONS, ...FUTURES_POSITIONS, ...OPTIONS_POSITIONS];
}
