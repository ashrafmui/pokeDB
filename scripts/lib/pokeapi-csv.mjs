// Shared helpers for the data build scripts (build-dex.mjs, build-moves.mjs):
// download PokéAPI's CSV tables from a pinned commit and parse them.
//
// Bump POKEAPI_COMMIT when new games ship, then re-run the build scripts.

export const POKEAPI_COMMIT = '2bf639e5572812a67d2b94903fdcb9d095f5aeb2';
export const CSV_BASE = `https://raw.githubusercontent.com/PokeAPI/pokeapi/${POKEAPI_COMMIT}/data/v2/csv`;
export const ENGLISH = '9';

// ── CSV ──────────────────────────────────────────────────────────────────────

/** Minimal RFC 4180 parser: handles quoted fields with commas and "" escapes. */
export function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = '';
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"' && text[i + 1] === '"') { field += '"'; i++; }
      else if (c === '"') inQuotes = false;
      else field += c;
    } else if (c === '"') inQuotes = true;
    else if (c === ',') { row.push(field); field = ''; }
    else if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i++;
      row.push(field); field = '';
      if (row.length > 1 || row[0] !== '') rows.push(row);
      row = [];
    } else field += c;
  }
  if (field !== '' || row.length) { row.push(field); rows.push(row); }
  const [header, ...body] = rows;
  return body.map((r) => Object.fromEntries(header.map((h, i) => [h, r[i] ?? ''])));
}

export async function loadCsv(name) {
  const res = await fetch(`${CSV_BASE}/${name}.csv`);
  if (!res.ok) throw new Error(`Failed to download ${name}.csv: ${res.status}`);
  return parseCsv(await res.text());
}

export const groupBy = (rows, key) => {
  const map = new Map();
  for (const r of rows) {
    const k = r[key];
    if (!map.has(k)) map.set(k, []);
    map.get(k).push(r);
  }
  return map;
};
export const indexBy = (rows, key) => new Map(rows.map((r) => [r[key], r]));
export const int = (s) => (s === '' ? null : Number(s));
