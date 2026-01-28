import { strategyRegistry } from './index.js';
import { readJson, writeJson } from '../storage/json-store.js';
import { resolveStoragePath } from '../storage/paths.js';

export type StrategyStatus = 'active' | 'paused' | 'stopped' | 'error';

export interface StrategyRecord {
  id: string;
  name: string;
  description: string;
  status: StrategyStatus;
  type: string;
  symbols: string[];
  pnl: number;
  pnlPercent: number;
  sharpeRatio: number;
  maxDrawdown: number;
  winRate: number;
  tradesCount: number;
  createdAt: string;
  updatedAt: string;
  source: 'registry' | 'custom';
}

interface StrategyStoreFile {
  records: StrategyRecord[];
}

const storePath = resolveStoragePath('strategies.json');
const defaultStore: StrategyStoreFile = { records: [] };

function formatSymbol(symbol: string): string {
  if (symbol.includes('/')) return symbol;
  const quotes = ['USDT', 'USD', 'BTC', 'ETH', 'BUSD'];
  for (const quote of quotes) {
    if (symbol.endsWith(quote)) {
      return `${symbol.slice(0, -quote.length)}/${quote}`;
    }
  }
  return symbol;
}

function formatType(id: string, name: string): string {
  const normalized = id.replace(/_/g, ' ').replace(/v\\d+$/, '').trim();
  if (normalized.includes('momentum')) return 'Momentum';
  if (normalized.includes('mean reversion')) return 'Mean Reversion';
  if (normalized.includes('arbitrage')) return 'Arbitrage';
  if (normalized.includes('trend')) return 'Trend';
  return name.split(' ')[0] || 'Strategy';
}

function seedFromRegistry(existing: StrategyRecord[]): StrategyRecord[] {
  const now = new Date().toISOString();
  const existingById = new Map(existing.map((r) => [r.id, r]));
  const seeded: StrategyRecord[] = [];

  for (const entry of strategyRegistry.values()) {
    const existingRecord = existingById.get(entry.id);
    if (existingRecord) {
      seeded.push(existingRecord);
      continue;
    }

    seeded.push({
      id: entry.id,
      name: entry.name,
      description: entry.description,
      status: 'stopped',
      type: formatType(entry.id, entry.name),
      symbols: entry.defaultParams.symbols.map(formatSymbol),
      pnl: 0,
      pnlPercent: 0,
      sharpeRatio: 0,
      maxDrawdown: 0,
      winRate: 0,
      tradesCount: 0,
      createdAt: now,
      updatedAt: now,
      source: 'registry',
    });
  }

  // Preserve custom records
  for (const record of existing) {
    if (record.source === 'custom') {
      seeded.push(record);
    }
  }

  return seeded;
}

class StrategyStore {
  private records: StrategyRecord[];

  constructor() {
    const data = readJson(storePath, defaultStore);
    this.records = seedFromRegistry(data.records);
    this.persist();
  }

  list(): StrategyRecord[] {
    return [...this.records].sort((a, b) => a.name.localeCompare(b.name));
  }

  get(id: string): StrategyRecord | undefined {
    return this.records.find((r) => r.id === id);
  }

  create(input: {
    name: string;
    description?: string;
    type?: string;
    symbols?: string[];
  }): StrategyRecord {
    const now = new Date().toISOString();
    const record: StrategyRecord = {
      id: `custom_${Date.now()}`,
      name: input.name,
      description: input.description || '',
      status: 'stopped',
      type: input.type || 'Custom',
      symbols: (input.symbols || []).map(formatSymbol),
      pnl: 0,
      pnlPercent: 0,
      sharpeRatio: 0,
      maxDrawdown: 0,
      winRate: 0,
      tradesCount: 0,
      createdAt: now,
      updatedAt: now,
      source: 'custom',
    };
    this.records.push(record);
    this.persist();
    return record;
  }

  updateStatus(id: string, status: StrategyStatus): StrategyRecord | null {
    const record = this.get(id);
    if (!record) return null;
    record.status = status;
    record.updatedAt = new Date().toISOString();
    this.persist();
    return record;
  }

  update(id: string, updates: Partial<StrategyRecord>): StrategyRecord | null {
    const record = this.get(id);
    if (!record) return null;
    Object.assign(record, updates, { updatedAt: new Date().toISOString() });
    this.persist();
    return record;
  }

  remove(id: string): boolean {
    const record = this.get(id);
    if (!record || record.source === 'registry') {
      return false;
    }
    this.records = this.records.filter((r) => r.id !== id);
    this.persist();
    return true;
  }

  private persist(): void {
    writeJson(storePath, { records: this.records });
  }
}

export const strategyStore = new StrategyStore();
