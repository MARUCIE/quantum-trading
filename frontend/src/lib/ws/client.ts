/**
 * WebSocket Client
 *
 * Real-time data client for Quantum X frontend.
 * Features automatic reconnection and subscription management.
 */

export type WsMessageType =
  | "subscribe"
  | "unsubscribe"
  | "ticker"
  | "kline"
  | "trade"
  | "orderbook"
  | "portfolio"
  | "risk"
  | "error"
  | "pong";

export interface WsMessage {
  type: WsMessageType;
  channel: string;
  data: unknown;
  timestamp: number;
}

export type WsCallback = (message: WsMessage) => void;

export interface WsClientConfig {
  url: string;
  reconnect: boolean;
  reconnectInterval: number;
  maxReconnectAttempts: number;
}

const DEFAULT_CONFIG: WsClientConfig = {
  url: process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:3002",
  reconnect: true,
  reconnectInterval: 2000,
  maxReconnectAttempts: 10,
};

export class QuantumWsClient {
  private ws: WebSocket | null = null;
  private config: WsClientConfig;
  private subscriptions: Map<string, Set<WsCallback>> = new Map();
  private globalCallbacks: Set<WsCallback> = new Set();
  private reconnectAttempts = 0;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private isConnecting = false;
  private isManualClose = false;

  constructor(config: Partial<WsClientConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Connect to WebSocket server
   */
  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        resolve();
        return;
      }

      if (this.isConnecting) {
        // Wait for existing connection attempt
        const checkInterval = setInterval(() => {
          if (this.ws?.readyState === WebSocket.OPEN) {
            clearInterval(checkInterval);
            resolve();
          }
        }, 100);
        return;
      }

      this.isConnecting = true;
      this.isManualClose = false;

      try {
        this.ws = new WebSocket(this.config.url);

        this.ws.onopen = () => {
          console.log("[WS] Connected");
          this.isConnecting = false;
          this.reconnectAttempts = 0;

          // Resubscribe to all channels
          for (const channel of this.subscriptions.keys()) {
            this.sendSubscribe(channel);
          }

          resolve();
        };

        this.ws.onmessage = (event) => {
          this.handleMessage(event.data);
        };

        this.ws.onclose = () => {
          console.log("[WS] Disconnected");
          this.isConnecting = false;

          if (!this.isManualClose && this.config.reconnect) {
            this.scheduleReconnect();
          }
        };

        this.ws.onerror = (error) => {
          console.error("[WS] Error:", error);
          this.isConnecting = false;

          if (this.reconnectAttempts === 0) {
            reject(new Error("WebSocket connection failed"));
          }
        };
      } catch (error) {
        this.isConnecting = false;
        reject(error);
      }
    });
  }

  /**
   * Disconnect from WebSocket server
   */
  disconnect(): void {
    this.isManualClose = true;

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  /**
   * Subscribe to a channel
   */
  subscribe(
    channel: string,
    symbol?: string,
    interval?: string
  ): (callback: WsCallback) => () => void {
    const subscriptionKey = this.getSubscriptionKey(channel, symbol, interval);

    if (!this.subscriptions.has(subscriptionKey)) {
      this.subscriptions.set(subscriptionKey, new Set());
      this.sendSubscribe(subscriptionKey, symbol, interval);
    }

    // Return a function that adds a callback and returns unsubscribe
    return (callback: WsCallback) => {
      this.subscriptions.get(subscriptionKey)?.add(callback);

      // Return unsubscribe function
      return () => {
        this.subscriptions.get(subscriptionKey)?.delete(callback);

        // If no more callbacks, unsubscribe from server
        if (this.subscriptions.get(subscriptionKey)?.size === 0) {
          this.subscriptions.delete(subscriptionKey);
          this.sendUnsubscribe(subscriptionKey);
        }
      };
    };
  }

  /**
   * Subscribe to ticker updates
   */
  subscribeTicker(symbol: string, callback: WsCallback): () => void {
    return this.subscribe("ticker", symbol)(callback);
  }

  /**
   * Subscribe to kline updates
   */
  subscribeKline(
    symbol: string,
    interval: string,
    callback: WsCallback
  ): () => void {
    return this.subscribe("kline", symbol, interval)(callback);
  }

  /**
   * Subscribe to trade updates
   */
  subscribeTrade(symbol: string, callback: WsCallback): () => void {
    return this.subscribe("trade", symbol)(callback);
  }

  /**
   * Subscribe to order book updates
   */
  subscribeOrderBook(symbol: string, callback: WsCallback): () => void {
    return this.subscribe("orderbook", symbol)(callback);
  }

  /**
   * Add global message handler
   */
  onMessage(callback: WsCallback): () => void {
    this.globalCallbacks.add(callback);
    return () => this.globalCallbacks.delete(callback);
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  /**
   * Get connection state
   */
  getState(): "connecting" | "connected" | "disconnected" {
    if (this.isConnecting) return "connecting";
    if (this.ws?.readyState === WebSocket.OPEN) return "connected";
    return "disconnected";
  }

  /**
   * Handle incoming message
   */
  private handleMessage(data: string): void {
    try {
      const message = JSON.parse(data) as WsMessage;

      // Notify global callbacks
      for (const callback of this.globalCallbacks) {
        callback(message);
      }

      // Notify channel subscribers
      const callbacks = this.subscriptions.get(message.channel);
      if (callbacks) {
        for (const callback of callbacks) {
          callback(message);
        }
      }
    } catch (error) {
      console.error("[WS] Failed to parse message:", error);
    }
  }

  /**
   * Send subscription message
   */
  private sendSubscribe(
    channel: string,
    symbol?: string,
    interval?: string
  ): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      const [base, derivedSymbol, derivedInterval] = channel.split(":");
      this.ws.send(
        JSON.stringify({
          type: "subscribe",
          channel: base, // Extract base channel
          symbol: symbol ?? derivedSymbol,
          interval: interval ?? derivedInterval,
        })
      );
    }
  }

  /**
   * Send unsubscribe message
   */
  private sendUnsubscribe(channel: string): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      const [base, symbol, interval] = channel.split(":");
      this.ws.send(
        JSON.stringify({
          type: "unsubscribe",
          channel: base,
          symbol,
          interval,
        })
      );
    }
  }

  /**
   * Generate subscription key
   */
  private getSubscriptionKey(
    channel: string,
    symbol?: string,
    interval?: string
  ): string {
    let key = channel;
    if (symbol) key += `:${symbol}`;
    if (interval) key += `:${interval}`;
    return key;
  }

  /**
   * Schedule reconnection attempt
   */
  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= this.config.maxReconnectAttempts) {
      console.error("[WS] Max reconnect attempts reached");
      return;
    }

    this.reconnectAttempts++;
    const delay =
      this.config.reconnectInterval *
      Math.pow(1.5, this.reconnectAttempts - 1);

    console.log(
      `[WS] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`
    );

    this.reconnectTimer = setTimeout(() => {
      this.connect().catch((error) => {
        console.error("[WS] Reconnect failed:", error);
      });
    }, delay);
  }
}

// Singleton instance
let wsClientInstance: QuantumWsClient | null = null;

export function getWsClient(): QuantumWsClient {
  if (!wsClientInstance) {
    wsClientInstance = new QuantumWsClient();
  }
  return wsClientInstance;
}
