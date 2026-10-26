// Site-wide constants used for metadata, the sitemap and robots.txt.

/** Public origin of the production site. Override with NEXT_PUBLIC_SITE_URL (e.g. after adding a custom domain). */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://pokedb-one.vercel.app").replace(/\/$/, "");

export const SITE_NAME = "poKeDB";

export const SITE_DESCRIPTION =
  "A fast, visual Pokédex for all 1,025 Pokémon: stats, types, evolutions, moves, locations, Pokédex entries and trading cards across every generation.";

/** Highest National Dex number covered by the site. */
export const MAX_POKEMON_ID = 1025;

export const GENERATION_COUNT = 9;

/** Region introduced by each generation, indexed by generation number - 1. */
export const GENERATION_REGIONS = [
  "Kanto", "Johto", "Hoenn", "Sinnoh", "Unova", "Kalos", "Alola", "Galar", "Paldea",
];
