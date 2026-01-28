"use client";

/**
 * Order Book Component
 *
 * Displays market depth with bid/ask orders.
 * Supports real-time updates and price level aggregation.
 */

import * as React from "react";
import { cn } from "@/lib/utils";
import { ArrowUp, ArrowDown, Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface OrderBookLevel {
  price: number;
  quantity: number;
  total: number;
  orders?: number;
}

export interface OrderBookProps {
  /** Symbol being displayed */
  symbol: string;
  /** Bid (buy) orders - sorted high to low */
  bids: OrderBookLevel[];
  /** Ask (sell) orders - sorted low to high */
  asks: OrderBookLevel[];
  /** Last traded price */
  lastPrice?: number;
  /** Price change from previous */
  priceChange?: number;
  /** Number of price levels to display (default: 10) */
  depth?: number;
  /** Callback when price level is clicked */
  onPriceClick?: (price: number, side: "bid" | "ask") => void;
  /** Whether data is loading */
  isLoading?: boolean;
  /** Precision for price display */
  pricePrecision?: number;
  /** Precision for quantity display */
  quantityPrecision?: number;
  /** Additional class names */
  className?: string;
}

export function OrderBook({
  symbol,
  bids,
  asks,
  lastPrice,
  priceChange = 0,
  depth = 10,
  onPriceClick,
  isLoading = false,
  pricePrecision = 2,
  quantityPrecision = 4,
  className,
}: OrderBookProps) {
  const [grouping, setGrouping] = React.useState<number>(0.01);
  const [hoveredRow, setHoveredRow] = React.useState<{
    side: "bid" | "ask";
    index: number;
  } | null>(null);

  // Calculate max total for bar visualization
  const maxTotal = React.useMemo(() => {
    const bidMax = bids.length > 0 ? Math.max(...bids.map((b) => b.total)) : 0;
    const askMax = asks.length > 0 ? Math.max(...asks.map((a) => a.total)) : 0;
    return Math.max(bidMax, askMax);
  }, [bids, asks]);

  // Display subset based on depth
  const displayBids = bids.slice(0, depth);
  const displayAsks = asks.slice(0, depth).reverse(); // Reverse to show lowest ask at bottom

  return (
    <div className={cn("rounded-lg border bg-card", className)}>
      {/* Header */}
      <div className="flex items-center justify-between border-b px-4 py-3">
        <h3 className="font-semibold">Order Book</h3>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">{symbol}</span>
          <Button variant="ghost" size="icon-xs">
            <Settings2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Column Headers */}
      <div className="grid grid-cols-3 gap-2 border-b px-4 py-2 text-xs font-medium text-muted-foreground">
        <div>Price</div>
        <div className="text-right">Size</div>
        <div className="text-right">Total</div>
      </div>

      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      ) : (
        <>
          {/* Asks (Sells) - Red */}
          <div className="relative">
            {displayAsks.map((level, index) => (
              <OrderBookRow
                key={`ask-${level.price}`}
                level={level}
                side="ask"
                maxTotal={maxTotal}
                pricePrecision={pricePrecision}
                quantityPrecision={quantityPrecision}
                isHovered={
                  hoveredRow?.side === "ask" && hoveredRow?.index === index
                }
                onHover={() => setHoveredRow({ side: "ask", index })}
                onLeave={() => setHoveredRow(null)}
                onClick={() => onPriceClick?.(level.price, "ask")}
              />
            ))}
          </div>

          {/* Spread / Last Price */}
          <div className="border-y bg-muted/30 px-4 py-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {lastPrice && (
                  <>
                    <span className="text-lg font-bold">
                      ${lastPrice.toFixed(pricePrecision)}
                    </span>
                    {priceChange !== 0 && (
                      <span
                        className={cn(
                          "flex items-center gap-0.5 text-sm",
                          priceChange > 0 ? "text-emerald-600" : "text-red-600"
                        )}
                      >
                        {priceChange > 0 ? (
                          <ArrowUp className="h-3 w-3" />
                        ) : (
                          <ArrowDown className="h-3 w-3" />
                        )}
                        {Math.abs(priceChange).toFixed(2)}%
                      </span>
                    )}
                  </>
                )}
              </div>
              {displayAsks.length > 0 && displayBids.length > 0 && (
                <span className="text-xs text-muted-foreground">
                  Spread: $
                  {(
                    displayAsks[displayAsks.length - 1].price -
                    displayBids[0].price
                  ).toFixed(pricePrecision)}
                </span>
              )}
            </div>
          </div>

          {/* Bids (Buys) - Green */}
          <div className="relative">
            {displayBids.map((level, index) => (
              <OrderBookRow
                key={`bid-${level.price}`}
                level={level}
                side="bid"
                maxTotal={maxTotal}
                pricePrecision={pricePrecision}
                quantityPrecision={quantityPrecision}
                isHovered={
                  hoveredRow?.side === "bid" && hoveredRow?.index === index
                }
                onHover={() => setHoveredRow({ side: "bid", index })}
                onLeave={() => setHoveredRow(null)}
                onClick={() => onPriceClick?.(level.price, "bid")}
              />
            ))}
          </div>
        </>
      )}

      {/* Grouping Controls */}
      <div className="flex items-center justify-between border-t px-4 py-2">
        <span className="text-xs text-muted-foreground">Grouping</span>
        <div className="flex gap-1">
          {[0.01, 0.1, 1, 10].map((g) => (
            <Button
              key={g}
              variant={grouping === g ? "secondary" : "ghost"}
              size="xs"
              onClick={() => setGrouping(g)}
            >
              {g}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}

interface OrderBookRowProps {
  level: OrderBookLevel;
  side: "bid" | "ask";
  maxTotal: number;
  pricePrecision: number;
  quantityPrecision: number;
  isHovered: boolean;
  onHover: () => void;
  onLeave: () => void;
  onClick: () => void;
}

function OrderBookRow({
  level,
  side,
  maxTotal,
  pricePrecision,
  quantityPrecision,
  isHovered,
  onHover,
  onLeave,
  onClick,
}: OrderBookRowProps) {
  const barWidth = maxTotal > 0 ? (level.total / maxTotal) * 100 : 0;

  return (
    <div
      className={cn(
        "relative cursor-pointer transition-colors",
        isHovered && "bg-muted/50"
      )}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      onClick={onClick}
    >
      {/* Background Bar */}
      <div
        className={cn(
          "absolute inset-y-0 right-0 opacity-20",
          side === "bid" ? "bg-emerald-500" : "bg-red-500"
        )}
        style={{ width: `${barWidth}%` }}
      />

      {/* Content */}
      <div className="relative grid grid-cols-3 gap-2 px-4 py-1.5 text-sm">
        <div
          className={cn(
            "font-mono",
            side === "bid" ? "text-emerald-600" : "text-red-600"
          )}
        >
          {level.price.toFixed(pricePrecision)}
        </div>
        <div className="text-right font-mono text-foreground/80">
          {level.quantity.toFixed(quantityPrecision)}
        </div>
        <div className="text-right font-mono text-muted-foreground">
          {level.total.toFixed(quantityPrecision)}
        </div>
      </div>
    </div>
  );
}

/**
 * Horizontal Order Book - Split view for wider screens
 */
export interface HorizontalOrderBookProps
  extends Omit<OrderBookProps, "className"> {
  className?: string;
}

export function HorizontalOrderBook({
  symbol,
  bids,
  asks,
  lastPrice,
  priceChange = 0,
  depth = 10,
  onPriceClick,
  isLoading = false,
  pricePrecision = 2,
  quantityPrecision = 4,
  className,
}: HorizontalOrderBookProps) {
  // Calculate max total for bar visualization
  const maxTotal = React.useMemo(() => {
    const bidMax = bids.length > 0 ? Math.max(...bids.map((b) => b.total)) : 0;
    const askMax = asks.length > 0 ? Math.max(...asks.map((a) => a.total)) : 0;
    return Math.max(bidMax, askMax);
  }, [bids, asks]);

  const displayBids = bids.slice(0, depth);
  const displayAsks = asks.slice(0, depth);

  return (
    <div className={cn("rounded-lg border bg-card", className)}>
      {/* Header */}
      <div className="flex items-center justify-between border-b px-4 py-3">
        <h3 className="font-semibold">Order Book</h3>
        <div className="flex items-center gap-4">
          {lastPrice && (
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold">
                ${lastPrice.toFixed(pricePrecision)}
              </span>
              {priceChange !== 0 && (
                <span
                  className={cn(
                    "flex items-center gap-0.5 text-sm",
                    priceChange > 0 ? "text-emerald-600" : "text-red-600"
                  )}
                >
                  {priceChange > 0 ? (
                    <ArrowUp className="h-3 w-3" />
                  ) : (
                    <ArrowDown className="h-3 w-3" />
                  )}
                  {Math.abs(priceChange).toFixed(2)}%
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      ) : (
        <div className="grid grid-cols-2 divide-x">
          {/* Bids Side */}
          <div>
            <div className="grid grid-cols-3 gap-2 border-b px-4 py-2 text-xs font-medium text-muted-foreground">
              <div className="text-right">Total</div>
              <div className="text-right">Size</div>
              <div className="text-right">Bid</div>
            </div>
            <div className="relative">
              {displayBids.map((level) => (
                <div
                  key={`bid-${level.price}`}
                  className="relative cursor-pointer transition-colors hover:bg-muted/50"
                  onClick={() => onPriceClick?.(level.price, "bid")}
                >
                  <div
                    className="absolute inset-y-0 left-0 bg-emerald-500 opacity-20"
                    style={{
                      width: `${
                        maxTotal > 0 ? (level.total / maxTotal) * 100 : 0
                      }%`,
                    }}
                  />
                  <div className="relative grid grid-cols-3 gap-2 px-4 py-1.5 text-sm">
                    <div className="text-right font-mono text-muted-foreground">
                      {level.total.toFixed(quantityPrecision)}
                    </div>
                    <div className="text-right font-mono text-foreground/80">
                      {level.quantity.toFixed(quantityPrecision)}
                    </div>
                    <div className="text-right font-mono text-emerald-600">
                      {level.price.toFixed(pricePrecision)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Asks Side */}
          <div>
            <div className="grid grid-cols-3 gap-2 border-b px-4 py-2 text-xs font-medium text-muted-foreground">
              <div>Ask</div>
              <div>Size</div>
              <div>Total</div>
            </div>
            <div className="relative">
              {displayAsks.map((level) => (
                <div
                  key={`ask-${level.price}`}
                  className="relative cursor-pointer transition-colors hover:bg-muted/50"
                  onClick={() => onPriceClick?.(level.price, "ask")}
                >
                  <div
                    className="absolute inset-y-0 right-0 bg-red-500 opacity-20"
                    style={{
                      width: `${
                        maxTotal > 0 ? (level.total / maxTotal) * 100 : 0
                      }%`,
                    }}
                  />
                  <div className="relative grid grid-cols-3 gap-2 px-4 py-1.5 text-sm">
                    <div className="font-mono text-red-600">
                      {level.price.toFixed(pricePrecision)}
                    </div>
                    <div className="font-mono text-foreground/80">
                      {level.quantity.toFixed(quantityPrecision)}
                    </div>
                    <div className="font-mono text-muted-foreground">
                      {level.total.toFixed(quantityPrecision)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Order Book Depth Chart - Visual representation of market depth
 */
export interface DepthChartProps {
  bids: OrderBookLevel[];
  asks: OrderBookLevel[];
  className?: string;
}

export function DepthChart({ bids, asks, className }: DepthChartProps) {
  const svgRef = React.useRef<SVGSVGElement>(null);
  const [dimensions, setDimensions] = React.useState({ width: 0, height: 0 });

  React.useEffect(() => {
    const updateDimensions = () => {
      if (svgRef.current) {
        const { width, height } = svgRef.current.getBoundingClientRect();
        setDimensions({ width, height });
      }
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  // Calculate path data
  const paths = React.useMemo(() => {
    if (dimensions.width === 0 || dimensions.height === 0) return null;
    if (bids.length === 0 || asks.length === 0) return null;

    const midPrice = (bids[0].price + asks[0].price) / 2;
    const priceRange = Math.max(
      midPrice - bids[bids.length - 1].price,
      asks[asks.length - 1].price - midPrice
    );

    const maxTotal = Math.max(
      ...bids.map((b) => b.total),
      ...asks.map((a) => a.total)
    );

    const centerX = dimensions.width / 2;
    const height = dimensions.height - 20;

    // Create bid path (from center to left)
    const bidPoints = bids.map((level, i) => {
      const x =
        centerX - ((midPrice - level.price) / priceRange) * (centerX - 20);
      const y = height - (level.total / maxTotal) * (height - 10);
      return `${x},${y}`;
    });

    // Create ask path (from center to right)
    const askPoints = asks.map((level, i) => {
      const x =
        centerX + ((level.price - midPrice) / priceRange) * (centerX - 20);
      const y = height - (level.total / maxTotal) * (height - 10);
      return `${x},${y}`;
    });

    return {
      bidPath: `M${centerX},${height} L${bidPoints.join(" L")} L${
        bidPoints[bidPoints.length - 1].split(",")[0]
      },${height} Z`,
      askPath: `M${centerX},${height} L${askPoints.join(" L")} L${
        askPoints[askPoints.length - 1].split(",")[0]
      },${height} Z`,
    };
  }, [bids, asks, dimensions]);

  return (
    <div className={cn("rounded-lg border bg-card p-4", className)}>
      <h4 className="mb-2 text-sm font-medium">Market Depth</h4>
      <svg ref={svgRef} className="h-32 w-full">
        {paths && (
          <>
            <path
              d={paths.bidPath}
              fill="rgba(16, 185, 129, 0.3)"
              stroke="rgb(16, 185, 129)"
              strokeWidth="1.5"
            />
            <path
              d={paths.askPath}
              fill="rgba(239, 68, 68, 0.3)"
              stroke="rgb(239, 68, 68)"
              strokeWidth="1.5"
            />
            <line
              x1={dimensions.width / 2}
              y1="0"
              x2={dimensions.width / 2}
              y2={dimensions.height}
              stroke="currentColor"
              strokeWidth="1"
              strokeDasharray="4,4"
              className="text-muted-foreground"
            />
          </>
        )}
      </svg>
    </div>
  );
}
