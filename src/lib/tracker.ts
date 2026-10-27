// Pokédex tracker storage format: caught National Dex ids, as a comma-separated
// list in localStorage and in the exported file. Client-safe.

export const TRACKER_KEY = 'pokedb-caught-v1';

export function encodeCaught(ids: ReadonlySet<number>): string {
  return [...ids].sort((a, b) => a - b).join(',');
}

/** Ids from a stored string, ignoring anything that isn't a valid dex number. */
export function decodeCaught(raw: string | null, maxId: number): Set<number> {
  const out = new Set<number>();
  for (const part of (raw ?? '').split(',')) {
    const n = Number(part);
    if (Number.isInteger(n) && n >= 1 && n <= maxId) out.add(n);
  }
  return out;
}

export interface TrackerExport {
  app: 'pokedb';
  kind: 'caught';
  caught: number[];
}

export function exportCaught(ids: ReadonlySet<number>): string {
  const data: TrackerExport = { app: 'pokedb', kind: 'caught', caught: [...ids].sort((a, b) => a - b) };
  return JSON.stringify(data, null, 2);
}

/** Parses an exported file; null when it isn't one. */
export function importCaught(text: string, maxId: number): Set<number> | null {
  try {
    const data = JSON.parse(text) as Partial<TrackerExport>;
    if (data.app !== 'pokedb' || data.kind !== 'caught' || !Array.isArray(data.caught)) return null;
    return decodeCaught(data.caught.join(','), maxId);
  } catch {
    return null;
  }
}
