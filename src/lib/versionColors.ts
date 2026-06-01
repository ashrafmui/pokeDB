// Tailwind colour accents per game version, backed by the canonical version
// table in ./versions.
import { VERSIONS, type VersionColors } from "./versions";

export type { VersionColors };

export const versionColors: Record<string, VersionColors> = Object.fromEntries(
  Object.entries(VERSIONS).map(([version, info]) => [version, info.colors]),
);

const FALLBACK_COLOR: VersionColors = {
  border: "border-gray-400",
  text: "text-gray-500",
  hoverBg: "hover:bg-gray-50",
  bg: "bg-gray-400",
};

export const getVersionColor = (version: string): VersionColors =>
  VERSIONS[version]?.colors ?? FALLBACK_COLOR;
