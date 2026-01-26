# Contracts Design

## 目标
- 定义统一的数据、特征、信号、订单、成交、风控事件契约
- 保证回测/仿真/实盘接口一致
- 明确版本与变更规则

## 契约版本规则
- 每次字段变更必须升级版本号
- 不保留旧字段兼容层
- 依赖方必须同步升级

## Contract: Data Record
| Field | Type | Required | Notes |
|---|---|---|---|
| symbol | string | yes | canonical asset id |
| ts | int64 | yes | epoch milliseconds |
| source | string | yes | data source id |
| payload | object | yes | normalized market data |
| version | string | yes | data schema version |

## Contract: Feature Vector
| Field | Type | Required | Notes |
|---|---|---|---|
| feature_set | string | yes | feature group id |
| symbol | string | yes | canonical asset id |
| ts | int64 | yes | feature timestamp |
| values | object | yes | feature key/value |
| version | string | yes | feature schema version |

## Contract: Strategy Signal
| Field | Type | Required | Notes |
|---|---|---|---|
| strategy_id | string | yes | strategy registry id |
| version | string | yes | strategy version |
| symbol | string | yes | canonical asset id |
| ts | int64 | yes | signal timestamp |
| action | string | yes | buy/sell/hold |
| strength | float | no | confidence score |
| meta | object | no | optional metadata |

## Contract: Order Request
| Field | Type | Required | Notes |
|---|---|---|---|
| order_id | string | yes | idempotency key |
| strategy_id | string | yes | source strategy |
| symbol | string | yes | canonical asset id |
| side | string | yes | buy/sell |
| qty | float | yes | order size |
| order_type | string | yes | market/limit |
| price | float | no | limit price |
| ts | int64 | yes | request time |

## Contract: Execution Report
| Field | Type | Required | Notes |
|---|---|---|---|
| order_id | string | yes | order id |
| status | string | yes | filled/partial/rejected/cancelled |
| filled_qty | float | yes | filled quantity |
| avg_price | float | no | average fill price |
| ts | int64 | yes | execution time |
| reason | string | no | reject/cancel reason |

## Contract: Risk Event
| Field | Type | Required | Notes |
|---|---|---|---|
| event_id | string | yes | risk event id |
| strategy_id | string | yes | source strategy |
| symbol | string | no | optional symbol |
| rule | string | yes | triggered rule |
| severity | string | yes | info/warn/critical |
| ts | int64 | yes | event time |
| action | string | yes | block/kill/alert |

## Contract: Audit Event
| Field | Type | Required | Notes |
|---|---|---|---|
| event_id | string | yes | audit id |
| event_type | string | yes | strategy/order/risk/system |
| actor | string | yes | user/service |
| payload | object | yes | audit payload |
| ts | int64 | yes | event time |
| version | string | yes | audit schema version |
