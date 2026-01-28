/**
 * State Management Stores
 *
 * Centralized state management using Zustand.
 * All stores follow the same pattern with actions and selectors.
 */

// Portfolio Store
export {
  usePortfolioStore,
  type PortfolioStats,
  type Position as PortfolioPosition,
} from "./portfolio-store";

// Strategy Store
export {
  useStrategyStore,
  type Strategy,
  type StrategyStatus,
} from "./strategy-store";

// Trading Store
export {
  useTradingStore,
  selectCurrentSymbol,
  selectMarketPrice,
  selectPositions,
  selectOpenOrders,
  selectOrderBook,
  type Order,
  type OrderStatus,
} from "./trading-store";

// Auth Store
export {
  useAuthStore,
  useUser,
  useIsAuthenticated,
  selectUser,
  selectIsAuthenticated,
  selectIsLoading,
  selectAuthError,
  type User,
  type UserRole,
  type Session,
} from "./auth-store";
