/**
 * Quantum X Backend - Entry Point
 *
 * MVP data pipeline and API server for quantitative trading system.
 */

import { config } from 'dotenv';
import { BinanceClient } from './data/binance-client.js';
import { BinanceWebSocket } from './data/binance-ws.js';
import { logBinanceConfig } from './data/binance-config.js';
import { ApiServer, registerRoutes } from './api/index.js';
import { wsServer } from './ws/index.js';

// Load environment variables
config({ path: '.env.local' });

async function main() {
  console.log('=== Quantum X Backend ===');
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);

  // Log Binance configuration
  logBinanceConfig();

  // Start API server
  const apiPort = parseInt(process.env.API_PORT || '3001', 10);
  const apiServer = new ApiServer(apiPort);
  registerRoutes(apiServer);
  await apiServer.start();

  // Initialize REST client
  const client = new BinanceClient({
    testnet: process.env.BINANCE_TESTNET === 'true',
  });

  // Health check (non-blocking for MVP - continue with mock data if fails)
  const healthy = await client.ping();
  console.log(`Binance API: ${healthy ? 'OK' : 'FAIL (using mock data)'}`);

  if (healthy) {
    // Get server time
    const serverTime = await client.getServerTime();
    const localTime = Date.now();
    const drift = Math.abs(serverTime - localTime);
    console.log(`Time drift: ${drift}ms`);

    // Fetch sample data
    console.log('\n--- Sample Data ---');

    const klines = await client.getKlines('BTCUSDT', '1h', { limit: 5 });
    console.log(`BTCUSDT 1h klines: ${klines.length} bars`);
    console.log(`Latest close: $${klines[klines.length - 1]?.close.toFixed(2)}`);

    const ticker = await client.getTicker('BTCUSDT');
    console.log(`BTCUSDT bid/ask: $${ticker.bid.toFixed(2)} / $${ticker.ask.toFixed(2)}`);
  } else {
    console.log('\nRunning in mock data mode (Binance API unavailable)');
    console.log('API endpoints will return simulated data');
  }

  // Initialize WebSocket (optional, for real-time data)
  if (process.env.ENABLE_WEBSOCKET === 'true') {
    console.log('\n--- WebSocket Stream ---');

    const ws = new BinanceWebSocket();

    ws.subscribeKline('BTCUSDT', '1m', (bar) => {
      console.log(`[WS] BTCUSDT 1m: $${bar.close.toFixed(2)} vol=${bar.volume.toFixed(4)}`);
    });

    ws.subscribeTicker('BTCUSDT', (tick) => {
      console.log(`[WS] BTCUSDT: bid=$${tick.bid.toFixed(2)} ask=$${tick.ask.toFixed(2)}`);
    });

    await ws.connect();
    console.log('WebSocket connected');

    // Keep process alive
    process.on('SIGINT', () => {
      console.log('\nShutting down...');
      ws.close();
      process.exit(0);
    });
  } else {
    console.log('\nData pipeline initialized successfully.');
    console.log('Set ENABLE_WEBSOCKET=true to start real-time streaming.');
  }

  // Start WebSocket server
  const wsPort = parseInt(process.env.WS_PORT || '3002', 10);
  await wsServer.start(wsPort);

  // Keep server alive
  console.log('\nServer ready. Press Ctrl+C to stop.');
  process.on('SIGINT', () => {
    console.log('\nShutting down...');
    wsServer.stop();
    process.exit(0);
  });
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
