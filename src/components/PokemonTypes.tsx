// components/PokemonTypes.tsx

import React from "react";
import { TYPE_COLORS } from "@/lib/typeColors";
import { capitalize } from "@/lib/formatters";

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
          style={{ backgroundColor: TYPE_COLORS[type] || "#333" }}
        >
          {capitalize(type)}
        </span>
      ))}
    </div>
  );
};

export default PokemonTypes;
