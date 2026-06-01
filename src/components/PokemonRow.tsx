"use client";

import Image from "next/image";
import Link from "next/link";
import { TYPE_COLORS } from "@/lib/typeColors";
import { getGenerationFromId } from "@/lib/typeUtils";
import { capitalize, formatDexNumber, kebabToSpace } from "@/lib/formatters";

interface PokemonRowProps {
  id: number;
  name: string;
  sprite: string;
  types: string[];
}

export default function PokemonRow({ id, name, sprite, types }: PokemonRowProps) {
  const generation = getGenerationFromId(id);
  const primaryType = types[0];
  const borderColor = TYPE_COLORS[primaryType] || "#A8A878";

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
              #{formatDexNumber(id, 4)}
            </span>
            <h3 className="font-semibold text-lg capitalize truncate">
              {kebabToSpace(name)}
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
              style={{ backgroundColor: TYPE_COLORS[type] || "#333" }}
            >
              {capitalize(type)}
            </span>
          ))}
        </div>
      </div>
    </Link>
  );
}
