// Canonical Pokémon type → colour mapping. Imported anywhere a type needs a
// background swatch so the palette is defined exactly once.

export const TYPE_COLORS: Record<string, string> = {
  normal: "#A8A878",
  fire: "#F08030",
  water: "#6890F0",
  electric: "#F8D030",
  grass: "#78C850",
  ice: "#98D8D8",
  fighting: "#C03028",
  poison: "#A040A0",
  ground: "#E0C068",
  flying: "#A890F0",
  psychic: "#F85888",
  bug: "#A8B820",
  rock: "#B8A038",
  ghost: "#705898",
  dragon: "#7038F8",
  dark: "#705848",
  steel: "#B8B8D0",
  fairy: "#EE99AC",
};

// Types whose swatch is light enough that dark text reads better on top of it.
const DARK_TEXT_TYPES = new Set(["electric", "ice", "ground", "steel", "fairy"]);

/**
 * Background + readable text colour for a type badge. Falls back to a neutral
 * grey swatch with white text for unknown types.
 */
export function getTypeBadgeColors(type: string): { bg: string; text: string } {
  const bg = TYPE_COLORS[type];
  if (!bg) return { bg: "#888", text: "#fff" };
  return { bg, text: DARK_TEXT_TYPES.has(type) ? "#333" : "#fff" };
}
