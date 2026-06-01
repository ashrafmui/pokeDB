'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { AnimatedCollapsibleContent, Collapsible, CollapseToggle, useCollapsible } from '@/components/ui/collapsible';
import { FORM_ICONS, pokespriteFormUrl, pickOfficialArtwork } from '@/lib/sprites';
import { getTypeBadgeColors } from '@/lib/typeColors';
import { capitalize } from '@/lib/formatters';
import { pokemonUrl } from '@/lib/pokeApi';

interface PokemonForm {
  id: number;
  name: string;
  formName: string;
  sprite: string;
  pokespriteUrl: string;
  types: string[];
  formType: 'mega' | 'mega-x' | 'mega-y' | 'gmax';
}

interface PokemonFormVariantsProps {
  pokemonId: number;
  pokemonName: string;
}

function getFormDisplayName(formType: string, pokemonName: string): string {
  const capitalizedName = capitalize(pokemonName);
  switch (formType) {
    case 'mega':
      return `Mega ${capitalizedName}`;
    case 'mega-x':
      return `Mega ${capitalizedName} X`;
    case 'mega-y':
      return `Mega ${capitalizedName} Y`;
    case 'gmax':
      return `Gigantamax ${capitalizedName}`;
    default:
      return capitalizedName;
  }
}

export default function PokemonFormVariants({ pokemonId, pokemonName }: PokemonFormVariantsProps) {
  const [forms, setForms] = useState<PokemonForm[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedForm, setSelectedForm] = useState<PokemonForm | null>(null);
  const { isOpen, toggle, setIsOpen } = useCollapsible(true);

  useEffect(() => {
    async function fetchForms() {
      setIsLoading(true);
      const foundForms: PokemonForm[] = [];

      try {
        // Check for Mega Evolution(s)
        const megaVariants = [
          { suffix: '-mega', type: 'mega' as const },
          { suffix: '-mega-x', type: 'mega-x' as const },
          { suffix: '-mega-y', type: 'mega-y' as const },
        ];

        for (const variant of megaVariants) {
          try {
            const res = await fetch(`${pokemonUrl(pokemonName)}${variant.suffix}`);
            if (res.ok) {
              const data = await res.json();
              foundForms.push({
                id: data.id,
                name: data.name,
                formName: getFormDisplayName(variant.type, pokemonName),
                sprite: pickOfficialArtwork(data.sprites, data.id),
                pokespriteUrl: pokespriteFormUrl(pokemonName, variant.type),
                types: data.types.map((t: { type: { name: string } }) => t.type.name),
                formType: variant.type,
              });
            }
          } catch {
            // Form doesn't exist, continue
          }
        }

        // Check for Gigantamax
        try {
          const gmaxRes = await fetch(`${pokemonUrl(pokemonName)}-gmax`);
          if (gmaxRes.ok) {
            const data = await gmaxRes.json();
            foundForms.push({
              id: data.id,
              name: data.name,
              formName: getFormDisplayName('gmax', pokemonName),
              sprite: pickOfficialArtwork(data.sprites, data.id),
              pokespriteUrl: pokespriteFormUrl(pokemonName, 'gmax'),
              types: data.types.map((t: { type: { name: string } }) => t.type.name),
              formType: 'gmax',
            });
          }
        } catch {
          // Gmax form doesn't exist
        }

        setForms(foundForms);
        if (foundForms.length > 0) {
          setSelectedForm(foundForms[0]);
        }
      } catch (error) {
        console.error('Error fetching form variants:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchForms();
  }, [pokemonId, pokemonName]);

  if (isLoading) {
    return null;
  }

  if (forms.length === 0) {
    return null;
  }

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} asChild>
    <div className="bg-white rounded-2xl shadow-xl p-6 relative">
      <div className="flex items-start justify-between gap-3">
        <h2 className="text-xl font-semibold">Special Forms</h2>
        <CollapseToggle isOpen={isOpen} onToggle={toggle} />
      </div>

      <AnimatedCollapsibleContent>
      <div className="flex flex-col items-center gap-4 mt-4">
        {/* Selected Form Display */}
        {selectedForm && (
          <div className="flex flex-col items-center">
            {/* Form Icon */}
            <div className="mb-2">
              <Image
                src={FORM_ICONS[selectedForm.formType]}
                alt={selectedForm.formType.includes('mega') ? 'Mega Evolution' : 'Gigantamax'}
                width={32}
                height={32}
                className="object-contain"
                unoptimized
              />
            </div>
            
            {/* Sprite */}
            <div className="w-40 h-40 flex items-center justify-center mb-3">
              <Image
                src={selectedForm.sprite}
                alt={selectedForm.formName}
                width={160}
                height={160}
                className="object-contain"
                unoptimized
              />
            </div>
            
            {/* Name */}
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              {selectedForm.formName}
            </h3>
            
            {/* Types */}
            <div className="flex gap-2">
              {selectedForm.types.map((type) => {
                const colors = getTypeBadgeColors(type);
                return (
                  <span
                    key={type}
                    className="px-3 py-1 rounded-full text-sm font-medium capitalize"
                    style={{ backgroundColor: colors.bg, color: colors.text }}
                  >
                    {type}
                  </span>
                );
              })}
            </div>
          </div>
        )}
        
        {/* Form Selector (if multiple forms) */}
        {forms.length > 1 && (
          <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100 w-full justify-center">
            {forms.map((form) => (
              <button
                key={form.id}
                onClick={() => setSelectedForm(form)}
                className={`p-2 rounded-xl transition-all ${
                  selectedForm?.id === form.id
                    ? 'bg-gray-100 ring-2 ring-blue-500'
                    : 'bg-gray-50 hover:bg-gray-100'
                }`}
                title={form.formName}
              >
                <Image
                  src={form.pokespriteUrl}
                  alt={form.formName}
                  width={68}
                  height={56}
                  className="object-contain"
                  style={{ imageRendering: 'pixelated' }}
                  unoptimized
                />
              </button>
            ))}
          </div>
        )}
      </div>
      </AnimatedCollapsibleContent>
    </div>
    </Collapsible>
  );
}