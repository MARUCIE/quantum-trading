"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectOption } from "@/components/ui/select";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Percent,
  BarChart3,
  Target,
  Activity,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

// Types
interface DayPnL {
  date: string;
  pnl: number;
  pnlPercent: number;
  trades: number;
  winRate: number;
}

interface MonthData {
  year: number;
  month: number;
  days: (DayPnL | null)[];
  totalPnL: number;
  totalTrades: number;
  winningDays: number;
  losingDays: number;
}

// Generate mock PnL data
function generateMonthData(year: number, month: number): MonthData {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay();
  const days: (DayPnL | null)[] = [];

  // Add empty slots for days before the 1st
  for (let i = 0; i < firstDayOfWeek; i++) {
    days.push(null);
  }

  let totalPnL = 0;
  let totalTrades = 0;
  let winningDays = 0;
  let losingDays = 0;

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
    const isFuture = date > new Date();

    if (isWeekend || isFuture) {
      days.push(null);
      continue;
    }

    // Generate random PnL
    const trades = Math.floor(Math.random() * 8) + 1;
    const pnl = (Math.random() - 0.45) * 500; // Slight positive bias
    const pnlPercent = pnl / 10000 * 100;
    const winRate = Math.random() * 40 + 40;

    totalPnL += pnl;
    totalTrades += trades;
    if (pnl > 0) winningDays++;
    if (pnl < 0) losingDays++;

    days.push({
      date: date.toISOString().split("T")[0],
      pnl,
      pnlPercent,
      trades,
      winRate,
    });
  }

  return {
    year,
    month,
    days,
    totalPnL,
    totalTrades,
    winningDays,
    losingDays,
  };
}

