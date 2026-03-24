"use client";

import Image from "next/image";
import Link from "next/link";
import { typeColors } from "@/components/PokemonTypes";
import { getGenerationFromId } from "@/lib/typeUtils";

interface PokemonRowProps {
  id: number;
  name: string;
  sprite: string;
  types: string[];
}

export default function PokemonRow({ id, name, sprite, types }: PokemonRowProps) {
  const generation = getGenerationFromId(id);
  const primaryType = types[0];
  const borderColor = typeColors[primaryType] || "#A8A878";

  return (
    <Link href={`/pokemon/${id}`}>
      <div
        className="flex items-center gap-4 rounded-lg border-l-4 bg-white/80 backdrop-blur-sm px-4 py-3 shadow-sm transition-all hover:shadow-md hover:scale-[1.01] hover:bg-white cursor-pointer"
        style={{ borderLeftColor: borderColor }}
      >
        {/* Sprite */}
        <div className="flex-shrink-0 w-16 h-16 flex items-center justify-center">
          <Image
            src={sprite}
            alt={name}
            width={64}
            height={64}
            className="object-contain"
            style={{ imageRendering: "pixelated" }}
            unoptimized
          />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2">
            <span className="text-sm font-mono text-muted-foreground">
              #{id.toString().padStart(4, "0")}
            </span>
            <h3 className="font-semibold text-lg capitalize truncate">
              {name.replace(/-/g, " ")}
            </h3>
          </div>
          <p className="text-sm text-muted-foreground">{generation}</p>
        </div>

        {/* Type badges */}
        <div className="flex gap-2 flex-shrink-0">
          {types.map((type) => (
            <span
              key={type}
              className="px-3 py-1 rounded-full text-white text-xs font-semibold"
              style={{ backgroundColor: typeColors[type] || "#333" }}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </span>
          ))}
        </div>
      </div>
    </Link>
  );
}
