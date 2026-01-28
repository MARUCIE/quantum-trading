# Quantum X Frontend

AI-native quantitative trading platform frontend built with Next.js 16, Tailwind CSS 4, and shadcn/ui.

## Features

- **Dashboard**: Real-time portfolio overview with key metrics
- **Strategies**: Strategy management and performance monitoring
- **Trading**: Order management and market data
- **Risk**: Multi-layer risk controls and monitoring
- **Backtest**: Historical strategy testing
- **Copy Trading**: Signal provider discovery and subscription
- **Alerts**: Custom alert rules and notifications

## Tech Stack

- **Framework**: Next.js 16 (App Router, Turbopack)
- **Styling**: Tailwind CSS 4 + shadcn/ui components
- **State**: Zustand (client) + TanStack Query (server)
- **Charts**: TradingView Lightweight Charts v5, Recharts (6 chart types)
- **Testing**: Vitest (unit) + Playwright (E2E)
- **Performance**: Web Vitals monitoring, lazy loading, virtualization

## Getting Started

### Prerequisites

- Node.js >= 20.19
- npm >= 10

### Installation

```bash
# Clone the repository
git clone <repo-url>
cd quantum-x/frontend

# Install dependencies
npm install

# Install Playwright browsers (for E2E tests)
npx playwright install
```

### Development

```bash
# Start development server
npm run dev

# Open http://localhost:3000
```

### Build

```bash
# Production build
npm run build

# Start production server
npm start
```

## UI/UX Component Library

### Design System (PDCA Round 1)

| Component | Description |
|-----------|-------------|
| `PageHeader` | Unified page header with icon, title, description, actions |
| `EmptyState` | Consistent empty state with sm/md/lg sizes |
| `DataCard` | Metric display card with trend indicators |
| `StatusIndicator` | Status badges with badge/dot/text variants |

### Interaction & Feedback (PDCA Round 2)

| Component | Description |
|-----------|-------------|
| `LoadingSpinner` | Multiple variants: spinner, dots, bars, pulse |
| `ErrorBoundary` | Error boundary with card/inline/banner displays |
| `ConfirmDialog` | Confirmation dialogs with danger/warning/info/success |
| `ProgressSteps` | Multi-step progress with horizontal/vertical layouts |
| `KeyboardShortcut` | Keyboard shortcut display and hooks |

### Accessibility & Performance (PDCA Round 3)

| Component | Description |
|-----------|-------------|
| `VisuallyHidden` | Screen reader content + live regions |
| `FocusTrap` | Focus management for modals with Tab/Escape |
| `LazyLoad` | Intersection Observer lazy loading |
| `VirtualizedList` | Windowed rendering for large datasets |
| `PerformanceMonitor` | Real-time Web Vitals + FPS + Memory |

### Chart Library (Phase 8)

| Component | Presets | Use Case |
|-----------|---------|----------|
| `CandlestickChart` | - | OHLC price data |
| `LineChart` | `EquityCurve`, `PerformanceComparison` | Time series, trends |
| `AreaChart` | `VolumeChart`, `AllocationTimeline`, `CumulativePnL` | Cumulative metrics |
| `BarChart` | `StrategyPnLChart`, `WinLossDistribution`, `MonthlyReturnsChart` | Comparisons |
| `PieChart` | `PortfolioAllocation`, `StrategyAllocation`, `WinRateGauge` | Proportions |
| `Heatmap` | `CorrelationMatrix`, `CalendarHeatmap` | Matrix data |

### React Hooks Library (Phase 9)

| Category | Hooks |
|----------|-------|
| **Debounce** | `useDebounce`, `useDebouncedCallback`, `useThrottledCallback` |
| **Storage** | `useLocalStorage`, `useSessionStorage` |
| **Responsive** | `useMediaQuery`, `useBreakpoint`, `useCurrentBreakpoint`, `useResponsiveValue` |
| **Timers** | `useInterval`, `useTimeout`, `useCountdown`, `useStopwatch`, `usePolling` |
| **Clipboard** | `useClipboard`, `useClipboardRead` |
| **Interaction** | `useClickOutside`, `useDismissable` |
| **Values** | `usePrevious`, `useHasChanged`, `useDelta`, `useDirection`, `useTrend` |

### Trading Components (Phase 10)

