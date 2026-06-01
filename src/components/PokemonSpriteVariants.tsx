"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronDown } from 'lucide-react';
import { getGenerationSprites, type GenerationSprite } from '@/lib/spriteOptions';
import { spriteUrl, backSpriteUrl, shinySpriteUrl, backShinySpriteUrl } from '@/lib/sprites';

interface SpriteItem {
  key: string;
  label: string;
  src: string;
}

// All sprite type keys used in the grid.
const SPRITE_TYPES = ['front', 'back', 'front-shiny', 'back-shiny'] as const;

interface Props {
  pokemonId: number;
  pokemonName: string;
  /** The raw `sprites.versions` object from PokeAPI. */
  spritesVersions: Record<string, unknown>;
  embedded?: boolean;
}

export default function PokemonSpriteVariants({
  pokemonId,
  pokemonName,
  spritesVersions,
  embedded = false,
}: Props) {
  const defaultSprites: SpriteItem[] = [
    { key: 'front', label: 'Front', src: spriteUrl(pokemonId) },
    { key: 'back', label: 'Back', src: backSpriteUrl(pokemonId) },
    { key: 'front-shiny', label: 'Shiny', src: shinySpriteUrl(pokemonId) },
    { key: 'back-shiny', label: 'Shiny Back', src: backShinySpriteUrl(pokemonId) },
  ];

  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());
  const [expandedType, setExpandedType] = useState<string | null>(null);
  const [selectedGen, setSelectedGen] = useState<
    Record<string, { genKey: string; src: string; label: string }>
  >({});

  const availableSprites = defaultSprites.filter(
    (item) => !failedImages.has(item.key),
  );

  const handleImageError = (key: string) => {
    setFailedImages((prev) => new Set(prev).add(key));
  };

  const handleSpriteClick = (key: string) => {
    setExpandedType((prev) => (prev === key ? null : key));
  };

  const handleGenSelect = (spriteType: string, gen: GenerationSprite) => {
    setSelectedGen((prev) => ({
      ...prev,
      [spriteType]: { genKey: gen.key, src: gen.src, label: gen.generation },
    }));
  };

  /** Apply a generation across every sprite type that has a sprite for it. */
  const handleApplyAll = (genLabel: string) => {
    if (genLabel === 'default') {
      setSelectedGen({});
      return;
    }

    const next: Record<string, { genKey: string; src: string; label: string }> = {};

    for (const type of SPRITE_TYPES) {
      const sprites = getGenerationSprites(spritesVersions, type);
      const match = sprites.find((s) => s.generation === genLabel);
      if (match) {
        next[type] = { genKey: match.key, src: match.src, label: match.generation };
      }
    }

    setSelectedGen(next);
  };

  if (availableSprites.length === 0) return null;

  // Build generation entries for the currently expanded type.
  const generationSprites: GenerationSprite[] = expandedType
    ? getGenerationSprites(spritesVersions, expandedType)
    : [];

  // Build the list of unique generation labels for the "apply all" dropdown.
  // Use the front sprite type as the reference since it has the widest coverage.
  const allGenerations = getGenerationSprites(spritesVersions, 'front');

  const isOpen = !!expandedType;

  const grid = (
    <div className="space-y-4">
      {/* Thumbnail grid */}
      <div className="grid grid-cols-4 gap-4">
        {availableSprites.map((sprite) => {
          const isExpanded = expandedType === sprite.key;
          const override = selectedGen[sprite.key];
          const displaySrc = override?.src ?? sprite.src;

          return (
            <button
              key={sprite.key}
              type="button"
              onClick={() => handleSpriteClick(sprite.key)}
              className={`flex flex-col items-center cursor-pointer rounded-md p-1.5 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                isExpanded
                  ? 'ring-2 ring-primary bg-primary/5'
                  : 'hover:bg-muted/60'
              }`}
            >
              <div className="w-20 h-20 flex items-center justify-center bg-muted rounded-md">
                <img
                  src={displaySrc}
                  alt={`${pokemonName} - ${sprite.label}`}
                  width={96}
                  height={96}
                  className="object-contain max-w-full max-h-full"
                  style={{ imageRendering: 'pixelated' }}
                  onError={() => handleImageError(sprite.key)}
                />
              </div>
              <div className="flex items-center gap-1 mt-2">
                <p className="text-xs text-muted-foreground text-center">
                  {override ? override.label : sprite.label}
                </p>
                <ChevronDown
                  className={`h-3 w-3 text-muted-foreground transition-transform duration-150 ease-out ${
                    isExpanded ? 'rotate-180' : ''
                  }`}
                />
              </div>
            </button>
          );
        })}
      </div>

      {/* Inline generation carousel — animated expand/collapse */}
      <div
        className="rounded-lg border bg-muted/30 overflow-hidden transition-all duration-150 ease-out"
        style={{
          height: isOpen ? '200px' : '0px',
          padding: isOpen ? '16px' : '0 16px',
          opacity: isOpen ? 1 : 0,
          borderWidth: isOpen ? '1px' : '0px',
          marginTop: isOpen ? '4px' : '0px',
        }}
      >
        {generationSprites.length > 0 ? (
          <>
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-medium text-muted-foreground">
                {availableSprites.find((s) => s.key === expandedType)?.label}{' '}
                across generations
              </p>
              <select
                aria-label="Apply generation to all sprites"

                value={
                  // If every overridden type shares the same generation label,
                  // show that label as the dropdown value; otherwise "default".
                  (() => {
                    const vals = Object.values(selectedGen);
                    if (vals.length === 0) return 'default';
                    const first = vals[0].label;
                    return vals.length === availableSprites.length &&
                      vals.every((v) => v.label === first)
                      ? first
                      : 'default';
                  })()
                }
                onChange={(e) => handleApplyAll(e.target.value)}
                className="text-[11px] bg-background border rounded-md px-2 py-1 text-muted-foreground cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="default">Default</option>
                {allGenerations.map((gen) => (
                  <option key={gen.key} value={gen.generation}>
                    {gen.generation}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex gap-3 overflow-x-auto p-1 snap-x snap-mandatory">
              {generationSprites.map((gen) => {
                const isActive =
                  expandedType != null &&
                  selectedGen[expandedType]?.genKey === gen.key;

                return (
                  <button
                    key={gen.key}
                    type="button"
                    onClick={() =>
                      expandedType && handleGenSelect(expandedType, gen)
                    }
                    className={`shrink-0 w-24 flex flex-col items-center gap-1.5 p-2 rounded-md border bg-background snap-start transition-all duration-150 ease-out ${
                      isActive
                        ? 'border-primary ring-1 ring-primary bg-primary/5'
                        : 'hover:border-muted-foreground/40'
                    }`}
                  >
                    <div className="w-20 h-20 flex items-center justify-center bg-muted rounded overflow-hidden">
                      <img
                        src={gen.src}
                        alt={`${pokemonName} - ${gen.generation}`}
                        className="object-contain w-16 h-16"
                        style={{ imageRendering: 'pixelated' }}
                      />
                    </div>
                    <span className="text-[11px] text-center text-muted-foreground font-medium leading-tight w-full">
                      {gen.generation}
                    </span>
                    <span className="text-[10px] text-center text-muted-foreground/70 leading-tight w-full line-clamp-1">
                      {gen.game}
                    </span>
                  </button>
                );
              })}
            </div>
          </>
        ) : (
          isOpen && (
            <p className="text-xs text-muted-foreground text-center">
              No generation sprites available for this type.
            </p>
          )
        )}
      </div>
    </div>
  );

  if (embedded) return grid;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold">Sprites</CardTitle>
      </CardHeader>
      <CardContent>{grid}</CardContent>
    </Card>
  );
}