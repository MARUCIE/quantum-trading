# Venue Adapter Design

## Responsibilities
- Provide a unified interface for market data and order execution
- Enforce paper trading mode by default (no live trading)
- Handle rate limits, retries, and error normalization

## Inputs
- Order requests from execution_router
- Market data subscriptions from data_ingestion

## Outputs
- Execution reports
- Normalized market data streams
- Adapter health metrics

## Failure Modes
- API auth failure
- Rate limit throttling
- Network instability

## Metrics
- Adapter latency
- Error rate
- Throttle count
