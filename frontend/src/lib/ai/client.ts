/**
 * AI Client
 *
 * Unified AI client with multi-provider support and automatic fallback.
 *
 * Provider Priority:
 * 1. Google AI Studio ($300 free credits until 2026-3-26)
 * 2. Poe API Primary ($100/month)
 * 3. Poe API Secondary ($50/month)
 */

import {
  AIProvider,
  AIProviderConfig,
  ChatCompletionRequest,
  ChatCompletionResponse,
  AIError,
} from './types';
import { googleChat, googleChatStream } from './providers/google';
import { poeChat, poeChatStream } from './providers/poe';

interface AIClientConfig {
  // Google AI Studio
  googleApiKey?: string;
  googleModel?: string;

  // Poe API (primary account - $100/month)
  poeApiKeyPrimary?: string;

  // Poe API (secondary account - $50/month)
  poeApiKeySecondary?: string;

  // Poe model
  poeModel?: string;

  // Default provider
  defaultProvider?: AIProvider;

  // Enable automatic fallback
  enableFallback?: boolean;

  // Max retry attempts per provider
  maxRetries?: number;
}

interface ProviderState {
  provider: AIProvider;
  config: AIProviderConfig;
  priority: number;
  failureCount: number;
  lastFailure?: Date;
  disabled: boolean;
}

class AIClient {
  private providers: ProviderState[] = [];
  private enableFallback: boolean;
  private maxRetries: number;

  constructor(config: AIClientConfig = {}) {
    this.enableFallback = config.enableFallback ?? true;
    this.maxRetries = config.maxRetries ?? 2;

    // Initialize providers in priority order
    this.initializeProviders(config);
  }

  private initializeProviders(config: AIClientConfig) {
    // Priority 1: Google AI Studio
    if (config.googleApiKey) {
      this.providers.push({
        provider: 'google',
        config: {
          provider: 'google',
          apiKey: config.googleApiKey,
          model: config.googleModel || 'gemini-2.0-flash',
        },
        priority: 1,
        failureCount: 0,
        disabled: false,
      });
    }

    // Priority 2: Poe API Primary ($100/month)
    if (config.poeApiKeyPrimary) {
      this.providers.push({
        provider: 'poe',
        config: {
          provider: 'poe',
          apiKey: config.poeApiKeyPrimary,
          model: config.poeModel || 'Claude-Sonnet-4',
          baseUrl: 'https://api.poe.com/v1',
        },
        priority: 2,
        failureCount: 0,
        disabled: false,
      });
    }

    // Priority 3: Poe API Secondary ($50/month)
    if (config.poeApiKeySecondary) {
      this.providers.push({
        provider: 'poe',
        config: {
          provider: 'poe',
          apiKey: config.poeApiKeySecondary,
          model: config.poeModel || 'Claude-Sonnet-4',
          baseUrl: 'https://api.poe.com/v1',
        },
        priority: 3,
        failureCount: 0,
        disabled: false,
      });
    }

    // Sort by priority
    this.providers.sort((a, b) => a.priority - b.priority);

    // If default provider is specified, move it to front
    if (config.defaultProvider) {
      const defaultIndex = this.providers.findIndex(
        (p) => p.provider === config.defaultProvider
      );
      if (defaultIndex > 0) {
        const [defaultProvider] = this.providers.splice(defaultIndex, 1);
        this.providers.unshift(defaultProvider);
      }
    }
  }

  private getAvailableProviders(): ProviderState[] {
    const now = new Date();
    return this.providers.filter((p) => {
      if (p.disabled) return false;

      // Reset failure count if last failure was more than 5 minutes ago
      if (p.lastFailure && now.getTime() - p.lastFailure.getTime() > 5 * 60 * 1000) {
        p.failureCount = 0;
        p.lastFailure = undefined;
      }

      // Disable if too many failures
      if (p.failureCount >= 5) {
        p.disabled = true;
        console.warn(`Provider ${p.provider} disabled due to repeated failures`);
        return false;
      }

      return true;
    });
  }

  private async executeWithProvider(
    providerState: ProviderState,
    request: ChatCompletionRequest
  ): Promise<ChatCompletionResponse> {
    const { provider, config } = providerState;

    switch (provider) {
      case 'google':
        return googleChat(
          { apiKey: config.apiKey, model: config.model },
          request
        );

      case 'poe':
        return poeChat(
          { apiKey: config.apiKey, model: config.model },
          request
        );

      default:
        throw {
          code: 'unknown_provider',
          message: `Unknown provider: ${provider}`,
          provider,
          retryable: false,
        } as AIError;
    }
  }

