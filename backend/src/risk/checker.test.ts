/**
 * Risk Checker Unit Tests
 */

import { describe, it, expect, beforeEach } from "vitest";
import { RiskChecker } from "./checker";
import type { AccountState, OrderRequest, Position, RiskConfig } from "../types/risk";

// Test configuration with stricter limits for easier testing
const testConfig: RiskConfig = {
  account: {
    maxAccountValue: 10000,
    initialCapital: 10000,
    maxLeverage: 2,
    marginCallThreshold: 0.5,
    maxDrawdownPct: 0.1, // 10%
    dailyLossLimitPct: 0.03, // 3%
    weeklyLossLimitPct: 0.05, // 5%
  },
  strategies: {},
  trade: {
    maxPositionPct: 0.1, // 10%
    maxOrderPct: 0.05, // 5%
    minOrderValue: 10,
    maxOpenPositions: 5,
    defaultStopLossPct: 0.02,
    defaultTakeProfitPct: 0.06,
    trailingStopPct: 0.015,
    maxSlippagePct: 0.005,
    orderTimeoutSec: 30,
    maxRetries: 3,
    retryDelayMs: 1000,
    priceDeviationLimit: 0.01,
  },
};

function createAccountState(overrides: Partial<AccountState> = {}): AccountState {
  return {
    totalEquity: 10000,
    equity: 10000,
    cash: 8000,
    margin: 2000,
    marginLevel: 5,
    unrealizedPnl: 0,
    realizedPnl: 0,
    dailyPnl: 0,
    weeklyPnl: 0,
    peakEquity: 10000,
    drawdown: 0,
    drawdownPct: 0,
    openPositions: 0,
    positions: [],
    timestamp: Date.now(),
    ...overrides,
  };
}

function createOrderRequest(overrides: Partial<OrderRequest> = {}): OrderRequest {
  return {
    symbol: "BTCUSDT",
    side: "buy",
    type: "limit",
    quantity: 0.01,
    price: 50000,
    ...overrides,
  };
}

function createPosition(overrides: Partial<Position> = {}): Position {
  return {
    symbol: "BTCUSDT",
    side: "long",
    quantity: 0.01,
    entryPrice: 50000,
    markPrice: 50000,
    currentPrice: 50000,
    unrealizedPnl: 0,
    unrealizedPnlPct: 0,
    leverage: 1,
    marginUsed: 500,
    ...overrides,
  };
}

