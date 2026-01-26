# Feature Store Design

## Responsibilities
- Store and serve features for training and live
- Maintain feature versions and metadata
- Provide consistent feature definitions

## Inputs
- Normalized data
- Feature definitions

## Outputs
- Feature vectors
- Feature lineage metadata

## Failure Modes
- Stale features
- Version mismatch
- Online/offline drift

## Metrics
- Feature freshness
- Retrieval latency
- Drift alerts
