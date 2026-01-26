# Risk Engine Design

## Responsibilities
- Evaluate exposure and leverage limits
- Enforce kill switch conditions
- Emit risk events and audit logs

## Inputs
- Orders and positions
- Risk policies

## Outputs
- Approved/rejected decisions
- Risk alerts

## Failure Modes
- Policy misconfiguration
- Latency spikes
- Missing position data

## Metrics
- Risk rejection rate
- Policy evaluation latency
- Kill switch activations
