---
Title: Task Plan - initiative_quantum_x
Scope: project
Owner: ai-agent
Status: active
LastUpdated: 2026-01-28
Related:
  - /doc/00_project/initiative_quantum_x/PRD.md
  - /doc/00_project/initiative_quantum_x/SYSTEM_ARCHITECTURE.md
  - /doc/00_project/initiative_quantum_x/USER_EXPERIENCE_MAP.md
  - /doc/00_project/initiative_quantum_x/PLATFORM_OPTIMIZATION_PLAN.md
  - /doc/00_project/initiative_quantum_x/notes.md
  - /doc/00_project/initiative_quantum_x/deliverable.md
---

# Objective
- AI-native quantitative trading system (stocks, futures, crypto) with SOTA strategy system and copy-trading roadmap
- Add account modes (simulated vs real) with safe separation and customer-owned account linking

# Non-goals
- Investment advice or guaranteed performance
- Unauthorized live trading connectivity or custody

# Work Breakdown (WBS)
| ID | Task | Owner | Dependencies | Risk | Done Definition | Status |
|---|---|---|---|---|---|---|
| T1 | Doc scaffold and PDCA baseline | ai-agent | none | low | all required docs exist | Done |
| T2 | OSS landscape research | ai-agent | T1 | low | notes.md contains evidence | Done |
| T3 | Architecture + UX map | ai-agent | T2 | medium | SYSTEM_ARCHITECTURE/USER_EXPERIENCE_MAP updated | Done |
| T4 | PRD + roadmap + optimization | ai-agent | T2 | medium | PRD/ROADMAP/OPT plan complete | Done |
| T5 | Strategy system definition | ai-agent | T3 | high | strategy pipeline documented | Done |
| T6 | Copy-trading design | ai-agent | T3 | high | signal/replication spec ready | Done |
| T7 | Feature docs: data_platform | ai-agent | T2 | medium | design doc exists | Done |
| T8 | Feature docs: execution_risk | ai-agent | T2 | medium | design doc exists | Done |
| T9 | Feature docs: strategy_system | ai-agent | T3 | high | design doc exists | Done |
| T10 | Feature docs: copy_trading | ai-agent | T3 | high | design doc exists | Done |
| T11 | Component docs: core modules | ai-agent | T3 | medium | component docs exist | Done |
| T12 | MVP implementation plan and decision gates | ai-agent | T4 | medium | roadmap updated | Done |
| T13 | MVP PoC plan | ai-agent | T12 | medium | MVP_POC_PLAN.md exists | Done |
| T14 | MVP implementation backlog | ai-agent | T13 | medium | MVP_IMPLEMENTATION_BACKLOG.md exists | Done |
| T15 | Canonical contracts spec | ai-agent | T3 | medium | contracts/design.md exists | Done |
| T16 | MVP milestones & verification | ai-agent | T14 | medium | milestone/verification docs exist | Done |
| T17 | API config guide & defaults | ai-agent | T16 | medium | API/DEFAULT docs exist | Done |
| T18 | Venue adapter component | ai-agent | T3 | medium | venue_adapter docs exist | Done |
| T19 | Frontend SOTA research | ai-agent | T3 | medium | notes.md contains frontend research | Done |
| T20 | Frontend architecture design | ai-agent | T19 | medium | frontend design doc exists | Done |
| T21 | Frontend MVP implementation | ai-agent | T20 | high | Next.js app builds successfully | Done |
| T22 | Frontend pages: Overview, Strategies, Trading, Risk | ai-agent | T21 | high | all core pages implemented | Done |
| T23 | Frontend pages: Backtest, Copy, Settings, Alerts | ai-agent | T21 | medium | all secondary pages implemented | Done |
| T24 | Asset class & compliance scope | ai-agent | T23 | low | decision doc exists | Done |
| T25 | Select data vendors | ai-agent | T24 | medium | data sources configured | Done |
| T26 | Risk limits & capital allocation | ai-agent | T24 | medium | risk parameters defined | Done |
| T27 | E1 Data Baseline implementation | ai-agent | T25 | high | data pipeline working | Done |
| T28 | E2 Feature Store implementation | ai-agent | T27 | high | feature versioning working | Done |
| T29 | E3 Research Pipeline implementation | ai-agent | T28 | high | experiments reproducible | Done |
| T30 | E4 Strategy MVP implementation | ai-agent | T29 | high | baseline strategy passing gates | Done |
| T31 | E5 Execution Parity implementation | ai-agent | T30,T26 | high | paper trading working | Done |
| T32 | E6 Risk & Monitoring implementation | ai-agent | T31 | high | risk controls auditable | Done |
| T33 | E7 Venue Adapter implementation | ai-agent | T25 | medium | exchange API connected | Done |
| T34 | Frontend API integration | ai-agent | T32,T33 | high | frontend connected to backend | Done |
| T35 | MVP end-to-end verification | ai-agent | T34 | high | all gates passing | Done |
| T36 | UI/UX: Dark/Light theme support | ai-agent | T35 | medium | theme toggle working, smooth transitions | Done |
| T37 | UI/UX: Responsive design | ai-agent | T36 | medium | mobile nav drawer, responsive header | Done |
| T38 | UI/UX: Loading states | ai-agent | T37 | medium | skeleton components for all dashboard elements | Done |
| T39 | UI/UX: Micro-interactions | ai-agent | T38 | low | hover effects, animations, tooltips | Done |
| T40 | UI/UX: Accessibility (a11y) | ai-agent | T39 | medium | keyboard navigation, ARIA labels | Done |
| T41 | UI/UX: Form validation | ai-agent | T40 | medium | input states, error handling | Done |
| T42 | Performance optimization | ai-agent | T41 | medium | code splitting, lazy loading | Done |
| T43 | Testing: Unit tests for core utilities | ai-agent | T42 | medium | Jest/Vitest tests for hooks/utils | Done |
| T44 | Testing: E2E tests with Playwright | ai-agent | T43 | medium | critical user flows tested | Done |
| T45 | Documentation: README and deployment guide | ai-agent | T42 | low | deployment instructions complete | Done |
| T46 | CI/CD: GitHub Actions workflow | ai-agent | T44 | medium | automated build/test/deploy | Done |
| T47 | Docker: Containerization | ai-agent | T45 | medium | Dockerfile and docker-compose | Done |
| T48 | Backend Dockerfile | ai-agent | T47 | low | backend containerized | Done |
| T49 | Environment configuration | ai-agent | T48 | low | .env.example complete | Done |
| T50 | Backend unit tests | ai-agent | T49 | medium | core modules tested | Done |
| T51 | API documentation | ai-agent | T50 | medium | OpenAPI spec exists | Done |
| T52 | Security hardening | ai-agent | T51 | high | rate limiting, input validation | Done |
| T53 | WebSocket server implementation | ai-agent | T52 | medium | real-time data broadcast | Done |
| T54 | Frontend WebSocket client | ai-agent | T53 | medium | live price updates | Done |
| T55 | Real-time trading page | ai-agent | T54 | medium | live order book, trades | Done |
| T56 | Toast notification system | ai-agent | T54 | low | event alerts, trade confirmations | Done |
| T57 | WebSocket integration tests | ai-agent | T55 | medium | E2E real-time tests | Done |
| T58 | Order book WebSocket subscription | ai-agent | T57 | medium | live bid/ask depth updates | Done |
| T59 | Binance testnet integration | ai-agent | T58 | high | real API data flowing | Done |
| T60 | Performance load testing | ai-agent | T59 | medium | benchmarks documented | Done |
| T61 | Deployment scripts | ai-agent | T60 | medium | one-click deploy ready | Done |
| T62 | Health check endpoints | ai-agent | T61 | low | /health and /ready routes | Done |
| T63 | Prometheus metrics export | ai-agent | T62 | medium | /metrics endpoint with key metrics | Done |
| T64 | Audit log viewer UI | ai-agent | T32 | medium | searchable audit records in frontend | Done |
| T65 | Backtest engine UI | ai-agent | T35 | high | visual backtest results | Done |
| T66 | API key management UI | ai-agent | T52 | high | create/revoke/permissions | Done |
| T67 | API key authentication middleware | ai-agent | T66 | high | requests validated with API keys | Done |
| T68 | Grafana dashboard template | ai-agent | T63 | medium | JSON dashboard for Prometheus metrics | Done |
| T69 | Alert rules configuration | ai-agent | T68 | medium | alerting rules for key metrics | Done |
| T70 | Strategy parameter optimizer UI | ai-agent | T65 | high | grid search / parameter tuning interface | Done |
| T71 | Multi-timeframe analysis UI | ai-agent | T70 | medium | MTF chart with synchronized timeframes | Done |
| T72 | Portfolio allocation optimizer | ai-agent | T70 | high | risk budget allocation across strategies | Done |
| T73 | Trade journal UI | ai-agent | T72 | medium | trade logging with notes, tags, screenshots | Done |
| T74 | Correlation matrix visualization | ai-agent | T72 | medium | asset correlation heatmap | Done |
| T75 | Position sizing calculator | ai-agent | T72 | medium | Kelly criterion, fixed fractional methods | Done |
| T76 | Strategy comparison view | ai-agent | T65 | medium | side-by-side backtest comparison | Done |
| T77 | Order book depth chart | ai-agent | T58 | medium | visual bid/ask depth visualization | Done |
| T78 | PnL calendar view | ai-agent | T73 | low | calendar heatmap of daily/monthly PnL | Done |
| T79 | Signal dashboard | ai-agent | T78 | medium | consolidated view of all strategy signals | Done |
| T80 | Market scanner | ai-agent | T78 | medium | scan for opportunities across assets | Done |
| T81 | Watchlist management | ai-agent | T78 | low | custom watchlists with price alerts | Done |
| T82 | Economic calendar | ai-agent | T78 | low | market-moving events calendar | Done |
| T83 | Performance attribution | ai-agent | T72 | high | return attribution by factor/strategy | Done |
| T84 | Trade replay | ai-agent | T73 | medium | replay historical trades for learning | Done |
| T85 | ML model dashboard | ai-agent | T84 | high | model training/evaluation/deployment UI | Done |
| T86 | Feature importance analyzer | ai-agent | T85 | high | SHAP/feature contribution visualization | Done |
| T87 | Strategy generator UI | ai-agent | T85 | high | AI-assisted strategy creation wizard | Done |
| T88 | Model backtester | ai-agent | T85 | high | ML model walk-forward validation | Done |
| T89 | Multi-exchange connector | ai-agent | T59 | high | unified API for Binance/OKX/Bybit | Done |
| T90 | Exchange comparison view | ai-agent | T89 | medium | cross-exchange price/liquidity comparison | Done |
| T91 | Smart order routing | ai-agent | T89 | high | best execution across venues | Done |
| T92 | Arbitrage scanner | ai-agent | T90 | high | cross-exchange arbitrage opportunities | Done |
| T93 | Production config management | ai-agent | T61 | medium | environment-specific configurations | Done |
| T94 | SSL/TLS setup guide | ai-agent | T93 | medium | HTTPS configuration with Let's Encrypt | Done |
| T95 | CDN integration | ai-agent | T93 | medium | Cloudflare/Vercel edge caching | Done |
| T96 | Production monitoring dashboard | ai-agent | T68 | high | unified ops view with alerts | Done |
| T97 | Notification center | ai-agent | T96 | medium | real-time notifications with preferences | Done |
| T98 | User preferences | ai-agent | T97 | medium | customizable settings and themes | Done |
| T99 | Dashboard builder | ai-agent | T98 | high | drag-drop widget customization | Done |
| T100 | Portfolio analytics | ai-agent | T72 | high | comprehensive portfolio analysis | Done |
| T101 | Trade statistics | ai-agent | T73 | medium | detailed trade performance metrics | Done |
| T102 | Leaderboard | ai-agent | T44 | medium | trader rankings and social features | Done |
| T103 | Strategy marketplace | ai-agent | T102 | high | share/subscribe to strategies | Done |
| T104 | Mobile dashboard | ai-agent | T37 | medium | mobile-optimized trading view | Done |
| T105 | Account modes requirements + PDCA doc alignment | ai-agent | none | high | PRD/Arch/UX/Opt plan updated and consistent | Done |
| T106 | Account model + environment separation | ai-agent | T105 | high | backend account entities and mode guards | Done |
| T107 | Account API (link/switch/status) | ai-agent | T106 | high | REST endpoints and error codes documented | Done |
| T108 | Execution gating for sim/real | ai-agent | T106 | high | strategy execution cannot cross environments | Done |
| T109 | Frontend account switcher + onboarding | ai-agent | T107 | high | UI for sim/real account selection and status | Done |
| T110 | Risk/audit for real accounts | ai-agent | T108 | high | audit logs + risk checks for real trading | Done |
| T111 | E2E tests for account flows | ai-agent | T109 | medium | Playwright flows cover sim/real switch | Done |
| T112 | Delivery SOP + verification | ai-agent | T111 | medium | ai check + UX map simulation evidence | Done |
| T113 | Sidebar navigation optimization | ai-agent | T37 | medium | collapsible groups, reduced density, touch-friendly | Done |
| T114 | UI/UX composition/hierarchy audit | ai-agent | T113 | medium | apply ui-skills, web-interface-guidelines | Done |
| T115 | UI/UX SOP accounts page alignment + evidence | ai-agent | T114 | low | spacing baseline + single primary action verified | Done |
| T116 | Network check + market fallback | ai-agent | T115 | medium | no 4xx/5xx on UI routes and market endpoints | Done |
| T116 | Performance baseline definition | ai-agent | T60 | medium | define KPIs, thresholds, and measurement methodology | Done |
| T117 | Backend load testing | ai-agent | T116 | high | API endpoint stress test with k6/artillery | Done |
| T118 | WebSocket throughput benchmark | ai-agent | T116 | high | message rate, latency percentiles, connection limits | Done |
| T119 | Frontend performance audit | ai-agent | T116 | medium | Lighthouse, Core Web Vitals, bundle analysis | Done |
| T120 | Performance report + optimization | ai-agent | T117,T118,T119 | high | bottleneck analysis, fixes, final benchmarks | Done |
| T121 | Lazy load chart components | ai-agent | T120 | high | dynamic import CandlestickChart, Recharts | Done |
| T122 | Code-split heavy pages | ai-agent | T121 | high | dynamic import trading/ml components | Done |
| T123 | Optimize icon bundling | ai-agent | T121 | medium | selective lucide-react imports | Done |
| T124 | Add preload hints | ai-agent | T122 | medium | preload critical CSS/fonts | Done |
| T125 | Performance verification | ai-agent | T124 | high | re-run Lighthouse, verify LCP < 2.5s | Done |
| T126 | Streaming SSR with Suspense | ai-agent | T125 | high | add Suspense boundaries for progressive loading | Done |
| T127 | Critical CSS optimization | ai-agent | T126 | medium | inline critical CSS, defer non-critical | Done |
| T128 | Image optimization | ai-agent | T126 | medium | convert to next/image, add lazy loading | Done |
| T129 | Font preload optimization | ai-agent | T127 | low | preload fonts, optimize loading strategy | Done |
| T130 | Final performance verification | ai-agent | T129 | high | verify LCP < 2.5s, Performance > 80 | Done |
| T131 | UI/UX SOP - Planning & Tool Inventory | ai-agent | T130 | high | init planning-with-files, skill/MCP inventory | Done |
| T132 | ui-skills/web-interface-guidelines audit | ai-agent | T131 | high | audit 47 pages for composition/hierarchy/emphasis/rhythm | Done |
| T133 | Fix spacing and hierarchy issues | ai-agent | T132 | high | fix double padding on 30 pages, verify button hierarchy | Done |
| T134 | Frontend verification | ai-agent | T133 | high | build + unit tests + E2E (94/94 pass) | Done |
| T135 | Update PDCA docs | ai-agent | T134 | medium | update notes.md, task_plan.md, UX Map SOP reference | Done |

