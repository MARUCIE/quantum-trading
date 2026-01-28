import { describe, it, expect, beforeEach, vi } from "vitest";
import { act } from "@testing-library/react";
import {
  useTradingStore,
  selectCurrentSymbol,
  selectMarketPrice,
  selectPositions,
  selectOpenOrders,
  selectOrderBook,
} from "./trading-store";

/**
 * Trading Store Tests
 *
 * Tests for the centralized trading state management.
 * Covers orders, positions, order book, and trade history.
 */

describe("useTradingStore", () => {
  // Reset store before each test
  beforeEach(() => {
    act(() => {
      useTradingStore.getState().reset();
    });
  });

  describe("Initial State", () => {
    it("should have default symbol BTC/USDT", () => {
      expect(useTradingStore.getState().currentSymbol).toBe("BTC/USDT");
    });

    it("should have initial market price", () => {
      expect(useTradingStore.getState().marketPrice).toBe(43250.0);
    });

    it("should have mock positions", () => {
      const positions = useTradingStore.getState().positions;
      expect(positions.length).toBeGreaterThan(0);
      expect(positions[0]).toHaveProperty("symbol");
      expect(positions[0]).toHaveProperty("side");
    });

    it("should have order book data", () => {
      const { bids, asks } = useTradingStore.getState();
      expect(bids.length).toBeGreaterThan(0);
      expect(asks.length).toBeGreaterThan(0);
    });

    it("should have available balance", () => {
      expect(useTradingStore.getState().availableBalance).toBe(50000.0);
    });
  });

  describe("Symbol Actions", () => {
    it("should update current symbol", () => {
      act(() => {
        useTradingStore.getState().setCurrentSymbol("ETH/USDT");
      });
      expect(useTradingStore.getState().currentSymbol).toBe("ETH/USDT");
    });
  });

  describe("Price Actions", () => {
    it("should update market price", () => {
      act(() => {
        useTradingStore.getState().setMarketPrice(45000.0);
      });
      expect(useTradingStore.getState().marketPrice).toBe(45000.0);
    });

    it("should update price with 24h change", () => {
      act(() => {
        useTradingStore.getState().setMarketPrice(45000.0, 5.25);
      });
      expect(useTradingStore.getState().marketPrice).toBe(45000.0);
      expect(useTradingStore.getState().priceChange24h).toBe(5.25);
    });

    it("should not update 24h change if not provided", () => {
      const initialChange = useTradingStore.getState().priceChange24h;
      act(() => {
        useTradingStore.getState().setMarketPrice(46000.0);
      });
      expect(useTradingStore.getState().priceChange24h).toBe(initialChange);
    });
  });

  describe("Order Actions", () => {
    it("should submit a market order", async () => {
      // Mock faster timeout for tests
      vi.useFakeTimers();

      const orderPromise = useTradingStore.getState().submitOrder({
        symbol: "BTC/USDT",
        side: "buy",
        type: "market",
        quantity: 0.5,
        timeInForce: "GTC",
      });

      expect(useTradingStore.getState().isSubmittingOrder).toBe(true);

      // Fast-forward timers
      await act(async () => {
        vi.advanceTimersByTime(1500);
        await orderPromise;
      });

      expect(useTradingStore.getState().isSubmittingOrder).toBe(false);

      const orders = useTradingStore.getState().orders;
      const newOrder = orders.find((o) => o.quantity === 0.5 && o.type === "market");
      expect(newOrder).toBeDefined();
      expect(newOrder?.status).toBe("filled");
      expect(newOrder?.filledQuantity).toBe(0.5);

      vi.useRealTimers();
    });

    it("should submit a limit order", async () => {
      vi.useFakeTimers();

      const orderPromise = useTradingStore.getState().submitOrder({
        symbol: "BTC/USDT",
        side: "sell",
        type: "limit",
        quantity: 1.0,
        price: 44000.0,
        timeInForce: "GTC",
      });

      await act(async () => {
        vi.advanceTimersByTime(1500);
        await orderPromise;
      });

      const orders = useTradingStore.getState().orders;
      const newOrder = orders.find((o) => o.price === 44000.0);
      expect(newOrder).toBeDefined();
      expect(newOrder?.status).toBe("open");
      expect(newOrder?.filledQuantity).toBe(0);

      vi.useRealTimers();
    });

    it("should cancel an order", async () => {
      vi.useFakeTimers();

      const orderId = useTradingStore.getState().orders[0].id;

      const cancelPromise = useTradingStore.getState().cancelOrder(orderId);

      await act(async () => {
        vi.advanceTimersByTime(600);
        await cancelPromise;
      });

      const cancelledOrder = useTradingStore
        .getState()
        .orders.find((o) => o.id === orderId);
      expect(cancelledOrder?.status).toBe("cancelled");

      vi.useRealTimers();
    });

    it("should set orders directly", () => {
      const newOrders = [
        {
          id: "test-order",
          symbol: "SOL/USDT",
          side: "buy" as const,
          type: "limit" as const,
          quantity: 10,
          price: 100,
          timeInForce: "GTC" as const,
          status: "open" as const,
          filledQuantity: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      act(() => {
        useTradingStore.getState().setOrders(newOrders);
      });

      expect(useTradingStore.getState().orders).toEqual(newOrders);
    });
  });

  describe("Position Actions", () => {
    it("should set positions", () => {
      const newPositions = [
        {
          id: "pos-test",
          symbol: "SOL/USDT",
          side: "long" as const,
          quantity: 50,
          entryPrice: 95.0,
          currentPrice: 100.0,
          openedAt: new Date(),
        },
      ];

      act(() => {
        useTradingStore.getState().setPositions(newPositions);
      });

      expect(useTradingStore.getState().positions).toEqual(newPositions);
    });

    it("should close a position", async () => {
      vi.useFakeTimers();

      const positionId = useTradingStore.getState().positions[0].id;

      const closePromise = useTradingStore.getState().closePosition(positionId);

      await act(async () => {
        vi.advanceTimersByTime(600);
        await closePromise;
      });

      const positions = useTradingStore.getState().positions;
      expect(positions.find((p) => p.id === positionId)).toBeUndefined();

      vi.useRealTimers();
    });

    it("should update a position", () => {
      const positionId = useTradingStore.getState().positions[0].id;

      act(() => {
        useTradingStore.getState().updatePosition(positionId, {
          currentPrice: 50000.0,
          stopLoss: 45000.0,
        });
      });

      const updated = useTradingStore.getState().positions.find((p) => p.id === positionId);
      expect(updated?.currentPrice).toBe(50000.0);
      expect(updated?.stopLoss).toBe(45000.0);
    });
  });

  describe("Order Book Actions", () => {
    it("should update order book", () => {
      const newBids = [{ price: 43200, quantity: 1, total: 1 }];
      const newAsks = [{ price: 43300, quantity: 1, total: 1 }];

      act(() => {
        useTradingStore.getState().updateOrderBook(newBids, newAsks);
      });

      expect(useTradingStore.getState().bids).toEqual(newBids);
      expect(useTradingStore.getState().asks).toEqual(newAsks);
    });

    it("should set order book connection status", () => {
      act(() => {
        useTradingStore.getState().setOrderBookConnected(false);
      });
      expect(useTradingStore.getState().isOrderBookConnected).toBe(false);

      act(() => {
        useTradingStore.getState().setOrderBookConnected(true);
      });
      expect(useTradingStore.getState().isOrderBookConnected).toBe(true);
    });
  });

  describe("Trade Actions", () => {
    it("should set trades and update recent trades", () => {
      const newTrades = Array.from({ length: 15 }, (_, i) => ({
        id: `t-${i}`,
        symbol: "BTC/USDT",
        side: "buy" as const,
        price: 43200 + i,
        quantity: 0.1,
        total: (43200 + i) * 0.1,
        timestamp: new Date(),
      }));

      act(() => {
        useTradingStore.getState().setTrades(newTrades);
      });

      expect(useTradingStore.getState().trades.length).toBe(15);
      expect(useTradingStore.getState().recentTrades.length).toBe(10);
    });

    it("should add a single trade", () => {
      const initialCount = useTradingStore.getState().trades.length;

      const newTrade = {
        id: "new-trade",
        symbol: "BTC/USDT",
        side: "sell" as const,
        price: 43500,
        quantity: 0.25,
        total: 43500 * 0.25,
        timestamp: new Date(),
      };

      act(() => {
        useTradingStore.getState().addTrade(newTrade);
      });

      expect(useTradingStore.getState().trades.length).toBe(initialCount + 1);
      expect(useTradingStore.getState().trades[0]).toEqual(newTrade);
    });
  });

  describe("Balance Actions", () => {
    it("should set available balance", () => {
      act(() => {
        useTradingStore.getState().setAvailableBalance(75000);
      });
      expect(useTradingStore.getState().availableBalance).toBe(75000);
    });
  });

  describe("Reset Action", () => {
    it("should reset to initial state", () => {
      // Modify state
      act(() => {
        useTradingStore.getState().setCurrentSymbol("ETH/USDT");
        useTradingStore.getState().setMarketPrice(5000);
        useTradingStore.getState().setAvailableBalance(0);
      });

      // Reset
      act(() => {
        useTradingStore.getState().reset();
      });

      expect(useTradingStore.getState().currentSymbol).toBe("BTC/USDT");
      expect(useTradingStore.getState().marketPrice).toBe(43250.0);
      expect(useTradingStore.getState().availableBalance).toBe(50000.0);
    });
  });

  describe("Selectors", () => {
    it("selectCurrentSymbol returns current symbol", () => {
      expect(selectCurrentSymbol(useTradingStore.getState())).toBe("BTC/USDT");
    });

    it("selectMarketPrice returns market price", () => {
      expect(selectMarketPrice(useTradingStore.getState())).toBe(43250.0);
    });

    it("selectPositions returns positions array", () => {
      const positions = selectPositions(useTradingStore.getState());
      expect(Array.isArray(positions)).toBe(true);
    });

    it("selectOpenOrders filters for open/pending orders", () => {
      const openOrders = selectOpenOrders(useTradingStore.getState());
      expect(openOrders.every((o) => o.status === "open" || o.status === "pending")).toBe(
        true
      );
    });

    it("selectOrderBook returns bids and asks", () => {
      const orderBook = selectOrderBook(useTradingStore.getState());
      expect(orderBook).toHaveProperty("bids");
      expect(orderBook).toHaveProperty("asks");
    });
  });
});
