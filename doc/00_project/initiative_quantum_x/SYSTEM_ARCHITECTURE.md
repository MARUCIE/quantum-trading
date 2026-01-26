# SYSTEM_ARCHITECTURE - quantum_x

<!-- AI-TOOLS-MANAGED:PROJECT_DIR START -->
- PROJECT_DIR: /Users/mauricewen/Projects/quantum x
<!-- AI-TOOLS-MANAGED:PROJECT_DIR END -->

## 系统边界
- 研究与生产分离：研究/回测/模拟/实盘四个环境
- 策略研发、执行、风控与监控解耦
- 外部依赖：数据源、交易通道、风控与合规要求

## 架构总览
```mermaid
flowchart LR
  subgraph Data
    MD[Market Data Ingest]
    FD[Fundamental Data]
    Alt[Alt Data]
    Norm[Normalization]
    Lake[Data Lake]
    Feature[Feature Store]
  end

  subgraph Research
    Lab[Research Studio]
    Orchestrator[Research Orchestrator]
    Train[Model Training]
    Eval[Backtest Engine]
    Registry[Model Registry]
  end

  subgraph Strategy
    Catalog[Strategy Catalog]
    Composer[Strategy Composer]
    Signal[Signal Engine]
    Portfolio[Portfolio Optimizer]
  end

  subgraph Execution
    Risk[Risk Engine]
    OMS[Order Manager]
    Router[Execution Router]
    Venue[Venue Adapters]
  end

  subgraph Copy
    SignalBus[Signal Bus]
    Copy[Copy Trading Service]
    Alloc[Allocation Rules]
  end

  subgraph Ops
    Monitor[Monitoring]
    Audit[Audit Log]
    Config[Config/Secret]
    Governance[Approval & Versioning]
  end

  MD --> Norm --> Lake --> Feature
  FD --> Norm
  Alt --> Norm

  Feature --> Lab --> Orchestrator --> Train --> Registry
  Registry --> Eval --> Catalog

  Catalog --> Composer --> Signal --> Portfolio --> Risk --> OMS --> Router --> Venue

  Signal --> SignalBus --> Copy --> Alloc --> OMS

  OMS --> Audit
  Risk --> Audit
  Monitor --> Audit
  Router --> Monitor
  Config --> Research
  Config --> Strategy
  Config --> Execution
  Governance --> Catalog
  Governance --> Registry
```

## 关键模块说明
- 数据层：统一数据接入、质量校验、版本化与特征服务
- 研究层：AI 训练与验证、回测与实验可复现
- 策略层：策略目录、策略编排、信号聚合与元策略
- 执行层：风控、订单管理、执行通道与交易适配器
- 跟单层：信号分发、复制规则、风险隔离
- 运维层：监控告警、审计追踪、配置与密钥管理

## 关键约束
- 回测与实盘接口一致，保证策略迁移成本最小
- 风控规则强制在执行层落地
- 审计日志不可篡改与可追溯