# Milestones
- M1: Docs baseline complete (PDCA + PRD + architecture + UX)
- M2: Strategy system definition complete
- M3: Copy-trading capability defined
- M4: Feature-level design docs complete
- M5: Component-level design docs complete
- M6: MVP implementation plan defined
- M7: MVP PoC plan complete
- M8: MVP implementation backlog complete
- M9: Canonical contracts defined
- M10: MVP milestones and verification defined
- M11: API config and venue adapter defined
- M12: Frontend MVP implementation complete (8 pages, TradingView charts, dark theme)
- M13: Backend Epic implementation complete (E1-E7: Data, Features, Research, Strategy, Execution, Risk, Venue)
- M14: Frontend-Backend API integration complete
- M15: MVP end-to-end verification passed
- M16: UI/UX polish complete (theme, responsive, loading, animations, a11y)
- M17: Production readiness (performance, testing, deployment)
- M18: Production hardening (backend tests, API docs, security)
- M19: Real-time capabilities (WebSocket, live updates, notifications)
- M20: Production deployment ready (deployment scripts, health checks)
- M21: Phase 5.1 complete (Prometheus metrics, Audit viewer, Backtest engine UI, API key management)
- M22: Phase 5.2 complete (API key auth middleware, Grafana dashboard, Alert rules, Parameter optimizer UI)
- M23: Phase 5.3 complete (Multi-timeframe analysis UI, Portfolio allocation optimizer)
- M24: Phase 5.4 complete (Trade journal, Correlation matrix, Position sizing, Strategy comparison, Order book depth, PnL calendar)
- M25: Phase 5.5 complete (Signal dashboard, Market scanner, Watchlist management, Economic calendar, Performance attribution, Trade replay)
- M26: Phase 6.1 complete (ML model dashboard, Feature importance analyzer, Strategy generator, Model backtester)
- M27: Phase 6.2 complete (Multi-exchange connector, Exchange comparison, Smart order routing, Arbitrage scanner)
- M28: Phase 6.3 complete (Production config, SSL/TLS, CDN, Monitoring dashboard)
- M29: Phase 7 complete (Notification center, User preferences, Dashboard builder, Portfolio analytics, Trade statistics, Leaderboard, Strategy marketplace, Mobile dashboard)
- M30: Account modes (sim/real) and real account linking complete
- M31: UI/UX optimization SOP complete (double padding fix, 94/94 E2E tests pass)

