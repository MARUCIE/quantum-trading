# Frontend Design - quantum_x

## Executive Summary

A world-class quantitative trading frontend delivering Bloomberg-level information density with TradingView-grade charting performance, built on modern React ecosystem.

## Technology Stack

### Core Framework
| Layer | Technology | Version | Rationale |
|-------|------------|---------|-----------|
| Framework | Next.js | 15.x | App Router, RSC, streaming SSR |
| Language | TypeScript | 5.x | Type safety, IDE support |
| Styling | Tailwind CSS | 4.x | Utility-first, CSS variables |
| Components | shadcn/ui | latest | Accessible, customizable, Radix-based |

### State Management
| Concern | Technology | Rationale |
|---------|------------|-----------|
| Client State | Zustand | Lightweight, minimal boilerplate |
| Server State | TanStack Query | Caching, background sync, pagination |
| Real-time | WebSocket (native) | Sub-100ms latency, auto-reconnect |

### Charting & Visualization
| Purpose | Technology | Rationale |
|---------|------------|-----------|
| Financial Charts | TradingView Lightweight Charts | SOTA performance, open-source |
| Data Visualization | Recharts / Tremor | shadcn-compatible, accessible |
| Flow Diagrams | React Flow | Strategy visualization |

### Performance Targets (Core Web Vitals)
| Metric | Target | Measurement |
|--------|--------|-------------|
| LCP (Largest Contentful Paint) | < 2.5s | Chrome DevTools |
| CLS (Cumulative Layout Shift) | < 0.1 | Lighthouse |
| FID (First Input Delay) | < 100ms | Web Vitals |
| TTFB (Time to First Byte) | < 600ms | Chrome DevTools |

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        Next.js App Router                        │
├─────────────────────────────────────────────────────────────────┤
│  app/                                                            │
│  ├── (auth)/          # Auth layout group                       │
│  │   ├── login/                                                  │
│  │   └── register/                                               │
│  ├── (dashboard)/     # Main dashboard layout                   │
│  │   ├── overview/    # Portfolio overview                      │
│  │   ├── strategies/  # Strategy management                     │
│  │   ├── backtest/    # Backtest results                        │
│  │   ├── trading/     # Live trading view                       │
│  │   ├── risk/        # Risk management                         │
│  │   └── settings/    # User settings                           │
│  ├── api/             # API routes (BFF)                        │
│  └── layout.tsx       # Root layout                             │
├─────────────────────────────────────────────────────────────────┤
│  components/                                                     │
│  ├── ui/              # shadcn/ui components                    │
│  ├── charts/          # TradingView chart wrappers              │
│  ├── trading/         # Trading-specific components             │
│  ├── layout/          # Layout components                       │
│  └── shared/          # Shared components                       │
├─────────────────────────────────────────────────────────────────┤
│  lib/                                                            │
│  ├── api/             # API client                              │
│  ├── ws/              # WebSocket client                        │
│  ├── stores/          # Zustand stores                          │
│  └── utils/           # Utility functions                       │
└─────────────────────────────────────────────────────────────────┘
```

## Page Structure

### 1. Overview Dashboard (`/overview`)
- **Purpose**: Portfolio summary, P&L, key metrics
- **Components**:
  - Portfolio value card (real-time)
  - P&L chart (daily/weekly/monthly)
  - Asset allocation pie chart
  - Recent trades table
  - Active strategies status

### 2. Strategy Management (`/strategies`)
- **Purpose**: Strategy lifecycle management
- **Components**:
  - Strategy list with status indicators
  - Strategy detail view
  - Performance metrics
  - Parameter configuration
  - Deployment controls

### 3. Backtest Results (`/backtest`)
- **Purpose**: Backtest analysis and comparison
- **Components**:
  - Equity curve chart
  - Drawdown chart
  - Trade distribution
  - Performance metrics table
  - Parameter sensitivity heatmap

### 4. Live Trading (`/trading`)
- **Purpose**: Real-time trading monitoring
- **Components**:
  - Multi-panel chart (TradingView)
  - Order book depth
  - Recent trades feed
  - Open orders table
  - Position manager

### 5. Risk Management (`/risk`)
- **Purpose**: Risk monitoring and alerts
- **Components**:
  - Risk metrics dashboard
  - VaR/CVaR gauges
  - Exposure breakdown
  - Alert configuration
  - Limit monitoring

## Component Design

### Chart Component (TradingView Lightweight Charts)
```typescript
// components/charts/CandlestickChart.tsx
interface CandlestickChartProps {
  symbol: string;
  timeframe: Timeframe;
  data?: OHLCV[];
  onCrosshairMove?: (param: MouseEventParams) => void;
}
```

### Real-time Data Flow
```
Backend API ──► TanStack Query (REST) ──► Components
    │
