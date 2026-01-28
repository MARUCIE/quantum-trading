"use client";

/**
 * Dashboard Builder Page (T99)
 *
 * Drag-and-drop widget customization for personalized dashboards.
 */

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  LayoutGrid,
  Plus,
  Save,
  Undo,
  Redo,
  Trash2,
  Copy,
  Settings,
  Move,
  Maximize2,
  Minimize2,
  GripVertical,
  LineChart,
  BarChart,
  PieChart,
  Table,
  Activity,
  Wallet,
  TrendingUp,
  Clock,
  Bell,
  Eye,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

// Types
interface Widget {
  id: string;
  type: string;
  title: string;
  icon: React.ElementType;
  size: "small" | "medium" | "large";
  x: number;
  y: number;
}

interface WidgetTemplate {
  type: string;
  titleKey: string;
  icon: React.ElementType;
  descKey: string;
  defaultSize: "small" | "medium" | "large";
}

// Widget templates with translation keys - defined outside component for static reference
const WIDGET_TEMPLATE_CONFIGS: WidgetTemplate[] = [
  { type: "portfolio", titleKey: "portfolioValue", icon: Wallet, descKey: "portfolioValueDesc", defaultSize: "medium" },
  { type: "pnl", titleKey: "pnlChart", icon: LineChart, descKey: "pnlChartDesc", defaultSize: "large" },
  { type: "positions", titleKey: "openPositions", icon: Table, descKey: "openPositionsDesc", defaultSize: "large" },
  { type: "performance", titleKey: "performance", icon: TrendingUp, descKey: "performanceDesc", defaultSize: "medium" },
  { type: "activity", titleKey: "recentActivity", icon: Activity, descKey: "recentActivityDesc", defaultSize: "medium" },
  { type: "alerts", titleKey: "activeAlerts", icon: Bell, descKey: "activeAlertsDesc", defaultSize: "small" },
  { type: "watchlist", titleKey: "watchlist", icon: Eye, descKey: "watchlistDesc", defaultSize: "medium" },
  { type: "clock", titleKey: "marketClock", icon: Clock, descKey: "marketClockDesc", defaultSize: "small" },
  { type: "allocation", titleKey: "allocation", icon: PieChart, descKey: "allocationDesc", defaultSize: "medium" },
  { type: "volume", titleKey: "volumeChart", icon: BarChart, descKey: "volumeChartDesc", defaultSize: "medium" },
];

