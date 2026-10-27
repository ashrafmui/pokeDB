import type { MetadataRoute } from "next";
import { GENERATION_COUNT, MAX_POKEMON_ID, SITE_URL } from "@/lib/site";
import { TYPE_CHART } from "@/lib/typeUtils";

export default function sitemap(): MetadataRoute.Sitemap {
  const page = (path: string, priority: number): MetadataRoute.Sitemap[number] => ({
    url: `${SITE_URL}${path}`,
    changeFrequency: "monthly",
    priority,
  });

  return [
    page("/", 1),
    ...Array.from({ length: GENERATION_COUNT }, (_, i) => page(`/generation/${i + 1}`, 0.8)),
    ...Object.keys(TYPE_CHART).map((type) => page(`/type/${type}`, 0.7)),
    ...Array.from({ length: MAX_POKEMON_ID }, (_, i) => page(`/pokemon/${i + 1}`, 0.6)),
    page("/play", 0.7),
    { ...page("/play/pokedle", 0.9), changeFrequency: "daily" },
    page("/disclaimer", 0.1),
  ];
}
