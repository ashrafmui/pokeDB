"use client";

import { useState } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@radix-ui/react-icons';

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
  // High-res sprites only (475x475 for artwork, 256x256 for home)
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
    { 
      key: 'home', 
      label: 'Home', 
      src: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/${pokemonId}.png` 
    },
    { 
      key: 'home-shiny', 
      label: 'Home (Shiny)', 
      src: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/shiny/${pokemonId}.png` 
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
      <div className="bg-white rounded-2xl shadow-xl p-8 flex items-center justify-center">
        <p className="text-gray-500">No sprites available</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 flex flex-col items-center">
      {/* Main sprite display */}
      <div className="relative w-full flex items-center justify-center h-[300px]">
        {availableSprites.length > 1 && (
          <button
            onClick={goToPrevious}
            className="absolute left-0 p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors z-10"
            aria-label="Previous sprite"
          >
            <ChevronLeftIcon className="w-6 h-6 text-gray-600" />
          </button>
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
          <button
            onClick={goToNext}
            className="absolute right-0 p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors z-10"
            aria-label="Next sprite"
          >
            <ChevronRightIcon className="w-6 h-6 text-gray-600" />
          </button>
        )}
      </div>

      {/* Sprite label */}
      <p className="mt-4 text-sm font-medium text-gray-600">{currentSprite.label}</p>

      {/* Dot indicators */}
      {availableSprites.length > 1 && (
        <div className="flex gap-2 mt-3">
          {availableSprites.map((option, index) => (
            <button
              key={option.key}
              onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentIndex ? 'bg-blue-500' : 'bg-gray-300 hover:bg-gray-400'
              }`}
              aria-label={`View ${option.label}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}