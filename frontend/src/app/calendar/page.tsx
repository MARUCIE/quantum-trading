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
  Clock,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Globe,
  Filter,
  Bell,
  Star,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

// Types
interface EconomicEvent {
  id: string;
  title: string;
  country: string;
  countryCode: string;
  date: string;
  time: string;
  impact: "high" | "medium" | "low";
  category: "rates" | "employment" | "inflation" | "gdp" | "trade" | "crypto" | "other";
  previous: string;
  forecast: string;
  actual?: string;
  description: string;
  starred: boolean;
}

// Mock data generator
function generateEvents(startDate: Date, days: number): EconomicEvent[] {
  const events: EconomicEvent[] = [];
  const eventTemplates = [
    { title: "Fed Interest Rate Decision", country: "United States", countryCode: "US", impact: "high" as const, category: "rates" as const, description: "Federal Reserve monetary policy decision" },
    { title: "Non-Farm Payrolls", country: "United States", countryCode: "US", impact: "high" as const, category: "employment" as const, description: "Monthly employment report" },
    { title: "CPI (YoY)", country: "United States", countryCode: "US", impact: "high" as const, category: "inflation" as const, description: "Consumer Price Index year-over-year" },
    { title: "GDP Growth Rate", country: "United States", countryCode: "US", impact: "high" as const, category: "gdp" as const, description: "Quarterly GDP report" },
    { title: "ECB Interest Rate", country: "European Union", countryCode: "EU", impact: "high" as const, category: "rates" as const, description: "European Central Bank rate decision" },
    { title: "Unemployment Rate", country: "Germany", countryCode: "DE", impact: "medium" as const, category: "employment" as const, description: "Monthly unemployment figures" },
    { title: "Trade Balance", country: "China", countryCode: "CN", impact: "medium" as const, category: "trade" as const, description: "Monthly trade data" },
    { title: "BOJ Policy Rate", country: "Japan", countryCode: "JP", impact: "high" as const, category: "rates" as const, description: "Bank of Japan policy decision" },
    { title: "Retail Sales (MoM)", country: "United Kingdom", countryCode: "GB", impact: "medium" as const, category: "other" as const, description: "Monthly retail sales change" },
    { title: "PMI Manufacturing", country: "United States", countryCode: "US", impact: "medium" as const, category: "other" as const, description: "Purchasing Managers Index" },
    { title: "Bitcoin ETF Flows", country: "United States", countryCode: "US", impact: "medium" as const, category: "crypto" as const, description: "Daily ETF inflow/outflow data" },
    { title: "Ethereum Shanghai Upgrade", country: "Global", countryCode: "CRYPTO", impact: "high" as const, category: "crypto" as const, description: "Major network upgrade" },
    { title: "SEC Crypto Hearing", country: "United States", countryCode: "US", impact: "high" as const, category: "crypto" as const, description: "Congressional hearing on crypto regulation" },
  ];

  for (let d = 0; d < days; d++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + d);

    // Skip weekends for most events
    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
    const numEvents = isWeekend ? Math.floor(Math.random() * 2) : Math.floor(Math.random() * 4) + 1;

    for (let i = 0; i < numEvents; i++) {
      const template = eventTemplates[Math.floor(Math.random() * eventTemplates.length)];
      const hour = Math.floor(Math.random() * 12) + 8;
      const minute = [0, 15, 30, 45][Math.floor(Math.random() * 4)];

      const prev = (Math.random() * 5 - 1).toFixed(1);
      const forecast = (parseFloat(prev) + (Math.random() - 0.5)).toFixed(1);
      const hasActual = date < new Date();

      events.push({
        id: `evt-${d}-${i}`,
        ...template,
        date: date.toISOString().split("T")[0],
        time: `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`,
        previous: `${prev}%`,
        forecast: `${forecast}%`,
        actual: hasActual ? `${(parseFloat(forecast) + (Math.random() - 0.5) * 0.5).toFixed(1)}%` : undefined,
        starred: Math.random() > 0.85,
      });
    }
  }

  return events.sort((a, b) => {
    const dateCompare = a.date.localeCompare(b.date);
    if (dateCompare !== 0) return dateCompare;
    return a.time.localeCompare(b.time);
  });
}

