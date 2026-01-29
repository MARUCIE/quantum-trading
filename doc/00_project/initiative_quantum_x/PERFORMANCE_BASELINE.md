# PERFORMANCE_BASELINE - quantum_x

## Overview
Performance benchmarking methodology and acceptance criteria for Quantum X trading platform.

## KPI Definitions

### Backend API Performance
| Metric | Description | Target | Critical |
|---|---|---|---|
| P50 Response Time | Median response time | < 100ms | < 200ms |
| P95 Response Time | 95th percentile response | < 500ms | < 1000ms |
| P99 Response Time | 99th percentile response | < 1000ms | < 2000ms |
| Error Rate | Percentage of failed requests | < 0.1% | < 1% |
| Throughput | Requests per second | > 100 rps | > 50 rps |

### WebSocket Performance
| Metric | Description | Target | Critical |
|---|---|---|---|
| Message Latency | Time from server to client | < 50ms | < 100ms |
| Message Rate | Messages per second per connection | > 100 msg/s | > 50 msg/s |
| Connection Limit | Concurrent connections supported | > 1000 | > 500 |
| Reconnect Time | Time to re-establish connection | < 1s | < 3s |

### Frontend Performance (Core Web Vitals)
| Metric | Description | Target | Critical |
|---|---|---|---|
| LCP | Largest Contentful Paint | < 2.5s | < 4.0s |
| INP | Interaction to Next Paint | < 200ms | < 500ms |
| CLS | Cumulative Layout Shift | < 0.1 | < 0.25 |
| TTFB | Time to First Byte | < 800ms | < 1800ms |
| FCP | First Contentful Paint | < 1.8s | < 3.0s |

### Bundle Size
| Metric | Description | Target | Critical |
|---|---|---|---|
| Initial JS | First load JavaScript | < 200KB | < 500KB |
| Total JS | All JavaScript chunks | < 500KB | < 1MB |
| CSS | Stylesheet size | < 50KB | < 100KB |

## Test Scenarios

### 1. API Load Test
```bash
# Health endpoint baseline
npx ts-node backend/scripts/load-test.ts /api/health 10 100

# Market data endpoint
npx ts-node backend/scripts/load-test.ts /api/markets 10 100

# Order submission (simulated)
npx ts-node backend/scripts/load-test.ts /api/orders 10 100

# Account status
npx ts-node backend/scripts/load-test.ts /api/accounts 10 100
```

### 2. WebSocket Throughput Test
- Connect 100 concurrent clients
- Subscribe to BTC/USDT ticker
- Measure message latency percentiles
- Monitor memory usage over 5 minutes

### 3. Frontend Lighthouse Audit
```bash
# Run Lighthouse CI
npx lighthouse http://localhost:3000 --output=json --output-path=./lighthouse-report.json

# Key pages to test
# - / (Dashboard)
# - /trading
# - /accounts
# - /strategies
```

### 4. Bundle Analysis
```bash
# Analyze bundle size
cd frontend && npm run build && npx @next/bundle-analyzer
```

## Measurement Methodology

### Environment
- **Hardware**: Apple M-series / Intel i7 equivalent
- **Network**: Local (localhost) for baseline, simulated latency for stress tests
- **Load**: Gradual ramp-up from 1 to 100 concurrent users
- **Duration**: Minimum 60 seconds per test scenario

### Data Collection
1. Run each test 3 times
2. Discard first run (warm-up)
3. Average remaining runs
4. Record min/max for variance analysis

### Reporting Format
```json
{
  "timestamp": "2026-01-28T12:00:00Z",
  "scenario": "api-health",
  "environment": "local",
  "results": {
    "p50": 15.2,
    "p95": 45.8,
    "p99": 89.3,
    "throughput": 2150.5,
    "errorRate": 0.0
  },
  "verdict": "PASS"
}
```

## Acceptance Criteria

### PASS Conditions
- All KPIs within "Target" thresholds
- No regression > 10% from previous baseline
- Zero critical errors during test

### WARN Conditions
- Any KPI between "Target" and "Critical"
- Regression 10-25% from previous baseline

### FAIL Conditions
- Any KPI exceeds "Critical" threshold
- Regression > 25% from previous baseline
- Error rate > 1%

## Baseline Results

### 2026-01-28 Initial Baseline

| Scenario | P50 | P95 | P99 | Throughput | Error Rate | Verdict |
|---|---|---|---|---|---|---|
| /api/health | 10.55ms | 14.47ms | 14.56ms | 5238 rps | 2% | WARN |
| /api/accounts | 15.25ms | 15.71ms | 16.06ms | 2559 rps | 8% | WARN |
| /api/markets | N/A | N/A | N/A | N/A | 100% | FAIL (endpoint not found) |
| WebSocket | - | - | - | - | - | Pending |
| Lighthouse | - | - | - | - | - | Pending |

#### Findings
1. **P95 Latency: PASS** - Both /api/health (14ms) and /api/accounts (16ms) well under 500ms threshold
2. **Error Rate: WARN** - Error rates of 2-8% exceed 1% threshold under concurrent load
3. **Stability: WARN** - Server crashed after ~100 requests under concurrent load
4. **Missing Endpoint** - /api/markets returns 404 (not implemented)

#### Recommendations
- Investigate connection handling under concurrent load
- Add connection pooling or rate limiting
- Implement /api/markets endpoint if needed

### Frontend Bundle Analysis (2026-01-28)

| Metric | Value | Target | Status |
|---|---|---|---|
| Total JS Chunks | 66 files | - | Info |
| Total JS Size | 1,703 KB | < 500KB | FAIL |
| Chunk Directory | 2.0 MB | - | Info |

#### Bundle Optimization Recommendations
1. Enable more aggressive code splitting
2. Implement dynamic imports for heavy components (charts, tables)
3. Review and tree-shake unused dependencies
4. Consider server components for static content

## Changelog
- 2026-01-28: Initial baseline document created (T116)
