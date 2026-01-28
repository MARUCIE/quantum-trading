# User Experience Map: Quantum X Trading Platform

> User Journey Documentation | v1.0

<!-- AI-TOOLS:PROJECT-DIR:BEGIN -->
**PROJECT_DIR**: `/Users/mauricewen/Projects/quantum x/frontend`
<!-- AI-TOOLS:PROJECT-DIR:END -->

## Overview

Quantum X 是一个 AI 量化交易平台，支持多资产类别（加密货币、股票、期货、期权）的交易、策略开发和风险管理。

## User Personas

### Persona 1: 新手交易者 (Beginner Trader)

```
Name: 小李
Background: 25岁，刚接触量化交易
Goals: 了解市场，尝试小额交易
Pain Points: 不熟悉专业术语，需要引导
```

**Journey Map:**
```
[首页] -> [查看持仓] -> [切换资产类别] -> [进入交易页] -> [查看K线] -> [尝试下单]
   |           |              |                |              |            |
  OK?         OK?            OK?              OK?            OK?          OK?
```

### Persona 2: 专业交易员 (Professional Trader)

```
Name: 张总
Background: 35岁，10年交易经验
Goals: 高效执行，多市场监控，风险控制
Pain Points: 需要快捷键，实时数据，多屏支持
```

**Journey Map:**
```
[首页] -> [信号面板] -> [快速切换资产] -> [执行交易] -> [风险检查] -> [盈亏回顾]
   |           |              |              |              |            |
  OK?         OK?            OK?            OK?            OK?          OK?
```

### Persona 3: 策略开发者 (Strategy Developer)

```
Name: 王工
Background: 30岁，量化工程师
Goals: 开发策略，回测验证，性能优化
Pain Points: 需要完整API，详细数据，调试工具
```

**Journey Map:**
```
[首页] -> [策略列表] -> [创建/编辑策略] -> [回测] -> [分析结果] -> [部署上线]
   |           |              |              |            |            |
  OK?         OK?            OK?            OK?          OK?          OK?
```

## Page Map

| Page | URL | Primary Persona | Key Actions |
|------|-----|-----------------|-------------|
| Dashboard | `/` | All | 查看持仓、盈亏、策略概览 |
| Trading | `/trading` | P1, P2 | 下单、查看K线、订单簿 |
| Signals | `/signals` | P2 | 查看交易信号 |
| Scanner | `/scanner` | P2 | 扫描市场机会 |
| Watchlist | `/watchlist` | All | 管理自选列表 |
| Strategies | `/strategies` | P2, P3 | 策略管理 |
| Backtest | `/backtest` | P3 | 策略回测 |
| Risk | `/risk` | P2 | 风险管理 |
| Settings | `/settings` | All | 系统设置 |

## Critical User Flows

### Flow 1: First-time User Onboarding
```
Landing -> Dashboard -> Asset Selector -> View Positions -> Explore Trading
```

### Flow 2: Quick Trade Execution
```
Dashboard -> Trading Page -> Select Symbol -> Enter Order -> Confirm -> View Position
```

### Flow 3: Signal-based Trading
```
Signals Page -> Filter by Asset Class -> View Signal Details -> Execute Trade
```

## Pain Points Tracking

| ID | Flow | Step | Issue | Severity | Status |
|----|------|------|-------|----------|--------|
| - | - | - | - | - | - |

## Testing Checkpoints

### Homepage (/)
- [ ] First Contentful Paint < 1.5s
- [ ] Core metrics visible without scroll
- [ ] Asset class selector accessible
- [ ] Navigation clear

### Trading (/trading)
- [ ] Chart loads correctly
- [ ] Order book updates
- [ ] Quick order form works
- [ ] Symbol switching works

### Mobile Responsive
- [ ] Navigation collapses properly
- [ ] Touch targets adequate (44px min)
- [ ] No horizontal scroll

---
Last updated: 2025-01-27
