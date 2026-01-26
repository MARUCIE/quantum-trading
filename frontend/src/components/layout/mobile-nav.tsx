"use client";

/**
 * Mobile Navigation
 *
 * Responsive navigation drawer for mobile devices.
 */

import { useState } from "react";
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
  Menu,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
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

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle navigation menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-64 p-0">
        <SheetHeader className="border-b border-border p-4">
          <SheetTitle className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <CandlestickChart className="h-5 w-5 text-primary-foreground" />
            </div>
            <span>Quantum X</span>
          </SheetTitle>
        </SheetHeader>

        {/* Primary Navigation */}
        <nav className="flex-1 space-y-1 px-3 py-4">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setOpen(false)}
              >
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
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setOpen(false)}
              >
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
        <div className="mt-auto border-t border-border p-4">
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
      </SheetContent>
    </Sheet>
  );
}
