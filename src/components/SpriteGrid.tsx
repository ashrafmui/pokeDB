"use client"; 

import React, { useEffect, useState } from "react";
import Image from "next/image";

interface Pokemon {
  id: number;
  name: string;
  sprite: string;
  generation: number;
  types: { id: number; name: string }[];
}

const generationMap: Record<string, number> = {
  gen1: 1,
  gen2: 2,
  gen3: 3,
  gen4: 4,
  gen5: 5,
  gen6: 6,
  gen7: 7,
};

interface SpriteGridProps {
  generation: keyof typeof generationMap;
}

export default function SpriteGrid({ generation }: SpriteGridProps) {
  const [pokemonList, setPokemonList] = useState<Pokemon[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPokemon() {
      try {
        const genNumber = generationMap[generation];
        const response = await fetch(`/api/pokemon?generation=${genNumber}`);
        const data = await response.json();
        setPokemonList(data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching Pokemon:", error);
        setLoading(false);
      }
    }

    fetchPokemon();
  }, [generation]);

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <div className="grid grid-cols-10 gap-4 p-4">
      {pokemonList.map((pokemon) => (
        <div
          key={pokemon.id}
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