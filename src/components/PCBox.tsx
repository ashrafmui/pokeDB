"use client";

import Image from "next/image";
import Link from "next/link";
import { generationThemes } from "./GenerationThemes";

interface Pokemon {
  id: number;
  name: string;
  sprite: string;
}

interface PCBoxProps {
  pokemonList: Pokemon[];
  generation: number;
}

const COLUMNS = 10;

export default function PCBox({ pokemonList, generation }: PCBoxProps) {
  const theme = generationThemes[generation] || generationThemes[1];

  // Pad to complete the last row
  const remainder = pokemonList.length % COLUMNS;
  const paddedPokemon = [...pokemonList];
  if (remainder !== 0) {
    const emptySlots = COLUMNS - remainder;
    for (let i = 0; i < emptySlots; i++) {
      paddedPokemon.push(null as unknown as Pokemon);
    }
  }

  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-5xl">
      <div className="relative w-full">
        {/* Outer frame */}
        <div
          className="p-3 rounded-lg shadow-2xl border-4"
          style={{ backgroundColor: theme.frame, borderColor: theme.frameBorder }}
        >
          {/* Generation label header */}
          <div className="flex items-center gap-2 mb-3">
            {generation > 1 ? (
              <Link
                href={`/generation/${generation - 1}`}
                className="w-10 h-10 rounded border-2 flex items-center justify-center transition-colors hover:opacity-80 active:opacity-60"
                style={{ backgroundColor: theme.buttonBg, borderColor: theme.buttonBorder }}
              >
                <span style={{ color: theme.buttonText }} className="font-bold text-lg">◀</span>
              </Link>
            ) : (
              <div className="w-10 h-10" />
            )}

            {/* Generation label with themed background */}
            <div
              className="flex-1 h-10 rounded border-2 flex items-center justify-center relative overflow-hidden"
              style={{ background: theme.headerBg, borderColor: theme.boxBorder }}
            >
              <span
                className="font-bold text-lg tracking-widest relative z-10"
                style={{ color: theme.textColor, textShadow: theme.textShadow }}
              >
                {theme.name.toUpperCase()}
              </span>
            </div>

            {generation < 9 ? (
              <Link
                href={`/generation/${generation + 1}`}
                className="w-10 h-10 rounded border-2 flex items-center justify-center transition-colors hover:opacity-80 active:opacity-60"
                style={{ backgroundColor: theme.buttonBg, borderColor: theme.buttonBorder }}
              >
                <span style={{ color: theme.buttonText }} className="font-bold text-lg">▶</span>
              </Link>
            ) : (
              <div className="w-10 h-10" />
            )}
          </div>

          {/* Pokemon grid area */}
          <div
            className="p-2 rounded border-4"
            style={{ backgroundColor: theme.boxBg, borderColor: theme.boxBorder }}
          >
            <div
              className="grid gap-1 p-2 rounded relative"
              style={{
                gridTemplateColumns: `repeat(${COLUMNS}, 1fr)`,
                backgroundColor: theme.gridBg,
                backgroundImage: theme.gridPattern,
              }}
            >
              {paddedPokemon.map((pokemon, index) => (
                <div
                  key={pokemon?.id ?? `empty-${index}`}
                  className="w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center relative z-10 hover:z-50"
                >
                  {pokemon ? (
                    <Link href={`/pokemon/${pokemon.id}`}>
                      <div className="group w-14 h-14 sm:w-[72px] sm:h-[72px] flex items-center justify-center hover:scale-150 transition-all cursor-pointer relative">
                        {/* Corner borders - only visible on hover */}
                        <div className="absolute top-0 left-0 w-3 h-3 border-t-[3px] border-l-[3px] border-red-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="absolute top-0 right-0 w-3 h-3 border-t-[3px] border-r-[3px] border-red-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="absolute bottom-0 left-0 w-3 h-3 border-b-[3px] border-l-[3px] border-red-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="absolute bottom-0 right-0 w-3 h-3 border-b-[3px] border-r-[3px] border-red-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                        
                        {/* Name tooltip - appears below on hover */}
                        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                          <div className="bg-gray-900/95 text-white text-[10px] sm:text-xs rounded px-2 py-1 whitespace-nowrap shadow-lg border border-gray-700 font-medium capitalize">
                            {pokemon.name.replace(/-/g, " ")}
                          </div>
                        </div>
                        
                        <Image
                          src={pokemon.sprite}
                          alt={pokemon.name}
                          width={72}
                          height={72}
                          className="object-contain"
                          style={{ imageRendering: "pixelated" }}
                          unoptimized
                        />
                      </div>
                    </Link>
                  ) : (
                    <div className="w-14 h-14 sm:w-[72px] sm:h-[72px]" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="mt-2 flex justify-center text-xs" style={{ color: theme.buttonText }}>
            <span className="font-medium">{pokemonList.length} POKEMON</span>
          </div>
        </div>
      </div>
    </div>
  );
}