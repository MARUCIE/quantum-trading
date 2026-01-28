/**
 * Paper Trading Adapter
 *
 * Simulated venue for testing strategies without real capital.
 */

import type {
  VenueAdapter,
  OrderRequest,
  Order,
  Position,
  Balance,
  AccountState,
  Fill,
  PaperTradingConfig,
} from '../types/execution';

const DEFAULT_CONFIG: PaperTradingConfig = {
  initialCapital: 10000,
  commission: 0.001,
  slippage: 0.0005,
  latencyMs: 50,
  fillProbability: 0.98,
  rejectProbability: 0.02,
};

export class PaperTradingAdapter implements VenueAdapter {
  name = 'paper_trading';
  exchange = 'paper';
  testnet = true;

  private config: PaperTradingConfig;
  private connected: boolean = false;
  private balances: Map<string, Balance> = new Map();
  private positions: Map<string, Position> = new Map();
  private orders: Map<string, Order> = new Map();
  private prices: Map<string, number> = new Map();
  private orderIdCounter: number = 0;
  private fillIdCounter: number = 0;

  constructor(config: Partial<PaperTradingConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.initializeAccount();
  }

  async connect(): Promise<void> {
    await this.simulateLatency();
    this.connected = true;
  }

  async disconnect(): Promise<void> {
    this.connected = false;
  }

  isConnected(): boolean {
    return this.connected;
  }

  async getAccountState(): Promise<AccountState> {
    const balances = await this.getBalances();
    const positions = await this.getPositions();

    const totalEquity = balances.reduce((sum, b) => sum + b.total, 0);
    const usedMargin = positions.reduce((sum, p) => sum + p.marginUsed, 0);

    return {
      balances,
      positions,
      totalEquity,
      availableMargin: totalEquity - usedMargin,
      usedMargin,
      marginLevel: usedMargin > 0 ? totalEquity / usedMargin : Infinity,
      updatedAt: Date.now(),
    };
  }

  async getBalances(): Promise<Balance[]> {
    return Array.from(this.balances.values());
  }

  async getPositions(): Promise<Position[]> {
    // Update unrealized P&L
    for (const position of this.positions.values()) {
      const price = this.prices.get(position.symbol) || position.markPrice;
      position.markPrice = price;

      const priceDiff = price - position.entryPrice;
      position.unrealizedPnl =
        position.side === 'long'
          ? priceDiff * position.quantity
          : -priceDiff * position.quantity;
    }

    return Array.from(this.positions.values()).filter((p) => p.quantity > 0);
  }

  async submitOrder(request: OrderRequest): Promise<Order> {
    await this.simulateLatency();

    const orderId = `paper_${++this.orderIdCounter}_${Date.now()}`;

    // Deterministic rejection based on configured probability
    if (this.config.rejectProbability > 0 && Math.random() < this.config.rejectProbability) {
      return this.createOrder(request, orderId, 'rejected', 'Simulated rejection');
    }

    const order = this.createOrder(request, orderId, 'submitted');
    this.orders.set(orderId, order);

    // Deterministic fill based on config and price conditions
    if (request.type === 'market' || this.shouldFillLimit(request)) {
      await this.fillOrder(order);
    }

    return order;
  }

  async cancelOrder(orderId: string): Promise<boolean> {
    await this.simulateLatency();

    const order = this.orders.get(orderId);
    if (!order) return false;

    if (['filled', 'cancelled', 'rejected'].includes(order.status)) {
      return false;
    }

    order.status = 'cancelled';
    order.updatedAt = Date.now();
    return true;
  }

  async cancelAllOrders(symbol?: string): Promise<number> {
    let cancelled = 0;

    for (const order of this.orders.values()) {
      if (symbol && order.symbol !== symbol) continue;
      if (['pending', 'submitted', 'partial'].includes(order.status)) {
        order.status = 'cancelled';
        order.updatedAt = Date.now();
        cancelled++;
      }
    }

    return cancelled;
  }

  async getOrder(orderId: string): Promise<Order | null> {
    return this.orders.get(orderId) || null;
  }

  async getOpenOrders(symbol?: string): Promise<Order[]> {
    return Array.from(this.orders.values()).filter((o) => {
      if (symbol && o.symbol !== symbol) return false;
      return ['pending', 'submitted', 'partial'].includes(o.status);
    });
  }

  async getLatestPrice(symbol: string): Promise<number> {
    return this.prices.get(symbol) || 0;
  }

  /**
   * Set price for paper trading simulation
   */
  setPrice(symbol: string, price: number): void {
    this.prices.set(symbol, price);
  }

  /**
   * Reset account to initial state
   */
  reset(): void {
    this.initializeAccount();
    this.orders.clear();
    this.positions.clear();
    this.prices.clear();
  }

