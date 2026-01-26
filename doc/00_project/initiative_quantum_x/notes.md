---
Title: Notes - initiative_quantum_x
Scope: project
Owner: ai-agent
Status: active
LastUpdated: 2026-01-25
Related:
  - /doc/00_project/initiative_quantum_x/task_plan.md
---

# Research / References
- 2026-01-24: QuantConnect Lean (https://github.com/QuantConnect/Lean) - algorithmic trading engine with backtest/live support and multi-asset focus.
- 2026-01-24: Qlib (https://github.com/microsoft/qlib) - AI-oriented quant research platform covering data, modeling, and evaluation.
- 2026-01-24: NautilusTrader (https://github.com/nautechsystems/nautilus_trader) - event-driven trading platform emphasizing backtest/live parity.
- 2026-01-24: Freqtrade (https://github.com/freqtrade/freqtrade) - open-source crypto trading bot with backtesting and optimization.
- 2026-01-24: Hummingbot (https://github.com/hummingbot/hummingbot) - open-source crypto trading bot framework and connectors.
- 2026-01-24: vn.py (https://github.com/vnpy/vnpy) - open-source quantitative trading framework with broad futures ecosystem usage.
- 2026-01-24: Backtrader (https://github.com/mementum/backtrader) - Python backtesting and trading framework.
- 2026-01-24: vectorbt (https://github.com/polakowo/vectorbt) - vectorized backtesting and research workflow.

# Decisions
- Decision 1: Use OSS repos as references for capability mapping, not mandatory dependencies.
- Decision 2: Prefer NautilusTrader for event-driven execution/backtest parity; Qlib for AI research pipeline.
- Decision 3: Treat crypto-focused frameworks (Freqtrade/Hummingbot) as connector/strategy references only.

# MVP 假设（临时）
- MVP 仅模拟盘，不接入实盘
- MVP 先聚焦单一资产域（默认：虚拟币现货/永续）
- MVP 使用公开/免费数据源，付费数据后置
- 仅内部使用，不开放客户跟单

# 决策门禁
- 资产优先级与合规地区
- 数据预算与延迟要求
- 交易通道与接入约束
- 风险限额与资金分配策略

# Open Questions
- Q1: Preferred primary execution venue(s) for each asset class?
- Q2: Data vendor budget and latency requirements?
- Q3: Compliance scope and target jurisdictions?

# Logs
- 2026-01-24: initialized. (reason: planning-with-files)
- 2026-01-24: added OSS landscape references and decisions.
- 2026-01-24: added feature-level design docs.
- 2026-01-25: added component-level design docs and engineering protocol injection.
- 2026-01-25: added MVP assumptions and decision gates.
- 2026-01-25: added MVP PoC plan.
- 2026-01-25: added MVP implementation backlog.
- 2026-01-25: added canonical contracts specification.
- 2026-01-25: added MVP milestone and verification plans.
- 2026-01-25: added API config guide, default scope, and venue adapter.

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
