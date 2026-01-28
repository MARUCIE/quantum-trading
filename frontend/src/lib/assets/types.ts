/**
 * Asset Class Types
 *
 * Multi-asset support: Crypto, Stocks, Futures, Options
 */

// Asset class enumeration
export type AssetClass = 'crypto' | 'stocks' | 'futures' | 'options';

// Asset class metadata
export interface AssetClassInfo {
  id: AssetClass;
  name: string;
  nameZh: string;
  icon: string;
  description: string;
  descriptionZh: string;
  tradingHours: string;
  tradingHoursZh: string;
  features: string[];
}

// Asset/Instrument definition
export interface Asset {
  symbol: string;
  name: string;
  assetClass: AssetClass;
  exchange: string;
  currency: string;
  // Crypto specific
  baseAsset?: string;
  quoteAsset?: string;
  // Stock specific
  sector?: string;
  industry?: string;
  marketCap?: number;
  // Futures specific
  expirationDate?: string;
  contractSize?: number;
  tickSize?: number;
  // Options specific
  underlying?: string;
  strikePrice?: number;
  optionType?: 'call' | 'put';
  expiryDate?: string;
}

// Extended position with asset class
export interface MultiAssetPosition {
  id: string;
  symbol: string;
  name: string;
  assetClass: AssetClass;
  exchange: string;
  side: 'long' | 'short';
  quantity: number;
  entryPrice: number;
  currentPrice: number;
  unrealizedPnl: number;
  unrealizedPnlPct: number;
  // Asset-specific fields
  leverage?: number;        // Crypto/Futures
  marginUsed?: number;      // Crypto/Futures
  delta?: number;           // Options
  gamma?: number;           // Options
  theta?: number;           // Options
  vega?: number;            // Options
  impliedVolatility?: number; // Options
  expiryDate?: string;      // Futures/Options
}

// Asset class configuration
export const ASSET_CLASSES: AssetClassInfo[] = [
  {
    id: 'crypto',
    name: 'Cryptocurrency',
    nameZh: '加密货币',
    icon: 'Bitcoin',
    description: '24/7 digital asset trading',
    descriptionZh: '7x24小时数字资产交易',
    tradingHours: '24/7',
    tradingHoursZh: '全天候',
    features: ['leverage', 'perpetual', 'spot', 'margin'],
  },
  {
    id: 'stocks',
    name: 'Stocks',
    nameZh: '股票',
    icon: 'TrendingUp',
    description: 'Equity securities trading',
    descriptionZh: '股票证券交易',
    tradingHours: 'Mon-Fri 9:30-16:00 ET',
    tradingHoursZh: '周一至周五 9:30-16:00 美东',
    features: ['dividends', 'splits', 'premarket', 'afterhours'],
  },
  {
    id: 'futures',
    name: 'Futures',
    nameZh: '期货',
    icon: 'Calendar',
    description: 'Derivatives with expiration',
    descriptionZh: '具有到期日的衍生品',
    tradingHours: 'Nearly 24/6',
    tradingHoursZh: '接近24/6',
    features: ['leverage', 'expiration', 'rollover', 'margin'],
  },
  {
    id: 'options',
    name: 'Options',
    nameZh: '期权',
    icon: 'Layers',
    description: 'Calls and puts trading',
    descriptionZh: '看涨和看跌期权交易',
    tradingHours: 'Mon-Fri 9:30-16:00 ET',
    tradingHoursZh: '周一至周五 9:30-16:00 美东',
    features: ['greeks', 'strategies', 'expiration', 'strikes'],
  },
];

// Helper function to get asset class info
export function getAssetClassInfo(assetClass: AssetClass): AssetClassInfo {
  return ASSET_CLASSES.find((ac) => ac.id === assetClass) || ASSET_CLASSES[0];
}
