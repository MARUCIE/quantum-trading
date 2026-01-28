/**
 * Google AI Studio Provider
 *
 * Integration with Google's Gemini models via AI Studio API.
 * Priority 1: $300 free credits until 2026-3-26
 */

import {
  ChatCompletionRequest,
  ChatCompletionResponse,
  ChatMessage,
  AIError,
} from '../types';

const GOOGLE_AI_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta';

interface GoogleAIConfig {
  apiKey: string;
  model?: string;
}

interface GoogleMessage {
  role: 'user' | 'model';
  parts: Array<{ text: string }>;
}

interface GoogleResponse {
  candidates: Array<{
    content: {
      parts: Array<{ text: string }>;
      role: string;
    };
    finishReason: string;
  }>;
  usageMetadata?: {
    promptTokenCount: number;
    candidatesTokenCount: number;
    totalTokenCount: number;
  };
}

function convertToGoogleMessages(messages: ChatMessage[]): {
  systemInstruction?: { parts: Array<{ text: string }> };
  contents: GoogleMessage[];
} {
  const systemMessages = messages.filter((m) => m.role === 'system');
  const chatMessages = messages.filter((m) => m.role !== 'system');

  const systemInstruction = systemMessages.length > 0
    ? { parts: systemMessages.map((m) => ({ text: m.content })) }
    : undefined;

  const contents: GoogleMessage[] = chatMessages.map((m) => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }));

  return { systemInstruction, contents };
}

export async function googleChat(
  config: GoogleAIConfig,
  request: ChatCompletionRequest
): Promise<ChatCompletionResponse> {
  const model = request.model || config.model || 'gemini-2.0-flash';
  const url = `${GOOGLE_AI_BASE_URL}/models/${model}:generateContent?key=${config.apiKey}`;

  const { systemInstruction, contents } = convertToGoogleMessages(request.messages);

  const body: Record<string, unknown> = {
    contents,
    generationConfig: {
      temperature: request.temperature ?? 0.7,
      maxOutputTokens: request.maxTokens ?? 2048,
    },
  };

  if (systemInstruction) {
    body.systemInstruction = systemInstruction;
  }

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const error: AIError = {
        code: `google_${response.status}`,
        message: errorData.error?.message || `Google AI error: ${response.status}`,
        provider: 'google',
        status: response.status,
        retryable: response.status >= 500 || response.status === 429,
      };
      throw error;
    }

    const data: GoogleResponse = await response.json();

    if (!data.candidates || data.candidates.length === 0) {
      throw {
        code: 'google_no_candidates',
        message: 'No response candidates returned',
        provider: 'google',
        retryable: true,
      } as AIError;
    }

    const candidate = data.candidates[0];
    const content = candidate.content.parts.map((p) => p.text).join('');

    return {
      id: `google_${Date.now()}`,
      content,
      model,
      provider: 'google',
      usage: data.usageMetadata
        ? {
            promptTokens: data.usageMetadata.promptTokenCount,
            completionTokens: data.usageMetadata.candidatesTokenCount,
            totalTokens: data.usageMetadata.totalTokenCount,
          }
        : undefined,
      finishReason: candidate.finishReason === 'STOP' ? 'stop' : undefined,
    };
  } catch (error) {
    if ((error as AIError).provider === 'google') {
      throw error;
    }
    throw {
      code: 'google_network_error',
      message: error instanceof Error ? error.message : 'Network error',
      provider: 'google',
      retryable: true,
    } as AIError;
  }
}

export async function* googleChatStream(
  config: GoogleAIConfig,
  request: ChatCompletionRequest
): AsyncGenerator<string, void, unknown> {
  const model = request.model || config.model || 'gemini-2.0-flash';
  const url = `${GOOGLE_AI_BASE_URL}/models/${model}:streamGenerateContent?key=${config.apiKey}&alt=sse`;

  const { systemInstruction, contents } = convertToGoogleMessages(request.messages);

  const body: Record<string, unknown> = {
    contents,
    generationConfig: {
      temperature: request.temperature ?? 0.7,
      maxOutputTokens: request.maxTokens ?? 2048,
    },
  };

  if (systemInstruction) {
    body.systemInstruction = systemInstruction;
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw {
      code: `google_${response.status}`,
      message: errorData.error?.message || `Google AI error: ${response.status}`,
      provider: 'google',
      status: response.status,
      retryable: response.status >= 500 || response.status === 429,
    } as AIError;
  }

  const reader = response.body?.getReader();
  if (!reader) {
    throw {
      code: 'google_no_stream',
      message: 'No response body stream',
      provider: 'google',
      retryable: false,
    } as AIError;
  }

  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const jsonStr = line.slice(6).trim();
        if (jsonStr && jsonStr !== '[DONE]') {
          try {
            const data = JSON.parse(jsonStr);
            if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
              yield data.candidates[0].content.parts[0].text;
            }
          } catch {
            // Skip invalid JSON
          }
        }
      }
    }
  }
}
