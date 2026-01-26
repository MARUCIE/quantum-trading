# API_CONFIGURATION_GUIDE - quantum_x

## 目标
- 提供 MVP 阶段的 API 配置规范
- 保证模拟盘模式下的安全与合规

## 基本原则
- 默认只允许 paper trading
- API 权限最小化（只读/交易分离）
- 密钥与配置分离（不得写入代码仓库）

## 必填配置
- Venue ID
- API Key / Secret / Passphrase
- Base URL
- Rate Limit / Timeout

## 建议环境变量模板
```env
# venue
VENUE_ID=example_exchange
VENUE_MODE=paper
VENUE_API_KEY=your_key
VENUE_API_SECRET=your_secret
VENUE_API_PASSPHRASE=your_passphrase
VENUE_BASE_URL=https://api.example.com
VENUE_RATE_LIMIT=10
VENUE_TIMEOUT_MS=3000

# data
DATA_SOURCE_ID=public_source
DATA_BASE_URL=https://data.example.com
DATA_RATE_LIMIT=5
```

## 校验清单
- 仅启用模拟盘接口
- API 权限最小化
- 超过阈值触发告警

## 安全与审计
- 密钥轮换记录
- 访问日志可追溯
- 配置变更审计
