# USER_EXPERIENCE_MAP - quantum_x

<!-- AI-TOOLS-MANAGED:PROJECT_DIR START -->
- PROJECT_DIR: /Users/mauricewen/Projects/quantum x
<!-- AI-TOOLS-MANAGED:PROJECT_DIR END -->

## 角色与目标
- 量化研究员：快速实验、可复现研究、策略迭代
- 交易/风控：稳定执行、风险控制、异常可追踪
- 运营/合规：版本可审计、权限清晰、合规可验证
- 客户/跟单用户（未来）：透明风险、稳定信号、可控复制

## 用户旅程（高层）
| 阶段 | 触点 | 用户目标 | 系统能力 | 关键证据 |
|---|---|---|---|---|
| 研究准备 | Data Hub / Feature Store | 数据可用、可追溯 | 数据版本与质量校验 | 数据报告 |
| 策略开发 | Research Studio | 快速验证策略 | 训练/回测/实验记录 | 实验日志 |
| 策略评审 | Strategy Registry | 可审计上线 | 版本控制与审批 | 审批记录 |
| 模拟交易 | Paper Trading | 风险可控试运行 | 统一执行链路 | 仿真报表 |
| 小资金实盘 | Execution Console | 稳定执行 | 风控约束、审计日志 | 实盘日志 |
| 放量与跟单 | Copy Trading Hub | 扩大规模 | 信号分发与复制规则 | 跟单报表 |
| 运营与审计 | Monitoring / Audit | 可追溯 | 监控告警与审计 | 审计记录 |

## 关键体验指标
- 策略从研究到实盘的迁移时间
- 回测与实盘偏差
- 风控触发与异常处理时长
- 跟单信号延迟与执行偏差

## UI/UX 规范合规状态（PDCA-2 审计）

| 检查项 | 状态 | 证据 |
|---|---|---|
| 视口高度 | PASS | `layout.tsx:44`, `sidebar.tsx:110` 使用 `h-dvh` |
| 8pt 间距体系 | PASS | `globals.css` 定义 `.space-section/group/item` |
| 页面级间距 | PASS | 所有 47 页使用 `space-y-6` 作为根容器 |
| 单一主按钮原则 | PASS | 每页仅一个默认变体 Button |
| 层级清晰 | PASS | PageHeader 组件强制一致层级 |
| 留白分组 | PASS | Card 使用内置 Header/Content 间距 |
| 无障碍 (a11y) | PASS | ARIA labels, role 属性, skip-link, focus-ring |
| 减少动画偏好 | PASS | `@media (prefers-reduced-motion: reduce)` |

**审计日期**: 2026-01-28
**结论**: 无需代码变更，UI/UX 已符合 ui-skills 和 web-interface-guidelines 规范
