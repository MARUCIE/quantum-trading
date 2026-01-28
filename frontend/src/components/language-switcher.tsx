"use client";

import { useLanguageStore } from "@/lib/stores/language-store";
import { locales, localeNames, localeFlags, type Locale } from "@/i18n/config";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Globe } from "lucide-react";

/**
 * Language Switcher Component
 *
 * Dropdown menu for switching between Chinese and English.
 * Uses Zustand store for persistence and triggers full page reload for SSR update.
 */
export function LanguageSwitcher() {
  const { locale, setLocale } = useLanguageStore();

  const handleLocaleChange = (newLocale: Locale) => {
    if (newLocale === locale) return;
    setLocale(newLocale);
    // Full page reload to apply the new locale from cookie
    window.location.reload();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-9 w-9">
          <Globe className="h-4 w-4" />
          <span className="sr-only">Switch language</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {locales.map((loc) => (
          <DropdownMenuItem
            key={loc}
            onClick={() => handleLocaleChange(loc)}
            className={locale === loc ? "bg-accent" : ""}
          >
            <span className="mr-2">{localeFlags[loc]}</span>
            {localeNames[loc]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/**
 * Compact Language Switcher
 *
 * Simple button that toggles between languages.
 */
export function LanguageSwitcherCompact() {
  const { locale, setLocale } = useLanguageStore();

  const toggleLocale = () => {
    const newLocale = locale === "zh" ? "en" : "zh";
    setLocale(newLocale);
    window.location.reload();
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleLocale}
      className="h-8 px-2 text-xs"
    >
      <Globe className="mr-1 h-3 w-3" />
      {localeNames[locale]}
    </Button>
  );
}
