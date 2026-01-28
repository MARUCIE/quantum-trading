/**
 * AI Market Sentiment API Route
 *
 * Analyzes market sentiment for given symbols.
 */

import { NextRequest, NextResponse } from 'next/server';
import { analyzeMarketSentiment } from '@/lib/ai';
import type { MarketSentimentRequest } from '@/lib/ai';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body: MarketSentimentRequest = await request.json();

    if (!body.symbols || body.symbols.length === 0) {
      return NextResponse.json(
        { error: 'At least one symbol is required' },
        { status: 400 }
      );
    }

    const sentiment = await analyzeMarketSentiment(body);

    return NextResponse.json({
      ...sentiment,
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error('Sentiment analysis error:', error);

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Sentiment analysis failed',
      },
      { status: 500 }
    );
  }
}
