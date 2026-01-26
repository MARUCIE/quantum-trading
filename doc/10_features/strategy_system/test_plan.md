# Strategy System Test Plan

## 范围
- 策略评审门禁
- 回测与实盘一致性
- 策略版本与回滚

## 关键测试
- Leakage Check: time split and look-ahead validation
- Cost Sensitivity: slippage and fees impact bounds
- Stress Test: tail events and regime shift
- Parity Check: backtest vs paper trading deviation

## 验收标准
- 通过门禁的策略满足稳健性阈值
- 回测与仿真偏差在可接受范围
