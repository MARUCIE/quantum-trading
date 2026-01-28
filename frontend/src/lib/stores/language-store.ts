import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { type Locale, defaultLocale, locales } from "@/i18n/config";

/**
 * Language Store
 *
 * Manages the user's language preference with localStorage persistence.
 * Default language is Chinese (zh).
 */

interface LanguageState {
  locale: Locale;
  setLocale: (locale: Locale) => void;
}

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set) => ({
      locale: defaultLocale,
      setLocale: (locale: Locale) => {
        // Validate locale
        if (locales.includes(locale)) {
          set({ locale });
          // Update cookie for server-side rendering
          document.cookie = `NEXT_LOCALE=${locale};path=/;max-age=31536000`;
        }
      },
    }),
    {
      name: "quantum-x-language",
      storage: createJSONStorage(() => localStorage),
    }
  )
);

// Selector for easier access
export const selectLocale = (state: LanguageState) => state.locale;
