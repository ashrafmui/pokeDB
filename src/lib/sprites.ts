// Centralised sprite / icon URL builders. Every PokeAPI + pokesprite asset URL
// in the app is constructed through these helpers so the base paths live in one
// place.

const POKEAPI_SPRITES =
  "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon";
const POKESPRITE = "https://raw.githubusercontent.com/msikma/pokesprite/master";

export type FormType = "mega" | "mega-x" | "mega-y" | "gmax";

// PokeAPI's sprite payloads are deeply nested and only loosely typed; we accept
// the raw object and reach into it defensively.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type RawSprites = any;

/** Default front sprite for a Pokémon by National Dex id. */
export const spriteUrl = (id: number): string => `${POKEAPI_SPRITES}/${id}.png`;
export const backSpriteUrl = (id: number): string => `${POKEAPI_SPRITES}/back/${id}.png`;
export const shinySpriteUrl = (id: number): string => `${POKEAPI_SPRITES}/shiny/${id}.png`;
export const backShinySpriteUrl = (id: number): string =>
  `${POKEAPI_SPRITES}/back/shiny/${id}.png`;

/** High-res official artwork (optionally the shiny variant). */
export const officialArtworkUrl = (id: number, shiny = false): string =>
  `${POKEAPI_SPRITES}/other/official-artwork/${shiny ? "shiny/" : ""}${id}.png`;

/** Gen-8 styled type badge icon used in the type-effectiveness UI. */
export const typeIconUrl = (typeName: string): string =>
  `${POKESPRITE}/misc/types/gen8/${typeName}.png`;

/** Mega / Gigantamax sigil icons keyed by form. */
export const FORM_ICONS: Record<FormType, string> = {
  mega: `${POKESPRITE}/misc/special-attribute/mega-evolution-sigil-hires.png`,
  "mega-x": `${POKESPRITE}/misc/special-attribute/mega-evolution-sigil-hires.png`,
  "mega-y": `${POKESPRITE}/misc/special-attribute/mega-evolution-sigil-hires.png`,
  gmax: `${POKESPRITE}/misc/special-attribute/gigantamax-icon.png`,
};

/** Pixel-art pokesprite for a special form (mega / gmax / base). */
export function pokespriteFormUrl(pokemonName: string, formType: string): string {
  const base = pokemonName.toLowerCase();
  const suffix =
    formType === "mega" ? "-mega"
    : formType === "mega-x" ? "-mega-x"
    : formType === "mega-y" ? "-mega-y"
    : formType === "gmax" ? "-gmax"
    : "";
  return `${POKESPRITE}/pokemon-gen8/regular/${base}${suffix}.png`;
}

/**
 * Best animated/default sprite from a raw PokeAPI `sprites` object:
 * Gen-V animated → Showdown → HOME → front_default.
 */
export function pickAnimatedSprite(sprites: RawSprites): string | undefined {
  return (
    sprites?.versions?.["generation-v"]?.["black-white"]?.animated?.front_default ??
    sprites?.other?.showdown?.front_default ??
    sprites?.other?.home?.front_default ??
    sprites?.front_default
  );
}

/**
 * Official artwork from a raw PokeAPI `sprites` object, falling back to the
 * default sprite and finally to the constructed sprite URL for the id.
 */
export function pickOfficialArtwork(sprites: RawSprites, id: number): string {
  return (
    sprites?.other?.["official-artwork"]?.front_default ??
    sprites?.front_default ??
    spriteUrl(id)
  );
}
