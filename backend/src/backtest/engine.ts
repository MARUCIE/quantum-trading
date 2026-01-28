/**
 * Backtest Engine
 *
 * Deterministic backtest using real market data.
 */

import type { KlineInterval } from '../types/market';
import type { BinanceClient } from '../data/binance-client';

/** Backtest configuration */
export interface BacktestConfig {
  strategyId: string;
  symbol: string;
  startDate: string; // ISO date
  endDate: string; // ISO date
  initialCapital: number;
  commission: number; // percentage
  slippage: number; // percentage
}

/** Single trade record */
export interface Trade {
  id: string;
  entryTime: number;
  exitTime: number;
  side: 'long' | 'short';
  entryPrice: number;
  exitPrice: number;
  quantity: number;
  pnl: number;
  pnlPercent: number;
  commission: number;
  reason: string;
}

/** Daily equity point */
export interface EquityPoint {
  timestamp: number;
  equity: number;
  drawdown: number;
  drawdownPercent: number;
}

/** Monthly return */
export interface MonthlyReturn {
  year: number;
  month: number;
  return: number;
  trades: number;
}

/** Backtest result */
export interface BacktestResult {
  config: BacktestConfig;
  startTime: number;
  endTime: number;
  duration: number;

  // Summary metrics
  totalReturn: number;
  totalReturnPercent: number;
  annualizedReturn: number;
  sharpeRatio: number;
  sortinoRatio: number;
  calmarRatio: number;
  maxDrawdown: number;
  maxDrawdownPercent: number;
  maxDrawdownDuration: number; // bars

  // Trade statistics
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  winRate: number;
  avgWin: number;
  avgLoss: number;
  avgWinPercent: number;
  avgLossPercent: number;
  profitFactor: number;
  expectancy: number;
  avgTradeDuration: number; // hours

  // Time series
  equityCurve: EquityPoint[];
  trades: Trade[];
  monthlyReturns: MonthlyReturn[];
}

const INTERVALS: Array<{ interval: KlineInterval; ms: number }> = [
  { interval: '1m', ms: 60_000 },
  { interval: '5m', ms: 5 * 60_000 },
  { interval: '15m', ms: 15 * 60_000 },
  { interval: '1h', ms: 60 * 60_000 },
  { interval: '4h', ms: 4 * 60 * 60_000 },
  { interval: '1d', ms: 24 * 60 * 60_000 },
  { interval: '1w', ms: 7 * 24 * 60 * 60_000 },
];

function pickInterval(startTime: number, endTime: number): KlineInterval {
  const duration = Math.max(endTime - startTime, 0);
  for (const candidate of INTERVALS) {
    const bars = Math.ceil(duration / candidate.ms);
    if (bars <= 1000) {
      return candidate.interval;
    }
  }
  return INTERVALS[INTERVALS.length - 1]!.interval;
}

function calcSharpe(returns: number[]): number {
  if (returns.length === 0) return 0;
  const avg = returns.reduce((a, b) => a + b, 0) / returns.length;
  const variance =
    returns.reduce((sum, r) => sum + Math.pow(r - avg, 2), 0) / returns.length;
  const std = Math.sqrt(variance);
  return std > 0 ? (avg / std) * Math.sqrt(252) : 0;
}

function calcSortino(returns: number[]): number {
  if (returns.length === 0) return 0;
  const negatives = returns.filter((r) => r < 0);
  if (negatives.length === 0) return 0;
  const downside =
    negatives.reduce((sum, r) => sum + r * r, 0) / negatives.length;
  const std = Math.sqrt(downside);
  const avg = returns.reduce((a, b) => a + b, 0) / returns.length;
  return std > 0 ? (avg / std) * Math.sqrt(252) : 0;
}

