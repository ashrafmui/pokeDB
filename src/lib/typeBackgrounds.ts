// Softer, lighter variants of the bold type colors used in PokemonTypes.tsx,
// tuned to sit behind sprites without overwhelming them.
export const typeBackgroundColors: Record<string, string> = {
  normal: "#C6C6A7",
  fire: "#F5AC78",
  water: "#9DB7F5",
  electric: "#FAE078",
  grass: "#A7DB8D",
  ice: "#BCE6E6",
  fighting: "#D67873",
  poison: "#C183C1",
  ground: "#EBD69D",
  flying: "#C6B7F5",
  psychic: "#FA92B2",
  bug: "#C6D16E",
  rock: "#D1C17D",
  ghost: "#A292BC",
  dragon: "#A27DFA",
  dark: "#A29288",
  steel: "#D1D1E0",
  fairy: "#F4BDC9",
};

const FALLBACK = "#E5E7EB";

function colorFor(type: string): string {
  return typeBackgroundColors[type.toLowerCase()] ?? FALLBACK;
}

// Returns a CSS `background` value for one or two pokemon types.
// Single type: a soft radial wash. Dual type: a diagonal blend of both.
export function getTypeBackground(types: string[]): string {
  if (types.length === 0) return FALLBACK;

  if (types.length === 1) {
    const c = colorFor(types[0]);
    return `radial-gradient(circle at 50% 40%, ${c} 0%, ${c}99 60%, ${c}66 100%)`;
  }

  const [a, b] = [colorFor(types[0]), colorFor(types[1])];
  return `linear-gradient(135deg, ${a} 0%, ${a} 45%, ${b} 55%, ${b} 100%)`;
}

// Returns the raw color(s) for a pokemon's typing — useful when you need
// to drive borders, glows, or text accents alongside the background.
export function getTypeColors(types: string[]): string[] {
  return types.map(colorFor);
}