  private initializeAccount(): void {
    this.balances.set('USDT', {
      asset: 'USDT',
      free: this.config.initialCapital,
      locked: 0,
      total: this.config.initialCapital,
    });
  }

  private createOrder(
    request: OrderRequest,
    orderId: string,
    status: Order['status'],
    rejectReason?: string
  ): Order {
    return {
      ...request,
      orderId,
      status,
      filledQty: 0,
      avgPrice: 0,
      commission: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      fills: [],
      rejectReason,
    };
  }

  private async fillOrder(order: Order): Promise<void> {
    if (this.config.fillProbability < 1 && Math.random() > this.config.fillProbability) {
      return; // No fill
    }

    const price = this.getExecutionPrice(order);
    const commission = order.quantity * price * this.config.commission;

    const fill: Fill = {
      fillId: `fill_${++this.fillIdCounter}_${Date.now()}`,
      orderId: order.orderId,
      symbol: order.symbol,
      side: order.side,
      price,
      quantity: order.quantity,
      commission,
      commissionAsset: 'USDT',
      timestamp: Date.now(),
      tradeId: `trade_${Date.now()}`,
    };

    order.fills.push(fill);
    order.filledQty = order.quantity;
    order.avgPrice = price;
    order.commission = commission;
    order.status = 'filled';
    order.updatedAt = Date.now();

    // Update balances and positions
    this.updateBalances(order, fill);
    this.updatePositions(order, fill);
  }

  private getExecutionPrice(order: Order): number {
    const basePrice = order.price || this.prices.get(order.symbol) || 0;
    const slippage = basePrice * this.config.slippage;

    return order.side === 'buy' ? basePrice + slippage : basePrice - slippage;
  }

  private shouldFillLimit(request: OrderRequest): boolean {
    if (request.type !== 'limit' || !request.price) return false;

    const currentPrice = this.prices.get(request.symbol);
    if (!currentPrice) return false;

    return request.side === 'buy'
      ? currentPrice <= request.price
      : currentPrice >= request.price;
  }

  private updateBalances(order: Order, fill: Fill): void {
    const usdt = this.balances.get('USDT');
    if (!usdt) return;

    const cost = fill.price * fill.quantity + fill.commission;

    if (order.side === 'buy') {
      usdt.free -= cost;
      usdt.total -= cost;
    } else {
      usdt.free += fill.price * fill.quantity - fill.commission;
      usdt.total += fill.price * fill.quantity - fill.commission;
    }
  }

  private updatePositions(order: Order, fill: Fill): void {
    const existing = this.positions.get(order.symbol);

    if (order.side === 'buy') {
      if (existing && existing.side === 'short') {
        // Close short
        existing.realizedPnl += (existing.entryPrice - fill.price) * fill.quantity;
        existing.quantity -= fill.quantity;
        if (existing.quantity <= 0) {
          existing.side = 'flat';
          existing.quantity = 0;
        }
      } else {
        // Open/add long
        if (existing && existing.side === 'long') {
          const totalQty = existing.quantity + fill.quantity;
          existing.entryPrice =
            (existing.entryPrice * existing.quantity + fill.price * fill.quantity) / totalQty;
          existing.quantity = totalQty;
        } else {
          this.positions.set(order.symbol, {
            symbol: order.symbol,
            side: 'long',
            quantity: fill.quantity,
            entryPrice: fill.price,
            markPrice: fill.price,
            unrealizedPnl: 0,
            realizedPnl: 0,
            leverage: 1,
            marginUsed: fill.price * fill.quantity,
            updatedAt: Date.now(),
          });
        }
      }
    } else {
      if (existing && existing.side === 'long') {
        // Close long
        existing.realizedPnl += (fill.price - existing.entryPrice) * fill.quantity;
        existing.quantity -= fill.quantity;
        if (existing.quantity <= 0) {
          existing.side = 'flat';
          existing.quantity = 0;
        }
      } else {
        // Open/add short
        if (existing && existing.side === 'short') {
          const totalQty = existing.quantity + fill.quantity;
          existing.entryPrice =
            (existing.entryPrice * existing.quantity + fill.price * fill.quantity) / totalQty;
          existing.quantity = totalQty;
        } else {
          this.positions.set(order.symbol, {
            symbol: order.symbol,
            side: 'short',
            quantity: fill.quantity,
            entryPrice: fill.price,
            markPrice: fill.price,
            unrealizedPnl: 0,
            realizedPnl: 0,
            leverage: 1,
            marginUsed: fill.price * fill.quantity,
            updatedAt: Date.now(),
          });
        }
      }
    }
  }

  private async simulateLatency(): Promise<void> {
    if (this.config.latencyMs > 0) {
      await new Promise((resolve) => setTimeout(resolve, this.config.latencyMs));
    }
  }
}