export default function PnLCalendarPage() {
  const t = useTranslations("pnlCalendarPage");
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [viewMode, setViewMode] = useState<"month" | "year">("month");

  // Month names - moved inside component to use translations
  const MONTHS = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // Generate data
  const monthData = useMemo(() => generateMonthData(year, month), [year, month]);

  const yearData = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => generateMonthData(year, i));
  }, [year]);

  // Calculate yearly stats
  const yearStats = useMemo(() => {
    return yearData.reduce(
      (acc, m) => ({
        totalPnL: acc.totalPnL + m.totalPnL,
        totalTrades: acc.totalTrades + m.totalTrades,
        winningDays: acc.winningDays + m.winningDays,
        losingDays: acc.losingDays + m.losingDays,
      }),
      { totalPnL: 0, totalTrades: 0, winningDays: 0, losingDays: 0 }
    );
  }, [yearData]);

  const navigateMonth = (delta: number) => {
    let newMonth = month + delta;
    let newYear = year;
    if (newMonth < 0) {
      newMonth = 11;
      newYear--;
    } else if (newMonth > 11) {
      newMonth = 0;
      newYear++;
    }
    setMonth(newMonth);
    setYear(newYear);
  };

  const getPnLColor = (pnl: number) => {
    if (pnl > 100) return "bg-green-500";
    if (pnl > 0) return "bg-green-400";
    if (pnl > -100) return "bg-red-400";
    return "bg-red-500";
  };

  const getPnLTextColor = (pnl: number) => {
    if (pnl >= 0) return "text-green-500";
    return "text-red-500";
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
          <p className="text-muted-foreground">
            {t("description")}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === "month" ? "secondary" : "outline"}
            size="sm"
            onClick={() => setViewMode("month")}
          >
            {t("month")}
          </Button>
          <Button
            variant={viewMode === "year" ? "secondary" : "outline"}
            size="sm"
            onClick={() => setViewMode("year")}
          >
            {t("year")}
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={cn(
                "flex h-10 w-10 items-center justify-center rounded-lg",
                (viewMode === "month" ? monthData.totalPnL : yearStats.totalPnL) >= 0
                  ? "bg-green-500/10"
                  : "bg-red-500/10"
              )}>
                <DollarSign className={cn(
                  "h-5 w-5",
                  (viewMode === "month" ? monthData.totalPnL : yearStats.totalPnL) >= 0
                    ? "text-green-500"
                    : "text-red-500"
                )} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  {viewMode === "month" ? t("monthlyPnl") : t("yearlyPnl")}
                </p>
                <p className={cn(
                  "text-xl font-bold",
                  (viewMode === "month" ? monthData.totalPnL : yearStats.totalPnL) >= 0
                    ? "text-green-500"
                    : "text-red-500"
                )}>
                  {formatCurrency(viewMode === "month" ? monthData.totalPnL : yearStats.totalPnL)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
                <Activity className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t("totalTrades")}</p>
                <p className="text-xl font-bold">
                  {viewMode === "month" ? monthData.totalTrades : yearStats.totalTrades}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10">
                <TrendingUp className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t("winningDays")}</p>
                <p className="text-xl font-bold text-green-500">
                  {viewMode === "month" ? monthData.winningDays : yearStats.winningDays}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-500/10">
                <TrendingDown className="h-5 w-5 text-red-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t("losingDays")}</p>
                <p className="text-xl font-bold text-red-500">
                  {viewMode === "month" ? monthData.losingDays : yearStats.losingDays}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {viewMode === "month" ? (
        /* Month View */
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                {MONTHS[month]} {year}
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" onClick={() => navigateMonth(-1)}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setMonth(now.getMonth());
                    setYear(now.getFullYear());
                  }}
                >
                  {t("today")}
                </Button>
                <Button variant="outline" size="icon" onClick={() => navigateMonth(1)}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-2">
              {/* Weekday Headers */}
              {WEEKDAYS.map((day) => (
                <div
                  key={day}
                  className="p-2 text-center text-sm font-medium text-muted-foreground"
                >
                  {day}
                </div>
              ))}

              {/* Day Cells */}
              {monthData.days.map((day, i) => (
                <div
                  key={i}
                  className={cn(
                    "aspect-square rounded-lg border p-2 transition-colors",
                    day ? "hover:bg-muted/50 cursor-pointer" : "bg-muted/20"
                  )}
                >
                  {day && (
                    <div className="h-full flex flex-col">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">
                          {new Date(day.date).getDate()}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {day.trades}t
                        </span>
                      </div>
                      <div className="flex-1 flex items-center justify-center">
                        <div
                          className={cn(
                            "w-full h-4 rounded-sm",
                            getPnLColor(day.pnl)
                          )}
                          style={{
                            opacity: Math.min(1, Math.abs(day.pnl) / 200 + 0.3),
                          }}
                        />
                      </div>
                      <div className={cn(
                        "text-xs font-mono text-center",
                        getPnLTextColor(day.pnl)
                      )}>
                        {day.pnl >= 0 ? "+" : ""}{day.pnl.toFixed(0)}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Legend */}
            <div className="mt-4 flex items-center justify-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-green-500" />
                <span className="text-muted-foreground">{t("profitOver100")}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-green-400" />
                <span className="text-muted-foreground">{t("profit0to100")}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-red-400" />
                <span className="text-muted-foreground">{t("loss0to100")}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-red-500" />
                <span className="text-muted-foreground">{t("lossOver100")}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        /* Year View */
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                {year} {t("overview")}
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" onClick={() => setYear(year - 1)}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setYear(now.getFullYear())}
                >
                  {t("thisYear")}
                </Button>
                <Button variant="outline" size="icon" onClick={() => setYear(year + 1)}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
              {yearData.map((data, i) => (
                <Card
                  key={i}
                  className={cn(
                    "cursor-pointer transition-colors hover:bg-muted/50",
                    month === i && "ring-2 ring-primary"
                  )}
                  onClick={() => {
                    setMonth(i);
                    setViewMode("month");
                  }}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{MONTHS[i].slice(0, 3)}</span>
                      <Badge variant={data.totalPnL >= 0 ? "default" : "destructive"}>
                        {data.totalPnL >= 0 ? "+" : ""}{formatCurrency(data.totalPnL)}
                      </Badge>
                    </div>
                    <div className="h-8 flex items-end gap-0.5">
                      {data.days
                        .filter((d): d is DayPnL => d !== null)
                        .slice(0, 22)
                        .map((day, j) => (
                          <div
                            key={j}
                            className={cn(
                              "flex-1 rounded-sm",
                              getPnLColor(day.pnl)
                            )}
                            style={{
                              height: `${Math.min(100, Math.abs(day.pnl) / 3 + 20)}%`,
                              opacity: Math.min(1, Math.abs(day.pnl) / 200 + 0.3),
                            }}
                          />
                        ))}
                    </div>
                    <div className="mt-2 flex justify-between text-xs text-muted-foreground">
                      <span>{data.winningDays}W / {data.losingDays}L</span>
                      <span>{data.totalTrades} {t("trades")}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
