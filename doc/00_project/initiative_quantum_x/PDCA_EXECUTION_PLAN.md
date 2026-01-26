# PDCA_EXECUTION_PLAN - quantum_x

## PLAN
- 明确目标与范围（PRD/架构/体验地图同步）
- 定义评价指标（研究/工程/风控）
- 规划数据与交易通道接入方案

## DO
- 搭建数据与研究底座
- 实现策略系统与回测框架
- 打通风控与执行链路

## CHECK
- 回测/仿真/实盘一致性验证
- 风控命中率与异常处理时效
- 关键指标达成度（可用性、延迟、成本）

## ACT
- 对低效策略进行剔除与优化
- 优化执行与数据质量
- 形成可复制的策略与运维模板

## 迭代节奏
- 以策略迭代为主线，每轮迭代至少包含：计划、实现、验证、复盘
- 每轮迭代结束同步更新 PDCA 四文档

## PDCA Iteration Log (Planning Phase)
### Round 1 - Architecture Baseline (2026-01-24)
- Plan: 确定系统目标、范围、核心模块与边界
- Do: 完成 PRD/架构/体验地图/路线图基线
- Check: 四文档一致性校验与范围对齐
- Act: 固化架构与用户旅程，明确后续策略系统设计方向

### Round 2 - Strategy System Blueprint (2026-01-24)
- Plan: 明确 SOTA 策略系统能力矩阵与门禁
- Do: 补齐策略类型、研究到生产流水线、评审门禁
- Check: 风控/回测/实盘一致性约束落地到架构
- Act: 更新优化计划与风险控制重点

### Round 3 - Copy-Trading Design (2026-01-24)
- Plan: 定义信号分发、跟单规则与风险隔离
- Do: 架构增加跟单层与信号总线
- Check: 与用户旅程和监控审计链路一致
- Act: 跟单能力纳入路线图与交付验收

### Round 4 - MVP Implementation Plan (2026-01-25)
- Plan: 明确 MVP 假设与决策门禁，定义实施路径
- Do: 补齐 MVP 工作流与退出标准
- Check: 与 PRD/架构/体验地图一致性校验
- Act: 将门禁纳入路线图与交付验收

### Round 5 - MVP PoC Plan (2026-01-25)
- Plan: 明确 PoC 范围、交付与验收标准
- Do: 输出 PoC 工作包与测试证据要求
- Check: 与 MVP 假设与门禁一致
- Act: 将 PoC 纳入交付验收与后续里程碑

### Round 6 - MVP Implementation Backlog (2026-01-25)
- Plan: 拆解 PoC 为可执行 Epic 与里程碑
- Do: 输出 MVP 实施清单与依赖关系
- Check: 与 feature/component 文档一致
- Act: 将清单纳入交付验收

### Round 7 - Canonical Contracts (2026-01-25)
- Plan: 明确数据/特征/信号/订单/成交/风控事件契约
- Do: 输出统一契约规范与版本规则
- Check: 与架构和执行链路一致
- Act: 将契约纳入交付验收与后续实现门禁

### Round 8 - MVP Milestones & Verification (2026-01-25)
- Plan: 明确 MVP 里程碑与验证路径
- Do: 输出里程碑与验证清单
- Check: 与 MVP 假设/门禁一致
- Act: 将验证清单纳入交付验收

### Round 9 - API Config & Venue Adapter (2026-01-25)
- Plan: 明确 API 配置规范与适配器职责
- Do: 输出配置指南与组件设计
- Check: 与默认 MVP 范围一致
- Act: 将 API 配置纳入交付验收
