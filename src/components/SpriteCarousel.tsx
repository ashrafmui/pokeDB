"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { StarFilledIcon } from '@radix-ui/react-icons';
import { getTypeColors } from '@/lib/typeBackgrounds';
import PokemonSpriteVariants from '@/components/PokemonSpriteVariants';

interface Props {
  pokemonId: number;
  pokemonName: string;
  types: string[];
}

export default function SpriteCarousel({ pokemonId, pokemonName, types }: Props) {
  const regularSrc = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemonId}.png`;
  const shinySrc = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/shiny/${pokemonId}.png`;

  const [isShiny, setIsShiny] = useState(false);
  const [shinyFailed, setShinyFailed] = useState(false);
  const [regularFailed, setRegularFailed] = useState(false);

  // Distance from viewport-left to the card's natural left edge, derived from
  // the page wrapper. Used to extend the card to the viewport edge without a
  // JS measurement / layout shift.
  // 72rem = max-w-6xl, 2rem = p-8 — keep in sync with src/app/pokemon/[id]/page.tsx.
  const VIEWPORT_OFFSET = 'max(0px, (100vw - 72rem) / 2) + 2rem';

  const SPRITE_BOX = 300;
  const OVAL_W = 200;
  const OVAL_H = 50;
  const DEFAULT_PLATFORM = {
    left: SPRITE_BOX / 2 - OVAL_W / 2,
    top: SPRITE_BOX - OVAL_H - 8,
  };
  const [platform, setPlatform] = useState<{ left: number; top: number }>(DEFAULT_PLATFORM);

  const computePlatformPosition = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    if (!img.naturalWidth || !img.naturalHeight) return;
    try {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.drawImage(img, 0, 0);
      const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);

      let minX = canvas.width, maxX = 0, minY = canvas.height, maxY = 0;
      let found = false;
      for (let y = 0; y < canvas.height; y++) {
        for (let x = 0; x < canvas.width; x++) {
          if (data[(y * canvas.width + x) * 4 + 3] > 10) {
            found = true;
            if (x < minX) minX = x;
            if (x > maxX) maxX = x;
            if (y < minY) minY = y;
            if (y > maxY) maxY = y;
          }
        }
      }
      if (!found) {
        setPlatform(DEFAULT_PLATFORM);
        return;
      }

      const scale = SPRITE_BOX / Math.max(canvas.width, canvas.height);
      const offsetX = (SPRITE_BOX - canvas.width * scale) / 2;
      const offsetY = (SPRITE_BOX - canvas.height * scale) / 2;
      const centerX = offsetX + ((minX + maxX) / 2) * scale;
      const bottomY = offsetY + maxY * scale;

      setPlatform({
        left: centerX - OVAL_W / 2,
        top: bottomY - OVAL_H / 2,
      });
    } catch {
      setPlatform(DEFAULT_PLATFORM);
    }
  };

  if (regularFailed && shinyFailed) {
    return (
      <div className="rounded-xl border bg-card text-card-foreground shadow">
        <div className="p-8 flex items-center justify-center">
          <p className="font-pokemon-gb text-muted-foreground">No sprites available</p>
        </div>
      </div>
    );
  }

  const showShiny = isShiny && !shinyFailed;
  const currentSrc = showShiny ? shinySrc : regularSrc;
  const currentLabel = showShiny ? 'Official Artwork (Shiny)' : 'Official Artwork';

  const [primary, secondary = '#FFFFFF'] = getTypeColors(types);
  const leftTexture = `conic-gradient(${primary} 25%, ${secondary} 0 50%, ${primary} 0 75%, ${secondary} 0) 0 0 / 24px 24px`;

  return (
    <div>
      <div
        style={{
          marginLeft: `calc(-1 * (${VIEWPORT_OFFSET}))`,
          width: `calc(100% + ${VIEWPORT_OFFSET})`,
          background: `linear-gradient(white, white) padding-box, ${primary} border-box`,
          border: '4px solid transparent',
          borderLeftWidth: 0,
        }}
        className="rounded-2xl rounded-l-none shadow text-card-foreground relative"
      >
        <div
          aria-hidden
          className="absolute left-0 top-0 bottom-0 pointer-events-none"
          style={{
            width: `calc(${VIEWPORT_OFFSET})`,
            background: leftTexture,
          }}
        />
        <div
          className="py-8 pr-8 flex flex-col items-center relative"
          style={{ paddingLeft: `calc(${VIEWPORT_OFFSET} + 2rem)` }}
        >
          <div className="relative w-full flex items-center justify-center h-[300px]">
            <div className="relative" style={{ width: SPRITE_BOX, height: SPRITE_BOX }}>
              <div
                aria-hidden
                className="absolute rounded-[50%] bg-gray-500/30 blur-sm"
                style={{
                  left: `${platform.left}px`,
                  top: `${platform.top}px`,
                  width: `${OVAL_W}px`,
                  height: `${OVAL_H}px`,
                }}
              />
              <img
                src={currentSrc}
                alt={`${pokemonName} - ${currentLabel}`}
                width={SPRITE_BOX}
                height={SPRITE_BOX}
                className="object-contain relative"
                crossOrigin="anonymous"
                onLoad={computePlatformPosition}
                onError={() => (showShiny ? setShinyFailed(true) : setRegularFailed(true))}
              />
            </div>
          </div>

          <p className="mt-4 text-sm font-pokemon-gb text-muted-foreground">
            {currentLabel}
          </p>

          {!shinyFailed && !regularFailed && (
            <Button
              variant={showShiny ? 'default' : 'outline'}
              size="sm"
              onClick={() => setIsShiny((prev) => !prev)}
              className="mt-3"
              aria-pressed={showShiny}
            >
              <StarFilledIcon className="h-4 w-4 mr-1.5" />
              Shiny
            </Button>
          )}

          <div className="mt-6 w-full">
            <PokemonSpriteVariants
              pokemonId={pokemonId}
              pokemonName={pokemonName}
              embedded
            />
          </div>
        </div>
      </div>
    </div>
  );
}