  async chat(request: ChatCompletionRequest): Promise<ChatCompletionResponse> {
    const availableProviders = this.getAvailableProviders();

    if (availableProviders.length === 0) {
      throw {
        code: 'no_providers',
        message: 'No AI providers available',
        provider: 'google',
        retryable: false,
      } as AIError;
    }

    let lastError: AIError | null = null;

    for (const providerState of availableProviders) {
      for (let attempt = 0; attempt < this.maxRetries; attempt++) {
        try {
          const response = await this.executeWithProvider(providerState, request);

          // Reset failure count on success
          providerState.failureCount = 0;
          providerState.lastFailure = undefined;

          return response;
        } catch (error) {
          lastError = error as AIError;
          providerState.failureCount++;
          providerState.lastFailure = new Date();

          console.warn(
            `AI provider ${providerState.provider} failed (attempt ${attempt + 1}/${this.maxRetries}):`,
            lastError.message
          );

          // Don't retry if error is not retryable
          if (!lastError.retryable) {
            break;
          }

          // Wait before retry (exponential backoff)
          if (attempt < this.maxRetries - 1) {
            await new Promise((resolve) =>
              setTimeout(resolve, Math.pow(2, attempt) * 1000)
            );
          }
        }
      }

      // If fallback is disabled, don't try other providers
      if (!this.enableFallback) {
        break;
      }
    }

    throw lastError || {
      code: 'all_providers_failed',
      message: 'All AI providers failed',
      provider: 'google',
      retryable: false,
    };
  }

  async *chatStream(
    request: ChatCompletionRequest
  ): AsyncGenerator<string, void, unknown> {
    const availableProviders = this.getAvailableProviders();

    if (availableProviders.length === 0) {
      throw {
        code: 'no_providers',
        message: 'No AI providers available',
        provider: 'google',
        retryable: false,
      } as AIError;
    }

    const providerState = availableProviders[0];
    const { provider, config } = providerState;

    try {
      switch (provider) {
        case 'google':
          yield* googleChatStream(
            { apiKey: config.apiKey, model: config.model },
            request
          );
          break;

        case 'poe':
          yield* poeChatStream(
            { apiKey: config.apiKey, model: config.model },
            request
          );
          break;

        default:
          throw {
            code: 'unknown_provider',
            message: `Unknown provider: ${provider}`,
            provider,
            retryable: false,
          } as AIError;
      }
    } catch (error) {
      providerState.failureCount++;
      providerState.lastFailure = new Date();
      throw error;
    }
  }

  /**
   * Get current provider status
   */
  getProviderStatus(): Array<{
    provider: AIProvider;
    priority: number;
    available: boolean;
    failureCount: number;
  }> {
    return this.providers.map((p) => ({
      provider: p.provider,
      priority: p.priority,
      available: !p.disabled && p.failureCount < 5,
      failureCount: p.failureCount,
    }));
  }

  /**
   * Reset all provider failure counts
   */
  resetProviders(): void {
    this.providers.forEach((p) => {
      p.failureCount = 0;
      p.lastFailure = undefined;
      p.disabled = false;
    });
  }
}

// Create singleton instance from environment variables
function createAIClient(): AIClient {
  // Server-side only - API keys should not be exposed to client
  if (typeof window !== 'undefined') {
    console.warn('AI client should only be used server-side');
    return new AIClient();
  }

  return new AIClient({
    googleApiKey: process.env.GOOGLE_AI_API_KEY,
    googleModel: process.env.NEXT_PUBLIC_GOOGLE_AI_MODEL,
    poeApiKeyPrimary: process.env.POE_API_KEY_PRIMARY,
    poeApiKeySecondary: process.env.POE_API_KEY_SECONDARY,
    poeModel: process.env.NEXT_PUBLIC_POE_MODEL,
    defaultProvider: (process.env.NEXT_PUBLIC_AI_PROVIDER as AIProvider) || 'google',
    enableFallback: true,
    maxRetries: 2,
  });
}

export const aiClient = createAIClient();
export { AIClient };
