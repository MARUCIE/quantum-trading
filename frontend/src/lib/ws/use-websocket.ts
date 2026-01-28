"use client";

/**
 * WebSocket React Hooks
 *
 * React hooks for real-time data subscriptions.
 */

import { useEffect, useState, useCallback, useRef } from "react";
import {
  getWsClient,
  type WsMessage,
  type WsCallback,
} from "./client";

/**
 * Hook to manage WebSocket connection
 */
export function useWebSocket() {
  const [state, setState] = useState<"connecting" | "connected" | "disconnected">(
    "disconnected"
  );
  const client = getWsClient();

  useEffect(() => {
    // Update state on mount
    setState(client.getState());

    // Connect if not connected
    if (!client.isConnected()) {
      setState("connecting");
      client.connect().then(() => {
        setState("connected");
      }).catch(() => {
        setState("disconnected");
      });
    }

    // Subscribe to state changes
    const unsubscribe = client.onMessage(() => {
      setState(client.getState());
    });

    return () => {
      unsubscribe();
    };
  }, [client]);

  const disconnect = useCallback(() => {
    client.disconnect();
    setState("disconnected");
  }, [client]);

  const reconnect = useCallback(() => {
    setState("connecting");
    client.connect().then(() => {
      setState("connected");
    }).catch(() => {
      setState("disconnected");
    });
  }, [client]);

  return {
    state,
    isConnected: state === "connected",
    disconnect,
    reconnect,
  };
}

/**
 * Hook to subscribe to ticker updates
 */
export function useTicker(symbol: string) {
  const [ticker, setTicker] = useState<{
    bid: number;
    ask: number;
    last: number;
    timestamp: number;
  } | null>(null);
  const client = getWsClient();

  useEffect(() => {
    if (!symbol) return;

    // Ensure connected
    client.connect().catch(console.error);

    const unsubscribe = client.subscribeTicker(symbol, (message: WsMessage) => {
      if (message.type === "ticker") {
        const data = message.data as {
          bid: number;
          ask: number;
          last: number;
        };
        setTicker({
          ...data,
          timestamp: message.timestamp,
        });
      }
    });

    return () => {
      unsubscribe();
    };
  }, [symbol, client]);

  return ticker;
}

/**
 * Hook to subscribe to kline/candlestick updates
 */
export function useKline(symbol: string, interval: string) {
  const [kline, setKline] = useState<{
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
    timestamp: number;
  } | null>(null);
  const client = getWsClient();

  useEffect(() => {
    if (!symbol || !interval) return;

    client.connect().catch(console.error);

    const unsubscribe = client.subscribeKline(
      symbol,
      interval,
      (message: WsMessage) => {
        if (message.type === "kline") {
          const data = message.data as {
            open: number;
            high: number;
            low: number;
            close: number;
            volume: number;
            timestamp: number;
          };
          setKline(data);
        }
      }
    );

    return () => {
      unsubscribe();
    };
  }, [symbol, interval, client]);

  return kline;
}

/** Order book level */
interface OrderBookLevel {
  price: number;
  size: number;
}

/** Order book data */
interface OrderBook {
  bids: OrderBookLevel[];
  asks: OrderBookLevel[];
  timestamp: number;
}

/**
 * Hook to subscribe to order book updates
 */
export function useOrderBook(symbol: string) {
  const [orderBook, setOrderBook] = useState<OrderBook | null>(null);
  const client = getWsClient();

  useEffect(() => {
    if (!symbol) return;

    // Ensure connected
    client.connect().catch(console.error);

    const unsubscribe = client.subscribeOrderBook(symbol, (message: WsMessage) => {
      if (message.type === "orderbook") {
        const data = message.data as {
          bids: Array<{ price: number; size: number }>;
          asks: Array<{ price: number; size: number }>;
        };
        setOrderBook({
          bids: data.bids,
          asks: data.asks,
          timestamp: message.timestamp,
        });
      }
    });

    return () => {
      unsubscribe();
    };
  }, [symbol, client]);

  return orderBook;
}

/**
 * Hook to subscribe to trade updates
 */
export function useTrades(symbol: string, maxTrades: number = 50) {
  const [trades, setTrades] = useState<
    Array<{
      id: string;
      price: number;
      quantity: number;
      side: "buy" | "sell";
      timestamp: number;
    }>
  >([]);
  const client = getWsClient();

  useEffect(() => {
    if (!symbol) return;

    client.connect().catch(console.error);

    const unsubscribe = client.subscribeTrade(symbol, (message: WsMessage) => {
      if (message.type === "trade") {
        const data = message.data as {
          tradeId: string;
          price: number;
          quantity: number;
          side: "buy" | "sell";
          timestamp: number;
        };

        setTrades((prev) => {
          const newTrades = [
            {
              id: data.tradeId,
              price: data.price,
              quantity: data.quantity,
              side: data.side,
              timestamp: data.timestamp,
            },
            ...prev,
          ].slice(0, maxTrades);
          return newTrades;
        });
      }
    });

    return () => {
      unsubscribe();
    };
  }, [symbol, maxTrades, client]);

  return trades;
}

/**
 * Generic subscription hook
 */
export function useSubscription<T>(
  channel: string,
  symbol?: string,
  interval?: string,
  transform?: (data: unknown) => T
) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const client = getWsClient();
  const transformRef = useRef(transform);
  transformRef.current = transform;

  useEffect(() => {
    if (!channel) return;

    client.connect().catch((err) => {
      setError(err.message);
    });

    const handleMessage: WsCallback = (message) => {
      if (message.type === "error") {
        setError((message.data as { error: string }).error);
      } else {
        setError(null);
        const transformed = transformRef.current
          ? transformRef.current(message.data)
          : (message.data as T);
        setData(transformed);
      }
    };

    const unsubscribe = client.subscribe(
      channel,
      symbol,
      interval
    )(handleMessage);

    return () => {
      unsubscribe();
    };
  }, [channel, symbol, interval, client]);

  return { data, error };
}
