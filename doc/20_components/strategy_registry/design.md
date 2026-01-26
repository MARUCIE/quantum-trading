# Strategy Registry Design

## Responsibilities
- Register strategies and metadata
- Enforce approval gates
- Track deployment versions

## Inputs
- Strategy definitions
- Backtest reports

## Outputs
- Strategy versions
- Approval records

## Failure Modes
- Incomplete backtest evidence
- Missing approvals
- Version conflicts

## Metrics
- Approval lead time
- Rollback frequency
- Registry integrity
