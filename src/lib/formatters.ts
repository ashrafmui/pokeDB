// Small, shared string/number formatting helpers. These cover the
// capitalize / kebab-case / dex-number / measurement patterns that were
// previously copy-pasted across components.

/** "fire" → "Fire" */
export function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/** "rock-smash" → "Rock Smash" */
export function toTitleCase(s: string): string {
  return s.split("-").map(capitalize).join(" ");
}

/** "black-2" → "black 2" (replaces hyphens with spaces, no casing change) */
export function kebabToSpace(s: string): string {
  return s.replace(/-/g, " ");
}

/** 25 → "025" — zero-padded National Dex number. */
export function formatDexNumber(id: number, width = 3): string {
  return id.toString().padStart(width, "0");
}

/** PokeAPI height is in decimetres. */
export function formatHeight(decimeters: number): { metric: string; imperial: string } {
  const meters = decimeters / 10;
  const totalInches = decimeters * 3.937;
  const feet = Math.floor(totalInches / 12);
  const inches = Math.round(totalInches % 12);
  return {
    metric: `${meters.toFixed(1)} m`,
    imperial: `${feet}'${inches.toString().padStart(2, "0")}"`,
  };
}

/** PokeAPI weight is in hectograms. */
export function formatWeight(hectograms: number): { metric: string; imperial: string } {
  const kg = hectograms / 10;
  const lbs = kg * 2.20462;
  return {
    metric: `${kg.toFixed(1)} kg`,
    imperial: `${lbs.toFixed(1)} lbs`,
  };
}
