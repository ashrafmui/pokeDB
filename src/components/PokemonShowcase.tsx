"use client";

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Sparkles } from 'lucide-react';

type FormType = 'mega' | 'mega-x' | 'mega-y' | 'gmax';

interface FormVariant {
  type: FormType;
  iconUrl: string;
  artworkUrl: string;
  shinyArtworkUrl: string | null;
  label: string;
}

const FORM_ICONS: Record<FormType, string> = {
  mega: 'https://raw.githubusercontent.com/msikma/pokesprite/master/misc/special-attribute/mega-evolution-sigil-hires.png',
  'mega-x': 'https://raw.githubusercontent.com/msikma/pokesprite/master/misc/special-attribute/mega-evolution-sigil-hires.png',
  'mega-y': 'https://raw.githubusercontent.com/msikma/pokesprite/master/misc/special-attribute/mega-evolution-sigil-hires.png',
  gmax: 'https://raw.githubusercontent.com/msikma/pokesprite/master/misc/special-attribute/gigantamax-icon.png',
};

const FORM_CHECKS: { type: FormType; suffix: string; label: string }[] = [
  { type: 'mega', suffix: '-mega', label: 'Mega' },
  { type: 'mega-x', suffix: '-mega-x', label: 'Mega X' },
  { type: 'mega-y', suffix: '-mega-y', label: 'Mega Y' },
  { type: 'gmax', suffix: '-gmax', label: 'Gigantamax' },
];
import PokemonSpriteVariants from '@/components/PokemonSpriteVariants';
import PokedexTopBar from '@/components/PokedexTopBar';
import EvolutionChain from '@/components/EvolutionChain';


interface Props {
  pokemonId: number;
  pokemonName: string;
  spritesVersions: Record<string, unknown>;
}

export default function PokemonShowcase({ pokemonId, pokemonName, spritesVersions }: Props) {
  const regularSrc = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemonId}.png`;
  const shinySrc = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/shiny/${pokemonId}.png`;

  const [isShiny, setIsShiny] = useState(false);
  const [shinyFailed, setShinyFailed] = useState(false);
  const [regularFailed, setRegularFailed] = useState(false);
  const [availableForms, setAvailableForms] = useState<FormVariant[]>([]);
  const [selectedForm, setSelectedForm] = useState<FormType | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function fetchForms() {
      const results = await Promise.all(
        FORM_CHECKS.map(async (check): Promise<FormVariant | null> => {
          try {
            const res = await fetch(
              `https://pokeapi.co/api/v2/pokemon/${pokemonName}${check.suffix}`
            );
            if (!res.ok) return null;
            const data = await res.json();
            const artwork = data.sprites?.other?.['official-artwork']?.front_default;
            if (!artwork) return null;
            return {
              type: check.type,
              iconUrl: FORM_ICONS[check.type],
              artworkUrl: artwork,
              shinyArtworkUrl:
                data.sprites?.other?.['official-artwork']?.front_shiny ?? null,
              label: check.label,
            };
          } catch {
            return null;
          }
        })
      );
      if (cancelled) return;
      setAvailableForms(results.filter((r): r is FormVariant => r !== null));
    }
    fetchForms();
    return () => {
      cancelled = true;
    };
  }, [pokemonName]);

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
  const activeForm = selectedForm
    ? availableForms.find((f) => f.type === selectedForm) ?? null
    : null;
  const currentSrc = activeForm
    ? (showShiny && activeForm.shinyArtworkUrl
        ? activeForm.shinyArtworkUrl
        : activeForm.artworkUrl)
    : showShiny
      ? shinySrc
      : regularSrc;
  const currentLabel = showShiny ? 'Official Artwork (Shiny)' : 'Official Artwork';

  return (
    <div className="bg-card text-card-foreground rounded-2xl shadow-lg border overflow-hidden relative">
      <PokedexTopBar />

      <div className="py-8 px-8 flex flex-col items-center relative">
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

            <div className="absolute inset-y-0 left-0 flex items-center">
              <TooltipProvider delayDuration={150}>
                <div className="flex flex-col gap-2">
                  {!shinyFailed && !regularFailed && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant={showShiny ? 'default' : 'outline'}
                          size="icon"
                          onClick={() => setIsShiny((prev) => !prev)}
                          aria-pressed={showShiny}
                          aria-label={showShiny ? 'Show normal sprite' : 'Show shiny sprite'}
                        >
                          <Sparkles />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="right">
                        {showShiny ? 'Switch to normal sprite' : 'Switch to shiny sprite'}
                      </TooltipContent>
                    </Tooltip>
                  )}

                  {availableForms.map((form) => {
                    const isActive = selectedForm === form.type;
                    return (
                      <Tooltip key={form.type}>
                        <TooltipTrigger asChild>
                          <Button
                            variant={isActive ? 'default' : 'outline'}
                            size="icon"
                            onClick={() =>
                              setSelectedForm((prev) => (prev === form.type ? null : form.type))
                            }
                            aria-pressed={isActive}
                            aria-label={`Show ${form.label} form`}
                          >
                            <img
                              src={form.iconUrl}
                              alt=""
                              width={24}
                              height={24}
                              className="object-contain"
                            />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="right">
                          {isActive ? `Hide ${form.label} form` : `View ${form.label} form`}
                        </TooltipContent>
                      </Tooltip>
                    );
                  })}
                </div>
              </TooltipProvider>
            </div>

            <div className="absolute inset-y-0 right-0 flex items-center">
              <EvolutionChain pokemonId={pokemonId} embedded />
            </div>
          </div>

          <div className="mt-6 w-full">
            <PokemonSpriteVariants
              pokemonId={pokemonId}
              pokemonName={pokemonName}
              spritesVersions={spritesVersions}
              embedded
            />
          </div>
      </div>
    </div>
  );
}