// Resolves a game-logo image for a version, e.g. `public/images/game-logos/red.png`.
// The set of known versions is derived from the canonical version table.
import { ALL_VERSIONS } from "./versions";

const GAME_LOGOS = new Set(ALL_VERSIONS);

export function fetchBoxartUrl(version: string): string | null {
  const key = version.toLowerCase();
  if (!GAME_LOGOS.has(key)) return null;
  return `/images/game-logos/${key}.png`;
}
