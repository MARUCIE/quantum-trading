/**
 * API Hooks Index
 *
 * Re-exports all TanStack Query hooks.
 */

// Portfolio hooks
export {
  useAccount,
  usePositions,
  usePortfolioStats,
  useClosePosition,
  portfolioKeys,
} from './use-portfolio';

// Strategy hooks
export {
  useStrategies,
  useStrategy,
  useStrategySignals,
  useUpdateStrategyStatus,
  useCreateStrategy,
  useDeleteStrategy,
  strategyKeys,
} from './use-strategies';

// Market data hooks
export {
  useKlines,
  useTicker,
  useAllTickers,
  useRecentTrades,
  marketKeys,
} from './use-market-data';

// Risk hooks
export {
  useRiskMetrics,
  useRiskEvents,
  useRiskEventsByLevel,
  useRiskLimits,
  riskKeys,
} from './use-risk';
