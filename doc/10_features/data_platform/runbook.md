# Data Platform Runbook

## 日常操作
- 数据源健康检查与告警处理
- 数据缺失回填与版本回滚
- 数据质量报告生成

## 异常处理
- 数据延迟: 触发降级与缓存策略
- 数据异常: 进入隔离区并标记
- 版本冲突: 仅保留通过质量门禁版本

## 监控指标
- Data freshness (lag)
- Missing rate
- Outlier rate
