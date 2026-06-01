// Single source of truth for every mainline Pokémon game version.
// generations.ts, platformIcons.ts, versionColors.ts and originMarks.ts all
// derive their data from this table so the list of version slugs lives in
// exactly one place.

export interface VersionColors {
  border: string;
  text: string;
  hoverBg: string;
  bg: string;
}

export interface VersionInfo {
  /** Generation number the game belongs to (1–9). */
  generation: number;
  /** Nintendo platform slug; resolves to public/images/platforms/{platform}.svg */
  platform: string;
  /** Tailwind colour classes used for version-themed UI accents. */
  colors: VersionColors;
}

export const VERSIONS: Record<string, VersionInfo> = {
  red: { generation: 1, platform: "gameboy", colors: { border: "border-red-500", text: "text-red-500", hoverBg: "hover:bg-red-50", bg: "bg-red-500" } },
  blue: { generation: 1, platform: "gameboy", colors: { border: "border-blue-500", text: "text-blue-500", hoverBg: "hover:bg-blue-50", bg: "bg-blue-500" } },
  yellow: { generation: 1, platform: "gameboy", colors: { border: "border-yellow-500", text: "text-yellow-600", hoverBg: "hover:bg-yellow-50", bg: "bg-yellow-400" } },
  gold: { generation: 2, platform: "gameboy-color", colors: { border: "border-yellow-600", text: "text-yellow-600", hoverBg: "hover:bg-yellow-50", bg: "bg-yellow-600" } },
  silver: { generation: 2, platform: "gameboy-color", colors: { border: "border-gray-400", text: "text-gray-500", hoverBg: "hover:bg-gray-50", bg: "bg-gray-400" } },
  crystal: { generation: 2, platform: "gameboy-color", colors: { border: "border-cyan-400", text: "text-cyan-500", hoverBg: "hover:bg-cyan-50", bg: "bg-cyan-400" } },
  ruby: { generation: 3, platform: "gameboy-advance", colors: { border: "border-red-700", text: "text-red-700", hoverBg: "hover:bg-red-50", bg: "bg-red-700" } },
  sapphire: { generation: 3, platform: "gameboy-advance", colors: { border: "border-blue-700", text: "text-blue-700", hoverBg: "hover:bg-blue-50", bg: "bg-blue-700" } },
  emerald: { generation: 3, platform: "gameboy-advance", colors: { border: "border-emerald-500", text: "text-emerald-500", hoverBg: "hover:bg-emerald-50", bg: "bg-emerald-500" } },
  firered: { generation: 3, platform: "gameboy-advance", colors: { border: "border-orange-500", text: "text-orange-500", hoverBg: "hover:bg-orange-50", bg: "bg-orange-500" } },
  leafgreen: { generation: 3, platform: "gameboy-advance", colors: { border: "border-green-500", text: "text-green-500", hoverBg: "hover:bg-green-50", bg: "bg-green-500" } },
  diamond: { generation: 4, platform: "nintendo-ds", colors: { border: "border-cyan-300", text: "text-cyan-400", hoverBg: "hover:bg-cyan-50", bg: "bg-cyan-300" } },
  pearl: { generation: 4, platform: "nintendo-ds", colors: { border: "border-pink-300", text: "text-pink-400", hoverBg: "hover:bg-pink-50", bg: "bg-pink-300" } },
  platinum: { generation: 4, platform: "nintendo-ds", colors: { border: "border-gray-500", text: "text-gray-500", hoverBg: "hover:bg-gray-50", bg: "bg-gray-500" } },
  heartgold: { generation: 4, platform: "nintendo-ds", colors: { border: "border-yellow-500", text: "text-yellow-500", hoverBg: "hover:bg-yellow-50", bg: "bg-yellow-500" } },
  soulsilver: { generation: 4, platform: "nintendo-ds", colors: { border: "border-slate-400", text: "text-slate-400", hoverBg: "hover:bg-slate-50", bg: "bg-slate-400" } },
  black: { generation: 5, platform: "nintendo-ds", colors: { border: "border-gray-900", text: "text-gray-900", hoverBg: "hover:bg-gray-50", bg: "bg-gray-900" } },
  white: { generation: 5, platform: "nintendo-ds", colors: { border: "border-gray-300", text: "text-gray-400", hoverBg: "hover:bg-gray-50", bg: "bg-gray-200" } },
  "black-2": { generation: 5, platform: "nintendo-ds", colors: { border: "border-gray-800", text: "text-gray-800", hoverBg: "hover:bg-gray-50", bg: "bg-gray-800" } },
  "white-2": { generation: 5, platform: "nintendo-ds", colors: { border: "border-gray-300", text: "text-gray-400", hoverBg: "hover:bg-gray-50", bg: "bg-gray-200" } },
  x: { generation: 6, platform: "nintendo-3ds", colors: { border: "border-blue-600", text: "text-blue-600", hoverBg: "hover:bg-blue-50", bg: "bg-blue-600" } },
  y: { generation: 6, platform: "nintendo-3ds", colors: { border: "border-red-600", text: "text-red-600", hoverBg: "hover:bg-red-50", bg: "bg-red-600" } },
  "omega-ruby": { generation: 6, platform: "nintendo-3ds", colors: { border: "border-red-700", text: "text-red-700", hoverBg: "hover:bg-red-50", bg: "bg-red-700" } },
  "alpha-sapphire": { generation: 6, platform: "nintendo-3ds", colors: { border: "border-blue-700", text: "text-blue-700", hoverBg: "hover:bg-blue-50", bg: "bg-blue-700" } },
  sun: { generation: 7, platform: "nintendo-3ds", colors: { border: "border-orange-400", text: "text-orange-400", hoverBg: "hover:bg-orange-50", bg: "bg-orange-400" } },
  moon: { generation: 7, platform: "nintendo-3ds", colors: { border: "border-purple-600", text: "text-purple-600", hoverBg: "hover:bg-purple-50", bg: "bg-purple-600" } },
  "ultra-sun": { generation: 7, platform: "nintendo-3ds", colors: { border: "border-orange-500", text: "text-orange-500", hoverBg: "hover:bg-orange-50", bg: "bg-orange-500" } },
  "ultra-moon": { generation: 7, platform: "nintendo-3ds", colors: { border: "border-purple-700", text: "text-purple-700", hoverBg: "hover:bg-purple-50", bg: "bg-purple-700" } },
  "lets-go-pikachu": { generation: 7, platform: "switch", colors: { border: "border-yellow-400", text: "text-yellow-500", hoverBg: "hover:bg-yellow-50", bg: "bg-yellow-400" } },
  "lets-go-eevee": { generation: 7, platform: "switch", colors: { border: "border-amber-600", text: "text-amber-600", hoverBg: "hover:bg-amber-50", bg: "bg-amber-600" } },
  sword: { generation: 8, platform: "switch", colors: { border: "border-cyan-500", text: "text-cyan-500", hoverBg: "hover:bg-cyan-50", bg: "bg-cyan-500" } },
  shield: { generation: 8, platform: "switch", colors: { border: "border-red-500", text: "text-red-500", hoverBg: "hover:bg-red-50", bg: "bg-red-500" } },
  "brilliant-diamond": { generation: 8, platform: "switch", colors: { border: "border-cyan-400", text: "text-cyan-400", hoverBg: "hover:bg-cyan-50", bg: "bg-cyan-400" } },
  "shining-pearl": { generation: 8, platform: "switch", colors: { border: "border-pink-400", text: "text-pink-400", hoverBg: "hover:bg-pink-50", bg: "bg-pink-400" } },
  "legends-arceus": { generation: 8, platform: "switch", colors: { border: "border-indigo-600", text: "text-indigo-600", hoverBg: "hover:bg-indigo-50", bg: "bg-indigo-600" } },
  scarlet: { generation: 9, platform: "switch", colors: { border: "border-red-600", text: "text-red-600", hoverBg: "hover:bg-red-50", bg: "bg-red-600" } },
  violet: { generation: 9, platform: "switch", colors: { border: "border-violet-600", text: "text-violet-600", hoverBg: "hover:bg-violet-50", bg: "bg-violet-600" } },
};

/** Every version slug, in National-Dex / release order. */
export const ALL_VERSIONS = Object.keys(VERSIONS);

export const GENERATION_ROMAN: Record<number, string> = {
  1: "I", 2: "II", 3: "III", 4: "IV", 5: "V",
  6: "VI", 7: "VII", 8: "VIII", 9: "IX",
};

export const PLATFORM_LABELS: Record<string, string> = {
  gameboy: "Game Boy",
  "gameboy-color": "Game Boy Color",
  "gameboy-advance": "Game Boy Advance",
  "nintendo-ds": "Nintendo DS",
  "nintendo-3ds": "Nintendo 3DS",
  switch: "Nintendo Switch",
};
