export interface GenerationSprite {
  key: string;
  /** Human-readable generation label, e.g. "Gen I" */
  generation: string;
  /** Human-readable game name, e.g. "Red / Blue" */
  game: string;
  src: string;
}

// Ordered list of generations with preferred game lookup order.
// The first game in the list that has a non-null URL for the requested sprite
// type wins. This keeps the carousel predictable and avoids showing the tiny
// "icons" sprites from Gen VII/VIII when better versions exist.
const GENERATION_META: {
  key: string;
  label: string;
  games: string[];
}[] = [
  { key: 'generation-i', label: 'Gen I', games: ['yellow', 'red-blue'] },
  { key: 'generation-ii', label: 'Gen II', games: ['crystal', 'gold', 'silver'] },
  {
    key: 'generation-iii',
    label: 'Gen III',
    games: ['firered-leafgreen', 'ruby-sapphire', 'emerald'],
  },
  {
    key: 'generation-iv',
    label: 'Gen IV',
    games: ['platinum', 'heartgold-soulsilver', 'diamond-pearl'],
  },
  { key: 'generation-v', label: 'Gen V', games: ['black-white'] },
  {
    key: 'generation-vi',
    label: 'Gen VI',
    games: ['x-y', 'omegaruby-alphasapphire'],
  },
  {
    key: 'generation-vii',
    label: 'Gen VII',
    games: ['ultra-sun-ultra-moon'],
  },
];
// Gen VIII "icons" only has front_default (tiny icon sprites) — intentionally
// excluded since it adds nothing useful to the carousel.

/** Maps the thumbnail-grid sprite key to the PokeAPI field name. */
const SPRITE_KEY_MAP: Record<string, string> = {
  front: 'front_default',
  back: 'back_default',
  'front-shiny': 'front_shiny',
  'back-shiny': 'back_shiny',
};

/**
 * Walks the PokeAPI `sprites.versions` object and returns one entry per
 * generation that has a non-null URL for the given sprite type.
 *
 * @param versions - The raw `sprites.versions` object from a PokeAPI pokemon
 *                   response.
 * @param spriteType - One of 'front' | 'back' | 'front-shiny' | 'back-shiny'.
 */
export function getGenerationSprites(
  versions: Record<string, unknown>,
  spriteType: string,
): GenerationSprite[] {
  const apiKey = SPRITE_KEY_MAP[spriteType];
  if (!apiKey) return [];

  const results: GenerationSprite[] = [];

  for (const gen of GENERATION_META) {
    const genData = versions[gen.key];
    if (!genData || typeof genData !== 'object') continue;

    const games = genData as Record<string, unknown>;

    for (const gameName of gen.games) {
      const gameData = games[gameName];
      if (!gameData || typeof gameData !== 'object') continue;

      const sprites = gameData as Record<string, string | null>;
      const url = sprites[apiKey];

      if (url) {
        results.push({
          key: `${spriteType}-${gen.key}`,
          generation: gen.label,
          game: formatGameName(gameName),
          src: url,
        });
        break; // use first available game for this generation
      }
    }
  }

  return results;
}

/** "firered-leafgreen" → "FireRed / LeafGreen" */
function formatGameName(raw: string): string {
  return raw
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
    .replace(/\s(?=[A-Z][a-z])/g, ' / ')
    // Handle combined names like "firered" → split on camelCase boundary
    .replace(/([a-z])([A-Z])/g, '$1 $2');
}