/**
 * WebSocket Server
 *
 * Broadcasts real-time market data to connected frontend clients.
 * Manages subscriptions and handles client connections.
 */

import { WebSocketServer, WebSocket } from 'ws';
import { IncomingMessage } from 'http';
import { BinanceWebSocket } from '../data/binance-ws.js';
import { metrics } from '../metrics/index.js';
import type { KlineInterval } from '../types/market.js';

/** WebSocket message types */
export type WsMessageType =
  | 'subscribe'
  | 'unsubscribe'
  | 'ticker'
  | 'kline'
  | 'trade'
  | 'orderbook'
  | 'portfolio'
  | 'risk'
  | 'error'
  | 'pong';

/** Client subscription request */
export interface WsSubscribeMessage {
  type: 'subscribe' | 'unsubscribe';
  channel: string;
  symbol?: string;
  interval?: KlineInterval;
}

/** Server broadcast message */
export interface WsBroadcastMessage {
  type: WsMessageType;
  channel: string;
  data: unknown;
  timestamp: number;
}

/** Connected client state */
interface ClientState {
  id: string;
  ws: WebSocket;
  subscriptions: Set<string>;
  connectedAt: number;
  lastPing: number;
}

export class QuantumWsServer {
  private wss: WebSocketServer | null = null;
  private clients: Map<string, ClientState> = new Map();
  private binanceWs: BinanceWebSocket;
  private channelSubscribers: Map<string, Set<string>> = new Map();
  private pingInterval: NodeJS.Timeout | null = null;
  private clientIdCounter = 0;

  constructor() {
    this.binanceWs = new BinanceWebSocket();
  }

  /**
   * Start WebSocket server
   */
  start(port: number = 3002): Promise<void> {
    return new Promise((resolve) => {
      this.wss = new WebSocketServer({ port });

      this.wss.on('connection', (ws, req) => {
        this.handleConnection(ws, req);
      });

      // Start ping interval to detect dead connections
      this.pingInterval = setInterval(() => this.pingClients(), 30000);

      console.log(`[WS] Server running on ws://localhost:${port}`);
      resolve();
    });
  }

  /**
   * Stop WebSocket server
   */
  stop(): void {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }

    if (this.wss) {
      this.wss.close();
      this.wss = null;
    }

