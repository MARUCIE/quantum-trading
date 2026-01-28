/**
 * Prometheus Metrics Collector
 *
 * Collects and exposes application metrics in Prometheus format.
 * Metrics are exposed at /metrics endpoint for scraping.
 */

// Metric types
type MetricType = 'counter' | 'gauge' | 'histogram';

interface MetricDefinition {
  name: string;
  help: string;
  type: MetricType;
  labels?: string[];
}

// MetricValue interface for future use with push gateway
// interface MetricValue {
//   value: number;
//   labels?: Record<string, string>;
//   timestamp?: number;
// }

interface HistogramValue {
  sum: number;
  count: number;
  buckets: Map<number, number>; // bucket upper bound -> count
}

// Default histogram buckets (in ms for latency)
const DEFAULT_BUCKETS = [5, 10, 25, 50, 100, 250, 500, 1000, 2500, 5000, 10000];

class MetricsCollector {
  private counters: Map<string, Map<string, number>> = new Map();
  private gauges: Map<string, Map<string, number>> = new Map();
  private histograms: Map<string, Map<string, HistogramValue>> = new Map();
  private definitions: Map<string, MetricDefinition> = new Map();
  private startTime: number = Date.now();

  /**
   * Register a new metric
   */
  register(definition: MetricDefinition): void {
    this.definitions.set(definition.name, definition);

    switch (definition.type) {
      case 'counter':
        this.counters.set(definition.name, new Map());
        break;
      case 'gauge':
        this.gauges.set(definition.name, new Map());
        break;
      case 'histogram':
        this.histograms.set(definition.name, new Map());
        break;
    }
  }

  /**
   * Increment a counter
   */
  incCounter(name: string, labels?: Record<string, string>, value: number = 1): void {
    const counter = this.counters.get(name);
    if (!counter) return;

    const key = this.labelsToKey(labels);
    const current = counter.get(key) || 0;
    counter.set(key, current + value);
  }

  /**
   * Set a gauge value
   */
  setGauge(name: string, value: number, labels?: Record<string, string>): void {
    const gauge = this.gauges.get(name);
    if (!gauge) return;

    const key = this.labelsToKey(labels);
    gauge.set(key, value);
  }

  /**
   * Increment a gauge
   */
  incGauge(name: string, labels?: Record<string, string>, value: number = 1): void {
    const gauge = this.gauges.get(name);
    if (!gauge) return;

    const key = this.labelsToKey(labels);
    const current = gauge.get(key) || 0;
    gauge.set(key, current + value);
  }

  /**
   * Decrement a gauge
   */
  decGauge(name: string, labels?: Record<string, string>, value: number = 1): void {
    this.incGauge(name, labels, -value);
  }

  /**
   * Observe a histogram value
   */
  observeHistogram(name: string, value: number, labels?: Record<string, string>): void {
    const histogram = this.histograms.get(name);
    if (!histogram) return;

    const key = this.labelsToKey(labels);
    let hist = histogram.get(key);

    if (!hist) {
      hist = {
        sum: 0,
        count: 0,
        buckets: new Map(DEFAULT_BUCKETS.map((b) => [b, 0])),
      };
      histogram.set(key, hist);
    }

    hist.sum += value;
    hist.count += 1;

    // Update buckets
    for (const bucket of DEFAULT_BUCKETS) {
      if (value <= bucket) {
        hist.buckets.set(bucket, (hist.buckets.get(bucket) || 0) + 1);
      }
    }
  }

  /**
   * Create a timer for measuring durations
   */
  startTimer(name: string, labels?: Record<string, string>): () => void {
    const start = performance.now();
    return () => {
      const duration = performance.now() - start;
      this.observeHistogram(name, duration, labels);
    };
  }

  /**
   * Get uptime in seconds
   */
  getUptime(): number {
    return (Date.now() - this.startTime) / 1000;
  }

