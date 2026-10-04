import type { ImageMetadata } from "astro";
import { getCollection } from "astro:content";

import { serviceImages } from "../data/service-images";
import { categoryImages } from "../data/category-images";
import { type Locale, type LocalizedText } from "../data/site";
import servicesLive from "../data/services-live.json";

/** A service image: an optimized imported asset, or a public path (e.g. an SVG). */
export type ServiceImage = ImageMetadata | string;

export type LiveServiceRow = {
  price?: number;
  duration?: number;
  available?: boolean;
  note?: string;
};

const live = servicesLive as Record<string, LiveServiceRow>;

export type Service = {
  id: string;
  category: string;
  name: string;
  description?: string;
  image: ServiceImage;
  price: number;
  duration?: number;
  available: boolean;
  featured: boolean;
  order: number;
  note?: string;
};

export type ServiceCategory = {
  id: string;
  name: string;
  order: number;
  image?: ServiceImage;
};

/** Pick a localized string, falling back to English then an empty string. */
export function pickLocalized(
  text: LocalizedText | undefined,
  lang: Locale,
): string {
  if (!text) return "";
  return text[lang] ?? text.en;
}

/** The full service list for a locale, with build-time Sheet overrides merged in. */
export async function getServices(lang: Locale): Promise<Service[]> {
  const services = await getCollection("services");

  return services
    .map((entry): Service => {
      const data = entry.data;
      const override = live[entry.id] ?? {};
      return {
        id: entry.id,
        category: data.category,
        name: pickLocalized(data.name, lang),
        description: data.description
          ? pickLocalized(data.description, lang)
          : undefined,
        image:
          serviceImages[entry.id] ??
          categoryImages[data.category] ??
          data.image ??
          "/images/placeholder.svg",
        price: override.price ?? data.price,
        duration: override.duration ?? data.duration,
        available: override.available ?? data.available,
        featured: data.featured,
        order: data.order,
        note: override.note,
      };
    })
    .sort((a, b) => a.order - b.order || a.name.localeCompare(b.name));
}

/** Service categories for a locale, ordered. */
export async function getCategories(lang: Locale): Promise<ServiceCategory[]> {
  const categories = await getCollection("categories");

  return categories
    .map((entry): ServiceCategory => ({
      id: entry.id,
      name: pickLocalized(entry.data.name, lang),
      order: entry.data.order,
      image: categoryImages[entry.id] ?? entry.data.image,
    }))
    .sort((a, b) => a.order - b.order);
}
