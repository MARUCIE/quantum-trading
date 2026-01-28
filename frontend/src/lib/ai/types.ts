/**
 * AI Types
 *
 * Type definitions for AI model integration.
 */

// Provider types
export type AIProvider = 'google' | 'poe';

export interface AIProviderConfig {
  provider: AIProvider;
  apiKey: string;
  model: string;
  baseUrl?: string;
}

// Message types (OpenAI compatible)
export type MessageRole = 'system' | 'user' | 'assistant';

export interface ChatMessage {
  role: MessageRole;
  content: string;
}

// Request types
export interface ChatCompletionRequest {
  messages: ChatMessage[];
  model?: string;
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
}

// Response types
export interface ChatCompletionResponse {
  id: string;
  content: string;
  model: string;
  provider: AIProvider;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  finishReason?: 'stop' | 'length' | 'content_filter';
}

// Streaming types
export interface ChatCompletionChunk {
  id: string;
  delta: string;
  model: string;
  provider: AIProvider;
  finishReason?: 'stop' | 'length' | 'content_filter';
}

// Error types
export interface AIError {
  code: string;
  message: string;
  provider: AIProvider;
  status?: number;
  retryable: boolean;
}

// Trading-specific AI types
export interface SignalAnalysisRequest {
  symbol: string;
  timeframe: string;
  priceData: Array<{
    timestamp: number;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
  }>;
  indicators?: Record<string, number[]>;
}

export interface SignalAnalysisResponse {
  symbol: string;
  signal: 'buy' | 'sell' | 'hold';
  confidence: number; // 0-100
  reasoning: string;
  entryPrice?: number;
  stopLoss?: number;
  takeProfit?: number;
  riskRewardRatio?: number;
}

export interface StrategyAnalysisRequest {
  strategyName: string;
  parameters: Record<string, unknown>;
  backtestResults?: {
    totalReturn: number;
    sharpeRatio: number;
    maxDrawdown: number;
    winRate: number;
    tradesCount: number;
  };
}

export interface StrategyAnalysisResponse {
  summary: string;
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  riskAssessment: 'low' | 'medium' | 'high';
}

export interface MarketSentimentRequest {
  symbols: string[];
  newsContext?: string;
}

export interface MarketSentimentResponse {
  overallSentiment: 'bullish' | 'bearish' | 'neutral';
  sentimentScore: number; // -100 to 100
  symbolSentiments: Array<{
    symbol: string;
    sentiment: 'bullish' | 'bearish' | 'neutral';
    score: number;
  }>;
  keyInsights: string[];
}
