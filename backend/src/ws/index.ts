/**
 * WebSocket Module
 *
 * Real-time communication for the Quantum X trading system.
 */

export { QuantumWsServer, wsServer } from './server.js';
export type {
  WsMessageType,
  WsSubscribeMessage,
  WsBroadcastMessage,
} from './server.js';
