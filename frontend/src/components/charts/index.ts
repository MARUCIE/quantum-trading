/**
 * Chart Components Index
 *
 * Comprehensive charting library for quantitative trading visualization.
 */

// Candlestick Chart (TradingView)
export { CandlestickChart } from "./candlestick-chart";

// Line Charts
export {
  LineChart,
  EquityCurve,
  PerformanceComparison,
  type LineDataPoint,
  type LineSeries,
} from "./line-chart";

// Area Charts
export {
  AreaChart,
  VolumeChart,
  AllocationTimeline,
  CumulativePnL,
  type AreaDataPoint,
  type AreaSeries,
} from "./area-chart";

// Bar Charts
export {
  BarChart,
  StrategyPnLChart,
  WinLossDistribution,
  MonthlyReturnsChart,
  type BarDataPoint,
  type BarSeries,
} from "./bar-chart";

// Pie & Donut Charts
export {
  PieChart,
  PortfolioAllocation,
  StrategyAllocation,
  WinRateGauge,
  type PieDataPoint,
} from "./pie-chart";

// Heatmaps
export {
  Heatmap,
  CorrelationMatrix,
  CalendarHeatmap,
  type HeatmapCell,
} from "./heatmap";
