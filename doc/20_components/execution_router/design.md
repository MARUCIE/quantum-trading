# Execution Router Design

## Responsibilities
- Select venue based on policy
- Handle routing failures and retries
- Normalize execution reports

## Inputs
- Orders from OMS
- Routing policies

## Outputs
- Routed orders
- Execution events

## Failure Modes
- Venue outage
- Throttle limits
- Protocol errors

## Metrics
- Route success rate
- P95/P99 latency
- Venue error rate