describe("RiskChecker", () => {
  let checker: RiskChecker;

  beforeEach(() => {
    checker = new RiskChecker(testConfig);
  });

  describe("validateOrder - no account state", () => {
    it("returns failure when account state is not initialized", () => {
      const order = createOrderRequest();
      const result = checker.validateOrder(order);

      expect(result.passed).toBe(false);
      expect(result.blockers).toContain("Account state not initialized");
    });
  });

  describe("validateOrder - healthy account", () => {
    beforeEach(() => {
      checker.updateAccountState(createAccountState());
    });

    it("passes for valid small order", () => {
      const order = createOrderRequest({
        quantity: 0.01,
        price: 50000, // $500 order on $10000 account = 5%
      });

      const result = checker.validateOrder(order);
      expect(result.passed).toBe(true);
      expect(result.blockers).toHaveLength(0);
    });

    it("includes all check items", () => {
      const order = createOrderRequest();
      const result = checker.validateOrder(order);

      const checkNames = result.checks.map((c) => c.name);
      expect(checkNames).toContain("max_drawdown");
      expect(checkNames).toContain("daily_loss_limit");
      expect(checkNames).toContain("weekly_loss_limit");
      expect(checkNames).toContain("position_limit");
      expect(checkNames).toContain("order_size");
      expect(checkNames).toContain("open_positions");
      expect(checkNames).toContain("leverage");
    });
  });

  describe("validateOrder - drawdown check", () => {
    it("blocks order when drawdown exceeds limit", () => {
      checker.updateAccountState(
        createAccountState({
          drawdownPct: 0.15, // 15% > 10% limit
        })
      );

      const order = createOrderRequest();
      const result = checker.validateOrder(order);

      expect(result.passed).toBe(false);
      expect(result.blockers.some((b) => b.includes("Drawdown"))).toBe(true);
    });

    it("passes when drawdown is within limit", () => {
      checker.updateAccountState(
        createAccountState({
          drawdownPct: 0.05, // 5% < 10% limit
        })
      );

      const order = createOrderRequest({ quantity: 0.001, price: 50000 }); // Small order
      const result = checker.validateOrder(order);

      const drawdownCheck = result.checks.find((c) => c.name === "max_drawdown");
      expect(drawdownCheck?.passed).toBe(true);
    });
  });

  describe("validateOrder - daily loss check", () => {
    it("blocks order when daily loss exceeds limit", () => {
      checker.updateAccountState(
        createAccountState({
          dailyPnl: -400, // -$400 on $10000 = -4% > 3% limit
        })
      );

      const order = createOrderRequest();
      const result = checker.validateOrder(order);

      expect(result.passed).toBe(false);
      expect(result.blockers.some((b) => b.includes("Daily loss"))).toBe(true);
    });
  });

  describe("validateOrder - weekly loss check", () => {
    it("blocks order when weekly loss exceeds limit", () => {
      checker.updateAccountState(
        createAccountState({
          weeklyPnl: -600, // -$600 on $10000 = -6% > 5% limit
        })
      );

      const order = createOrderRequest();
      const result = checker.validateOrder(order);

      expect(result.passed).toBe(false);
      expect(result.blockers.some((b) => b.includes("Weekly loss"))).toBe(true);
    });
  });

  describe("validateOrder - position limit check", () => {
    it("blocks order when position size exceeds limit", () => {
      checker.updateAccountState(createAccountState());

      const order = createOrderRequest({
        quantity: 0.5,
        price: 50000, // $25000 order on $10000 account = 250%
      });

      const result = checker.validateOrder(order);

      expect(result.passed).toBe(false);
      expect(result.blockers.some((b) => b.includes("Position size"))).toBe(true);
    });
  });

  describe("validateOrder - order size check", () => {
    it("blocks order when below minimum value", () => {
      checker.updateAccountState(createAccountState());

      const order = createOrderRequest({
        quantity: 0.0001,
        price: 50000, // $5 < $10 minimum
      });

      const result = checker.validateOrder(order);

      expect(result.passed).toBe(false);
      expect(result.blockers.some((b) => b.includes("below minimum"))).toBe(true);
    });
  });

  describe("validateOrder - open positions check", () => {
    it("blocks order when at max open positions", () => {
      checker.updateAccountState(createAccountState());

      // Add 5 positions (max)
      for (let i = 0; i < 5; i++) {
        checker.updatePosition(createPosition({ symbol: `SYM${i}` }));
      }

      const order = createOrderRequest({ symbol: "NEWPAIR" });
      const result = checker.validateOrder(order);

      expect(result.passed).toBe(false);
      expect(result.blockers.some((b) => b.includes("Open positions"))).toBe(true);
    });

    it("passes when below max open positions", () => {
      checker.updateAccountState(createAccountState());

      // Add 3 positions (under max of 5)
      for (let i = 0; i < 3; i++) {
        checker.updatePosition(createPosition({ symbol: `SYM${i}` }));
      }

      const order = createOrderRequest({ quantity: 0.001, price: 50000 });
      const result = checker.validateOrder(order);

      const positionsCheck = result.checks.find((c) => c.name === "open_positions");
      expect(positionsCheck?.passed).toBe(true);
    });
  });

  describe("validateOrder - leverage check", () => {
    it("blocks order when leverage exceeds limit", () => {
      checker.updateAccountState(createAccountState({ equity: 10000 }));

      // Add existing position worth $15000
      checker.updatePosition(
        createPosition({
          symbol: "ETHUSDT",
          quantity: 5,
          currentPrice: 3000, // $15000
        })
      );

      // Try to add another $10000 position = $25000 total / $10000 equity = 2.5x > 2x limit
      const order = createOrderRequest({
        quantity: 0.2,
        price: 50000, // $10000
      });

      const result = checker.validateOrder(order);

      expect(result.passed).toBe(false);
      expect(result.blockers.some((b) => b.includes("Leverage"))).toBe(true);
    });
  });

  describe("position management", () => {
    it("updates position correctly", () => {
      checker.updateAccountState(createAccountState());
      checker.updatePosition(createPosition({ symbol: "BTCUSDT" }));

      const order = createOrderRequest({ symbol: "ETHUSDT", quantity: 0.001, price: 3000 });
      const result = checker.validateOrder(order);

      const posCheck = result.checks.find((c) => c.name === "open_positions");
      expect(posCheck?.value).toBe(1);
    });

    it("removes position correctly", () => {
      checker.updateAccountState(createAccountState());
      checker.updatePosition(createPosition({ symbol: "BTCUSDT" }));
      checker.updatePosition(createPosition({ symbol: "ETHUSDT" }));
      checker.removePosition("BTCUSDT");

      const order = createOrderRequest({ symbol: "SOLUSDT", quantity: 0.001, price: 100 });
      const result = checker.validateOrder(order);

      const posCheck = result.checks.find((c) => c.name === "open_positions");
      expect(posCheck?.value).toBe(1);
    });
  });

  describe("multiple failures", () => {
    it("reports all failures", () => {
      checker.updateAccountState(
        createAccountState({
          drawdownPct: 0.15, // exceeds 10%
          dailyPnl: -400, // exceeds 3%
        })
      );

      const order = createOrderRequest({
        quantity: 0.5,
        price: 50000, // exceeds position limit
      });

      const result = checker.validateOrder(order);

      expect(result.passed).toBe(false);
      expect(result.blockers.length).toBeGreaterThan(1);
    });
  });
});
