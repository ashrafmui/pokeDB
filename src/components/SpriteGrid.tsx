"use client"; 

import React, { useEffect, useState } from "react";
import Image from "next/image";

interface Pokemon {
  name: string;
  sprite: string;
}

// Constants for different Pokémon generations
const GENERATION_CONFIG = {
  gen1: { offset: 0, limit: 151 },
  gen2: { offset: 151, limit: 100 },
  gen3: { offset: 251, limit: 135 },
  gen4: { offset: 386, limit: 107 },
  gen5: { offset: 493, limit: 156 },
  gen6: { offset: 649, limit: 72 },
  gen7: { offset: 721, limit: 86 },
} as const;

type GenerationKey = keyof typeof GENERATION_CONFIG;

interface SpriteGridProps {
  generation: GenerationKey; // Specify the type to match the keys of GENERATION_CONFIG
}

export default function SpriteGrid({ generation }: SpriteGridProps) {
  const [pokemonList, setPokemonList] = useState<Pokemon[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPokemonSprites() {
      try {
        const { offset, limit } = GENERATION_CONFIG[generation]; // Now TypeScript knows this is safe
        const response = await fetch(
          `https://pokeapi.co/api/v2/pokemon?offset=${offset}&limit=${limit}`
        );
        const data = await response.json();

        // Extract detailed data for each Pokémon
        const pokemonDetails = await Promise.all(
          data.results.map(async (pokemon: { url: string }) => {
            const res = await fetch(pokemon.url);
            const pokeData = await res.json();
            return {
              name: pokeData.name,
              sprite:
                pokeData.sprites.versions["generation-vii"]["ultra-sun-ultra-moon"].front_default, // Get Gen 7 sprite
            };
          })
        );

        setPokemonList(pokemonDetails);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching Pokémon data:", error);
        setLoading(false);
      }
    }

    fetchPokemonSprites();
  }, [generation]);

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <div className="grid grid-cols-10 gap-4 p-4">
      {pokemonList.map((pokemon, index) => (
        <div
          key={index}
          className="w-20 h-20 flex items-center justify-center bg-white shadow-lg transform transition duration-300 rounded-3xl hover:scale-150 hover:bg-gray-100 hover:z-10 active:bg-violet-700 focus:outline-none focus:ring focus:ring-violet-300"
        >
          <Image
            src={pokemon.sprite}
            alt={pokemon.name}
            width={72}
            height={72}
            className="object-contain"
          />
        </div>
      ))}
    </div>
  );
}
