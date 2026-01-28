/**
 * AI Trading Services
 *
 * High-level AI services for trading analysis and insights.
 */

import { aiClient } from './client';
import {
  SignalAnalysisRequest,
  SignalAnalysisResponse,
  StrategyAnalysisRequest,
  StrategyAnalysisResponse,
  MarketSentimentRequest,
  MarketSentimentResponse,
} from './types';

/**
 * Analyze market data and generate trading signals
 */
export async function analyzeSignal(
  request: SignalAnalysisRequest
): Promise<SignalAnalysisResponse> {
  const { symbol, timeframe, priceData, indicators } = request;

  // Prepare price data summary
  const recentPrices = priceData.slice(-20);
  const priceChange =
    ((recentPrices[recentPrices.length - 1].close - recentPrices[0].close) /
      recentPrices[0].close) *
    100;
  const avgVolume =
    recentPrices.reduce((sum, bar) => sum + bar.volume, 0) / recentPrices.length;
  const highestPrice = Math.max(...recentPrices.map((bar) => bar.high));
  const lowestPrice = Math.min(...recentPrices.map((bar) => bar.low));
  const currentPrice = recentPrices[recentPrices.length - 1].close;

  const prompt = `You are a professional quantitative trading analyst. Analyze the following market data and provide a trading signal.

Symbol: ${symbol}
Timeframe: ${timeframe}
Current Price: ${currentPrice.toFixed(4)}
Price Change (20 periods): ${priceChange.toFixed(2)}%
Highest Price: ${highestPrice.toFixed(4)}
Lowest Price: ${lowestPrice.toFixed(4)}
Average Volume: ${avgVolume.toFixed(0)}

${indicators ? `Technical Indicators: ${JSON.stringify(indicators)}` : ''}

Provide your analysis in the following JSON format only, no additional text:
{
  "signal": "buy" | "sell" | "hold",
  "confidence": <number 0-100>,
  "reasoning": "<brief explanation>",
  "entryPrice": <number or null>,
  "stopLoss": <number or null>,
  "takeProfit": <number or null>,
  "riskRewardRatio": <number or null>
}`;

  const response = await aiClient.chat({
    messages: [
      {
        role: 'system',
        content:
          'You are a professional trading analyst. Always respond with valid JSON only.',
      },
      { role: 'user', content: prompt },
    ],
    temperature: 0.3,
    maxTokens: 500,
  });

  try {
    // Extract JSON from response
    const jsonMatch = response.content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in response');
    }

    const result = JSON.parse(jsonMatch[0]);

    return {
      symbol,
      signal: result.signal || 'hold',
      confidence: Math.min(100, Math.max(0, result.confidence || 50)),
      reasoning: result.reasoning || 'Unable to analyze',
      entryPrice: result.entryPrice || undefined,
      stopLoss: result.stopLoss || undefined,
      takeProfit: result.takeProfit || undefined,
      riskRewardRatio: result.riskRewardRatio || undefined,
    };
  } catch {
    // Return default response on parse error
    return {
      symbol,
      signal: 'hold',
      confidence: 30,
      reasoning: 'Analysis unavailable - unable to process response',
    };
  }
}

/**
 * Analyze strategy performance and provide insights
 */