const IMPACT_COLORS = {
  high: "bg-red-500",
  medium: "bg-yellow-500",
  low: "bg-green-500",
};

export default function CalendarPage() {
  const t = useTranslations("calendarPage");

  const CATEGORIES = [
    { value: "all", label: t("allEvents") },
    { value: "rates", label: t("interestRates") },
    { value: "employment", label: t("employment") },
    { value: "inflation", label: t("inflation") },
    { value: "gdp", label: t("gdp") },
    { value: "trade", label: t("trade") },
    { value: "crypto", label: t("crypto") },
    { value: "other", label: t("other") },
  ];

  const COUNTRIES = [
    { value: "all", label: t("allCountries") },
    { value: "US", label: t("unitedStates") },
    { value: "EU", label: t("europeanUnion") },
    { value: "GB", label: t("unitedKingdom") },
    { value: "JP", label: t("japan") },
    { value: "CN", label: t("china") },
    { value: "DE", label: t("germany") },
    { value: "CRYPTO", label: t("crypto") },
  ];
  const now = new Date();
  const [weekStart, setWeekStart] = useState(() => {
    const start = new Date(now);
    start.setDate(start.getDate() - start.getDay());
    return start;
  });
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterCountry, setFilterCountry] = useState("all");
  const [filterImpact, setFilterImpact] = useState<"all" | "high" | "medium" | "low">("all");
  const [showStarredOnly, setShowStarredOnly] = useState(false);

  // Generate events for 2 weeks
  const allEvents = useMemo(() => {
    const start = new Date(weekStart);
    start.setDate(start.getDate() - 7);
    return generateEvents(start, 21);
  }, [weekStart]);

  // Filter events
  const filteredEvents = useMemo(() => {
    return allEvents.filter((event) => {
      if (filterCategory !== "all" && event.category !== filterCategory) return false;
      if (filterCountry !== "all" && event.countryCode !== filterCountry) return false;
      if (filterImpact !== "all" && event.impact !== filterImpact) return false;
      if (showStarredOnly && !event.starred) return false;
      return true;
    });
  }, [allEvents, filterCategory, filterCountry, filterImpact, showStarredOnly]);

  // Group events by date
  const eventsByDate = useMemo(() => {
    const grouped: Record<string, EconomicEvent[]> = {};
    filteredEvents.forEach((event) => {
      if (!grouped[event.date]) {
        grouped[event.date] = [];
      }
      grouped[event.date].push(event);
    });
    return grouped;
  }, [filteredEvents]);

  // Get week days
  const weekDays = useMemo(() => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStart);
      date.setDate(date.getDate() + i);
      days.push(date);
    }
    return days;
  }, [weekStart]);

  const navigateWeek = (delta: number) => {
    const newStart = new Date(weekStart);
    newStart.setDate(newStart.getDate() + delta * 7);
    setWeekStart(newStart);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
  };

  const isToday = (date: Date) => {
    return date.toDateString() === now.toDateString();
  };

  const getCountryFlag = (code: string) => {
    const flags: Record<string, string> = {
      US: "🇺🇸", EU: "🇪🇺", GB: "🇬🇧", JP: "🇯🇵", CN: "🇨🇳", DE: "🇩🇪", CRYPTO: "₿",
    };
    return flags[code] || "🌍";
  };

  // Stats for the week
  const weekStats = useMemo(() => {
    const weekEvents = filteredEvents.filter((e) => {
      const eventDate = new Date(e.date);
      return eventDate >= weekStart && eventDate < new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000);
    });
    return {
      total: weekEvents.length,
      high: weekEvents.filter((e) => e.impact === "high").length,
      medium: weekEvents.filter((e) => e.impact === "medium").length,
      crypto: weekEvents.filter((e) => e.category === "crypto").length,
    };
  }, [filteredEvents, weekStart]);

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
          <p className="text-muted-foreground">
            {t("description")}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Calendar className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t("thisWeek")}</p>
                <p className="text-xl font-bold">{weekStats.total} {t("events")}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-500/10">
                <AlertTriangle className="h-5 w-5 text-red-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t("highImpact")}</p>
                <p className="text-xl font-bold text-red-500">{weekStats.high}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-500/10">
                <Clock className="h-5 w-5 text-yellow-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t("mediumImpact")}</p>
                <p className="text-xl font-bold text-yellow-500">{weekStats.medium}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500/10">
                <span className="text-lg">₿</span>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t("cryptoEvents")}</p>
                <p className="text-xl font-bold text-orange-500">{weekStats.crypto}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            <Select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
              {CATEGORIES.map((cat) => (
                <SelectOption key={cat.value} value={cat.value}>
                  {cat.label}
                </SelectOption>
              ))}
            </Select>

            <Select value={filterCountry} onChange={(e) => setFilterCountry(e.target.value)}>
              {COUNTRIES.map((c) => (
                <SelectOption key={c.value} value={c.value}>
                  {c.label}
                </SelectOption>
              ))}
            </Select>

            <Select value={filterImpact} onChange={(e) => setFilterImpact(e.target.value as typeof filterImpact)}>
              <SelectOption value="all">{t("allImpact")}</SelectOption>
              <SelectOption value="high">{t("highImpact")}</SelectOption>
              <SelectOption value="medium">{t("mediumImpact")}</SelectOption>
              <SelectOption value="low">{t("lowImpact")}</SelectOption>
            </Select>

            <Button
              variant={showStarredOnly ? "secondary" : "outline"}
              size="sm"
              onClick={() => setShowStarredOnly(!showStarredOnly)}
            >
              <Star className={cn("mr-2 h-4 w-4", showStarredOnly && "fill-yellow-500 text-yellow-500")} />
              {t("starred")}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Week Navigation */}
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={() => navigateWeek(-1)}>
          <ChevronLeft className="mr-2 h-4 w-4" />
          {t("previousWeek")}
        </Button>
        <h2 className="text-lg font-semibold">
          {formatDate(weekStart)} - {formatDate(weekDays[6])}
        </h2>
        <Button variant="outline" onClick={() => navigateWeek(1)}>
          {t("nextWeek")}
          <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>

      {/* Calendar Grid */}
      <div className="grid gap-4 lg:grid-cols-7">
        {weekDays.map((day) => {
          const dateStr = day.toISOString().split("T")[0];
          const dayEvents = eventsByDate[dateStr] || [];

          return (
            <Card
              key={dateStr}
              className={cn(
                "min-h-[300px]",
                isToday(day) && "ring-2 ring-primary"
              )}
            >
              <CardHeader className={cn(
                "pb-2",
                isToday(day) && "bg-primary/5"
              )}>
                <CardTitle className="text-sm flex items-center justify-between">
                  <span>{formatDate(day)}</span>
                  {isToday(day) && <Badge>{t("today")}</Badge>}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {dayEvents.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-4">
                    {t("noEvents")}
                  </p>
                ) : (
                  dayEvents.map((event) => (
                    <div
                      key={event.id}
                      className="p-2 rounded-lg border bg-card hover:bg-muted/50 transition-colors cursor-pointer"
                    >
                      <div className="flex items-start gap-2">
                        <div
                          className={cn(
                            "w-2 h-2 rounded-full mt-1.5 shrink-0",
                            IMPACT_COLORS[event.impact]
                          )}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1">
                            <span className="text-sm">{getCountryFlag(event.countryCode)}</span>
                            <span className="text-xs font-medium truncate">
                              {event.title}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            <span>{event.time}</span>
                          </div>
                          <div className="flex items-center gap-2 mt-1 text-xs">
                            <span className="text-muted-foreground">
                              {t("prev")}: {event.previous}
                            </span>
                            <span className="text-muted-foreground">
                              {t("fcst")}: {event.forecast}
                            </span>
                            {event.actual && (
                              <span className={cn(
                                "font-semibold",
                                parseFloat(event.actual) > parseFloat(event.forecast)
                                  ? "text-green-500"
                                  : "text-red-500"
                              )}>
                                {t("act")}: {event.actual}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
