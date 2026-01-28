/**
 * Binance WebSocket Client
 *
 * Real-time market data streaming from Binance.
 * Implements automatic reconnection and data quality monitoring.
 */

import WebSocket from 'ws';
import type { OHLCVBar, Ticker, Trade, OrderBook, KlineInterval } from '../types/market';
import { binanceConfig } from './binance-config.js';

type StreamType = 'kline' | 'ticker' | 'trade' | 'depth';

interface StreamConfig {
  symbol: string;
  type: StreamType;
  interval?: KlineInterval;
}

type DataCallback<T> = (data: T) => void;

export class BinanceWebSocket {
  private ws: WebSocket | null = null;
  private streams: Map<string, StreamConfig> = new Map();
  private callbacks: Map<string, Set<DataCallback<any>>> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 10;
  private reconnectDelay = 1000;
  private pingInterval: NodeJS.Timeout | null = null;
  private isConnected = false;

  /**
   * Connect to Binance WebSocket
   */
  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      const streamNames = Array.from(this.streams.keys());
      if (streamNames.length === 0) {
        reject(new Error('No streams configured'));
        return;
      }

      const url = `${binanceConfig.ws.stream}/stream?streams=${streamNames.join('/')}`;
      this.ws = new WebSocket(url);

      this.ws.on('open', () => {
        console.log(`[BinanceWS] Connected to ${binanceConfig.isTestnet ? 'TESTNET' : 'PRODUCTION'}`);
        this.isConnected = true;
        this.reconnectAttempts = 0;
        this.startPing();
        resolve();
      });

      this.ws.on('message', (data: WebSocket.Data) => {
        this.handleMessage(data.toString());
      });

      this.ws.on('close', () => {
        console.log('[BinanceWS] Disconnected');
        this.isConnected = false;
        this.stopPing();
        this.attemptReconnect();
      });

      this.ws.on('error', (error) => {
        console.error('[BinanceWS] Error:', error.message);
        if (!this.isConnected) {
          reject(error);
        }
      });
    });
  }

  /**
   * Subscribe to kline stream
   */
  subscribeKline(
    symbol: string,
    interval: KlineInterval,
    callback: DataCallback<OHLCVBar>
  ): string {
    const streamName = `${symbol.toLowerCase()}@kline_${interval}`;
    this.streams.set(streamName, { symbol, type: 'kline', interval });
    this.addCallback(streamName, callback);
    return streamName;
  }

  /**
   * Subscribe to ticker stream
   */
  subscribeTicker(symbol: string, callback: DataCallback<Ticker>): string {
    const streamName = `${symbol.toLowerCase()}@bookTicker`;
    this.streams.set(streamName, { symbol, type: 'ticker' });
    this.addCallback(streamName, callback);
    return streamName;
  }

  /**
   * Subscribe to trade stream
   */
  subscribeTrade(symbol: string, callback: DataCallback<Trade>): string {
    const streamName = `${symbol.toLowerCase()}@trade`;
    this.streams.set(streamName, { symbol, type: 'trade' });
    this.addCallback(streamName, callback);
    return streamName;
  }

  /**
   * Subscribe to order book depth stream
   * @param levels - Number of price levels (5, 10, or 20)
   * @param updateSpeed - Update speed in ms (100 or 1000)
   */
  subscribeDepth(
    symbol: string,
    callback: DataCallback<OrderBook>,
    levels: 5 | 10 | 20 = 10,
    updateSpeed: 100 | 1000 = 100
  ): string {
    const streamName = `${symbol.toLowerCase()}@depth${levels}@${updateSpeed}ms`;
    this.streams.set(streamName, { symbol, type: 'depth' });
    this.addCallback(streamName, callback);
    return streamName;
  }

  /**
   * Unsubscribe from a stream
   */
  unsubscribe(streamName: string): void {
    this.streams.delete(streamName);
    this.callbacks.delete(streamName);
  }

  /**
   * Close connection
   */
  close(): void {
    this.stopPing();
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.isConnected = false;
  }

  private addCallback(streamName: string, callback: DataCallback<any>): void {
    if (!this.callbacks.has(streamName)) {
      this.callbacks.set(streamName, new Set());
    }
    this.callbacks.get(streamName)!.add(callback);
  }

  private handleMessage(raw: string): void {
    try {
      const message = JSON.parse(raw);
      const streamName = message.stream;
      const data = message.data;

      if (!streamName || !data) return;

      const config = this.streams.get(streamName);
      if (!config) return;

      let transformed: any;

      switch (config.type) {
        case 'kline':
          transformed = this.transformKline(data, config.symbol, config.interval!);
          break;
        case 'ticker':
          transformed = this.transformTicker(data, config.symbol);
          break;
        case 'trade':
          transformed = this.transformTrade(data, config.symbol);
          break;
        case 'depth':
          transformed = this.transformDepth(data, config.symbol);
          break;
        default:
          return;
      }

      const callbacks = this.callbacks.get(streamName);
      if (callbacks) {
        callbacks.forEach((cb) => cb(transformed));
      }
    } catch (error) {
      console.error('[BinanceWS] Parse error:', error);
    }
  }

  private transformKline(data: any, symbol: string, interval: KlineInterval): OHLCVBar {
    const k = data.k;
    return {
      timestamp: k.t,
      open: parseFloat(k.o),
      high: parseFloat(k.h),
      low: parseFloat(k.l),
      close: parseFloat(k.c),
      volume: parseFloat(k.v),
      symbol: symbol.toUpperCase(),
      exchange: 'binance',
      interval,
    };
  }

  private transformTicker(data: any, symbol: string): Ticker {
    return {
      timestamp: Date.now(),
      symbol: symbol.toUpperCase(),
      exchange: 'binance',
      bid: parseFloat(data.b),
      ask: parseFloat(data.a),
      bidSize: parseFloat(data.B),
      askSize: parseFloat(data.A),
      last: parseFloat(data.b),
      lastSize: 0,
    };
  }

  private transformTrade(data: any, symbol: string): Trade {
    return {
      timestamp: data.T,
      symbol: symbol.toUpperCase(),
      exchange: 'binance',
      price: parseFloat(data.p),
      quantity: parseFloat(data.q),
      side: data.m ? 'sell' : 'buy',
      tradeId: String(data.t),
    };
  }

  private transformDepth(data: any, symbol: string): OrderBook {
    return {
      timestamp: Date.now(),
      symbol: symbol.toUpperCase(),
      exchange: 'binance',
      bids: data.bids.map(([price, size]: [string, string]) => ({
        price: parseFloat(price),
        size: parseFloat(size),
      })),
      asks: data.asks.map(([price, size]: [string, string]) => ({
        price: parseFloat(price),
        size: parseFloat(size),
      })),
      lastUpdateId: data.lastUpdateId,
    };
  }

  private startPing(): void {
    this.pingInterval = setInterval(() => {
      if (this.ws && this.isConnected) {
        this.ws.ping();
      }
    }, 30000);
  }

  private stopPing(): void {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }

  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('[BinanceWS] Max reconnect attempts reached');
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);

    console.log(`[BinanceWS] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`);

    setTimeout(() => {
      this.connect().catch((error) => {
        console.error('[BinanceWS] Reconnect failed:', error.message);
      });
    }, delay);
  }
}