export async function analyzeStrategy(
  request: StrategyAnalysisRequest
): Promise<StrategyAnalysisResponse> {
  const { strategyName, parameters, backtestResults } = request;

  let performanceContext = '';
  if (backtestResults) {
    performanceContext = `
Backtest Results:
- Total Return: ${backtestResults.totalReturn.toFixed(2)}%
- Sharpe Ratio: ${backtestResults.sharpeRatio.toFixed(2)}
- Max Drawdown: ${backtestResults.maxDrawdown.toFixed(2)}%
- Win Rate: ${backtestResults.winRate.toFixed(2)}%
- Total Trades: ${backtestResults.tradesCount}`;
  }

  const prompt = `You are a professional quantitative strategy analyst. Analyze the following trading strategy and provide insights.

Strategy Name: ${strategyName}
Parameters: ${JSON.stringify(parameters, null, 2)}
${performanceContext}

Provide your analysis in the following JSON format only:
{
  "summary": "<2-3 sentence summary>",
  "strengths": ["<strength 1>", "<strength 2>", ...],
  "weaknesses": ["<weakness 1>", "<weakness 2>", ...],
  "suggestions": ["<suggestion 1>", "<suggestion 2>", ...],
  "riskAssessment": "low" | "medium" | "high"
}`;

  const response = await aiClient.chat({
    messages: [
      {
        role: 'system',
        content:
          'You are a professional strategy analyst. Always respond with valid JSON only.',
      },
      { role: 'user', content: prompt },
    ],
    temperature: 0.5,
    maxTokens: 800,
  });

  try {
    const jsonMatch = response.content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in response');
    }

    const result = JSON.parse(jsonMatch[0]);

    return {
      summary: result.summary || 'Unable to analyze strategy',
      strengths: result.strengths || [],
      weaknesses: result.weaknesses || [],
      suggestions: result.suggestions || [],
      riskAssessment: result.riskAssessment || 'medium',
    };
  } catch {
    return {
      summary: 'Analysis unavailable',
      strengths: [],
      weaknesses: [],
      suggestions: ['Please try again later'],
      riskAssessment: 'medium',
    };
  }
}

/**
 * Analyze market sentiment
 */
export async function analyzeMarketSentiment(
  request: MarketSentimentRequest
): Promise<MarketSentimentResponse> {
  const { symbols, newsContext } = request;

  const prompt = `You are a market sentiment analyst. Analyze the sentiment for the following symbols.

Symbols: ${symbols.join(', ')}
${newsContext ? `News Context: ${newsContext}` : ''}

Provide your analysis in the following JSON format only:
{
  "overallSentiment": "bullish" | "bearish" | "neutral",
  "sentimentScore": <number -100 to 100>,
  "symbolSentiments": [
    { "symbol": "<symbol>", "sentiment": "bullish" | "bearish" | "neutral", "score": <number> }
  ],
  "keyInsights": ["<insight 1>", "<insight 2>", ...]
}`;

  const response = await aiClient.chat({
    messages: [
      {
        role: 'system',
        content:
          'You are a market sentiment analyst. Always respond with valid JSON only.',
      },
      { role: 'user', content: prompt },
    ],
    temperature: 0.4,
    maxTokens: 600,
  });

  try {
    const jsonMatch = response.content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in response');
    }

    const result = JSON.parse(jsonMatch[0]);

    return {
      overallSentiment: result.overallSentiment || 'neutral',
      sentimentScore: Math.min(100, Math.max(-100, result.sentimentScore || 0)),
      symbolSentiments: result.symbolSentiments || [],
      keyInsights: result.keyInsights || [],
    };
  } catch {
    return {
      overallSentiment: 'neutral',
      sentimentScore: 0,
      symbolSentiments: symbols.map((s) => ({
        symbol: s,
        sentiment: 'neutral' as const,
        score: 0,
      })),
      keyInsights: ['Unable to analyze sentiment at this time'],
    };
  }
}

/**
 * General trading assistant chat
 */
export async function tradingAssistantChat(
  userMessage: string,
  conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }> = []
): Promise<string> {
  const response = await aiClient.chat({
    messages: [
      {
        role: 'system',
        content: `You are a professional trading assistant for Quantum X trading platform.
You help users with:
- Understanding trading concepts and strategies
- Analyzing market conditions
- Explaining technical indicators
- Risk management advice
- Platform usage guidance

Be concise, professional, and helpful. Always prioritize risk awareness in your advice.
Never provide specific investment recommendations or guarantee returns.`,
      },
      ...conversationHistory.map((msg) => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
      })),
      { role: 'user', content: userMessage },
    ],
    temperature: 0.7,
    maxTokens: 1000,
  });

  return response.content;
}

/**
 * Stream trading assistant response
 */
export async function* tradingAssistantChatStream(
  userMessage: string,
  conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }> = []
): AsyncGenerator<string, void, unknown> {
  yield* aiClient.chatStream({
    messages: [
      {
        role: 'system',
        content: `You are a professional trading assistant for Quantum X trading platform.
You help users with trading concepts, market analysis, and platform guidance.
Be concise and professional. Prioritize risk awareness.`,
      },
      ...conversationHistory.map((msg) => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
      })),
      { role: 'user', content: userMessage },
    ],
    temperature: 0.7,
    maxTokens: 1000,
  });
}
