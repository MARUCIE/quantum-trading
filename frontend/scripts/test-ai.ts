/**
 * AI Integration Test Script
 *
 * Run with: npx tsx scripts/test-ai.ts
 */

import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

const GOOGLE_AI_API_KEY = process.env.GOOGLE_AI_API_KEY;
const POE_API_KEY_PRIMARY = process.env.POE_API_KEY_PRIMARY;

async function testGoogleAI() {
  console.log('\n--- Testing Google AI Studio ---');

  if (!GOOGLE_AI_API_KEY) {
    console.log('SKIP: GOOGLE_AI_API_KEY not set');
    return false;
  }

  const model = 'gemini-2.0-flash';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GOOGLE_AI_API_KEY}`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [{ text: 'Say "Hello from Google AI" in exactly 5 words.' }],
          },
        ],
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 50,
        },
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.log(`ERROR: ${response.status} - ${error.error?.message || 'Unknown error'}`);
      return false;
    }

    const data = await response.json();
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response';

    console.log(`OK: Response received`);
    console.log(`   Model: ${model}`);
    console.log(`   Content: ${content.trim()}`);
    console.log(`   Tokens: ${data.usageMetadata?.totalTokenCount || 'N/A'}`);

    return true;
  } catch (error) {
    console.log(`ERROR: ${error instanceof Error ? error.message : 'Network error'}`);
    return false;
  }
}

async function testPoeAPI() {
  console.log('\n--- Testing Poe API ---');

  if (!POE_API_KEY_PRIMARY) {
    console.log('SKIP: POE_API_KEY_PRIMARY not set');
    return false;
  }

  const model = 'Claude-Sonnet-4';
  const url = 'https://api.poe.com/v1/chat/completions';

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${POE_API_KEY_PRIMARY}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'user', content: 'Say "Hello from Poe API" in exactly 5 words.' },
        ],
        temperature: 0.1,
        max_tokens: 50,
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      console.log(`ERROR: ${response.status} - ${error.error?.message || 'Unknown error'}`);

      // Check rate limit headers
      const remaining = response.headers.get('x-ratelimit-remaining-requests');
      if (remaining) {
        console.log(`   Rate limit remaining: ${remaining}`);
      }

      return false;
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || 'No response';

    console.log(`OK: Response received`);
    console.log(`   Model: ${data.model || model}`);
    console.log(`   Content: ${content.trim()}`);
    console.log(`   Tokens: ${data.usage?.total_tokens || 'N/A'}`);

    return true;
  } catch (error) {
    console.log(`ERROR: ${error instanceof Error ? error.message : 'Network error'}`);
    return false;
  }
}

async function main() {
  console.log('='.repeat(50));
  console.log('AI Integration Test');
  console.log('='.repeat(50));

  const results = {
    google: await testGoogleAI(),
    poe: await testPoeAPI(),
  };

  console.log('\n' + '='.repeat(50));
  console.log('Summary');
  console.log('='.repeat(50));
  console.log(`Google AI Studio: ${results.google ? 'OK' : 'FAILED'}`);
  console.log(`Poe API: ${results.poe ? 'OK' : 'FAILED'}`);

  if (results.google || results.poe) {
    console.log('\nAt least one provider is working. AI integration ready!');
  } else {
    console.log('\nWARN: No providers available. Check API keys.');
  }
}

main().catch(console.error);
