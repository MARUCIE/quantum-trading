/**
 * AI Strategy Analysis API Route
 *
 * Analyzes trading strategies and provides insights.
 */

import { NextRequest, NextResponse } from 'next/server';
import { analyzeStrategy } from '@/lib/ai';
import type { StrategyAnalysisRequest } from '@/lib/ai';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body: StrategyAnalysisRequest = await request.json();

    if (!body.strategyName) {
      return NextResponse.json(
        { error: 'Strategy name is required' },
        { status: 400 }
      );
    }

    const analysis = await analyzeStrategy(body);

    return NextResponse.json({
      ...analysis,
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error('Strategy analysis error:', error);

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Strategy analysis failed',
      },
      { status: 500 }
    );
  }
}
