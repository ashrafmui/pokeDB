'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';

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

const typeColors: Record<string, { bg: string; text: string }> = {
  normal: { bg: "#A8A878", text: "#fff" },
  fire: { bg: "#F08030", text: "#fff" },
  water: { bg: "#6890F0", text: "#fff" },
  electric: { bg: "#F8D030", text: "#333" },
  grass: { bg: "#78C850", text: "#fff" },
  ice: { bg: "#98D8D8", text: "#333" },
  fighting: { bg: "#C03028", text: "#fff" },
  poison: { bg: "#A040A0", text: "#fff" },
  ground: { bg: "#E0C068", text: "#333" },
  flying: { bg: "#A890F0", text: "#fff" },
  psychic: { bg: "#F85888", text: "#fff" },
  bug: { bg: "#A8B820", text: "#fff" },
  rock: { bg: "#B8A038", text: "#fff" },
  ghost: { bg: "#705898", text: "#fff" },
  dragon: { bg: "#7038F8", text: "#fff" },
  dark: { bg: "#705848", text: "#fff" },
  steel: { bg: "#B8B8D0", text: "#333" },
  fairy: { bg: "#EE99AC", text: "#333" },
};

function getPokespriteUrl(pokemonName: string, formType: string): string {
  // PokeSprite uses specific naming conventions
  // https://raw.githubusercontent.com/msikma/pokesprite/master/pokemon-gen8/regular/{name}.png
  // For forms: {name}-{form}.png
  const baseName = pokemonName.toLowerCase();
  
  switch (formType) {
    case 'mega':
      return `https://raw.githubusercontent.com/msikma/pokesprite/master/pokemon-gen8/regular/${baseName}-mega.png`;
    case 'mega-x':
      return `https://raw.githubusercontent.com/msikma/pokesprite/master/pokemon-gen8/regular/${baseName}-mega-x.png`;
    case 'mega-y':
      return `https://raw.githubusercontent.com/msikma/pokesprite/master/pokemon-gen8/regular/${baseName}-mega-y.png`;
    case 'gmax':
      return `https://raw.githubusercontent.com/msikma/pokesprite/master/pokemon-gen8/regular/${baseName}-gmax.png`;
    default:
      return `https://raw.githubusercontent.com/msikma/pokesprite/master/pokemon-gen8/regular/${baseName}.png`;
  }
}

function getFormDisplayName(formType: string, pokemonName: string): string {
  const capitalizedName = pokemonName.charAt(0).toUpperCase() + pokemonName.slice(1);
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

function getFormBadge(formType: string): { label: string; color: string } {
  switch (formType) {
    case 'mega':
    case 'mega-x':
    case 'mega-y':
      return { label: 'MEGA', color: '#8B5CF6' };
    case 'gmax':
      return { label: 'GMAX', color: '#EC4899' };
    default:
      return { label: '', color: '#888' };
  }
}

export default function PokemonFormVariants({ pokemonId, pokemonName }: PokemonFormVariantsProps) {
  const [forms, setForms] = useState<PokemonForm[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedForm, setSelectedForm] = useState<PokemonForm | null>(null);

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
            const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonName}${variant.suffix}`);
            if (res.ok) {
              const data = await res.json();
              foundForms.push({
                id: data.id,
                name: data.name,
                formName: getFormDisplayName(variant.type, pokemonName),
                sprite: data.sprites.other?.['official-artwork']?.front_default 
                  || data.sprites.front_default 
                  || `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${data.id}.png`,
                pokespriteUrl: getPokespriteUrl(pokemonName, variant.type),
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
          const gmaxRes = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonName}-gmax`);
          if (gmaxRes.ok) {
            const data = await gmaxRes.json();
            foundForms.push({
              id: data.id,
              name: data.name,
              formName: getFormDisplayName('gmax', pokemonName),
              sprite: data.sprites.other?.['official-artwork']?.front_default 
                || data.sprites.front_default 
                || `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${data.id}.png`,
              pokespriteUrl: getPokespriteUrl(pokemonName, 'gmax'),
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
    return null; // Don't show anything while loading
  }

  if (forms.length === 0) {
    return null; // Don't render if no special forms exist
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6">
      <h2 className="text-xl font-semibold mb-4">Special Forms</h2>
      
      <div className="flex flex-col items-center gap-4">
        {/* Selected Form Display */}
        {selectedForm && (
          <div className="flex flex-col items-center">
            {/* Form Badge */}
            <span 
              className="px-3 py-1 rounded-full text-xs font-bold text-white mb-2"
              style={{ backgroundColor: getFormBadge(selectedForm.formType).color }}
            >
              {getFormBadge(selectedForm.formType).label}
            </span>
            
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
                const colors = typeColors[type] || { bg: '#888', text: '#fff' };
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
    </div>
  );
}