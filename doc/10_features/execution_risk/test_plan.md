# Execution & Risk Test Plan

## 范围
- 订单生命周期完整性
- 风控规则与 Kill Switch
- 回测/实盘一致性接口

## 关键测试
- Order Lifecycle: state transitions and idempotency
- Risk Rules: limits and exposure checks
- Kill Switch: trigger conditions and recovery
- Latency: P95/P99 within thresholds

## 验收标准
- 风控规则覆盖率满足要求
- 订单链路无丢单/重复
