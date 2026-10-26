'use client';

import { useEffect, useRef, useState } from 'react';
import { Volume2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface PokemonCries {
  latest: string | null;
  legacy: string | null;
}

interface PokemonCryProps {
  cries: PokemonCries;
  pokemonName: string;
}

type CryKind = keyof PokemonCries;

// Play button for the Pokémon's cry. PokéAPI serves .ogg files for the modern
// cry and, for older Pokémon, the original Game Boy-era "legacy" cry.
export default function PokemonCry({ cries, pokemonName }: PokemonCryProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState<CryKind | null>(null);

  // Stop any playing cry when navigating away.
  useEffect(() => () => audioRef.current?.pause(), []);

  if (!cries.latest && !cries.legacy) return null;

  function play(kind: CryKind) {
    const src = cries[kind];
    if (!src) return;
    audioRef.current?.pause();
    const audio = new Audio(src);
    audio.volume = 0.5;
    audio.onended = () => setPlaying(null);
    audio.onerror = () => setPlaying(null);
    audioRef.current = audio;
    setPlaying(kind);
    audio.play().catch(() => setPlaying(null));
  }

  const buttonClass =
    'flex items-center gap-1 rounded-full bg-white/80 backdrop-blur shadow-sm px-2.5 h-8 text-xs font-medium text-muted-foreground transition hover:scale-105 hover:text-foreground';

  return (
    <div className="flex items-center gap-1.5 shrink-0">
      {cries.latest && (
        <button
          type="button"
          onClick={() => play('latest')}
          className={buttonClass}
          aria-label={`Play ${pokemonName}'s cry`}
          title="Play cry"
        >
          <Volume2 className={cn('h-4 w-4', playing === 'latest' && 'text-blue-600 animate-pulse')} />
        </button>
      )}
      {cries.legacy && cries.legacy !== cries.latest && (
        <button
          type="button"
          onClick={() => play('legacy')}
          className={buttonClass}
          aria-label={`Play ${pokemonName}'s original cry`}
          title="Play the original cry from the older games"
        >
          <Volume2 className={cn('h-3.5 w-3.5', playing === 'legacy' && 'text-blue-600 animate-pulse')} />
          Classic
        </button>
      )}
    </div>
  );
}
