# Research Notes: UX Testing & Optimization

> Evidence and research notes for UX testing task

## Session: 2025-01-27

### Pre-test Analysis

#### Current State Summary
- Multi-asset support implemented (Crypto/Stocks/Futures/Options)
- i18n support (Chinese/English)
- Dark/Light theme support
- Pages updated: Dashboard, Trading, Signals, Scanner, Watchlist

#### Key Files for UX
- `src/app/page.tsx` - Dashboard
- `src/app/trading/page.tsx` - Trading
- `src/app/signals/page.tsx` - Signals
- `src/components/layout/` - Layout components
- `src/components/ui/` - UI components

### Testing Evidence

#### Round 1: Homepage Testing (2025-01-27)

**Performance Metrics (Chrome DevTools via Playwright):**
```
TTFB: 149.70ms - 210.10ms (good)
FCP:  688.00ms - 920.00ms (good)
LCP:  688.00ms (good, target <2.5s)
CLS:  0.01 (good, target <0.1)
INP:  400.00ms (needs-improvement, target <200ms)
```

**Console Errors Observed:**
```
[ERROR] Access to fetch at 'http://localhost:3001/api/portfolio/stats' - CORS
[ERROR] Access to fetch at 'http://localhost:3001/api/strategies' - CORS
[ERROR] Access to fetch at 'http://localhost:3001/api/market/klines?symbol=BTCUSDT' - CORS
[ERROR] Access to fetch at 'http://localhost:3001/api/market/trades?symbol=BTCUSDT' - CORS
```
Root Cause: Backend API server (localhost:3001) not running or CORS not configured.

**Asset Class Switching Test:**
| From | To | Positions Updated | Chart Symbol | Asset Allocation | Result |
|------|-----|-------------------|--------------|------------------|--------|
| Stocks | Crypto | AAPL,NVDA,TSLA,MSFT -> BTC,ETH,SOL | AAPL -> BTC/USDT | Updated correctly | PASS |
| Crypto | Stocks | BTC,ETH,SOL -> AAPL,NVDA,TSLA,MSFT | BTC/USDT -> AAPL | Updated correctly | PASS |

**Theme Switching Test:**
| Theme | Applied | UI Contrast | Navigation | Cards | Result |
|-------|---------|-------------|------------|-------|--------|
| Light | Yes | Good | Visible | Clear borders | PASS |
| Dark | Yes | Good | Visible | Dark backgrounds | PASS |
| System | Yes | Follows OS | N/A | N/A | PASS |

**i18n Test:**
| Language | Navigation | Dashboard | Cards | Empty States | Result |
|----------|------------|-----------|-------|--------------|--------|
| Chinese | 概览,策略,回测... | 仪表盘 | 总资产价值,今日盈亏 | 暂无行情数据 | PASS |
| English | Overview,Strategies,Backtest... | Dashboard | Total Portfolio Value,Today's P&L | No market data | PASS |

**Screenshots:**
1. `homepage-round1-initial.png` - Full page, light theme, Chinese, stocks
2. `homepage-dark-theme.png` - Viewport, dark theme, Chinese, crypto
3. `homepage-english-dark.png` - Viewport, dark theme, English, crypto

---

## Pain Point Analysis

### Identified Issues

<!-- Issues will be documented here -->

---

## Fix Verification

<!-- Fix verification evidence -->
