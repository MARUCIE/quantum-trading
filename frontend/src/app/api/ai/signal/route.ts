/**
 * AI Signal Analysis API Route
 *
 * Analyzes market data and generates trading signals.
 */

import { NextRequest, NextResponse } from 'next/server';
import { analyzeSignal } from '@/lib/ai';
import type { SignalAnalysisRequest } from '@/lib/ai';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body: SignalAnalysisRequest = await request.json();

    if (!body.symbol || !body.timeframe || !body.priceData) {
      return NextResponse.json(
        { error: 'Symbol, timeframe, and priceData are required' },
        { status: 400 }
      );
    }

    if (body.priceData.length < 10) {
      return NextResponse.json(
        { error: 'At least 10 price bars required for analysis' },
        { status: 400 }
      );
    }

    const signal = await analyzeSignal(body);

    return NextResponse.json({
      ...signal,
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error('Signal analysis error:', error);

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Signal analysis failed',
      },
      { status: 500 }
    );
  }
}
