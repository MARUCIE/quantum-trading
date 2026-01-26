# MVP_IMPLEMENTATION_BACKLOG - quantum_x

## 目标
- 将 PoC 计划拆解为可执行的工程实施清单
- 明确依赖关系、验收标准与证据产出
- 保持与 MVP 假设与门禁一致

## 假设与门禁（摘录）
- MVP 仅模拟盘，不接入实盘
- 单一资产域优先（默认：虚拟币现货/永续）
- 使用公开/免费数据源，付费数据后置
- 内部使用，不开放客户跟单
- 门禁：资产优先级/合规地区/数据预算/通道接入/风险限额

## Epic Backlog
| Epic | 内容 | 关键依赖 | 验收标准 | 证据 |
|---|---|---|---|---|
| E1 Data Baseline | 数据接入契约、标准化、质量门禁 | data_ingestion | 数据快照可复现、质量报告 | data_platform/test_plan.md | 
| E2 Feature Store | 特征版本与在线/离线一致 | feature_store | 特征版本可追溯、漂移检测 | data_platform/runbook.md |
| E3 Research Pipeline | 实验可复现与模型注册 | research_orchestrator, model_registry | 实验记录完整、可回放 | strategy_system/test_plan.md |
| E4 Strategy MVP | 基准策略与评审门禁 | strategy_registry | 回测报告与门禁通过 | strategy_system/design.md |
| E5 Execution Parity | 统一订单契约模拟盘 | order_manager, execution_router | 订单生命周期稳定、无重复/丢单 | execution_risk/test_plan.md |
| E6 Risk & Monitoring | 风控与审计链路 | risk_engine, monitoring_audit | 风控触发可审计、告警可追踪 | execution_risk/runbook.md |
| E7 Venue Adapter | API 接入与配置 | venue_adapter | 模拟盘联通与可审计 | API_CONFIGURATION_GUIDE.md |

## Milestone Plan
| Milestone | 内容 | Exit Criteria |
|---|---|---|
| M0 | 工程脚手架与契约冻结 | 关键契约评审通过 |
| M1 | 数据与特征基线 | 数据质量门禁通过 |
| M2 | 研究与策略基线 | 策略门禁通过 |
| M3 | 执行与风控基线 | 模拟盘偏差达标 |
| M4 | PoC 评审 | 端到端证据齐全 |

## 验收与证据
- 使用 `doc/10_features/*/test_plan.md` 作为测试基线
- 证据写入 `doc/00_project/initiative_quantum_x/notes.md`
- 交付入口：`doc/00_project/initiative_quantum_x/deliverable.md`
