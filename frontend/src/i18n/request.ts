import { getRequestConfig } from "next-intl/server";
import { cookies } from "next/headers";
import { defaultLocale, locales, type Locale } from "./config";

/**
 * next-intl request configuration
 *
 * Loads messages based on the current locale.
 * Reads locale from NEXT_LOCALE cookie, falls back to default (zh).
 */
export default getRequestConfig(async () => {
  // Read locale from cookie
  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get("NEXT_LOCALE")?.value;

  // Validate and fall back to default if needed
  let locale: Locale = defaultLocale;
  if (cookieLocale && locales.includes(cookieLocale as Locale)) {
    locale = cookieLocale as Locale;
  }

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
