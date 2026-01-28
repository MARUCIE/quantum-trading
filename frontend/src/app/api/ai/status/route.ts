/**
 * AI Provider Status API Route
 *
 * Returns the status of all AI providers.
 */

import { NextResponse } from 'next/server';
import { aiClient } from '@/lib/ai';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const status = aiClient.getProviderStatus();

    return NextResponse.json({
      providers: status,
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error('Status check error:', error);

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Status check failed',
      },
      { status: 500 }
    );
  }
}

export async function POST() {
  // Reset providers (for admin use)
  try {
    aiClient.resetProviders();

    return NextResponse.json({
      message: 'Providers reset successfully',
      providers: aiClient.getProviderStatus(),
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error('Provider reset error:', error);

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Reset failed',
      },
      { status: 500 }
    );
  }
}
