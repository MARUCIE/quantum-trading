/**
 * Binance API Configuration
 *
 * Centralized configuration for Binance API endpoints.
 * Supports both production and testnet environments.
 */

export interface BinanceConfig {
  isTestnet: boolean;
  rest: {
    base: string;
    api: string;
  };
  ws: {
    stream: string;
  };
  apiKey?: string;
  apiSecret?: string;
}

const PRODUCTION_CONFIG = {
  rest: {
    base: 'https://api.binance.com',
    api: 'https://api.binance.com/api/v3',
  },
  ws: {
    stream: 'wss://stream.binance.com:9443',
  },
};

const TESTNET_CONFIG = {
  rest: {
    base: 'https://testnet.binance.vision',
    api: 'https://testnet.binance.vision/api/v3',
  },
  ws: {
    stream: 'wss://testnet.binance.vision',
  },
};

/**
 * Get Binance configuration based on environment
 */
export function getBinanceConfig(): BinanceConfig {
  const isTestnet = process.env.BINANCE_TESTNET === 'true';
  const baseConfig = isTestnet ? TESTNET_CONFIG : PRODUCTION_CONFIG;

  return {
    isTestnet,
    ...baseConfig,
    apiKey: process.env.BINANCE_API_KEY,
    apiSecret: process.env.BINANCE_API_SECRET,
  };
}

/**
 * Log current Binance configuration (without secrets)
 */
export function logBinanceConfig(): void {
  const config = getBinanceConfig();
  console.log('[Binance] Configuration:');
  console.log(`  Environment: ${config.isTestnet ? 'TESTNET' : 'PRODUCTION'}`);
  console.log(`  REST API: ${config.rest.api}`);
  console.log(`  WebSocket: ${config.ws.stream}`);
  console.log(`  API Key: ${config.apiKey ? '[SET]' : '[NOT SET]'}`);
  console.log(`  API Secret: ${config.apiSecret ? '[SET]' : '[NOT SET]'}`);
}

// Export singleton config
export const binanceConfig = getBinanceConfig();
