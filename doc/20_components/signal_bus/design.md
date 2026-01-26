# Signal Bus Design

## Responsibilities
- Publish signal events
- Provide subscription controls
- Ensure ordering guarantees

## Inputs
- Strategy signals

## Outputs
- Signal streams
- Delivery acknowledgements

## Failure Modes
- Out-of-order delivery
- Duplicate signals
- Backpressure overload

## Metrics
- Signal latency
- Delivery success rate
- Subscriber lag
