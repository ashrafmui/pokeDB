"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface SpriteItem {
  key: string;
  label: string;
  src: string;
}

interface Props {
  pokemonId: number;
  pokemonName: string;
}

export default function PokemonSpriteVariants({ pokemonId, pokemonName }: Props) {
  const spriteItems: SpriteItem[] = [
    { 
      key: 'front', 
      label: 'Front', 
      src: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemonId}.png` 
    },
    { 
      key: 'back', 
      label: 'Back', 
      src: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/back/${pokemonId}.png` 
    },
    { 
      key: 'front-shiny', 
      label: 'Shiny', 
      src: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/${pokemonId}.png` 
    },
    { 
      key: 'back-shiny', 
      label: 'Shiny Back', 
      src: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/back/shiny/${pokemonId}.png` 
    },
  ];

  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());

  const availableSprites = spriteItems.filter(
    (item) => !failedImages.has(item.key)
  );

  const handleImageError = (key: string) => {
    setFailedImages((prev) => new Set(prev).add(key));
  };

  if (availableSprites.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold">Sprites</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-4 gap-4">
          {availableSprites.map((sprite) => (
            <div key={sprite.key} className="flex flex-col items-center">
              <div className="w-20 h-20 flex items-center justify-center bg-muted rounded-md">
                <img
                  src={sprite.src}
                  alt={`${pokemonName} - ${sprite.label}`}
                  width={96}
                  height={96}
                  className="object-contain"
                  style={{ imageRendering: 'pixelated' }}
                  onError={() => handleImageError(sprite.key)}
                />
              </div>
              <p className="mt-2 text-xs text-muted-foreground text-center">
                {sprite.label}
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}