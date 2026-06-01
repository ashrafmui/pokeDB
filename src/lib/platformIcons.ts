// Maps a Pokémon game version to the Nintendo platform it shipped on,
// and resolves to an SVG icon at `public/images/platforms/{platform}.svg`.
// Backed by the canonical version table in ./versions.
import { VERSIONS, PLATFORM_LABELS } from "./versions";

export function getPlatformForVersion(version: string): string | null {
  return VERSIONS[version]?.platform ?? null;
}

export function getPlatformIconUrl(version: string): string | null {
  const platform = VERSIONS[version]?.platform;
  return platform ? `/images/platforms/${platform}.svg` : null;
}

export function getPlatformLabel(version: string): string | null {
  const platform = VERSIONS[version]?.platform;
  return platform ? PLATFORM_LABELS[platform] : null;
}
