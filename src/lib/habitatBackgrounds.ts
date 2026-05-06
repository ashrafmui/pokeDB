// Per-habitat backgrounds keyed off PokeAPI's species `habitat.name`.
// Each habitat expects an image at `public/images/habitats/{habitat}.jpg`.
// The CSS gradient acts as a fallback layer beneath the image, so a missing
// file still renders a habitat-tinted card.
const habitatGradients: Record<string, string> = {
  cave: "radial-gradient(circle at 50% 30%, #4A3A33 0%, #2A1F1A 70%, #1A100C 100%)",
  forest: "linear-gradient(180deg, #4A7C3A 0%, #2D5016 60%, #1A3308 100%)",
  grassland: "linear-gradient(180deg, #B8E0A0 0%, #7CB342 70%, #558B2F 100%)",
  mountain: "linear-gradient(180deg, #B0BEC5 0%, #607D8B 60%, #37474F 100%)",
  rare: "radial-gradient(circle at 50% 40%, #FFE082 0%, #BA68C8 60%, #4A148C 100%)",
  "rough-terrain": "linear-gradient(180deg, #E8C9A0 0%, #C9A06B 60%, #8B6F47 100%)",
  sea: "linear-gradient(180deg, #4FC3F7 0%, #1976D2 60%, #0D47A1 100%)",
  urban: "linear-gradient(180deg, #CFD8DC 0%, #90A4AE 60%, #546E7A 100%)",
  "waters-edge": "linear-gradient(180deg, #80DEEA 0%, #26C6DA 60%, #00838F 100%)",
};

const FALLBACK_GRADIENT = "linear-gradient(180deg, #ECEFF1 0%, #B0BEC5 100%)";

export function getHabitatBackground(habitat: string | null | undefined): string {
  if (!habitat) return FALLBACK_GRADIENT;
  const gradient = habitatGradients[habitat] ?? FALLBACK_GRADIENT;
  return `url(/images/habitats/${habitat}.jpg) center/cover no-repeat, ${gradient}`;
}
