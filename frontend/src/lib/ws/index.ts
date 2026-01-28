/**
 * WebSocket Module
 *
 * Real-time data subscriptions for Quantum X frontend.
 */

export { QuantumWsClient, getWsClient } from "./client";
export type { WsMessage, WsCallback, WsMessageType, WsClientConfig } from "./client";

export {
  useWebSocket,
  useTicker,
  useKline,
  useTrades,
  useOrderBook,
  useSubscription,
} from "./use-websocket";
