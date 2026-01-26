# Order Manager Design

## Responsibilities
- Manage order states
- Persist order events
- Provide retry and cancel logic

## Inputs
- Approved orders
- Execution reports

## Outputs
- Order state updates
- Audit records

## Failure Modes
- Duplicate order submissions
- Stale states
- Missing execution reports

## Metrics
- Order throughput
- Cancel success rate
- State reconciliation errors
