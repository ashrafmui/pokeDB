// Maps each Pokémon game version to the generation it belongs to,
// and exposes a roman numeral for display in the pokedex entry card.
const versionToGeneration: Record<string, number> = {
  red: 1, blue: 1, yellow: 1,
  gold: 2, silver: 2, crystal: 2,
  ruby: 3, sapphire: 3, emerald: 3, firered: 3, leafgreen: 3,
  diamond: 4, pearl: 4, platinum: 4, heartgold: 4, soulsilver: 4,
  black: 5, white: 5, "black-2": 5, "white-2": 5,
  x: 6, y: 6, "omega-ruby": 6, "alpha-sapphire": 6,
  sun: 7, moon: 7, "ultra-sun": 7, "ultra-moon": 7,
  "lets-go-pikachu": 7, "lets-go-eevee": 7,
  sword: 8, shield: 8,
  "brilliant-diamond": 8, "shining-pearl": 8,
  "legends-arceus": 8,
  scarlet: 9, violet: 9,
};

const ROMAN: Record<number, string> = {
  1: "I", 2: "II", 3: "III", 4: "IV", 5: "V",
  6: "VI", 7: "VII", 8: "VIII", 9: "IX",
};

export function getGenerationNumber(version: string): number | null {
  return versionToGeneration[version] ?? null;
}

export function getGenerationRoman(version: string): string | null {
  const gen = versionToGeneration[version];
  return gen ? ROMAN[gen] : null;
}
