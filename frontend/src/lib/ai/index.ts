/**
 * AI Module
 *
 * Unified AI integration for Quantum X trading platform.
 *
 * Provider Priority:
 * 1. Google AI Studio (gemini-2.0-flash) - $300 free credits until 2026-3-26
 * 2. Poe API Primary - $100/month (Claude-Sonnet-4)
 * 3. Poe API Secondary - $50/month
 *
 * Features:
 * - Multi-provider support with automatic fallback
 * - Trading signal analysis
 * - Strategy evaluation
 * - Market sentiment analysis
 * - Trading assistant chat
 */

// Types
export type {
  AIProvider,
  AIProviderConfig,
  ChatMessage,
  ChatCompletionRequest,
  ChatCompletionResponse,
  ChatCompletionChunk,
  AIError,
  SignalAnalysisRequest,
  SignalAnalysisResponse,
  StrategyAnalysisRequest,
  StrategyAnalysisResponse,
  MarketSentimentRequest,
  MarketSentimentResponse,
} from './types';

// Client
export { aiClient, AIClient } from './client';

// Services
export {
  analyzeSignal,
  analyzeStrategy,
  analyzeMarketSentiment,
  tradingAssistantChat,
  tradingAssistantChatStream,
} from './services';

// Providers
export { googleChat, googleChatStream } from './providers/google';
export { poeChat, poeChatStream, POE_MODELS } from './providers/poe';

// React Hooks (client-side)
export {
  useAIChat,
  useSignalAnalysis,
  useStrategyAnalysis,
  useMarketSentiment,
  useAIStatus,
} from './hooks';
