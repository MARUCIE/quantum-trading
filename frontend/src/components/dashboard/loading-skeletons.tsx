"use client";

/**
 * Loading Skeletons for Dashboard Components
 *
 * Provides visual placeholders while data is loading.
 */

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Stats Card Skeleton
 */
export function StatsCardSkeleton() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-4" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-32 mb-1" />
        <Skeleton className="h-3 w-20" />
      </CardContent>
    </Card>
  );
}

/**
 * Chart Skeleton
 */
export function ChartSkeleton({ height = 350 }: { height?: number }) {
  return (
    <div className="w-full" style={{ height }}>
      <div className="flex h-full w-full items-end gap-1 px-4 pb-4">
        {/* Simulate candlestick bars */}
        {Array.from({ length: 30 }).map((_, i) => (
          <div key={i} className="flex flex-1 flex-col items-center gap-0.5">
            <Skeleton
              className="w-0.5"
              style={{ height: `${Math.random() * 20 + 10}%` }}
            />
            <Skeleton
              className="w-full"
              style={{ height: `${Math.random() * 40 + 20}%` }}
            />
            <Skeleton
              className="w-0.5"
              style={{ height: `${Math.random() * 20 + 10}%` }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Positions Table Skeleton
 */
export function PositionsTableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="grid grid-cols-6 gap-4 px-2">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-12" />
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-16" />
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="grid grid-cols-6 gap-4 px-2 py-2">
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-5 w-14 rounded-full" />
          <Skeleton className="h-5 w-12" />
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-5 w-24" />
        </div>
      ))}
    </div>
  );
}

/**
 * Recent Trades Skeleton
 */
export function RecentTradesSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="flex items-center justify-between rounded-lg border border-border p-3"
        >
          <div className="flex items-center gap-3">
            <Skeleton className="h-5 w-12 rounded-full" />
            <div className="space-y-1">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
          <div className="text-right space-y-1">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Allocation Chart Skeleton
 */
export function AllocationSkeleton({ items = 4 }: { items?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Skeleton className="h-3 w-3 rounded-full" />
              <Skeleton className="h-4 w-16" />
            </div>
            <Skeleton className="h-4 w-10" />
          </div>
          <Skeleton className="h-2 w-full rounded-full" />
        </div>
      ))}
    </div>
  );
}

/**
 * Strategy Card Skeleton
 */
export function StrategyCardSkeleton() {
  return (
    <div className="rounded-lg border border-border p-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-2 w-2 rounded-full" />
      </div>
      <Skeleton className="mt-1 h-3 w-20" />
      <div className="mt-3 flex items-end justify-between">
        <div className="space-y-1">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-3 w-14" />
        </div>
        <div className="text-right space-y-1">
          <Skeleton className="h-5 w-10" />
          <Skeleton className="h-3 w-12" />
        </div>
      </div>
    </div>
  );
}

/**
 * Full Dashboard Loading State
 */
export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Skeleton className="h-8 w-32 mb-2" />
        <Skeleton className="h-4 w-64" />
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <StatsCardSkeleton key={i} />
        ))}
      </div>

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Chart */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-8 w-32" />
          </CardHeader>
          <CardContent>
            <ChartSkeleton />
          </CardContent>
        </Card>

        {/* Allocation */}
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent>
            <AllocationSkeleton />
          </CardContent>
        </Card>
      </div>

      {/* Positions and Trades */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent>
            <PositionsTableSkeleton />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-28" />
          </CardHeader>
          <CardContent>
            <RecentTradesSkeleton />
          </CardContent>
        </Card>
      </div>

      {/* Strategy Performance */}
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <StrategyCardSkeleton key={i} />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