    this.binanceWs.close();
    this.clients.clear();
    this.channelSubscribers.clear();
  }

  /**
   * Handle new client connection
   */
  private handleConnection(ws: WebSocket, req: IncomingMessage): void {
    const clientId = `client_${++this.clientIdCounter}_${Date.now()}`;
    const clientIp = req.socket.remoteAddress || 'unknown';

    const client: ClientState = {
      id: clientId,
      ws,
      subscriptions: new Set(),
      connectedAt: Date.now(),
      lastPing: Date.now(),
    };

    this.clients.set(clientId, client);
    metrics.incGauge('websocket_connections');
    console.log(`[WS] Client connected: ${clientId} from ${clientIp}`);

    // Send welcome message
    this.send(ws, {
      type: 'pong',
      channel: 'system',
      data: { clientId, message: 'Connected to Quantum X WebSocket' },
      timestamp: Date.now(),
    });

    ws.on('message', (data) => {
      this.handleMessage(client, data.toString());
    });

    ws.on('close', () => {
      this.handleDisconnect(client);
    });

    ws.on('error', (error) => {
      console.error(`[WS] Client ${clientId} error:`, error.message);
    });

    ws.on('pong', () => {
      client.lastPing = Date.now();
    });
  }

  /**
   * Handle client message
   */
  private handleMessage(client: ClientState, raw: string): void {
    metrics.incCounter('websocket_messages_total', { direction: 'received', type: 'message' });
    try {
      const message = JSON.parse(raw) as WsSubscribeMessage;

      switch (message.type) {
        case 'subscribe':
          this.handleSubscribe(client, message);
          break;
        case 'unsubscribe':
          this.handleUnsubscribe(client, message);
          break;
        default:
          this.sendError(client.ws, `Unknown message type: ${message.type}`);
      }
    } catch {
      this.sendError(client.ws, 'Invalid JSON message');
    }
  }

  /**
   * Handle subscription request
   */
  private handleSubscribe(client: ClientState, message: WsSubscribeMessage): void {
    const { channel, symbol, interval } = message;
    const subscriptionKey = this.getSubscriptionKey(channel, symbol, interval);

    // Add to client subscriptions
    client.subscriptions.add(subscriptionKey);

    // Add to channel subscribers
    if (!this.channelSubscribers.has(subscriptionKey)) {
      this.channelSubscribers.set(subscriptionKey, new Set());

      // Setup upstream subscription if needed
      this.setupUpstreamSubscription(channel, symbol, interval);
    }
    this.channelSubscribers.get(subscriptionKey)!.add(client.id);

    console.log(`[WS] Client ${client.id} subscribed to ${subscriptionKey}`);

    // Confirm subscription
    this.send(client.ws, {
      type: 'pong',
      channel: subscriptionKey,
      data: { subscribed: true },
      timestamp: Date.now(),
    });
  }

  /**
   * Handle unsubscribe request
   */
  private handleUnsubscribe(client: ClientState, message: WsSubscribeMessage): void {
    const { channel, symbol, interval } = message;
    const subscriptionKey = this.getSubscriptionKey(channel, symbol, interval);

    client.subscriptions.delete(subscriptionKey);

    const subscribers = this.channelSubscribers.get(subscriptionKey);
    if (subscribers) {
      subscribers.delete(client.id);
      if (subscribers.size === 0) {
        this.channelSubscribers.delete(subscriptionKey);
        // Could cleanup upstream subscription here if needed
      }
    }

    console.log(`[WS] Client ${client.id} unsubscribed from ${subscriptionKey}`);
  }

  /**
   * Handle client disconnect
   */
  private handleDisconnect(client: ClientState): void {
    // Remove from all channel subscribers
    for (const subscription of client.subscriptions) {
      const subscribers = this.channelSubscribers.get(subscription);
      if (subscribers) {
        subscribers.delete(client.id);
        if (subscribers.size === 0) {
          this.channelSubscribers.delete(subscription);
        }
      }
    }

    this.clients.delete(client.id);
    metrics.decGauge('websocket_connections');
    console.log(`[WS] Client disconnected: ${client.id}`);
  }

  /**
   * Setup upstream subscription to Binance
   */
  private setupUpstreamSubscription(
    channel: string,
    symbol?: string,
    interval?: KlineInterval
  ): void {
    if (!symbol) return;

    switch (channel) {
      case 'ticker':
        this.binanceWs.subscribeTicker(symbol, (ticker) => {
          this.broadcast(`ticker:${symbol}`, 'ticker', ticker);
        });
        break;

      case 'kline':
        if (interval) {
          this.binanceWs.subscribeKline(symbol, interval, (kline) => {
            this.broadcast(`kline:${symbol}:${interval}`, 'kline', kline);
          });
        }
        break;

      case 'trade':
        this.binanceWs.subscribeTrade(symbol, (trade) => {
          this.broadcast(`trade:${symbol}`, 'trade', trade);
        });
        break;

      case 'orderbook':
        this.binanceWs.subscribeDepth(symbol, (orderbook) => {
          this.broadcast(`orderbook:${symbol}`, 'orderbook', orderbook);
        });
        break;
    }

    // Connect to Binance if not already connected
    this.binanceWs.connect().catch((error) => {
      console.error('[WS] Failed to connect to Binance:', error.message);
    });
  }

  /**
   * Broadcast message to all subscribers of a channel
   */
  broadcast(channel: string, type: WsMessageType, data: unknown): void {
    const subscribers = this.channelSubscribers.get(channel);
    if (!subscribers || subscribers.size === 0) return;

    const message: WsBroadcastMessage = {
      type,
      channel,
      data,
      timestamp: Date.now(),
    };

    for (const clientId of subscribers) {
      const client = this.clients.get(clientId);
      if (client && client.ws.readyState === WebSocket.OPEN) {
        this.send(client.ws, message);
      }
    }
  }

  /**
   * Broadcast to all connected clients (e.g., system messages)
   */
  broadcastAll(type: WsMessageType, data: unknown): void {
    const message: WsBroadcastMessage = {
      type,
      channel: 'system',
      data,
      timestamp: Date.now(),
    };

    for (const client of this.clients.values()) {
      if (client.ws.readyState === WebSocket.OPEN) {
        this.send(client.ws, message);
      }
    }
  }

  /**
   * Send message to specific client
   */
  private send(ws: WebSocket, message: WsBroadcastMessage): void {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
      metrics.incCounter('websocket_messages_total', { direction: 'sent', type: message.type });
    }
  }

  /**
   * Send error to client
   */
  private sendError(ws: WebSocket, error: string): void {
    this.send(ws, {
      type: 'error',
      channel: 'system',
      data: { error },
      timestamp: Date.now(),
    });
  }

  /**
   * Generate subscription key
   */
  private getSubscriptionKey(
    channel: string,
    symbol?: string,
    interval?: KlineInterval
  ): string {
    let key = channel;
    if (symbol) key += `:${symbol}`;
    if (interval) key += `:${interval}`;
    return key;
  }

  /**
   * Ping all clients to detect dead connections
   */
  private pingClients(): void {
    const now = Date.now();
    const timeout = 60000; // 1 minute timeout

    for (const [clientId, client] of this.clients) {
      if (now - client.lastPing > timeout) {
        console.log(`[WS] Client ${clientId} timed out`);
        client.ws.terminate();
        this.handleDisconnect(client);
      } else if (client.ws.readyState === WebSocket.OPEN) {
        client.ws.ping();
      }
    }
  }

  /**
   * Get server stats
   */
  getStats(): {
    clientCount: number;
    channelCount: number;
    subscriptionCount: number;
  } {
    let subscriptionCount = 0;
    for (const subscribers of this.channelSubscribers.values()) {
      subscriptionCount += subscribers.size;
    }

    return {
      clientCount: this.clients.size,
      channelCount: this.channelSubscribers.size,
      subscriptionCount,
    };
  }
}

// Export singleton instance
export const wsServer = new QuantumWsServer();
