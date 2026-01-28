"use client";

/**
 * Settings Page
 *
 * Demonstrates form validation with accessible form components.
 * Uses useFormValidation hook for field-level validation.
 */

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { FormField, TextareaField } from "@/components/ui/form-field";
import { useFormValidation, type ValidationRule } from "@/lib/hooks/use-form-validation";
import { User, Key, Bell, Shield, Palette, Globe, Check, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";

type SettingsSection = "profile" | "api" | "notifications" | "security" | "appearance" | "language";

export default function SettingsPage() {
  const t = useTranslations("settingsPage");
  const [activeSection, setActiveSection] = useState<SettingsSection>("profile");
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Form validation for profile
  const profileForm = useFormValidation({
    displayName: {
      initialValue: "Quantum X User",
      rules: [
        { type: "required", message: t("displayNameRequired") },
        { type: "minLength", value: 2, message: t("displayNameMinLength") },
        { type: "maxLength", value: 50, message: t("displayNameMaxLength") },
      ] as ValidationRule<string>[],
    },
    email: {
      initialValue: "user@example.com",
      rules: [
        { type: "required", message: t("emailRequired") },
        { type: "email", message: t("emailInvalid") },
      ] as ValidationRule<string>[],
    },
    bio: {
      initialValue: "",
      rules: [
        { type: "maxLength", value: 200, message: t("bioMaxLength") },
      ] as ValidationRule<string>[],
    },
  });

  // Form validation for API key
  const apiKeyForm = useFormValidation({
    apiKey: {
      initialValue: "",
      rules: [
        { type: "required", message: t("apiKeyRequired") },
        { type: "minLength", value: 20, message: t("apiKeyMinLength") },
      ] as ValidationRule<string>[],
    },
    apiSecret: {
      initialValue: "",
      rules: [
        { type: "required", message: t("apiSecretRequired") },
        { type: "minLength", value: 20, message: t("apiSecretMinLength") },
      ] as ValidationRule<string>[],
    },
  });

  const handleProfileSubmit = profileForm.handleSubmit(async (values) => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  });

  const handleApiKeySubmit = apiKeyForm.handleSubmit(async (values) => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    apiKeyForm.reset();
  });

  const navItems = [
    { icon: User, label: t("profile"), section: "profile" as const },
    { icon: Key, label: t("apiKeys"), section: "api" as const },
    { icon: Bell, label: t("notifications"), section: "notifications" as const },
    { icon: Shield, label: t("security"), section: "security" as const },
    { icon: Palette, label: t("appearance"), section: "appearance" as const },
    { icon: Globe, label: t("language"), section: "language" as const },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
        <p className="text-muted-foreground">
          {t("description")}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Sidebar Navigation */}
        <nav className="space-y-2" aria-label="Settings sections">
          {navItems.map((item) => (
            <Button
              key={item.label}
              variant={activeSection === item.section ? "secondary" : "ghost"}
              className="w-full justify-start"
              onClick={() => setActiveSection(item.section)}
              aria-current={activeSection === item.section ? "page" : undefined}
            >
              <item.icon className="mr-2 h-4 w-4" aria-hidden="true" />
              {item.label}
            </Button>
          ))}
        </nav>

        {/* Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile Section */}
          {activeSection === "profile" && (
            <Card className="animate-in fade-in-0 duration-300">
              <CardHeader>
                <CardTitle>{t("profile")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted text-xl font-bold">
                    QX
                  </div>
                  <div>
                    <h3 className="font-semibold">{profileForm.getValue("displayName")}</h3>
                    <p className="text-sm text-muted-foreground">
                      {profileForm.getValue("email")}
                    </p>
                  </div>
                </div>
                <Separator />
                <form onSubmit={handleProfileSubmit} className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                      id="displayName"
                      label={t("displayName")}
                      required
                      value={profileForm.getValue("displayName")}
                      onChange={(e) => profileForm.handleChange("displayName", e)}
                      onBlur={() => profileForm.handleBlur("displayName")}
                      error={profileForm.getError("displayName")}
                      placeholder={t("enterName")}
                    />
                    <FormField
                      id="email"
                      label={t("email")}
                      type="email"
                      required
                      value={profileForm.getValue("email")}
                      onChange={(e) => profileForm.handleChange("email", e)}
                      onBlur={() => profileForm.handleBlur("email")}
                      error={profileForm.getError("email")}
                      placeholder={t("enterEmail")}
                    />
                  </div>
                  <TextareaField
                    id="bio"
                    label={t("bio")}
                    description={t("bioDescription")}
                    value={profileForm.getValue("bio")}
                    onChange={(e) => profileForm.handleChange("bio", e as React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>)}
                    onBlur={() => profileForm.handleBlur("bio")}
                    error={profileForm.getError("bio")}
                    placeholder={t("tellAboutYourself")}
                    rows={3}
                  />
                  <div className="flex items-center gap-2">
                    <Button
                      type="submit"
                      disabled={profileForm.isSubmitting || !profileForm.isValid}
                    >
                      {profileForm.isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                          {t("saving")}
                        </>
                      ) : (
                        t("saveChanges")
                      )}
                    </Button>
                    {saveSuccess && (
                      <span className="flex items-center gap-1 text-sm text-profit animate-in fade-in-0 duration-200">
                        <Check className="h-4 w-4" aria-hidden="true" />
                        {t("savedSuccessfully")}
                      </span>
                    )}
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* API Keys Section */}
          {activeSection === "api" && (
            <Card className="animate-in fade-in-0 duration-300">
              <CardHeader>
                <CardTitle>{t("apiKeys")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Connected APIs */}
                <div className="rounded-lg border border-border p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Binance</h4>
                      <p className="text-xs text-muted-foreground">
                        {t("connectedOn", { date: "Jan 15, 2026" })}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-profit border-profit/50">
                      {t("active")}
                    </Badge>
                  </div>
                </div>
                <div className="rounded-lg border border-border p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Coinbase</h4>
                      <p className="text-xs text-muted-foreground">
                        {t("notConnected")}
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      {t("connect")}
                    </Button>
                  </div>
                </div>

                <Separator />

                {/* Add New API Key Form */}
                <div>
                  <h4 className="font-medium mb-4">{t("addNewApiKey")}</h4>
                  <form onSubmit={handleApiKeySubmit} className="space-y-4">
                    <FormField
                      id="apiKey"
                      label={t("apiKey")}
                      required
                      type="password"
                      value={apiKeyForm.getValue("apiKey")}
                      onChange={(e) => apiKeyForm.handleChange("apiKey", e)}
                      onBlur={() => apiKeyForm.handleBlur("apiKey")}
                      error={apiKeyForm.getError("apiKey")}
                      description={t("apiKeyDescription")}
                      placeholder={t("enterApiKey")}
                    />
                    <FormField
                      id="apiSecret"
                      label={t("apiSecret")}
                      required
                      type="password"
                      value={apiKeyForm.getValue("apiSecret")}
                      onChange={(e) => apiKeyForm.handleChange("apiSecret", e)}
                      onBlur={() => apiKeyForm.handleBlur("apiSecret")}
                      error={apiKeyForm.getError("apiSecret")}
                      placeholder={t("enterApiSecret")}
                    />
                    <Button
                      type="submit"
                      variant="outline"
                      disabled={apiKeyForm.isSubmitting || !apiKeyForm.isValid}
                    >
                      {apiKeyForm.isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                          {t("adding")}
                        </>
                      ) : (
                        <>
                          <Key className="mr-2 h-4 w-4" aria-hidden="true" />
                          {t("addApiKey")}
                        </>
                      )}
                    </Button>
                  </form>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Notifications Section */}
          {activeSection === "notifications" && (
            <Card className="animate-in fade-in-0 duration-300">
              <CardHeader>
                <CardTitle>{t("notifications")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { key: "tradeExecutions", label: t("tradeExecutions"), description: t("tradeExecutionsDesc"), enabled: true },
                  { key: "riskAlerts", label: t("riskAlerts"), description: t("riskAlertsDesc"), enabled: true },
                  { key: "strategyUpdates", label: t("strategyUpdates"), description: t("strategyUpdatesDesc"), enabled: false },
                  { key: "marketNews", label: t("marketNews"), description: t("marketNewsDesc"), enabled: false },
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">{item.label}</h4>
                      <p className="text-xs text-muted-foreground">{item.description}</p>
                    </div>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={item.enabled}
                      aria-label={item.label}
                      className={`h-6 w-11 rounded-full ${item.enabled ? 'bg-profit' : 'bg-muted'} relative cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2`}
                    >
                      <span
                        className={`absolute h-5 w-5 rounded-full bg-white top-0.5 transition-all ${item.enabled ? 'right-0.5' : 'left-0.5'}`}
                        aria-hidden="true"
                      />
                    </button>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Security Section */}
          {activeSection === "security" && (
            <Card className="animate-in fade-in-0 duration-300">
              <CardHeader>
                <CardTitle>{t("security")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">{t("twoFactorAuth")}</h4>
                    <p className="text-xs text-muted-foreground">
                      {t("twoFactorAuthDesc")}
                    </p>
                  </div>
                  <Button variant="outline">{t("enable2FA")}</Button>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">{t("changePassword")}</h4>
                    <p className="text-xs text-muted-foreground">
                      {t("lastChanged", { days: 30 })}
                    </p>
                  </div>
                  <Button variant="outline">{t("update")}</Button>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">{t("activeSessions")}</h4>
                    <p className="text-xs text-muted-foreground">
                      {t("activeSessionsDesc")}
                    </p>
                  </div>
                  <Button variant="outline">{t("viewAll")}</Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Appearance Section */}
          {activeSection === "appearance" && (
            <Card className="animate-in fade-in-0 duration-300">
              <CardHeader>
                <CardTitle>{t("appearance")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  {t("appearanceDesc")}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Language Section */}
          {activeSection === "language" && (
            <Card className="animate-in fade-in-0 duration-300">
              <CardHeader>
                <CardTitle>{t("language")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  {t("languageDesc")}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
