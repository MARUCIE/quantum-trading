"use client";

import { Bell, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/theme-toggle";
import { MobileNav } from "@/components/layout/mobile-nav";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function Header() {
  return (
    <header className="flex h-14 md:h-16 items-center justify-between border-b border-border bg-background px-4 md:px-6">
      {/* Left side - Mobile nav + Search */}
      <div className="flex items-center gap-2 md:gap-4">
        {/* Mobile Navigation */}
        <MobileNav />

        {/* Search - Hidden on mobile, shown on tablet+ */}
        <div className="relative hidden sm:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search strategies, assets..."
            className="h-9 w-48 md:w-64 lg:w-80 rounded-md border border-input bg-background pl-9 pr-4 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 rounded border border-border bg-muted px-1.5 text-xs text-muted-foreground hidden lg:inline-flex">
            /
          </kbd>
        </div>

        {/* Mobile Search Button */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="sm:hidden">
              <Search className="h-4 w-4" />
              <span className="sr-only">Search</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>Search</TooltipContent>
        </Tooltip>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-1 md:gap-2">
        {/* Market Status - Hidden on mobile */}
        <div className="hidden md:flex mr-4 items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500"></span>
          </span>
          <span className="text-sm text-muted-foreground">Markets Open</span>
        </div>

        {/* Market Status Indicator - Mobile only (just the dot) */}
        <span className="relative flex h-2 w-2 md:hidden mr-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span>
          <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500"></span>
        </span>

        {/* Notifications */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="relative h-9 w-9">
              <Bell className="h-4 w-4" />
              <Badge
                variant="destructive"
                className="absolute -right-1 -top-1 h-4 w-4 rounded-full p-0 text-xs"
              >
                3
              </Badge>
            </Button>
          </TooltipTrigger>
          <TooltipContent>Notifications</TooltipContent>
        </Tooltip>

        {/* Theme Toggle */}
        <ThemeToggle />
      </div>
    </header>
  );
}