export default function DashboardBuilderPage() {
  const t = useTranslations("dashboardBuilderPage");

  // Initial widgets with translation keys
  const getInitialWidgets = (): Widget[] => [
    { id: "w1", type: "portfolio", title: t("portfolioValue"), icon: Wallet, size: "medium", x: 0, y: 0 },
    { id: "w2", type: "pnl", title: t("pnlChart"), icon: LineChart, size: "large", x: 1, y: 0 },
    { id: "w3", type: "positions", title: t("openPositions"), icon: Table, size: "large", x: 0, y: 1 },
    { id: "w4", type: "activity", title: t("recentActivity"), icon: Activity, size: "medium", x: 2, y: 1 },
  ];

  const [widgets, setWidgets] = useState<Widget[]>(getInitialWidgets);
  const [selectedWidget, setSelectedWidget] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [dashboardName, setDashboardName] = useState("My Dashboard");
  const [hasChanges, setHasChanges] = useState(false);

  // Get translated widget templates
  const WIDGET_TEMPLATES = WIDGET_TEMPLATE_CONFIGS.map(template => ({
    ...template,
    title: t(template.titleKey as keyof typeof t),
    description: t(template.descKey as keyof typeof t),
  }));

  const addWidget = (template: WidgetTemplate & { title: string; description: string }) => {
    const newWidget: Widget = {
      id: `w${Date.now()}`,
      type: template.type,
      title: template.title,
      icon: template.icon,
      size: template.defaultSize,
      x: widgets.length % 3,
      y: Math.floor(widgets.length / 3),
    };
    setWidgets([...widgets, newWidget]);
    setHasChanges(true);
  };

  const removeWidget = (id: string) => {
    setWidgets(widgets.filter((w) => w.id !== id));
    setSelectedWidget(null);
    setHasChanges(true);
  };

  const duplicateWidget = (id: string) => {
    const widget = widgets.find((w) => w.id === id);
    if (widget) {
      const newWidget: Widget = {
        ...widget,
        id: `w${Date.now()}`,
        x: (widget.x + 1) % 3,
      };
      setWidgets([...widgets, newWidget]);
      setHasChanges(true);
    }
  };

  const resizeWidget = (id: string, size: "small" | "medium" | "large") => {
    setWidgets(widgets.map((w) => (w.id === id ? { ...w, size } : w)));
    setHasChanges(true);
  };

  const handleSave = () => {
    setHasChanges(false);
    // Save logic
  };

  const getSizeClass = (size: "small" | "medium" | "large") => {
    switch (size) {
      case "small":
        return "col-span-1";
      case "medium":
        return "col-span-1 lg:col-span-2";
      case "large":
        return "col-span-1 lg:col-span-3";
    }
  };

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <LayoutGrid className="h-5 w-5 text-primary" />
          </div>
          <div>
            {isEditing ? (
              <Input
                value={dashboardName}
                onChange={(e) => setDashboardName(e.target.value)}
                className="h-8 w-48"
                onBlur={() => setIsEditing(false)}
                autoFocus
              />
            ) : (
              <h1
                className="text-2xl font-bold tracking-tight cursor-pointer hover:text-primary"
                onClick={() => setIsEditing(true)}
              >
                {dashboardName}
              </h1>
            )}
            <p className="text-muted-foreground">
              {t("description")}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" disabled>
            <Undo className="mr-2 h-4 w-4" />
            {t("undo")}
          </Button>
          <Button variant="outline" size="sm" disabled>
            <Redo className="mr-2 h-4 w-4" />
            {t("redo")}
          </Button>
          <Button size="sm" onClick={handleSave} disabled={!hasChanges}>
            <Save className="mr-2 h-4 w-4" />
            {t("save")}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        {/* Widget Palette */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">{t("addWidgets")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {WIDGET_TEMPLATES.map((template) => (
              <Button
                key={template.type}
                variant="outline"
                className="w-full justify-start gap-2 h-auto py-2"
                onClick={() => addWidget(template)}
              >
                <template.icon className="h-4 w-4 shrink-0" />
                <div className="flex-1 text-left">
                  <p className="font-medium text-xs">{template.title}</p>
                  <p className="text-[10px] text-muted-foreground">{template.description}</p>
                </div>
                <Plus className="h-3 w-3" />
              </Button>
            ))}
          </CardContent>
        </Card>

        {/* Dashboard Canvas */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">{t("dashboardPreview")}</CardTitle>
                <Badge variant="outline">{widgets.length} {t("widgets")}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 lg:grid-cols-3 min-h-[400px]">
                {widgets.map((widget) => (
                  <div
                    key={widget.id}
                    className={cn(
                      "relative group border rounded-lg p-4 cursor-move transition-all",
                      getSizeClass(widget.size),
                      selectedWidget === widget.id
                        ? "border-primary ring-2 ring-primary/20"
                        : "border-border hover:border-primary/50"
                    )}
                    onClick={() => setSelectedWidget(widget.id)}
                  >
                    {/* Drag Handle */}
                    <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <GripVertical className="h-4 w-4 text-muted-foreground" />
                    </div>

                    {/* Widget Actions */}
                    <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={(e) => {
                          e.stopPropagation();
                          duplicateWidget(widget.id);
                        }}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeWidget(widget.id);
                        }}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>

                    {/* Widget Content */}
                    <div className="flex flex-col items-center justify-center h-24">
                      <widget.icon className="h-8 w-8 text-muted-foreground mb-2" />
                      <p className="text-sm font-medium">{widget.title}</p>
                      <Badge variant="secondary" className="mt-1 text-[10px]">
                        {widget.size}
                      </Badge>
                    </div>

                    {/* Resize Buttons */}
                    {selectedWidget === widget.id && (
                      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                        <Button
                          variant={widget.size === "small" ? "secondary" : "ghost"}
                          size="icon"
                          className="h-6 w-6"
                          onClick={(e) => {
                            e.stopPropagation();
                            resizeWidget(widget.id, "small");
                          }}
                        >
                          <Minimize2 className="h-3 w-3" />
                        </Button>
                        <Button
                          variant={widget.size === "medium" ? "secondary" : "ghost"}
                          size="icon"
                          className="h-6 w-6"
                          onClick={(e) => {
                            e.stopPropagation();
                            resizeWidget(widget.id, "medium");
                          }}
                        >
                          <Move className="h-3 w-3" />
                        </Button>
                        <Button
                          variant={widget.size === "large" ? "secondary" : "ghost"}
                          size="icon"
                          className="h-6 w-6"
                          onClick={(e) => {
                            e.stopPropagation();
                            resizeWidget(widget.id, "large");
                          }}
                        >
                          <Maximize2 className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                ))}

                {widgets.length === 0 && (
                  <div className="col-span-3 flex flex-col items-center justify-center h-48 border-2 border-dashed rounded-lg">
                    <LayoutGrid className="h-12 w-12 text-muted-foreground mb-2" />
                    <p className="text-muted-foreground">{t("addWidgetsHint")}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Widget Settings */}
          {selectedWidget && (
            <Card className="mt-4">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    {t("widgetSettings")}
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedWidget(null)}
                  >
                    {t("close")}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="text-sm font-medium mb-2 block">{t("widgetTitle")}</label>
                    <Input
                      value={widgets.find((w) => w.id === selectedWidget)?.title || ""}
                      onChange={(e) => {
                        setWidgets(
                          widgets.map((w) =>
                            w.id === selectedWidget ? { ...w, title: e.target.value } : w
                          )
                        );
                        setHasChanges(true);
                      }}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">{t("size")}</label>
                    <div className="flex gap-2">
                      {(["small", "medium", "large"] as const).map((size) => (
                        <Button
                          key={size}
                          variant={
                            widgets.find((w) => w.id === selectedWidget)?.size === size
                              ? "secondary"
                              : "outline"
                          }
                          size="sm"
                          className="flex-1"
                          onClick={() => resizeWidget(selectedWidget, size)}
                        >
                          {size}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