WebSocket ──► Zustand Store ──► Components (real-time updates)
```

### WebSocket Message Types
```typescript
type WSMessage =
  | { type: 'ticker'; data: Ticker }
  | { type: 'orderbook'; data: OrderBook }
  | { type: 'trade'; data: Trade }
  | { type: 'position'; data: Position }
  | { type: 'order_update'; data: Order }
  | { type: 'alert'; data: Alert };
```

## Design System

### Color Palette (Dark Theme Primary)
```css
/* Theme variables */
--background: 222.2 84% 4.9%;
--foreground: 210 40% 98%;
--card: 222.2 84% 4.9%;
--primary: 210 40% 98%;
--secondary: 217.2 32.6% 17.5%;
--accent: 217.2 32.6% 17.5%;
--destructive: 0 62.8% 30.6%;
--success: 142.1 76.2% 36.3%;
--warning: 47.9 95.8% 53.1%;

/* Trading-specific */
--profit: 142.1 76.2% 36.3%;  /* Green */
--loss: 0 62.8% 50%;          /* Red */
--neutral: 217.2 32.6% 50%;   /* Gray */
```

### Typography
- **Headlines**: Inter, 600-700 weight
- **Body**: Inter, 400-500 weight
- **Monospace**: JetBrains Mono (prices, data)

### Spacing System
- Base unit: 4px
- Scale: 4, 8, 12, 16, 20, 24, 32, 40, 48, 64

## Performance Optimization

### 1. Code Splitting
- Route-based splitting (Next.js automatic)
- Component lazy loading for heavy charts
- Dynamic imports for non-critical features

### 2. Data Fetching
- SSR for initial data
- Client-side revalidation
- Optimistic updates for user actions
- WebSocket for real-time data (no polling)

### 3. Rendering Optimization
- React.memo for expensive components
- useMemo/useCallback for computed values
- Virtual scrolling for large lists
- Canvas rendering for charts (not SVG)

### 4. Asset Optimization
- Next.js Image optimization
- Font subsetting
- SVG sprites for icons
- Preload critical resources

## Security Considerations

- API keys never exposed to client
- HTTPS only, secure WebSocket (wss://)
- CSRF protection
- Rate limiting
- Input validation (Zod schemas)

## Browser Support

| Browser | Version |
|---------|---------|
| Chrome | 90+ |
| Firefox | 88+ |
| Safari | 14+ |
| Edge | 90+ |

## Dependencies

```json
{
  "dependencies": {
    "next": "^15.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "typescript": "^5.0.0",
    "tailwindcss": "^4.0.0",
    "lightweight-charts": "^4.0.0",
    "@tanstack/react-query": "^5.0.0",
    "zustand": "^5.0.0",
    "zod": "^3.0.0",
    "lucide-react": "latest",
    "recharts": "^2.0.0",
    "date-fns": "^3.0.0"
  }
}
```

## Milestones

| Phase | Scope | Status |
|-------|-------|--------|
| M1 | Project setup, layout, navigation | Pending |
| M2 | Overview dashboard with mock data | Pending |
| M3 | Charting integration (TradingView) | Pending |
| M4 | Strategy management pages | Pending |
| M5 | Real-time WebSocket integration | Pending |
| M6 | Risk management dashboard | Pending |
| M7 | Performance optimization | Pending |
| M8 | E2E testing and polish | Pending |
