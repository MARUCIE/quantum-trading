# ROLLING_REQUIREMENTS_AND_PROMPTS - quantum_x

## Requirements Ledger
| ID | Date | Requirement | Priority | Status | Source | Notes |
|---|---|---|---|---|---|---|
| REQ-001 | 2026-01-24 | 设计并规划 AI-native 量化交易系统，覆盖股票/期货/虚拟币 | P0 | Done | User | PDCA 文档基线完成 |
| REQ-002 | 2026-01-24 | 构建 SOTA 策略系统与未来跟单能力 | P0 | Done | User | 策略系统与跟单设计完成 |
| REQ-003 | 2026-01-24 | 选择推荐技术路线（NautilusTrader + Qlib） | P1 | Done | User | 作为参考栈与能力对标 |
| REQ-004 | 2026-01-24 | 输出 feature 级设计文档（数据/策略/执行/跟单） | P1 | Done | User | doc/10_features/* |
| REQ-005 | 2026-01-25 | 输出 component 级设计文档（核心组件） | P1 | Done | User | doc/20_components/* |
| REQ-006 | 2026-01-25 | 输出 MVP 实施计划与门禁 | P1 | Done | User | doc/00_project/initiative_quantum_x/EXECUTION_ROADMAP.md |
| REQ-007 | 2026-01-25 | 输出 MVP PoC 计划 | P1 | Done | User | doc/00_project/initiative_quantum_x/MVP_POC_PLAN.md |
| REQ-008 | 2026-01-25 | 输出 MVP 实施清单 | P1 | Done | User | doc/00_project/initiative_quantum_x/MVP_IMPLEMENTATION_BACKLOG.md |
| REQ-009 | 2026-01-25 | 输出统一契约规范 | P1 | Done | User | doc/20_components/contracts/design.md |
| REQ-010 | 2026-01-25 | 输出 MVP 里程碑与验证计划 | P1 | Done | User | doc/00_project/initiative_quantum_x/MVP_MILESTONE_PLAN.md |
| REQ-011 | 2026-01-25 | 输出 MVP 验证清单 | P1 | Done | User | doc/00_project/initiative_quantum_x/MVP_VERIFICATION_PLAN.md |
| REQ-012 | 2026-01-25 | 输出 API 配置指南与默认范围 | P1 | Done | User | doc/00_project/initiative_quantum_x/API_CONFIGURATION_GUIDE.md |
| REQ-013 | 2026-01-25 | 输出 Venue Adapter 组件设计 | P1 | Done | User | doc/20_components/venue_adapter/* |

## Prompt Library
### Strategy Research
- 目标: 生成可回测的策略假设与特征
- Prompt: “Provide a research plan for a multi-asset alpha strategy. Include hypotheses, features, validation, and risk controls.”

### Backtest Review
- 目标: 标准化回测评审
- Prompt: “Review the backtest report for bias, overfitting, and regime sensitivity. Suggest robustness checks.”

### Risk Policy Draft
- 目标: 形成风控规则模板
- Prompt: “Draft a risk policy for multi-asset strategies with limits, drawdown controls, and kill-switch criteria.”

### Copy-Trading Policy
- 目标: 形成跟单风险隔离与分配规则
- Prompt: “Design a copy-trading policy with signal versioning, allocation rules, and risk isolation for different client profiles.”

## Anti-Regression Q&A
| ID | Symptom | Root Cause | Fix | Verification | Prevention | Trigger |
|---|---|---|---|---|---|---|
| AR-001 | 回测收益显著高于实盘 | 数据延迟与滑点建模缺失 | 统一成交与滑点模型 | 以历史样本做回测-实盘偏差比对 | 强制回测模型与实盘一致 | "backtest_live_gap" |
| AR-002 | 回测表现突然异常好 | 数据泄漏或前视偏差 | 加入泄漏检测与时间切片验证 | Walk-forward 与时间切片审计 | 回测门禁强制泄漏检测 | "data_leakage" |
| AR-003 | 实盘策略表现快速衰减 | 模型漂移与市场结构变化 | 漂移检测与再训练触发器 | 监控漂移告警与再训练效果 | 建立漂移门禁与回退策略 | "model_drift" |

## References
- Lean (QuantConnect) engine
- Qlib research platform
- NautilusTrader event-driven engine
- Freqtrade / Hummingbot for crypto execution
- vn.py for futures trading ecosystem
- Backtrader and vectorbt for research backtesting