# Risks & Mitigations
- R1: Overfitting and backtest bias / mitigation: robust validation and walk-forward
- R2: Execution mismatch / mitigation: single execution interface for backtest/live
- R3: Compliance constraints / mitigation: environment separation and audit logs
- R4: Real account integration risk / mitigation: explicit user consent, scoped permissions, audit + kill switch

# Decisions
- D1: Use multi-layer architecture (data, research, strategy, execution, ops)
- D2: Treat OSS repos as references, not mandatory dependencies
- D3: Prefer NautilusTrader + Qlib as core reference stack
- D4: Use Next.js 15 + Tailwind CSS 4 + shadcn/ui as frontend stack
- D5: Use TradingView Lightweight Charts v5 for financial charting
- D6: Use Zustand for client state, TanStack Query for server state
- D7: Target performance: LCP <2.5s, CLS <0.1, FID <100ms
- D8: Enforce strict separation between simulated and real account execution paths

# Next Steps
- Integration testing with real Binance testnet
- Performance benchmarking under load
- Security audit and penetration testing
- Implement order book WebSocket subscription (T55 enhancement)
- Production deployment preparation
- Define account mode flows and API contracts for sim/real separation
- Implement real account execution adapters for Binance/OKX/Bybit

## Changelog
- 2026-01-24: initialized. (reason: planning-with-files)
- 2026-01-24: updated scope and structure for initiative_quantum_x.
- 2026-01-24: completed planning phase and recorded 3 PDCA rounds.
- 2026-01-24: added feature-level design docs.
- 2026-01-25: added component-level design docs and engineering protocol injection.
- 2026-01-25: added MVP plan and decision gates.
- 2026-01-25: added MVP PoC plan.
- 2026-01-25: added MVP implementation backlog.
- 2026-01-25: added contracts specification.
- 2026-01-25: added MVP milestones and verification plans.
- 2026-01-25: added API config guide, default scope, and venue adapter component.
- 2026-01-26: completed frontend SOTA research (TradingView, Bloomberg, Binance patterns).
- 2026-01-26: completed frontend architecture design and MVP implementation.
- 2026-01-26: implemented 8 pages: Overview, Strategies, Trading, Risk, Backtest, Copy, Settings, Alerts.
- 2026-01-26: completed T24-T35 (Asset/Compliance scope, Data vendors, Risk config, E1-E7 implementation, API integration, E2E verification).
- 2026-01-26: MVP implementation complete. All 35 tasks done.
- 2026-01-26: Added UI/UX optimization tasks (T36-T42). Completed T36-T39 (theme, responsive, loading, animations).
- 2026-01-28: Added account modes initiative (sim/real) with WBS and risk updates.
- 2026-01-26: Completed T40 (a11y) and T41 (form validation) with useFormValidation hook.
- 2026-01-26: Completed T42 (performance): next.config optimizations, lazy loading, Web Vitals monitoring, prefetch utilities.
- 2026-01-26: Completed T43-T47 (production readiness): unit tests, E2E tests, README, CI/CD, Docker.
- 2026-01-26: Added Phase 2 tasks (T48-T52). Completed T48-T49 (backend Dockerfile, env config).
- 2026-01-26: Completed Phase 2 (T48-T52): backend Docker, env config, 88 unit tests, OpenAPI docs, security middleware.
- 2026-01-26: Completed Phase 3 (T53-T57): WebSocket server, frontend WS client, real-time trading page, toast notifications, WS integration tests. All 63 frontend tests passing.
- 2026-01-26: Completed Phase 4 (T58-T62): Order book WS subscription, Binance testnet config, load testing script, deployment scripts, health check endpoints. M20 complete.
- 2026-01-26: Started Phase 5.1: T63 Prometheus metrics (HTTP/WS metrics, /metrics endpoint), T64 Audit log viewer UI (searchable, exportable, integrity check).
- 2026-01-26: Completed T65 Backtest engine UI (config panel, API integration, trade list, monthly returns heatmap, performance metrics).
- 2026-01-26: Completed T66 API key management UI (create/revoke/toggle, permission groups, secure key display, usage tracking). Phase 5.1 complete. M21 reached.
- 2026-01-26: Completed Phase 5.2 (T67-T70): API key auth middleware (23 tests), Grafana dashboard template, Prometheus alert rules, Strategy parameter optimizer UI. M22 reached.
- 2026-01-26: Completed Phase 5.3 (T71-T72): Multi-timeframe analysis UI (6 timeframes, trend signals, focus mode), Portfolio allocation optimizer (5 methods: Equal Weight, Risk Parity, Max Sharpe, Min Variance, Max Diversification). M23 reached.
- 2026-01-26: Completed Phase 5.4 (T73-T78): Trade journal UI (5 stats, filters, expandable entries, tags/emotions/ratings), Correlation matrix visualization (10 assets, heatmap with legend), Position sizing calculator (5 methods), Strategy comparison view (5 strategies, 15 metrics, ranking), Order book depth chart (live updates, imbalance indicator), PnL calendar view (month/year modes, winning/losing days). M24 reached.
- 2026-01-26: Completed Phase 5.5 (T79-T84): Signal dashboard (auto-refresh, strength indicators), Market scanner (6 scan types), Watchlist management (multi-list, alerts), Economic calendar (week nav, impact filters), Performance attribution (factor/strategy breakdown), Trade replay (playback controls, timeline). M25 reached.
- 2026-01-26: Completed Phase 6.1 (T85-T88): ML model dashboard (training jobs, model cards, status), Feature importance analyzer (SHAP values, interactions, rankings), Strategy generator (6-step wizard, AI generation), Model backtester (walk-forward windows, overfit detection). M26 reached.
- 2026-01-26: Completed Phase 6.2 (T89-T92): Multi-exchange connector (5 exchanges, API keys, rate limits), Exchange comparison (price/liquidity/spread analysis), Smart order routing (TWAP/VWAP/split strategies), Arbitrage scanner (real-time opportunities, auto-execution settings). M27 reached.
- 2026-01-26: Completed Phase 6.3 (T93-T96): Production config (env vars, secrets management), Infrastructure (SSL certs, CDN edges, services), Monitoring (system metrics, alerts, service status). M28 reached. 39 pages total. All 96 tasks done.
- 2026-01-27: Completed Phase 7 (T97-T104): Notification center (preferences, filters, mark read), User preferences (theme, language, timezone, trading defaults, privacy), Dashboard builder (drag-drop widgets, resize, settings), Portfolio analytics (holdings table, allocation chart, performance metrics), Trade statistics (win rate, profit factor, detailed metrics, recent trades), Leaderboard (podium, rankings, social features), Strategy marketplace (featured, categories, pricing, favorites), Mobile dashboard (touch-optimized, quick actions, bottom nav). M29 reached. 47 pages total. All 104 tasks done.
- 2026-01-28: Completed PDCA-1/2/3 optimization rounds: Entry/contract alignment verified (47 routes), UI/UX audit passed, **308/308 E2E tests pass (100%)**. Key fixes: locale cookie, CardTitle semantic (div→h3), auth form noValidate, scoped selectors.

