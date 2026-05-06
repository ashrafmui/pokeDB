// Maps a Pokémon game version to the Nintendo platform it shipped on,
// and resolves to an SVG icon at `public/images/platforms/{platform}.svg`.
const versionToPlatform: Record<string, string> = {
  red: "gameboy",
  blue: "gameboy",
  yellow: "gameboy",
  gold: "gameboy-color",
  silver: "gameboy-color",
  crystal: "gameboy-color",
  ruby: "gameboy-advance",
  sapphire: "gameboy-advance",
  emerald: "gameboy-advance",
  firered: "gameboy-advance",
  leafgreen: "gameboy-advance",
  diamond: "nintendo-ds",
  pearl: "nintendo-ds",
  platinum: "nintendo-ds",
  heartgold: "nintendo-ds",
  soulsilver: "nintendo-ds",
  black: "nintendo-ds",
  white: "nintendo-ds",
  "black-2": "nintendo-ds",
  "white-2": "nintendo-ds",
  x: "nintendo-3ds",
  y: "nintendo-3ds",
  "omega-ruby": "nintendo-3ds",
  "alpha-sapphire": "nintendo-3ds",
  sun: "nintendo-3ds",
  moon: "nintendo-3ds",
  "ultra-sun": "nintendo-3ds",
  "ultra-moon": "nintendo-3ds",
  "lets-go-pikachu": "switch",
  "lets-go-eevee": "switch",
  sword: "switch",
  shield: "switch",
  "brilliant-diamond": "switch",
  "shining-pearl": "switch",
  "legends-arceus": "switch",
  scarlet: "switch",
  violet: "switch",
};

const platformLabels: Record<string, string> = {
  gameboy: "Game Boy",
  "gameboy-color": "Game Boy Color",
  "gameboy-advance": "Game Boy Advance",
  "nintendo-ds": "Nintendo DS",
  "nintendo-3ds": "Nintendo 3DS",
  switch: "Nintendo Switch",
};

export function getPlatformForVersion(version: string): string | null {
  return versionToPlatform[version] ?? null;
}

export function getPlatformIconUrl(version: string): string | null {
  const platform = versionToPlatform[version];
  return platform ? `/images/platforms/${platform}.svg` : null;
}

export function getPlatformLabel(version: string): string | null {
  const platform = versionToPlatform[version];
  return platform ? platformLabels[platform] : null;
}
