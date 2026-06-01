// Maps each Pokémon game version to the generation it belongs to,
// and exposes a roman numeral for display in the pokedex entry card.
// Backed by the canonical version table in ./versions.
import { VERSIONS, GENERATION_ROMAN } from "./versions";

export function getGenerationNumber(version: string): number | null {
  return VERSIONS[version]?.generation ?? null;
}

export function getGenerationRoman(version: string): string | null {
  const gen = VERSIONS[version]?.generation;
  return gen ? GENERATION_ROMAN[gen] : null;
}
