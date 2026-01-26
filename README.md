# Quantum X

AI-native quantitative trading system for crypto, stocks, and futures.

## Features

- **Data Pipeline**: Real-time market data via Binance REST/WebSocket
- **Feature Store**: 8 technical indicators with versioning and drift detection
- **Strategy Engine**: Momentum and Mean Reversion strategies with backtesting
- **Risk Management**: 4-layer risk control (Account/Strategy/Trade/System)
- **Paper Trading**: Simulated execution with slippage and commission modeling
- **Web Dashboard**: Next.js 15 with TradingView charts and real-time updates

## Quick Start

### Prerequisites

- Node.js >= 20.0.0
- npm >= 10.0.0

### Backend

```bash
cd backend
npm install
cp .env.example .env.local
# Edit .env.local with your Binance API keys (optional for testnet)
npm run dev
```

Backend runs on http://localhost:3001

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on http://localhost:3000

## Project Structure

```
quantum-x/
├── backend/                # TypeScript backend
│   └── src/
│       ├── api/           # REST API server (15 endpoints)
│       ├── data/          # Binance client, pipeline, storage
│       ├── execution/     # Order manager, paper trading
│       ├── features/      # Technical indicators, feature store
│       ├── research/      # Backtesting, model registry
│       ├── risk/          # Risk checker, monitor, audit
│       ├── strategy/      # Strategy implementations
│       └── types/         # TypeScript type definitions
│
├── frontend/              # Next.js 15 frontend
│   └── src/
│       ├── app/          # 8 pages (Overview, Strategies, Trading, etc.)
│       ├── components/   # UI components (shadcn/ui)
│       └── lib/          # API client, hooks, stores
│
└── doc/                   # Project documentation
    └── 00_project/initiative_quantum_x/
        ├── PRD.md                    # Product requirements
        ├── SYSTEM_ARCHITECTURE.md    # Architecture design
        ├── task_plan.md              # Task tracking
        └── MVP_VERIFICATION_REPORT.md # Verification results
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/health | Health check |
| GET | /api/portfolio/account | Account state |
| GET | /api/portfolio/positions | Open positions |
| GET | /api/portfolio/stats | Portfolio statistics |
| GET | /api/strategies | List strategies |
| GET | /api/strategies/:id | Get strategy details |
| PUT | /api/strategies/:id/status | Update strategy status |
| GET | /api/market/klines | OHLCV candlestick data |
| GET | /api/market/ticker | Current ticker |
| GET | /api/market/tickers | All tickers |
| GET | /api/risk/metrics | Risk metrics |
| GET | /api/risk/events | Risk events |

## Technology Stack

### Backend
- TypeScript 5.x
- Node.js built-in HTTP server
- Binance REST & WebSocket API
- Event-driven architecture

### Frontend
- Next.js 15 (App Router)
- React 19
- TanStack Query v5
- Zustand v5
- TradingView Lightweight Charts v5
- shadcn/ui + Tailwind CSS 4

## Risk Management

Four-layer risk control system:

1. **Account Level**: Max drawdown, daily/weekly loss limits, margin call
2. **Strategy Level**: Capital allocation, correlation limits, consecutive loss limits
3. **Trade Level**: Position sizing, stop-loss, slippage limits
4. **System Level**: Kill switches, circuit breakers

## Development

```bash
# Type check
cd backend && npm run typecheck
cd frontend && npx tsc --noEmit

# Build frontend
cd frontend && npm run build

# Run tests (when available)
cd backend && npm test
```

## Documentation

- [PRD](doc/00_project/initiative_quantum_x/PRD.md) - Product requirements
- [Architecture](doc/00_project/initiative_quantum_x/SYSTEM_ARCHITECTURE.md) - System design
- [Risk Config](doc/00_project/initiative_quantum_x/RISK_CAPITAL_CONFIG.md) - Risk parameters
- [Verification](doc/00_project/initiative_quantum_x/MVP_VERIFICATION_REPORT.md) - MVP verification

## License

Private - All rights reserved.

## Disclaimer

This software is for educational and research purposes only. Not financial advice. Trading cryptocurrencies and other financial instruments involves substantial risk of loss. Past performance does not guarantee future results.
