/**
 * WebSocket Client Tests
 *
 * Unit tests for the WebSocket client module.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Mock WebSocket implementation
class MockWebSocket {
  static CONNECTING = 0;
  static OPEN = 1;
  static CLOSING = 2;
  static CLOSED = 3;

  readyState = MockWebSocket.CONNECTING;
  url: string;
  onopen: ((event: Event) => void) | null = null;
  onclose: ((event: CloseEvent) => void) | null = null;
  onmessage: ((event: MessageEvent) => void) | null = null;
  onerror: ((event: Event) => void) | null = null;

  private sentMessages: string[] = [];

  constructor(url: string) {
    this.url = url;
    // Simulate async connection
    setTimeout(() => {
      this.readyState = MockWebSocket.OPEN;
      if (this.onopen) {
        this.onopen(new Event("open"));
      }
    }, 10);
  }

  send(data: string) {
    if (this.readyState !== MockWebSocket.OPEN) {
      throw new Error("WebSocket is not open");
    }
    this.sentMessages.push(data);
  }

  close() {
    this.readyState = MockWebSocket.CLOSED;
    if (this.onclose) {
      this.onclose(new CloseEvent("close", { code: 1000, reason: "Normal closure" }));
    }
  }

  // Test helpers
  getSentMessages(): string[] {
    return this.sentMessages;
  }

  simulateMessage(data: unknown) {
    if (this.onmessage) {
      this.onmessage(new MessageEvent("message", { data: JSON.stringify(data) }));
    }
  }

  simulateError() {
    if (this.onerror) {
      this.onerror(new Event("error"));
    }
  }

  simulateClose(code = 1000, reason = "Normal closure") {
    this.readyState = MockWebSocket.CLOSED;
    if (this.onclose) {
      this.onclose(new CloseEvent("close", { code, reason }));
    }
  }
}

// Global mock
let mockWsInstance: MockWebSocket | null = null;
const originalWebSocket = globalThis.WebSocket;

beforeEach(() => {
  // Reset module cache to get fresh client instances
  vi.resetModules();
  mockWsInstance = null;
  (globalThis as unknown as { WebSocket: typeof MockWebSocket }).WebSocket = class extends MockWebSocket {
    constructor(url: string) {
      super(url);
      mockWsInstance = this;
    }
  } as unknown as typeof WebSocket;
});

afterEach(() => {
  (globalThis as unknown as { WebSocket: typeof WebSocket }).WebSocket = originalWebSocket;
  vi.clearAllMocks();
});

describe("WebSocket Client", () => {
  describe("Connection", () => {
    it("should connect to WebSocket server", async () => {
      const { QuantumWsClient } = await import("./client");
      const client = new QuantumWsClient({ url: "ws://localhost:3002" });

      await client.connect();

      expect(client.isConnected()).toBe(true);
      expect(client.getState()).toBe("connected");
    });

    it("should use default URL from environment", async () => {
      const { QuantumWsClient } = await import("./client");
      const client = new QuantumWsClient();

      await client.connect();

      expect(mockWsInstance?.url).toContain("localhost");
    });

    it("should handle connection error", async () => {
      const { QuantumWsClient } = await import("./client");
      const client = new QuantumWsClient({ url: "ws://localhost:3002" });

      // Start connection
      const connectPromise = client.connect();

      // Simulate error before open
      setTimeout(() => {
        if (mockWsInstance) {
          mockWsInstance.readyState = MockWebSocket.CLOSED;
          mockWsInstance.simulateError();
        }
      }, 5);

      await expect(connectPromise).rejects.toThrow();
    });

    it("should disconnect cleanly", async () => {
      const { QuantumWsClient } = await import("./client");
      const client = new QuantumWsClient({ url: "ws://localhost:3002" });

      await client.connect();
      client.disconnect();

      expect(client.isConnected()).toBe(false);
      expect(client.getState()).toBe("disconnected");
    });

    it("should not connect if already connected", async () => {
      const { QuantumWsClient } = await import("./client");
      const client = new QuantumWsClient({ url: "ws://localhost:3002" });

      await client.connect();

      // Second connect should return immediately
      await client.connect();

      // Should still be connected
      expect(client.isConnected()).toBe(true);
    });
  });

  describe("Subscriptions", () => {
    it("should subscribe to ticker channel", async () => {
      const { QuantumWsClient } = await import("./client");
      const client = new QuantumWsClient({ url: "ws://localhost:3002" });

      await client.connect();

      const callback = vi.fn();
      client.subscribeTicker("BTCUSDT", callback);

      // Verify subscription message sent
      const sentMessages = mockWsInstance?.getSentMessages() ?? [];
      expect(sentMessages.length).toBeGreaterThan(0);

      const subMessage = JSON.parse(sentMessages[0]);
      expect(subMessage.type).toBe("subscribe");
      expect(subMessage.channel).toBe("ticker");
      expect(subMessage.symbol).toBe("BTCUSDT");
    });

    it("should subscribe to kline channel with interval", async () => {
      const { QuantumWsClient } = await import("./client");
      const client = new QuantumWsClient({ url: "ws://localhost:3002" });

      await client.connect();

      const callback = vi.fn();
      client.subscribeKline("BTCUSDT", "1m", callback);

      const sentMessages = mockWsInstance?.getSentMessages() ?? [];
      const subMessage = JSON.parse(sentMessages[0]);
      expect(subMessage.type).toBe("subscribe");
      expect(subMessage.channel).toBe("kline");
      expect(subMessage.symbol).toBe("BTCUSDT");
      expect(subMessage.interval).toBe("1m");
    });

    it("should subscribe to trade channel", async () => {
      const { QuantumWsClient } = await import("./client");
      const client = new QuantumWsClient({ url: "ws://localhost:3002" });

      await client.connect();

      const callback = vi.fn();
      client.subscribeTrade("ETHUSDT", callback);

      const sentMessages = mockWsInstance?.getSentMessages() ?? [];
      const subMessage = JSON.parse(sentMessages[0]);
      expect(subMessage.type).toBe("subscribe");
      expect(subMessage.channel).toBe("trade");
      expect(subMessage.symbol).toBe("ETHUSDT");
    });

    it("should unsubscribe when cleanup function called", async () => {
      const { QuantumWsClient } = await import("./client");
      const client = new QuantumWsClient({ url: "ws://localhost:3002" });

      await client.connect();

      const callback = vi.fn();
      const unsubscribe = client.subscribeTicker("BTCUSDT", callback);

      // Unsubscribe
      unsubscribe();

      const sentMessages = mockWsInstance?.getSentMessages() ?? [];
      const unsubMessage = JSON.parse(sentMessages[sentMessages.length - 1]);
      expect(unsubMessage.type).toBe("unsubscribe");
      expect(unsubMessage.channel).toBe("ticker");
    });

    it("should not unsubscribe if other callbacks exist", async () => {
      const { QuantumWsClient } = await import("./client");
      const client = new QuantumWsClient({ url: "ws://localhost:3002" });

      await client.connect();

      const callback1 = vi.fn();
      const callback2 = vi.fn();

      const unsubscribe1 = client.subscribeTicker("BTCUSDT", callback1);
      client.subscribeTicker("BTCUSDT", callback2);

      // Clear sent messages
      const sentBefore = mockWsInstance?.getSentMessages().length ?? 0;

      // Unsubscribe first callback
      unsubscribe1();

      // No unsubscribe message should be sent (second callback still active)
      const sentAfter = mockWsInstance?.getSentMessages().length ?? 0;
      expect(sentAfter).toBe(sentBefore);
    });
  });

  describe("Message Handling", () => {
    it("should parse and route ticker messages", async () => {
      const { QuantumWsClient } = await import("./client");
      const client = new QuantumWsClient({ url: "ws://localhost:3002" });

      await client.connect();

      const callback = vi.fn();
      client.subscribeTicker("BTCUSDT", callback);

      // Note: channel in message should match the subscription key base channel
      const tickerData = {
        type: "ticker",
        channel: "ticker:BTCUSDT", // Matches subscription key
        data: { bid: 43000, ask: 43001, last: 43000.5 },
        timestamp: Date.now(),
      };

      mockWsInstance?.simulateMessage(tickerData);

      expect(callback).toHaveBeenCalledWith(expect.objectContaining({
        type: "ticker",
        data: expect.objectContaining({ bid: 43000 }),
      }));
    });

    it("should parse and route trade messages", async () => {
      const { QuantumWsClient } = await import("./client");
      const client = new QuantumWsClient({ url: "ws://localhost:3002" });

      await client.connect();

      const callback = vi.fn();
      client.subscribeTrade("BTCUSDT", callback);

      const tradeData = {
        type: "trade",
        channel: "trade:BTCUSDT",
        timestamp: Date.now(),
        data: {
          tradeId: "t123",
          price: 43000,
          quantity: 0.5,
          side: "buy",
          timestamp: Date.now(),
        },
      };

      mockWsInstance?.simulateMessage(tradeData);

      expect(callback).toHaveBeenCalledWith(expect.objectContaining({
        type: "trade",
      }));
    });

    it("should handle malformed messages gracefully", async () => {
      const { QuantumWsClient } = await import("./client");
      const client = new QuantumWsClient({ url: "ws://localhost:3002" });

      await client.connect();

      const callback = vi.fn();
      client.subscribeTicker("BTCUSDT", callback);

      // Send invalid JSON - should not throw
      if (mockWsInstance?.onmessage) {
        mockWsInstance.onmessage(new MessageEvent("message", { data: "not-json" }));
      }

      expect(callback).not.toHaveBeenCalled();
    });

    it("should notify all subscribers via onMessage", async () => {
      const { QuantumWsClient } = await import("./client");
      const client = new QuantumWsClient({ url: "ws://localhost:3002" });

      await client.connect();

      const globalCallback = vi.fn();
      client.onMessage(globalCallback);

      mockWsInstance?.simulateMessage({
        type: "ticker",
        channel: "ticker:BTCUSDT",
        timestamp: Date.now(),
        data: { bid: 43000, ask: 43001, last: 43000.5 },
      });

      expect(globalCallback).toHaveBeenCalled();
    });

    it("should allow removing global message handler", async () => {
      const { QuantumWsClient } = await import("./client");
      const client = new QuantumWsClient({ url: "ws://localhost:3002" });

      await client.connect();

      const globalCallback = vi.fn();
      const unsubscribe = client.onMessage(globalCallback);

      // Remove handler
      unsubscribe();

      mockWsInstance?.simulateMessage({
        type: "ticker",
        channel: "ticker:BTCUSDT",
        timestamp: Date.now(),
        data: { bid: 43000, ask: 43001, last: 43000.5 },
      });

      expect(globalCallback).not.toHaveBeenCalled();
    });
  });

  describe("Reconnection", () => {
    it("should handle unexpected disconnection", async () => {
      const { QuantumWsClient } = await import("./client");
      const client = new QuantumWsClient({
        url: "ws://localhost:3002",
        reconnect: true,
        reconnectInterval: 100,
        maxReconnectAttempts: 1,
      });

      await client.connect();
      expect(client.isConnected()).toBe(true);

      // Simulate unexpected close
      mockWsInstance?.simulateClose(1006, "Abnormal closure");

      // State should transition to disconnected
      expect(client.getState()).toBe("disconnected");
    });

    it("should not reconnect after manual disconnect", async () => {
      const { QuantumWsClient } = await import("./client");
      const client = new QuantumWsClient({
        url: "ws://localhost:3002",
        reconnect: true,
        reconnectInterval: 100,
        maxReconnectAttempts: 5,
      });

      await client.connect();

      // Manual disconnect
      client.disconnect();

      // Should be disconnected immediately and stay that way
      expect(client.getState()).toBe("disconnected");
      expect(client.isConnected()).toBe(false);
    });
  });

  describe("State Management", () => {
    it("should return connecting state during connection", async () => {
      const { QuantumWsClient } = await import("./client");
      const client = new QuantumWsClient({ url: "ws://localhost:3002" });

      // Start connection but don't await
      const connectPromise = client.connect();

      // During connection, state should be connecting
      expect(client.getState()).toBe("connecting");

      await connectPromise;
      expect(client.getState()).toBe("connected");
    });

    it("should return disconnected state initially", async () => {
      const { QuantumWsClient } = await import("./client");
      const client = new QuantumWsClient({ url: "ws://localhost:3002" });

      // Before connect, should be disconnected
      expect(client.getState()).toBe("disconnected");
      expect(client.isConnected()).toBe(false);
    });
  });

  describe("Subscription Keys", () => {
    it("should create unique keys for different symbols", async () => {
      const { QuantumWsClient } = await import("./client");
      const client = new QuantumWsClient({ url: "ws://localhost:3002" });

      await client.connect();

      const btcCallback = vi.fn();
      const ethCallback = vi.fn();

      client.subscribeTicker("BTCUSDT", btcCallback);
      client.subscribeTicker("ETHUSDT", ethCallback);

      // Two subscribe messages should be sent
      const sentMessages = mockWsInstance?.getSentMessages() ?? [];
      expect(sentMessages.length).toBeGreaterThanOrEqual(2);

      // Find ticker subscribe messages
      const tickerSubs = sentMessages
        .map((m) => JSON.parse(m))
        .filter((m) => m.type === "subscribe" && m.channel === "ticker");

      expect(tickerSubs.length).toBe(2);

      const symbols = tickerSubs.map((m) => m.symbol);
      expect(symbols).toContain("BTCUSDT");
      expect(symbols).toContain("ETHUSDT");
    });

    it("should create unique keys for different intervals", async () => {
      const { QuantumWsClient } = await import("./client");
      const client = new QuantumWsClient({ url: "ws://localhost:3002" });

      await client.connect();

      const callback1m = vi.fn();
      const callback5m = vi.fn();

      client.subscribeKline("BTCUSDT", "1m", callback1m);
      client.subscribeKline("BTCUSDT", "5m", callback5m);

      // Find kline subscribe messages
      const sentMessages = mockWsInstance?.getSentMessages() ?? [];
      const klineSubs = sentMessages
        .map((m) => JSON.parse(m))
        .filter((m) => m.type === "subscribe" && m.channel === "kline");

      expect(klineSubs.length).toBe(2);

      const intervals = klineSubs.map((m) => m.interval);
      expect(intervals).toContain("1m");
      expect(intervals).toContain("5m");
    });
  });
});

describe("Singleton Instance", () => {
  it("should return same instance from getWsClient", async () => {
    // Clear any cached modules
    vi.resetModules();

    const { getWsClient } = await import("./client");

    const instance1 = getWsClient();
    const instance2 = getWsClient();

    expect(instance1).toBe(instance2);
  });
});
