'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { pokemonUrl } from '@/lib/pokeApi';
import { pickOfficialArtwork } from '@/lib/sprites';
import { kebabToSpace, formatDexNumber } from '@/lib/formatters';

const MAX_POKEMON_ID = 1025;

interface PokemonOfTheDay {
  id: number;
  name: string;
  sprite: string;
  types: string[];
}

// Deterministic hash of the YYYY-MM-DD date string. Same date → same pokemon
// all day, different date → almost certainly a different pokemon.
function hashDateString(s: string): number {
  let hash = 0;
  for (let i = 0; i < s.length; i++) {
    hash = ((hash << 5) - hash + s.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

export default function RandomPokemonOfTheDay() {
  const [pokemon, setPokemon] = useState<PokemonOfTheDay | null>(null);
  // Resolved in useEffect so we don't mismatch on hydration.
  const [dailyId, setDailyId] = useState<number | null>(null);

  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    setDailyId((hashDateString(today) % MAX_POKEMON_ID) + 1);
  }, []);

  useEffect(() => {
    if (dailyId === null) return;
    const id = dailyId;
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch(pokemonUrl(id));
        if (!res.ok) return;
        const data = await res.json();
        if (cancelled) return;
        const artwork = pickOfficialArtwork(data.sprites, data.id);
        setPokemon({
          id: data.id,
          name: data.name,
          sprite: artwork,
          types: data.types.map((t: { type: { name: string } }) => t.type.name),
        });
      } catch {
        // network/parse failure — leave the skeleton up.
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [dailyId]);

  if (!pokemon) {
    return (
      <div className="w-72 rounded-2xl border bg-white shadow-md p-4 flex items-center gap-4">
        <div className="w-24 h-24 shrink-0 rounded-xl bg-muted animate-pulse" />
        <div className="flex flex-col gap-2 flex-1">
          <div className="h-3 w-32 rounded bg-muted animate-pulse" />
          <div className="h-5 w-28 rounded bg-muted animate-pulse" />
          <div className="h-4 w-16 rounded bg-muted animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <Link
      href={`/pokemon/${pokemon.id}`}
      className="w-72 rounded-2xl border bg-white shadow-md p-4 flex items-center gap-4 hover:shadow-lg hover:-translate-y-0.5 transition-all"
    >
      <div className="w-24 h-24 shrink-0 rounded-xl bg-muted flex items-center justify-center">
        <Image
          src={pokemon.sprite}
          alt={pokemon.name}
          width={96}
          height={96}
          unoptimized
          className="object-contain max-w-full max-h-full"
        />
      </div>
      <div className="flex flex-col gap-1 flex-1 min-w-0">
        <p className="text-[10px] font-pokemon-gb uppercase tracking-wider text-muted-foreground">
          Pokémon of the Day
        </p>
        <p className="font-semibold text-base capitalize truncate">
          {kebabToSpace(pokemon.name)}
        </p>
        <p className="text-xs text-muted-foreground">
          #{formatDexNumber(pokemon.id)}
        </p>
        <div className="flex gap-1 mt-1 flex-wrap">
          {pokemon.types.map((type) => (
            <span
              key={type}
              className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 capitalize"
            >
              {type}
            </span>
          ))}
        </div>
      </div>
    </Link>
  );
}
