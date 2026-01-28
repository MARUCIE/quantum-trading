/**
 * Technical Indicators Unit Tests
 */

import { describe, it, expect } from "vitest";
import {
  sma,
  ema,
  rsi,
  macd,
  bollingerBands,
  atr,
  vwap,
  obv,
  roc,
  stdDev,
  zScore,
} from "./indicators";
import type { OHLCVBar } from "../types/market";

// Helper to create OHLCV bars for testing
function createBars(closes: number[], volumes: number[] = []): OHLCVBar[] {
  return closes.map((close, i) => ({
    timestamp: Date.now() + i * 60000,
    open: close - 0.5,
    high: close + 1,
    low: close - 1,
    close,
    volume: volumes[i] || 100,
    symbol: "BTCUSDT",
    exchange: "binance",
    interval: "1h",
  }));
}

describe("sma (Simple Moving Average)", () => {
  it("returns null when data length is less than period", () => {
    expect(sma([1, 2, 3], 5)).toBeNull();
  });

  it("calculates correct SMA for exact period length", () => {
    const data = [10, 20, 30, 40, 50];
    expect(sma(data, 5)).toBe(30); // (10+20+30+40+50)/5 = 30
  });

  it("calculates SMA using last N values", () => {
    const data = [1, 2, 3, 10, 20, 30];
    expect(sma(data, 3)).toBe(20); // (10+20+30)/3 = 20
  });

  it("handles single value period", () => {
    const data = [5, 10, 15];
    expect(sma(data, 1)).toBe(15); // Last value
  });
});

describe("ema (Exponential Moving Average)", () => {
  it("returns null when data length is less than period", () => {
    expect(ema([1, 2], 5)).toBeNull();
  });

  it("calculates EMA correctly", () => {
    const data = [22, 22.5, 22.2, 21.8, 22.1, 22.3, 22.5, 22.7, 22.9, 23];
    const result = ema(data, 5);
    expect(result).not.toBeNull();
    expect(result).toBeCloseTo(22.72, 1); // EMA weighs recent values more
  });

  it("returns same as SMA when data equals period", () => {
    const data = [10, 20, 30];
    expect(ema(data, 3)).toBe(sma(data, 3));
  });
});

describe("rsi (Relative Strength Index)", () => {
  it("returns null when insufficient data", () => {
    expect(rsi([100, 101], 14)).toBeNull();
  });

  it("returns 100 when only gains (no losses)", () => {
    const data = Array.from({ length: 20 }, (_, i) => 100 + i);
    expect(rsi(data, 14)).toBe(100);
  });

  it("returns close to 0 when only losses", () => {
    const data = Array.from({ length: 20 }, (_, i) => 100 - i);
    const result = rsi(data, 14);
    expect(result).not.toBeNull();
    expect(result).toBeCloseTo(0, 0);
  });

  it("returns around 50 for balanced gains/losses", () => {
    // Alternating up/down with equal magnitude
    const data = [100, 101, 100, 101, 100, 101, 100, 101, 100, 101, 100, 101, 100, 101, 100, 101];
    const result = rsi(data, 14);
    expect(result).not.toBeNull();
    expect(result).toBeCloseTo(50, 5);
  });
});

describe("macd (Moving Average Convergence Divergence)", () => {
  it("returns null when insufficient data", () => {
    const shortData = Array.from({ length: 30 }, (_, i) => 100 + i);
    expect(macd(shortData)).toBeNull();
  });

  it("calculates MACD correctly", () => {
    // Create enough data for MACD (26 + 9 = 35 minimum)
    const data = Array.from({ length: 50 }, (_, i) => 100 + Math.sin(i / 5) * 10);
    const result = macd(data);
    expect(result).not.toBeNull();
    expect(result).toHaveProperty("macd");
    expect(result).toHaveProperty("signal");
    expect(result).toHaveProperty("histogram");
  });

  it("histogram equals macd minus signal", () => {
    const data = Array.from({ length: 50 }, (_, i) => 100 + i * 0.5);
    const result = macd(data);
    expect(result).not.toBeNull();
    if (result) {
      expect(result.histogram).toBeCloseTo(result.macd - result.signal, 10);
    }
  });
});

describe("bollingerBands", () => {
  it("returns null when insufficient data", () => {
    expect(bollingerBands([1, 2, 3], 20)).toBeNull();
  });

  it("calculates bands correctly for flat data", () => {
    const data = Array.from({ length: 20 }, () => 100);
    const result = bollingerBands(data, 20, 2);
    expect(result).not.toBeNull();
    if (result) {
      expect(result.middle).toBe(100);
      expect(result.upper).toBe(100); // No volatility, bands collapse
      expect(result.lower).toBe(100);
      expect(result.width).toBe(0);
    }
  });

  it("upper is greater than middle which is greater than lower", () => {
    const data = Array.from({ length: 25 }, () => 100 + Math.random() * 10);
    const result = bollingerBands(data, 20, 2);
    expect(result).not.toBeNull();
    if (result) {
      expect(result.upper).toBeGreaterThan(result.middle);
      expect(result.middle).toBeGreaterThan(result.lower);
    }
  });

  it("width is positive", () => {
    const data = Array.from({ length: 25 }, (_, i) => 100 + (i % 5) * 2);
    const result = bollingerBands(data, 20, 2);
    expect(result).not.toBeNull();
    if (result) {
      expect(result.width).toBeGreaterThan(0);
    }
  });
});

