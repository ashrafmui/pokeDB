"use client";

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeftIcon, ChevronRightIcon } from '@radix-ui/react-icons';
import { cn } from '@/lib/utils';

interface SpriteOption {
  key: string;
  label: string;
  src: string;
}

interface Props {
  pokemonId: number;
  pokemonName: string;
}

export default function SpriteCarousel({ pokemonId, pokemonName }: Props) {
  const spriteOptions: SpriteOption[] = [
    { 
      key: 'artwork', 
      label: 'Official Artwork', 
      src: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemonId}.png` 
    },
    { 
      key: 'artwork-shiny', 
      label: 'Official Artwork (Shiny)', 
      src: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/shiny/${pokemonId}.png` 
    },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());

  const availableSprites = spriteOptions.filter(
    (option) => !failedImages.has(option.key)
  );

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? availableSprites.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === availableSprites.length - 1 ? 0 : prev + 1));
  };

  const handleImageError = (key: string) => {
    setFailedImages((prev) => new Set(prev).add(key));
    if (currentIndex >= availableSprites.length - 1) {
      setCurrentIndex(0);
    }
  };

  const currentSprite = availableSprites[currentIndex];

  if (availableSprites.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 flex items-center justify-center">
          <p className="text-muted-foreground">No sprites available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-8 flex flex-col items-center">
        {/* Main sprite display */}
        <div className="relative w-full flex items-center justify-center h-[300px]">
          {availableSprites.length > 1 && (
            <Button
              variant="secondary"
              size="icon"
              onClick={goToPrevious}
              className="absolute left-0 rounded-full z-10"
              aria-label="Previous sprite"
            >
              <ChevronLeftIcon className="h-5 w-5" />
            </Button>
          )}

          <img
            src={currentSprite.src}
            alt={`${pokemonName} - ${currentSprite.label}`}
            width={300}
            height={300}
            className="object-contain"
            onError={() => handleImageError(currentSprite.key)}
          />

          {availableSprites.length > 1 && (
            <Button
              variant="secondary"
              size="icon"
              onClick={goToNext}
              className="absolute right-0 rounded-full z-10"
              aria-label="Next sprite"
            >
              <ChevronRightIcon className="h-5 w-5" />
            </Button>
          )}
        </div>

        {/* Sprite label */}
        <p className="mt-4 text-sm font-medium text-muted-foreground">
          {currentSprite.label}
        </p>

        {/* Dot indicators */}
        {availableSprites.length > 1 && (
          <div className="flex gap-2 mt-3">
            {availableSprites.map((option, index) => (
              <button
                key={option.key}
                onClick={() => setCurrentIndex(index)}
                className={cn(
                  "w-2 h-2 rounded-full transition-colors",
                  index === currentIndex 
                    ? "bg-primary" 
                    : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
                )}
                aria-label={`View ${option.label}`}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}