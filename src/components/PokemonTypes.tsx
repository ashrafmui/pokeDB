// components/PokemonTypes.tsx

import React from "react";

interface PokemonTypesProps {
  types: string[];
}

const PokemonTypes: React.FC<PokemonTypesProps> = ({ types }) => {
  return (
    <div className="flex gap-2 mt-2">
      {types.map((type) => (
        <span
          key={type}
          className="px-3 py-1 rounded-full text-white text-sm font-semibold"
          style={{ backgroundColor: typeColors[type] || "#333" }}
        >
          {type.charAt(0).toUpperCase() + type.slice(1)}
        </span>
      ))}
    </div>
  );
};

// Colors for each Pokémon type
const typeColors: { [key: string]: string } = {
  fire: "#F08030",
  water: "#6890F0",
  grass: "#78C850",
  electric: "#F8D030",
  ice: "#98D8D8",
  fighting: "#C03028",
  poison: "#A040A0",
  ground: "#E0C068",
  flying: "#A890F0",
  psychic: "#F85888",
  bug: "#A8B820",
  rock: "#B8A038",
  ghost: "#705898",
  dragon: "#7038F8",
  dark: "#705848",
  steel: "#B8B8D0",
  fairy: "#EE99AC",
  normal: "#A8A878",
};

export default PokemonTypes;
