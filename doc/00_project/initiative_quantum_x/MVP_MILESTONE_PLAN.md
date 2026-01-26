# MVP_MILESTONE_PLAN - quantum_x

## 目标
- 基于 MVP 假设形成可执行里程碑
- 明确每个里程碑的交付物、验收与证据
- 为工程实施提供可追踪节奏

## 里程碑计划
| Milestone | 内容 | 关键交付物 | 验收标准 | 证据 |
|---|---|---|---|---|
| M0 | 契约冻结 | 契约规范与版本规则 | 契约评审通过 | contracts/design.md |
| M1 | 数据与特征基线 | 数据接入、质量门禁、特征版本 | 质量门禁通过、特征可追溯 | data_platform/test_plan.md |
| M2 | 研究与策略基线 | 研究流水线、策略注册、门禁 | 策略通过泄漏/成本/压力门禁 | strategy_system/test_plan.md |
| M3 | 执行与风控基线 | 模拟盘执行、风控与审计 | 订单链路稳定、风控可审计 | execution_risk/test_plan.md |
| M4 | PoC 评审 | 端到端证据 | 回测与模拟偏差达标 | deliverable.md |

## 依赖关系
- M0 -> M1 -> M2 -> M3 -> M4

## 关键风险
- 数据质量与延迟风险
- 回测与模拟偏差风险
- 风控门禁缺失风险
