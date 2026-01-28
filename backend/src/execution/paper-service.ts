import type { OrderRequest, Order, Fill, Position } from '../types/execution';
import type { AccountState as RiskAccountState } from '../types/risk';
import { OrderManager } from './order-manager.js';
import { PaperTradingAdapter } from './paper-trading.js';
import { MVP_ACCOUNT_RISK } from '../risk/config.js';
import { binanceClient } from '../data/binance-client.js';

interface TradeRecord {
  id: string;
  orderId: string;
  symbol: string;
  side: 'buy' | 'sell';
  price: number;
  quantity: number;
  commission: number;
  strategyId?: string;
  timestamp: number;
}

const adapter = new PaperTradingAdapter({
  initialCapital: MVP_ACCOUNT_RISK.initialCapital,
  commission: 0.001,
  slippage: 0.0005,
  latencyMs: 0,
  fillProbability: 1,
  rejectProbability: 0,
});

const orderManager = new OrderManager();
orderManager.setAdapter(adapter);

const trades: TradeRecord[] = [];
let peakEquity = MVP_ACCOUNT_RISK.initialCapital;

function normalizeSymbol(symbol: string): string {
  return symbol.replace('/', '').toUpperCase();
}

async function refreshPrice(symbol: string): Promise<void> {
  const ticker = await binanceClient.getTicker(normalizeSymbol(symbol));
  adapter.setPrice(normalizeSymbol(symbol), ticker.last || ticker.bid);
}

function mapFillToTrade(fill: Fill, strategyId?: string): TradeRecord {
  return {
    id: fill.tradeId,
    orderId: fill.orderId,
    symbol: fill.symbol,
    side: fill.side,
    price: fill.price,
    quantity: fill.quantity,
    commission: fill.commission,
    strategyId,
    timestamp: fill.timestamp,
  };
}

function mapPosition(position: Position): RiskAccountState['positions'][number] {
  return {
    symbol: position.symbol.includes('/')
      ? position.symbol
      : position.symbol.replace(/(USDT|USD|BTC|ETH|BUSD)$/, '/$1'),
    side: position.side === 'flat' ? 'long' : position.side,
    quantity: position.quantity,
    entryPrice: position.entryPrice,
    markPrice: position.markPrice,
    currentPrice: position.markPrice,
    unrealizedPnl: position.unrealizedPnl,
    unrealizedPnlPct:
      position.entryPrice > 0 ? position.unrealizedPnl / (position.entryPrice * position.quantity) : 0,
    leverage: position.leverage,
    marginUsed: position.marginUsed,
  };
}

export async function submitPaperOrder(request: Omit<OrderRequest, 'clientOrderId'> & { clientOrderId?: string }): Promise<Order> {
  const clientOrderId = request.clientOrderId || `client_${Date.now()}`;
  const normalizedSymbol = normalizeSymbol(request.symbol);

  await refreshPrice(normalizedSymbol);

  const order = await orderManager.submitOrder({
    ...request,
    clientOrderId,
    symbol: normalizedSymbol,
  });

  if (order.fills.length > 0) {
    order.fills.forEach((fill) => {
      trades.unshift(mapFillToTrade(fill, order.strategyId));
    });
  }

  const account = await adapter.getAccountState();
  if (account.totalEquity > peakEquity) {
    peakEquity = account.totalEquity;
  }

  return order;
}

export async function cancelPaperOrder(orderId: string): Promise<boolean> {
  return orderManager.cancelOrder(orderId);
}

export function listPaperOrders(symbol?: string): Order[] {
  return orderManager.getAllOrders(symbol);
}

export function listPaperTrades(limit: number = 100): TradeRecord[] {
  return trades.slice(0, limit);
}

export async function getPaperPositions(): Promise<RiskAccountState['positions']> {
  const positions = await adapter.getPositions();
  return positions.filter((p) => p.quantity > 0).map(mapPosition);
}

export async function getPaperAccountState(): Promise<RiskAccountState> {
  const account = await adapter.getAccountState();
  const rawPositions = await adapter.getPositions();
  const positions = rawPositions.filter((p) => p.quantity > 0).map(mapPosition);
  const totalEquity = account.totalEquity;
  const cash = account.balances.find((b) => b.asset === 'USDT')?.free ?? totalEquity;
  const drawdown = Math.max(0, peakEquity - totalEquity);
  const drawdownPct = peakEquity > 0 ? drawdown / peakEquity : 0;
  const realizedPnl = rawPositions.reduce((sum, p) => sum + p.realizedPnl, 0);

  return {
    totalEquity,
    equity: totalEquity,
    cash,
    margin: account.usedMargin,
    marginLevel: account.marginLevel,
    unrealizedPnl: positions.reduce((sum, p) => sum + p.unrealizedPnl, 0),
    realizedPnl,
    dailyPnl: 0,
    weeklyPnl: 0,
    peakEquity,
    drawdown,
    drawdownPct,
    openPositions: positions.length,
    positions,
    timestamp: Date.now(),
  };
}