export async function runBacktest(
  config: BacktestConfig,
  client: BinanceClient
): Promise<BacktestResult> {
  const startTime = new Date(config.startDate).getTime();
  const endTime = new Date(config.endDate).getTime();
  const interval = pickInterval(startTime, endTime);

  const klines = await client.getKlines(config.symbol, interval, {
    startTime,
    endTime,
    limit: 1000,
  });

  if (klines.length < 2) {
    throw new Error('Not enough market data for backtest');
  }

  const entryBar = klines[0];
  const exitBar = klines[klines.length - 1];
  const slippage = config.slippage / 100;
  const commission = config.commission / 100;

  const entryPrice = entryBar.close * (1 + slippage);
  const exitPrice = exitBar.close * (1 - slippage);
  const quantity = config.initialCapital / entryPrice;
  const grossPnl = (exitPrice - entryPrice) * quantity;
  const commissionCost = (entryPrice + exitPrice) * quantity * commission;
  const pnl = grossPnl - commissionCost;
  const pnlPercent = (pnl / config.initialCapital) * 100;

  const trades: Trade[] = [
    {
      id: `t_${Date.now()}`,
      entryTime: entryBar.timestamp,
      exitTime: exitBar.timestamp,
      side: 'long',
      entryPrice,
      exitPrice,
      quantity,
      pnl,
      pnlPercent,
      commission: commissionCost,
      reason: 'hold',
    },
  ];

  const equityCurve: EquityPoint[] = [];
  let peakEquity = config.initialCapital;
  let maxDrawdown = 0;
  let maxDrawdownPercent = 0;

  for (const bar of klines) {
    const equity = config.initialCapital + (bar.close - entryPrice) * quantity - commissionCost;
    if (equity > peakEquity) {
      peakEquity = equity;
    }
    const drawdown = peakEquity - equity;
    const drawdownPct = peakEquity > 0 ? (drawdown / peakEquity) * 100 : 0;
    if (drawdown > maxDrawdown) {
      maxDrawdown = drawdown;
      maxDrawdownPercent = drawdownPct;
    }
    equityCurve.push({
      timestamp: bar.timestamp,
      equity,
      drawdown,
      drawdownPercent: drawdownPct,
    });
  }

  const monthlyReturns: MonthlyReturn[] = [];
  const monthlyEquity = new Map<string, { start: number; end: number; trades: number }>();

  for (const point of equityCurve) {
    const date = new Date(point.timestamp);
    const key = `${date.getFullYear()}-${date.getMonth()}`;
    const existing = monthlyEquity.get(key);
    if (!existing) {
      monthlyEquity.set(key, { start: point.equity, end: point.equity, trades: 0 });
    } else {
      existing.end = point.equity;
    }
  }

  const tradeMonthKey = `${new Date(exitBar.timestamp).getFullYear()}-${new Date(exitBar.timestamp).getMonth()}`;
  const tradeMonth = monthlyEquity.get(tradeMonthKey);
  if (tradeMonth) {
    tradeMonth.trades = 1;
  }

  for (const [key, data] of monthlyEquity) {
    const [year, month] = key.split('-').map(Number);
    monthlyReturns.push({
      year,
      month,
      return: data.start > 0 ? ((data.end - data.start) / data.start) * 100 : 0,
      trades: data.trades,
    });
  }

  const dailyReturns = equityCurve.slice(1).map((p, i) => (p.equity - equityCurve[i].equity) / equityCurve[i].equity);
  const sharpeRatio = calcSharpe(dailyReturns);
  const sortinoRatio = calcSortino(dailyReturns);
  const totalReturn = pnl;
  const totalReturnPercent = pnlPercent;
  const years = (endTime - startTime) / (365 * 24 * 60 * 60 * 1000);
  const annualizedReturn = years > 0 ? (Math.pow((config.initialCapital + pnl) / config.initialCapital, 1 / years) - 1) * 100 : 0;
  const calmarRatio = maxDrawdownPercent > 0 ? annualizedReturn / maxDrawdownPercent : 0;

  return {
    config,
    startTime,
    endTime,
    duration: endTime - startTime,
    totalReturn,
    totalReturnPercent,
    annualizedReturn,
    sharpeRatio,
    sortinoRatio,
    calmarRatio,
    maxDrawdown,
    maxDrawdownPercent,
    maxDrawdownDuration: equityCurve.length,
    totalTrades: trades.length,
    winningTrades: pnl > 0 ? 1 : 0,
    losingTrades: pnl > 0 ? 0 : 1,
    winRate: pnl > 0 ? 100 : 0,
    avgWin: pnl > 0 ? pnl : 0,
    avgLoss: pnl > 0 ? 0 : Math.abs(pnl),
    avgWinPercent: pnl > 0 ? pnlPercent : 0,
    avgLossPercent: pnl > 0 ? 0 : Math.abs(pnlPercent),
    profitFactor: pnl > 0 ? Infinity : 0,
    expectancy: pnl / trades.length,
    avgTradeDuration: (exitBar.timestamp - entryBar.timestamp) / 3600000,
    equityCurve,
    trades,
    monthlyReturns,
  };
}