## Engineering Protocol

- Variant: v5
- Source: https://gist.github.com/discountry/fdf6d1137b46c363af132dfc8ba36677
- InjectedAt: 2026-01-25 14:10:02

```text
Software Engineering Protocol

Decision Priority
1) Correctness & invariants
2) Simplicity (KISS > DRY)
3) Testability / verifiability
4) Maintainability (low coupling, high cohesion)
5) Performance (measure first)

Working Loop
Clarify → Map impact (topology) → Plan minimal diff → Implement → Validate → Refactor (only related) → Report

Stop & Ask When
- Requirements are ambiguous/conflicting
- Public API / data contract / dependency direction must change
- The change triggers cross-module ripple (shotgun surgery risk)
- Security/privacy risk exists
- No credible validation path exists

Change Rules
- Minimal diff; no unrelated churn (refactor/rename/format/deps).
- Names use domain language; comments explain WHY (constraints/trade-offs).
- One abstraction level per function; single-purpose responsibilities.
- Patterns/abstractions only with a clear change scenario; prefer composition over inheritance.
- Think in models/data-structures before code; handle failures explicitly (no silent errors).

Verification Guardrail
- Changes to logic/data/behavior must be verifiable (tests preferred).
- UI/presentation-only changes may skip tests.
- If tests are skipped, state verification steps + residual risk.
- Untested code is “legacy”: add seams/isolate dependencies before behavior changes.

Anti-Patterns
- Premature optimization
- Abstraction before 3rd use
- Swallowing errors / silent failures
- Hidden coupling / unclear ownership across modules

Output
- What changed (files) + why
- How to verify (tests run or manual steps)
- Risks / breaking changes (if any)
```

