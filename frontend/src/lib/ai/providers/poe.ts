/**
 * Poe API Provider
 *
 * OpenAI-compatible API integration for Poe.
 * Supports hundreds of models including Claude, GPT, Gemini, Llama, etc.
 */

import {
  ChatCompletionRequest,
  ChatCompletionResponse,
  ChatMessage,
  AIError,
} from '../types';

const POE_API_BASE_URL = 'https://api.poe.com/v1';

interface PoeConfig {
  apiKey: string;
  model?: string;
}

interface OpenAIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface OpenAIChoice {
  index: number;
  message: {
    role: string;
    content: string;
  };
  finish_reason: 'stop' | 'length' | 'content_filter' | null;
}

interface OpenAIResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: OpenAIChoice[];
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

interface OpenAIStreamChunk {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    delta: {
      role?: string;
      content?: string;
    };
    finish_reason: 'stop' | 'length' | 'content_filter' | null;
  }>;
}

function convertToOpenAIMessages(messages: ChatMessage[]): OpenAIMessage[] {
  return messages.map((m) => ({
    role: m.role,
    content: m.content,
  }));
}

export async function poeChat(
  config: PoeConfig,
  request: ChatCompletionRequest
): Promise<ChatCompletionResponse> {
  const model = request.model || config.model || 'Claude-Sonnet-4';
  const url = `${POE_API_BASE_URL}/chat/completions`;

  const body = {
    model,
    messages: convertToOpenAIMessages(request.messages),
    temperature: request.temperature ?? 0.7,
    max_tokens: request.maxTokens ?? 2048,
    stream: false,
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify(body),
    });

    // Check rate limit headers
    const remainingRequests = response.headers.get('x-ratelimit-remaining-requests');
    if (remainingRequests && parseInt(remainingRequests) < 10) {
      console.warn(`Poe API: Low rate limit remaining: ${remainingRequests}`);
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const error: AIError = {
        code: `poe_${response.status}`,
        message: errorData.error?.message || `Poe API error: ${response.status}`,
        provider: 'poe',
        status: response.status,
        retryable: response.status >= 500 || response.status === 429,
      };
      throw error;
    }

    const data: OpenAIResponse = await response.json();

    if (!data.choices || data.choices.length === 0) {
      throw {
        code: 'poe_no_choices',
        message: 'No response choices returned',
        provider: 'poe',
        retryable: true,
      } as AIError;
    }

    const choice = data.choices[0];

    return {
      id: data.id,
      content: choice.message.content,
      model: data.model,
      provider: 'poe',
      usage: data.usage
        ? {
            promptTokens: data.usage.prompt_tokens,
            completionTokens: data.usage.completion_tokens,
            totalTokens: data.usage.total_tokens,
          }
        : undefined,
      finishReason: choice.finish_reason || undefined,
    };
  } catch (error) {
    if ((error as AIError).provider === 'poe') {
      throw error;
    }
    throw {
      code: 'poe_network_error',
      message: error instanceof Error ? error.message : 'Network error',
      provider: 'poe',
      retryable: true,
    } as AIError;
  }
}

export async function* poeChatStream(
  config: PoeConfig,
  request: ChatCompletionRequest
): AsyncGenerator<string, void, unknown> {
  const model = request.model || config.model || 'Claude-Sonnet-4';
  const url = `${POE_API_BASE_URL}/chat/completions`;

  const body = {
    model,
    messages: convertToOpenAIMessages(request.messages),
    temperature: request.temperature ?? 0.7,
    max_tokens: request.maxTokens ?? 2048,
    stream: true,
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw {
      code: `poe_${response.status}`,
      message: errorData.error?.message || `Poe API error: ${response.status}`,
      provider: 'poe',
      status: response.status,
      retryable: response.status >= 500 || response.status === 429,
    } as AIError;
  }

  const reader = response.body?.getReader();
  if (!reader) {
    throw {
      code: 'poe_no_stream',
      message: 'No response body stream',
      provider: 'poe',
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
            const data: OpenAIStreamChunk = JSON.parse(jsonStr);
            const delta = data.choices?.[0]?.delta?.content;
            if (delta) {
              yield delta;
            }
          } catch {
            // Skip invalid JSON
          }
        }
      }
    }
  }
}

/**
 * Available Poe models (partial list)
 */
export const POE_MODELS = {
  // Claude models
  'Claude-Opus-4.1': 'claude-opus-4.1',
  'Claude-Sonnet-4': 'claude-sonnet-4',
  'Claude-3.5-Sonnet': 'claude-3.5-sonnet',

  // GPT models
  'GPT-4o': 'gpt-4o',
  'GPT-4-Turbo': 'gpt-4-turbo',
  'GPT-4o-Mini': 'gpt-4o-mini',

  // Gemini models
  'Gemini-2.5-Pro': 'gemini-2.5-pro',
  'Gemini-3-Pro': 'gemini-3-pro',

  // Llama models
  'Llama-3.1-405B': 'llama-3.1-405b',

  // Other
  'Grok-4': 'grok-4',
} as const;

export type PoeModelName = keyof typeof POE_MODELS;