| Component | Variants | Use Case |
|-----------|----------|----------|
| `OrderForm` | `QuickOrderForm` | Order submission with market/limit/stop types |
| `PositionManager` | `PositionSummary` | Open position tracking with P&L |
| `OrderBook` | `HorizontalOrderBook`, `DepthChart` | Market depth and bid/ask display |
| `TradeHistory` | `RecentTrades`, `TradeStats` | Trade logs with filtering and pagination |

### Authentication Pages (Phase 11)

| Page | Features |
|------|----------|
| `/login` | Email/password login, social login (Google/GitHub), remember me |
| `/register` | Registration form with password strength indicator |
| `/forgot-password` | Password reset request with email verification |

### State Management (Phase 13)

| Store | Purpose | Key Features |
|-------|---------|--------------|
| `usePortfolioStore` | Portfolio state | Stats, holdings, P&L tracking |
| `useStrategyStore` | Strategy management | CRUD operations, status updates |
| `useTradingStore` | Trading operations | Orders, positions, order book, trades |
| `useAuthStore` | Authentication | Login/logout, session persistence, OAuth |

## Project Structure

```
frontend/
├── e2e/                    # Playwright E2E tests
├── public/                 # Static assets
├── src/
│   ├── app/               # Next.js App Router pages (50 routes)
│   │   ├── (auth)/        # Authentication pages (login, register)
│   │   ├── (dashboard)/   # Dashboard layout group
│   │   ├── strategies/    # Strategies page
│   │   ├── trading/       # Trading page
│   │   ├── risk/          # Risk management
│   │   ├── backtest/      # Backtest page
│   │   ├── copy/          # Copy trading
│   │   ├── settings/      # User settings
│   │   └── alerts/        # Alert management
│   ├── components/
│   │   ├── ui/            # Base UI components (40+ components)
│   │   ├── dashboard/     # Dashboard widgets
│   │   ├── layout/        # Layout components
│   │   ├── charts/        # Chart components (6 types, 15 presets)
│   │   └── trading/       # Trading components (orders, positions, orderbook)
│   ├── lib/
│   │   ├── api/           # API client and hooks
│   │   ├── hooks/         # Custom React hooks
│   │   └── utils.ts       # Utility functions
│   └── test/              # Test setup and utilities
├── vitest.config.ts       # Vitest configuration
├── playwright.config.ts   # Playwright configuration
└── next.config.ts         # Next.js configuration
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm test` | Run Vitest in watch mode |
| `npm run test:run` | Run Vitest once |
| `npm run test:coverage` | Run tests with coverage |
| `npm run test:e2e` | Run Playwright E2E tests |
| `npm run test:e2e:ui` | Run E2E tests with UI |
| `npm run test:e2e:headed` | Run E2E tests in headed mode |

## Environment Variables

Create a `.env.local` file:

```bash
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3001/api

# Feature Flags (optional)
NEXT_PUBLIC_ENABLE_ANALYTICS=false
```

## Performance Targets

Based on Google Core Web Vitals:

| Metric | Target | Description |
|--------|--------|-------------|
| LCP | < 2.5s | Largest Contentful Paint |
| CLS | < 0.1 | Cumulative Layout Shift |
| INP | < 200ms | Interaction to Next Paint |
| TTFB | < 800ms | Time to First Byte |

## Testing

### Unit Tests

```bash
# Run all unit tests
npm run test:run

# Run with coverage
npm run test:coverage

# Run in watch mode
npm test
```

### E2E Tests

```bash
# Run all E2E tests
npm run test:e2e

# Run with UI (interactive)
npm run test:e2e:ui

# Run in headed browser
npm run test:e2e:headed
```

## Theming

The application supports light and dark modes with smooth transitions.

- Theme toggle in header
- System preference detection
- Persistent preference storage
- CSS custom properties for colors

## Accessibility

- Skip to main content link
- Proper heading hierarchy
- ARIA labels on interactive elements
- Keyboard navigation support
- Focus visible indicators
- Screen reader friendly

## Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Docker

```bash
# Build image
docker build -t quantum-x-frontend .

# Run container
docker run -p 3000:3000 quantum-x-frontend
```

### Self-hosted

```bash
# Build
npm run build

# Start with PM2
pm2 start npm --name "quantum-x" -- start
```

## Contributing

1. Create a feature branch
2. Make changes
3. Run tests (`npm run test:run && npm run test:e2e`)
4. Submit a pull request

## License

Proprietary - All rights reserved