## Project Review & Optimization (2026-01-27)

### Objective
- Project-level code review and optimization
- Ensure frontend/backend entry consistency (REST + WS + routes)
- UI/UX improvements
- Execute 3 PDCA rounds with documentation updates

### PDCA Rounds
| Round | Focus | Key Outputs | Status |
|---|---|---|---|
| PDCA-1 | Entry/contract alignment | REST/WS parity verified, route table updated (5→47 routes) | Done |
| PDCA-2 | UI/UX optimization | UI audit passed (h-dvh, 8pt spacing, single primary action) | Done |
| PDCA-3 | Full-loop verification | Build PASS, 275/275 unit tests PASS, **308/308 E2E tests PASS (100%)** | Done |

### Completed Actions (2026-01-28)
- [x] Aligned REST endpoints used by frontend with backend routes
- [x] Fixed WebSocket subscribe/unsubscribe parity (symbol/interval params)
- [x] Updated SYSTEM_ARCHITECTURE route table to match actual pages (47 routes)
- [x] Fixed all E2E test failures (locale, selectors, form validation, accessibility)
- [x] CardTitle semantic improvement (div→h3 for heading role)
- [x] Auth forms: noValidate + aria-label improvements
- 2026-01-28: Implemented account store + API + UI (accounts page + switcher), added sim/real gating and OpenAPI updates, fixed paper-service price refresh, updated trading store tests.
- 2026-01-28: UI/UX SOP for `/accounts` (spacing aligned to `space-y-6`, single primary action), Playwright evidence run (chromium) pass.
- 2026-01-28: Network check passed (frontend + API), added market endpoint graceful fallback to avoid 5xx on upstream 451.