describe("atr (Average True Range)", () => {
  it("returns null when insufficient bars", () => {
    const bars = createBars([100, 101]);
    expect(atr(bars, 14)).toBeNull();
  });

  it("calculates ATR correctly", () => {
    const closes = Array.from({ length: 20 }, (_, i) => 100 + i);
    const bars = createBars(closes);
    const result = atr(bars, 14);
    expect(result).not.toBeNull();
    expect(result).toBeGreaterThan(0);
  });

  it("returns higher ATR for volatile data", () => {
    const stableCloses = Array.from({ length: 20 }, () => 100);
    const volatileCloses = Array.from({ length: 20 }, (_, i) => 100 + (i % 2 === 0 ? 5 : -5));

    const stableBars = createBars(stableCloses);
    const volatileBars = createBars(volatileCloses);

    const stableAtr = atr(stableBars, 10);
    const volatileAtr = atr(volatileBars, 10);

    expect(volatileAtr).toBeGreaterThan(stableAtr!);
  });
});

describe("vwap (Volume Weighted Average Price)", () => {
  it("returns null for empty bars", () => {
    expect(vwap([])).toBeNull();
  });

  it("returns null when total volume is zero", () => {
    // Create bars directly with zero volume (helper uses || 100 fallback)
    const bars: OHLCVBar[] = [
      { timestamp: 1, open: 99, high: 102, low: 98, close: 100, volume: 0, symbol: "BTC", exchange: "binance", interval: "1h" },
      { timestamp: 2, open: 100, high: 103, low: 99, close: 101, volume: 0, symbol: "BTC", exchange: "binance", interval: "1h" },
    ];
    expect(vwap(bars)).toBeNull();
  });

  it("calculates VWAP correctly", () => {
    const bars: OHLCVBar[] = [
      { timestamp: 1, open: 99, high: 102, low: 98, close: 100, volume: 100, symbol: "BTC", exchange: "binance", interval: "1h" },
      { timestamp: 2, open: 100, high: 105, low: 99, close: 104, volume: 200, symbol: "BTC", exchange: "binance", interval: "1h" },
    ];
    // TP1 = (102+98+100)/3 = 100, TPV1 = 100*100 = 10000
    // TP2 = (105+99+104)/3 = 102.67, TPV2 = 102.67*200 = 20534
    // VWAP = (10000+20534) / (100+200) = 30534/300 = 101.78
    const result = vwap(bars);
    expect(result).not.toBeNull();
    expect(result).toBeCloseTo(101.78, 1);
  });
});

describe("obv (On-Balance Volume)", () => {
  it("returns null for insufficient bars", () => {
    const bars = createBars([100]);
    expect(obv(bars)).toBeNull();
  });

  it("increases OBV on up days", () => {
    const bars = createBars([100, 101, 102], [100, 200, 300]);
    const result = obv(bars);
    expect(result).toBe(500); // 0 + 200 + 300
  });

  it("decreases OBV on down days", () => {
    const bars = createBars([100, 99, 98], [100, 200, 300]);
    const result = obv(bars);
    expect(result).toBe(-500); // 0 - 200 - 300
  });

  it("no change on flat days", () => {
    const bars = createBars([100, 100, 100], [100, 200, 300]);
    const result = obv(bars);
    expect(result).toBe(0);
  });
});

describe("roc (Rate of Change)", () => {
  it("returns null when insufficient data", () => {
    expect(roc([100, 101], 10)).toBeNull();
  });

  it("calculates positive ROC for uptrend", () => {
    const data = Array.from({ length: 15 }, (_, i) => 100 + i);
    const result = roc(data, 10);
    expect(result).not.toBeNull();
    expect(result).toBeGreaterThan(0);
  });

  it("calculates negative ROC for downtrend", () => {
    const data = Array.from({ length: 15 }, (_, i) => 100 - i);
    const result = roc(data, 10);
    expect(result).not.toBeNull();
    expect(result).toBeLessThan(0);
  });

  it("returns 0 for flat price", () => {
    const data = Array.from({ length: 15 }, () => 100);
    expect(roc(data, 10)).toBe(0);
  });

  it("calculates correct percentage", () => {
    const data = [100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 110];
    expect(roc(data, 10)).toBe(10); // (110-100)/100 * 100 = 10%
  });
});

describe("stdDev (Standard Deviation)", () => {
  it("returns null when insufficient data", () => {
    expect(stdDev([1, 2], 5)).toBeNull();
  });

  it("returns 0 for constant values", () => {
    const data = Array.from({ length: 10 }, () => 100);
    expect(stdDev(data, 5)).toBe(0);
  });

  it("calculates standard deviation correctly", () => {
    const data = [2, 4, 4, 4, 5, 5, 7, 9];
    // Mean = 5, Variance = 4, StdDev = 2
    const result = stdDev(data, 8);
    expect(result).toBeCloseTo(2, 5);
  });
});

describe("zScore", () => {
  it("returns null when insufficient data", () => {
    expect(zScore([1, 2], 5)).toBeNull();
  });

  it("returns null when stdDev is 0", () => {
    const data = Array.from({ length: 10 }, () => 100);
    expect(zScore(data, 5)).toBeNull();
  });

  it("returns null when all values are the same (stdDev is 0)", () => {
    // When all values are the same, stdDev is 0, so zScore returns null
    const result = zScore([5, 5, 5, 5, 5], 5);
    expect(result).toBeNull();
  });

  it("returns positive z-score for values above mean", () => {
    const data = [1, 2, 3, 4, 5, 10]; // Last value is above mean
    const result = zScore(data, 5);
    expect(result).not.toBeNull();
    expect(result).toBeGreaterThan(0);
  });

  it("returns negative z-score for values below mean", () => {
    const data = [5, 6, 7, 8, 9, 1]; // Last value is below mean
    const result = zScore(data, 5);
    expect(result).not.toBeNull();
    expect(result).toBeLessThan(0);
  });
});
