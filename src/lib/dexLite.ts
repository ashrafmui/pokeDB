// A small, client-safe slice of a dex entry. Server pages build these from
// src/lib/dex.ts (which holds the full 1.5 MB dataset) and pass them to
// client components such as the Pokédle, team builder and filters.

export interface DexLite {
  id: number;
  name: string;
  types: string[];
  generation: number;
  heightM: number;
  weightKg: number;
  color: string | null;
  evolutionStage: number;
}
