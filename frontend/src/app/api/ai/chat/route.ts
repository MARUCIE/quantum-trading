/**
 * AI Chat API Route
 *
 * Handles AI chat requests with streaming support.
 */

import { NextRequest, NextResponse } from 'next/server';
import { tradingAssistantChat, tradingAssistantChatStream } from '@/lib/ai';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface ChatRequest {
  message: string;
  history?: Array<{ role: 'user' | 'assistant'; content: string }>;
  stream?: boolean;
}

export async function POST(request: NextRequest) {
  try {
    const body: ChatRequest = await request.json();
    const { message, history = [], stream = false } = body;

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    if (stream) {
      // Streaming response
      const encoder = new TextEncoder();
      const readable = new ReadableStream({
        async start(controller) {
          try {
            const generator = tradingAssistantChatStream(message, history);
            for await (const chunk of generator) {
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ content: chunk })}\n\n`)
              );
            }
            controller.enqueue(encoder.encode('data: [DONE]\n\n'));
            controller.close();
          } catch (error) {
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({
                  error: error instanceof Error ? error.message : 'Stream error',
                })}\n\n`
              )
            );
            controller.close();
          }
        },
      });

      return new Response(readable, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      });
    }

    // Non-streaming response
    const response = await tradingAssistantChat(message, history);

    return NextResponse.json({
      content: response,
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error('AI Chat error:', error);

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'AI service unavailable',
      },
      { status: 500 }
    );
  }
}
