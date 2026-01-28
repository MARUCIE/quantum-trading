"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  LineChart,
  FlaskConical,
  CandlestickChart,
  Shield,
  Settings,
  Users,
  Bell,
  FileText,
  Key,
  SlidersHorizontal,
  Layers,
  PieChart,
  BookOpen,
  Grid3X3,
  Calculator,
  GitCompare,
  BarChart2,
  CalendarDays,
  Radio,
  Scan,
  Eye,
  CalendarCheck,
  BarChart,
  PlayCircle,
  Brain,
  Sparkles,
  Wand2,
  TestTube,
  Building2,
  ArrowUpDown,
  Route,
  Zap,
  Server,
  Globe,
  Activity,
  LayoutGrid,
  Wallet,
  Trophy,
  Store,
  Smartphone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

// Navigation items with translation keys
const navigation = [
  { key: "overview", href: "/", icon: LayoutDashboard },
  { key: "strategies", href: "/strategies", icon: FlaskConical },
  { key: "backtest", href: "/backtest", icon: LineChart },
  { key: "optimizer", href: "/optimizer", icon: SlidersHorizontal },
  { key: "mtfAnalysis", href: "/mtf", icon: Layers },
  { key: "trading", href: "/trading", icon: CandlestickChart },
  { key: "risk", href: "/risk", icon: Shield },
  { key: "copyTrading", href: "/copy", icon: Users },
  { key: "allocation", href: "/allocation", icon: PieChart },
  { key: "journal", href: "/journal", icon: BookOpen },
  { key: "correlation", href: "/correlation", icon: Grid3X3 },
  { key: "positionSizing", href: "/position-sizing", icon: Calculator },
  { key: "compare", href: "/compare", icon: GitCompare },
  { key: "orderBook", href: "/orderbook", icon: BarChart2 },
  { key: "pnlCalendar", href: "/pnl-calendar", icon: CalendarDays },
  { key: "signals", href: "/signals", icon: Radio },
  { key: "scanner", href: "/scanner", icon: Scan },
  { key: "watchlist", href: "/watchlist", icon: Eye },
  { key: "calendar", href: "/calendar", icon: CalendarCheck },
  { key: "attribution", href: "/attribution", icon: BarChart },
  { key: "replay", href: "/replay", icon: PlayCircle },
  { key: "mlModels", href: "/ml-models", icon: Brain },
  { key: "features", href: "/feature-importance", icon: Sparkles },
  { key: "generator", href: "/strategy-generator", icon: Wand2 },
  { key: "mlBacktest", href: "/model-backtest", icon: TestTube },
  { key: "exchanges", href: "/exchanges", icon: Building2 },
  { key: "exchangeCompare", href: "/exchange-compare", icon: ArrowUpDown },
  { key: "routing", href: "/smart-routing", icon: Route },
  { key: "arbitrage", href: "/arbitrage", icon: Zap },
  { key: "config", href: "/config", icon: Server },
  { key: "infrastructure", href: "/infrastructure", icon: Globe },
  { key: "monitoring", href: "/monitoring", icon: Activity },
  { key: "notifications", href: "/notifications", icon: Bell },
  { key: "preferences", href: "/preferences", icon: Settings },
  { key: "dashboardBuilder", href: "/dashboard-builder", icon: LayoutGrid },
  { key: "portfolio", href: "/portfolio-analytics", icon: Wallet },
  { key: "tradeStats", href: "/trade-stats", icon: BarChart },
  { key: "leaderboard", href: "/leaderboard", icon: Trophy },
  { key: "marketplace", href: "/marketplace", icon: Store },
  { key: "mobile", href: "/mobile", icon: Smartphone },
];

const secondaryNavigation = [
  { key: "alerts", href: "/alerts", icon: Bell },
  { key: "apiKeys", href: "/api-keys", icon: Key },
  { key: "auditLog", href: "/audit", icon: FileText },
  { key: "settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const t = useTranslations("nav");

  return (
    <aside
      className="hidden md:flex h-dvh w-64 flex-col border-r border-border bg-sidebar"
      role="navigation"
      aria-label="Main navigation"
    >
      {/* Logo */}
      <div className="flex h-16 items-center gap-2 px-6">
        <div
          className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary"
          aria-hidden="true"
        >
          <CandlestickChart className="h-5 w-5 text-primary-foreground" />
        </div>
        <span className="text-lg font-semibold tracking-tight">Quantum X</span>
      </div>

      <Separator />

      {/* Primary Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4" aria-label="Primary">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          const name = t(item.key);
          return (
            <Link
              key={item.key}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
            >
              <Button
                variant={isActive ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start gap-3 focus-ring",
                  isActive && "bg-sidebar-accent"
                )}
                tabIndex={-1}
              >
                <item.icon className="h-4 w-4" aria-hidden="true" />
                {name}
              </Button>
            </Link>
          );
        })}
      </nav>

      <Separator />

      {/* Secondary Navigation */}
      <nav className="space-y-1 px-3 py-4" aria-label="Secondary">
        {secondaryNavigation.map((item) => {
          const isActive = pathname === item.href;
          const name = t(item.key);
          return (
            <Link
              key={item.key}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
            >
              <Button
                variant={isActive ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start gap-3 focus-ring",
                  isActive && "bg-sidebar-accent"
                )}
                tabIndex={-1}
              >
                <item.icon className="h-4 w-4" aria-hidden="true" />
                {name}
              </Button>
            </Link>
          );
        })}
      </nav>

      {/* User Section */}
      <div className="border-t border-border p-4" role="region" aria-label="User info">
        <div className="flex items-center gap-3">
          <div
            className="flex h-9 w-9 items-center justify-center rounded-full bg-muted"
            aria-hidden="true"
          >
            <span className="text-sm font-medium">QX</span>
          </div>
          <div className="flex-1 truncate">
            <p className="text-sm font-medium">Quantum X</p>
            <p className="text-xs text-muted-foreground">Paper Trading</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
