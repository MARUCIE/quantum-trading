# Data Ingestion Design

## Responsibilities
- Pull data from vendors/exchanges
- Normalize timestamps and symbols
- Enforce schema and quality gates

## Inputs
- Raw market feeds, files, or APIs

## Outputs
- Normalized data streams
- Ingestion metadata and lineage

## Failure Modes
- Source outage
- Schema drift
- Latency spikes

## Metrics
- Ingestion lag
- Error rate
- Missing rate
