'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';

interface Type {
  id: number;
  name: string;
  slot: number;
}

interface DamageRelations {
  double_damage_from: { name: string }[];
  half_damage_from: { name: string }[];
  no_damage_from: { name: string }[];
  double_damage_to: { name: string }[];
  half_damage_to: { name: string }[];
  no_damage_to: { name: string }[];
}

interface TypeData {
  damage_relations: DamageRelations;
}

interface PokemonHeaderProps {
  pokemonId: number;
  pokemonName: string;
  types: Type[];
}

function TypeIcon({ typeName }: { typeName: string }) {
  const [typeData, setTypeData] = useState<TypeData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchTypeData = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`https://pokeapi.co/api/v2/type/${typeName}`);
        const data = await response.json();
        setTypeData(data);
      } catch (error) {
        console.error('Error fetching type data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTypeData();
  }, [typeName]);

  return (
    <div className="relative group">
      <div className="w-12 h-12 bg-white/80 backdrop-blur rounded-full shadow-sm flex items-center justify-center overflow-hidden cursor-help transition-transform hover:scale-110">
        <Image
          src={`https://raw.githubusercontent.com/msikma/pokesprite/master/misc/types/gen8/${typeName}.png`}
          alt={typeName}
          width={48}
          height={48}
          unoptimized
        />
      </div>

      {/* Type Effectiveness Modal */}
      {typeData && (
        <div className="absolute left-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-2xl p-4 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 pointer-events-none group-hover:pointer-events-auto">
          <h3 className="font-semibold text-lg capitalize mb-3 border-b pb-2">
            {typeName} Type
          </h3>

          {/* Defensive (Damage Taken) */}
          <div className="mb-4">
            <h4 className="font-medium text-sm text-gray-600 mb-2">Defensive</h4>
            
            {typeData.damage_relations.double_damage_from.length > 0 && (
              <div className="mb-2">
                <p className="text-xs text-gray-500 mb-1">Weak to (2x):</p>
                <div className="flex flex-wrap gap-1">
                  {typeData.damage_relations.double_damage_from.map((type) => (
                    <div key={type.name} className="w-6 h-6 rounded-full overflow-hidden border-2 border-red-400">
                      <Image
                        src={`https://raw.githubusercontent.com/msikma/pokesprite/master/misc/types/gen8/${type.name}.png`}
                        alt={type.name}
                        width={24}
                        height={24}
                        unoptimized
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {typeData.damage_relations.half_damage_from.length > 0 && (
              <div className="mb-2">
                <p className="text-xs text-gray-500 mb-1">Resists (0.5x):</p>
                <div className="flex flex-wrap gap-1">
                  {typeData.damage_relations.half_damage_from.map((type) => (
                    <div key={type.name} className="w-6 h-6 rounded-full overflow-hidden border-2 border-green-400">
                      <Image
                        src={`https://raw.githubusercontent.com/msikma/pokesprite/master/misc/types/gen8/${type.name}.png`}
                        alt={type.name}
                        width={24}
                        height={24}
                        unoptimized
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {typeData.damage_relations.no_damage_from.length > 0 && (
              <div>
                <p className="text-xs text-gray-500 mb-1">Immune to (0x):</p>
                <div className="flex flex-wrap gap-1">
                  {typeData.damage_relations.no_damage_from.map((type) => (
                    <div key={type.name} className="w-6 h-6 rounded-full overflow-hidden border-2 border-blue-400">
                      <Image
                        src={`https://raw.githubusercontent.com/msikma/pokesprite/master/misc/types/gen8/${type.name}.png`}
                        alt={type.name}
                        width={24}
                        height={24}
                        unoptimized
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Offensive (Damage Dealt) */}
          <div>
            <h4 className="font-medium text-sm text-gray-600 mb-2">Offensive</h4>
            
            {typeData.damage_relations.double_damage_to.length > 0 && (
              <div className="mb-2">
                <p className="text-xs text-gray-500 mb-1">Strong against (2x):</p>
                <div className="flex flex-wrap gap-1">
                  {typeData.damage_relations.double_damage_to.map((type) => (
                    <div key={type.name} className="w-6 h-6 rounded-full overflow-hidden border-2 border-green-400">
                      <Image
                        src={`https://raw.githubusercontent.com/msikma/pokesprite/master/misc/types/gen8/${type.name}.png`}
                        alt={type.name}
                        width={24}
                        height={24}
                        unoptimized
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {typeData.damage_relations.half_damage_to.length > 0 && (
              <div className="mb-2">
                <p className="text-xs text-gray-500 mb-1">Weak against (0.5x):</p>
                <div className="flex flex-wrap gap-1">
                  {typeData.damage_relations.half_damage_to.map((type) => (
                    <div key={type.name} className="w-6 h-6 rounded-full overflow-hidden border-2 border-red-400">
                      <Image
                        src={`https://raw.githubusercontent.com/msikma/pokesprite/master/misc/types/gen8/${type.name}.png`}
                        alt={type.name}
                        width={24}
                        height={24}
                        unoptimized
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {typeData.damage_relations.no_damage_to.length > 0 && (
              <div>
                <p className="text-xs text-gray-500 mb-1">No effect on (0x):</p>
                <div className="flex flex-wrap gap-1">
                  {typeData.damage_relations.no_damage_to.map((type) => (
                    <div key={type.name} className="w-6 h-6 rounded-full overflow-hidden border-2 border-gray-400">
                      <Image
                        src={`https://raw.githubusercontent.com/msikma/pokesprite/master/misc/types/gen8/${type.name}.png`}
                        alt={type.name}
                        width={24}
                        height={24}
                        unoptimized
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {isLoading && (
            <div className="absolute inset-0 bg-white/80 rounded-2xl flex items-center justify-center">
              <p className="text-sm text-gray-500">Loading...</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function PokemonHeader({ pokemonId, pokemonName, types }: PokemonHeaderProps) {
  return (
    <div className="flex items-center gap-4">
      {/* Pokemon Sprite */}
      <div className="relative aspect-square rounded-2xl flex items-center justify-center shrink-0">
        <Image
          src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemonId}.png`}
          alt={pokemonName}
          width={120}
          height={120}
          unoptimized
        />
      </div>

      {/* Name */}
      <h1 className="font-pocket-monk font-extralight text-5xl capitalize leading-none">{pokemonName}</h1>

      {/* Types - now inline */}
      <div className="flex gap-3 items-center">
        {types.map((type) => (
          <TypeIcon key={type.id} typeName={type.name} />
        ))}
      </div>
    </div>
  );
}