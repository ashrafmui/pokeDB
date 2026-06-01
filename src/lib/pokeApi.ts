// Shared PokeAPI base URL + helpers. URL builders are used everywhere a request
// is constructed; the cached fetch helpers wrap the common server-side pattern
// of "fetch with 24h revalidation, return parsed JSON or null on failure".

export const POKEAPI_BASE = "https://pokeapi.co/api/v2";

/** Cache PokeAPI responses for a day — the data is effectively static. */
const REVALIDATE_DAY = 86400;

export const pokemonUrl = (idOrName: string | number): string =>
  `${POKEAPI_BASE}/pokemon/${idOrName}`;

export const speciesUrl = (idOrName: string | number): string =>
  `${POKEAPI_BASE}/pokemon-species/${idOrName}`;

async function fetchJson(url: string) {
  const res = await fetch(url, { next: { revalidate: REVALIDATE_DAY } });
  if (!res.ok) return null;
  return res.json();
}

/** Cached fetch of /pokemon/{id|name}; returns parsed JSON or null. */
export const fetchPokemon = (idOrName: string | number) =>
  fetchJson(pokemonUrl(idOrName));

/** Cached fetch of /pokemon-species/{id|name}; returns parsed JSON or null. */
export const fetchSpecies = (idOrName: string | number) =>
  fetchJson(speciesUrl(idOrName));