  /**
   * Convert labels to a unique key
   */
  private labelsToKey(labels?: Record<string, string>): string {
    if (!labels || Object.keys(labels).length === 0) return '';
    return Object.entries(labels)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}="${v}"`)
      .join(',');
  }

  /**
   * Format labels for Prometheus output
   */
  private formatLabels(key: string): string {
    return key ? `{${key}}` : '';
  }

  /**
   * Export all metrics in Prometheus format
   */
  export(): string {
    const lines: string[] = [];

    // Export counters
    for (const [name, values] of this.counters) {
      const def = this.definitions.get(name);
      if (def) {
        lines.push(`# HELP ${name} ${def.help}`);
        lines.push(`# TYPE ${name} counter`);
      }
      for (const [key, value] of values) {
        lines.push(`${name}${this.formatLabels(key)} ${value}`);
      }
    }

    // Export gauges
    for (const [name, values] of this.gauges) {
      const def = this.definitions.get(name);
      if (def) {
        lines.push(`# HELP ${name} ${def.help}`);
        lines.push(`# TYPE ${name} gauge`);
      }
      for (const [key, value] of values) {
        lines.push(`${name}${this.formatLabels(key)} ${value}`);
      }
    }

    // Export histograms
    for (const [name, values] of this.histograms) {
      const def = this.definitions.get(name);
      if (def) {
        lines.push(`# HELP ${name} ${def.help}`);
        lines.push(`# TYPE ${name} histogram`);
      }
      for (const [key, hist] of values) {
        const baseLabels = key ? `${key},` : '';
        for (const [bucket, count] of hist.buckets) {
          lines.push(`${name}_bucket{${baseLabels}le="${bucket}"} ${count}`);
        }
        lines.push(`${name}_bucket{${baseLabels}le="+Inf"} ${hist.count}`);
        lines.push(`${name}_sum${this.formatLabels(key)} ${hist.sum}`);
        lines.push(`${name}_count${this.formatLabels(key)} ${hist.count}`);
      }
    }

    return lines.join('\n');
  }

  /**
   * Reset all metrics (useful for testing)
   */
  reset(): void {
    for (const counter of this.counters.values()) {
      counter.clear();
    }
    for (const gauge of this.gauges.values()) {
      gauge.clear();
    }
    for (const histogram of this.histograms.values()) {
      histogram.clear();
    }
  }
}

// Singleton instance
export const metrics = new MetricsCollector();

// Register default metrics
metrics.register({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  type: 'counter',
  labels: ['method', 'path', 'status'],
});

metrics.register({
  name: 'http_request_duration_ms',
  help: 'HTTP request duration in milliseconds',
  type: 'histogram',
  labels: ['method', 'path'],
});

metrics.register({
  name: 'http_requests_in_flight',
  help: 'Number of HTTP requests currently being processed',
  type: 'gauge',
});

metrics.register({
  name: 'websocket_connections',
  help: 'Number of active WebSocket connections',
  type: 'gauge',
});

metrics.register({
  name: 'websocket_messages_total',
  help: 'Total number of WebSocket messages',
  type: 'counter',
  labels: ['direction', 'type'],
});

metrics.register({
  name: 'binance_api_requests_total',
  help: 'Total number of Binance API requests',
  type: 'counter',
  labels: ['endpoint', 'status'],
});

metrics.register({
  name: 'binance_api_latency_ms',
  help: 'Binance API request latency in milliseconds',
  type: 'histogram',
  labels: ['endpoint'],
});

metrics.register({
  name: 'risk_events_total',
  help: 'Total number of risk events triggered',
  type: 'counter',
  labels: ['level', 'type'],
});

metrics.register({
  name: 'process_uptime_seconds',
  help: 'Process uptime in seconds',
  type: 'gauge',
});

metrics.register({
  name: 'nodejs_heap_size_bytes',
  help: 'Node.js heap size in bytes',
  type: 'gauge',
  labels: ['type'],
});

export { MetricsCollector, MetricDefinition };
