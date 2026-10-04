import { site, type Locale } from "../data/site";
import { ui, defaultLang, type UiKey } from "./ui";

export function isLocale(value: string | undefined): value is Locale {
  return !!value && (site.locales as readonly string[]).includes(value);
}

/** Resolve the active locale from a pathname (`/si/...` => "si"). */
export function getLangFromUrl(url: URL): Locale {
  const [, first] = url.pathname.split("/");
  if (isLocale(first)) return first;
  return defaultLang;
}

/** Translator bound to a locale, falling back to English for missing strings. */
export function useTranslations(lang: Locale) {
  return function t(key: UiKey): string {
    return ui[lang][key] ?? ui[defaultLang][key] ?? key;
  };
}

/** Prefix a root-relative path with the locale (English stays unprefixed). */
export function localizePath(path: string, lang: Locale): string {
  const clean = path.startsWith("/") ? path : `/${path}`;
  if (lang === defaultLang) return clean;
  return clean === "/" ? `/${lang}` : `/${lang}${clean}`;
}

/** Map the current pathname onto another locale, preserving the page. */
export function switchLocalePath(pathname: string, target: Locale): string {
  const parts = pathname.split("/").filter(Boolean);
  if (isLocale(parts[0])) parts.shift();
  const rest = parts.join("/");
  return localizePath(rest ? `/${rest}` : "/", target);
}
