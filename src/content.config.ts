import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro:schema";

const localizedText = z.object({
  en: z.string(),
  si: z.string().optional(),
  ta: z.string().optional(),
});

/**
 * Salon services. The file name (without `.md`) is the service id used to match
 * rows in the owner's Google Sheet, so keep it stable once live.
 */
const services = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/services" }),
  schema: z.object({
    category: z.string(),
    name: localizedText,
    description: localizedText.optional(),
    duration: z.number().int().positive().optional(),
    price: z.number().nonnegative(),
    available: z.boolean().default(true),
    featured: z.boolean().default(false),
    order: z.number().default(0),
    image: z.string().optional(),
  }),
});

/** Service categories. The file name is the category id referenced by services. */
const categories = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/categories" }),
  schema: z.object({
    name: localizedText,
    order: z.number().default(0),
    image: z.string().optional(),
  }),
});

/** Long-form page copy, one file per locale: `about/en.md`, `about/si.md`, … */
const pages = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/pages" }),
  schema: z.object({
    title: z.string(),
  }),
});

export const collections = { services, categories, pages };
