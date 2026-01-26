"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const navigation = [
  { name: "Overview", href: "/", icon: LayoutDashboard },
  { name: "Strategies", href: "/strategies", icon: FlaskConical },
  { name: "Backtest", href: "/backtest", icon: LineChart },
  { name: "Trading", href: "/trading", icon: CandlestickChart },
  { name: "Risk", href: "/risk", icon: Shield },
  { name: "Copy Trading", href: "/copy", icon: Users },
];

const secondaryNavigation = [
  { name: "Alerts", href: "/alerts", icon: Bell },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-64 flex-col border-r border-border bg-sidebar">
      {/* Logo */}
      <div className="flex h-16 items-center gap-2 px-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
          <CandlestickChart className="h-5 w-5 text-primary-foreground" />
        </div>
        <span className="text-lg font-semibold tracking-tight">Quantum X</span>
      </div>

      <Separator />

      {/* Primary Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.name} href={item.href}>
              <Button
                variant={isActive ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start gap-3",
                  isActive && "bg-sidebar-accent"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.name}
              </Button>
            </Link>
          );
        })}
      </nav>

      <Separator />

      {/* Secondary Navigation */}
      <nav className="space-y-1 px-3 py-4">
        {secondaryNavigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.name} href={item.href}>
              <Button
                variant={isActive ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start gap-3",
                  isActive && "bg-sidebar-accent"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.name}
              </Button>
            </Link>
          );
        })}
      </nav>

      {/* User Section */}
      <div className="border-t border-border p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted">
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
