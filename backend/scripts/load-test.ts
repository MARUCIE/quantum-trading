/**
 * Load Test Script
 *
 * Simple load testing for Quantum X API endpoints.
 * Measures response times and throughput under concurrent load.
 *
 * Usage: npx ts-node scripts/load-test.ts [endpoint] [concurrency] [requests]
 */

const API_BASE = process.env.API_URL || 'http://localhost:3001';

interface LoadTestResult {
  endpoint: string;
  totalRequests: number;
  concurrency: number;
  successCount: number;
  errorCount: number;
  avgResponseTime: number;
  minResponseTime: number;
  maxResponseTime: number;
  p50ResponseTime: number;
  p95ResponseTime: number;
  p99ResponseTime: number;
  requestsPerSecond: number;
  totalDuration: number;
}

async function measureRequest(url: string): Promise<{ success: boolean; duration: number }> {
  const start = performance.now();
  try {
    const response = await fetch(url);
    const duration = performance.now() - start;
    return { success: response.ok, duration };
  } catch {
    const duration = performance.now() - start;
    return { success: false, duration };
  }
}

function percentile(arr: number[], p: number): number {
  const sorted = [...arr].sort((a, b) => a - b);
  const index = Math.ceil((p / 100) * sorted.length) - 1;
  return sorted[Math.max(0, index)];
}

async function runLoadTest(
  endpoint: string,
  concurrency: number,
  totalRequests: number
): Promise<LoadTestResult> {
  const url = `${API_BASE}${endpoint}`;
  console.log(`\nLoad testing: ${url}`);
  console.log(`Concurrency: ${concurrency}, Total requests: ${totalRequests}`);
  console.log('Running...\n');

  const results: { success: boolean; duration: number }[] = [];
  const startTime = performance.now();

  // Create batches based on concurrency
  const batches: Promise<{ success: boolean; duration: number }>[][] = [];
  for (let i = 0; i < totalRequests; i += concurrency) {
    const batchSize = Math.min(concurrency, totalRequests - i);
    const batch = Array(batchSize)
      .fill(null)
      .map(() => measureRequest(url));
    batches.push(batch);
  }

  // Execute batches sequentially (each batch runs concurrently)
  for (const batch of batches) {
    const batchResults = await Promise.all(batch);
    results.push(...batchResults);

    // Progress indicator
    const progress = ((results.length / totalRequests) * 100).toFixed(0);
    process.stdout.write(`\rProgress: ${progress}% (${results.length}/${totalRequests})`);
  }

  const totalDuration = performance.now() - startTime;
  console.log('\n');

  // Calculate statistics
  const successResults = results.filter((r) => r.success);
  const errorResults = results.filter((r) => !r.success);
  const durations = results.map((r) => r.duration);

  const avgResponseTime = durations.reduce((a, b) => a + b, 0) / durations.length;
  const minResponseTime = Math.min(...durations);
  const maxResponseTime = Math.max(...durations);

  return {
    endpoint,
    totalRequests,
    concurrency,
    successCount: successResults.length,
    errorCount: errorResults.length,
    avgResponseTime,
    minResponseTime,
    maxResponseTime,
    p50ResponseTime: percentile(durations, 50),
    p95ResponseTime: percentile(durations, 95),
    p99ResponseTime: percentile(durations, 99),
    requestsPerSecond: (totalRequests / totalDuration) * 1000,
    totalDuration,
  };
}

function printResults(result: LoadTestResult): void {
  console.log('='.repeat(50));
  console.log('LOAD TEST RESULTS');
  console.log('='.repeat(50));
  console.log(`Endpoint:          ${result.endpoint}`);
  console.log(`Concurrency:       ${result.concurrency}`);
  console.log(`Total Requests:    ${result.totalRequests}`);
  console.log('-'.repeat(50));
  console.log(`Success:           ${result.successCount} (${((result.successCount / result.totalRequests) * 100).toFixed(1)}%)`);
  console.log(`Errors:            ${result.errorCount}`);
  console.log('-'.repeat(50));
  console.log(`Avg Response:      ${result.avgResponseTime.toFixed(2)}ms`);
  console.log(`Min Response:      ${result.minResponseTime.toFixed(2)}ms`);
  console.log(`Max Response:      ${result.maxResponseTime.toFixed(2)}ms`);
  console.log(`P50 (Median):      ${result.p50ResponseTime.toFixed(2)}ms`);
  console.log(`P95:               ${result.p95ResponseTime.toFixed(2)}ms`);
  console.log(`P99:               ${result.p99ResponseTime.toFixed(2)}ms`);
  console.log('-'.repeat(50));
  console.log(`Throughput:        ${result.requestsPerSecond.toFixed(2)} req/s`);
  console.log(`Total Duration:    ${(result.totalDuration / 1000).toFixed(2)}s`);
  console.log('='.repeat(50));
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const endpoint = args[0] || '/api/health';
  const concurrency = parseInt(args[1] || '10', 10);
  const totalRequests = parseInt(args[2] || '100', 10);

  console.log('Quantum X Load Test');
  console.log(`API Base: ${API_BASE}`);

  try {
    // Quick connectivity check
    const checkResponse = await fetch(`${API_BASE}/api/health`);
    if (!checkResponse.ok) {
      console.error('ERROR: API not responding. Is the server running?');
      process.exit(1);
    }
    console.log('API connectivity: OK');
  } catch {
    console.error('ERROR: Cannot connect to API. Is the server running?');
    process.exit(1);
  }

  const result = await runLoadTest(endpoint, concurrency, totalRequests);
  printResults(result);

  // Performance thresholds check
  console.log('\nPERFORMANCE CHECK:');
  const p95Threshold = 500; // 500ms
  const errorRateThreshold = 1; // 1%

  const errorRate = (result.errorCount / result.totalRequests) * 100;

  if (result.p95ResponseTime <= p95Threshold) {
    console.log(`  P95 Response Time: PASS (${result.p95ResponseTime.toFixed(0)}ms <= ${p95Threshold}ms)`);
  } else {
    console.log(`  P95 Response Time: FAIL (${result.p95ResponseTime.toFixed(0)}ms > ${p95Threshold}ms)`);
  }

  if (errorRate <= errorRateThreshold) {
    console.log(`  Error Rate: PASS (${errorRate.toFixed(2)}% <= ${errorRateThreshold}%)`);
  } else {
    console.log(`  Error Rate: FAIL (${errorRate.toFixed(2)}% > ${errorRateThreshold}%)`);
  }
}

main().catch(console.error);
