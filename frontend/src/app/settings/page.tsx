"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { User, Key, Bell, Shield, Palette, Globe } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account and preferences
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Sidebar */}
        <div className="space-y-2">
          {[
            { icon: User, label: "Profile", active: true },
            { icon: Key, label: "API Keys", active: false },
            { icon: Bell, label: "Notifications", active: false },
            { icon: Shield, label: "Security", active: false },
            { icon: Palette, label: "Appearance", active: false },
            { icon: Globe, label: "Language", active: false },
          ].map((item) => (
            <Button
              key={item.label}
              variant={item.active ? "secondary" : "ghost"}
              className="w-full justify-start"
            >
              <item.icon className="mr-2 h-4 w-4" />
              {item.label}
            </Button>
          ))}
        </div>

        {/* Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile */}
          <Card>
            <CardHeader>
              <CardTitle>Profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted text-xl font-bold">
                  QX
                </div>
                <div>
                  <h3 className="font-semibold">Quantum X User</h3>
                  <p className="text-sm text-muted-foreground">
                    user@example.com
                  </p>
                </div>
              </div>
              <Separator />
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm text-muted-foreground">
                    Display Name
                  </label>
                  <input
                    type="text"
                    defaultValue="Quantum X User"
                    className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Email</label>
                  <input
                    type="email"
                    defaultValue="user@example.com"
                    className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  />
                </div>
              </div>
              <Button>Save Changes</Button>
            </CardContent>
          </Card>

          {/* API Keys */}
          <Card>
            <CardHeader>
              <CardTitle>API Keys</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg border border-border p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Binance</h4>
                    <p className="text-xs text-muted-foreground">
                      Connected on Jan 15, 2026
                    </p>
                  </div>
                  <Badge variant="outline" className="text-green-500 border-green-500/50">
                    Active
                  </Badge>
                </div>
              </div>
              <div className="rounded-lg border border-border p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Coinbase</h4>
                    <p className="text-xs text-muted-foreground">
                      Not connected
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    Connect
                  </Button>
                </div>
              </div>
              <Button variant="outline">
                <Key className="mr-2 h-4 w-4" />
                Add API Key
              </Button>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card>
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { label: "Trade Executions", description: "Get notified when trades are executed", enabled: true },
                { label: "Risk Alerts", description: "Receive alerts when risk limits are approached", enabled: true },
                { label: "Strategy Updates", description: "Notifications about strategy status changes", enabled: false },
                { label: "Market News", description: "Important market news and events", enabled: false },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">{item.label}</h4>
                    <p className="text-xs text-muted-foreground">{item.description}</p>
                  </div>
                  <div className={`h-6 w-11 rounded-full ${item.enabled ? 'bg-green-500' : 'bg-muted'} relative cursor-pointer`}>
                    <div className={`absolute h-5 w-5 rounded-full bg-white top-0.5 transition-all ${item.enabled ? 'right-0.5' : 'left-0.5'}`} />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
