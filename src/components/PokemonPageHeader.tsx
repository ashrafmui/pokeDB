'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ChevronLeftIcon, ChevronRightIcon, ArrowLeftIcon } from '@radix-ui/react-icons';
import RandomPokemonButton from '@/components/RandomPokemonButton';
import { getTypeRelations } from '@/lib/typeUtils';

interface Type {
  id: number;
  name: string;
  slot?: number;
  [key: string]: unknown;
}

interface PokemonHeaderProps {
  pokemonId: number;
  pokemonName: string;
  types: Type[];
  prevId: number;
  nextId: number;
  maxId: number;
}

function TypeIcon({ typeName }: { typeName: string }) {
  const typeData = getTypeRelations(typeName);

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
            
            {typeData.weakTo.length > 0 && (
              <div className="mb-2">
                <p className="text-xs text-gray-500 mb-1">Weak to (2x):</p>
                <div className="flex flex-wrap gap-1">
                  {typeData.weakTo.map((type) => (
                    <div key={type} className="w-6 h-6 rounded-full overflow-hidden border-2 border-red-400">
                      <Image
                        src={`https://raw.githubusercontent.com/msikma/pokesprite/master/misc/types/gen8/${type}.png`}
                        alt={type}
                        width={24}
                        height={24}
                        unoptimized
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {typeData.resistantTo.length > 0 && (
              <div className="mb-2">
                <p className="text-xs text-gray-500 mb-1">Resists (0.5x):</p>
                <div className="flex flex-wrap gap-1">
                  {typeData.resistantTo.map((type) => (
                    <div key={type} className="w-6 h-6 rounded-full overflow-hidden border-2 border-green-400">
                      <Image
                        src={`https://raw.githubusercontent.com/msikma/pokesprite/master/misc/types/gen8/${type}.png`}
                        alt={type}
                        width={24}
                        height={24}
                        unoptimized
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {typeData.immuneTo.length > 0 && (
              <div>
                <p className="text-xs text-gray-500 mb-1">Immune to (0x):</p>
                <div className="flex flex-wrap gap-1">
                  {typeData.immuneTo.map((type) => (
                    <div key={type} className="w-6 h-6 rounded-full overflow-hidden border-2 border-blue-400">
                      <Image
                        src={`https://raw.githubusercontent.com/msikma/pokesprite/master/misc/types/gen8/${type}.png`}
                        alt={type}
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
            
            {typeData.resistantTo.length > 0 && (
              <div className="mb-2">
                <p className="text-xs text-gray-500 mb-1">Strong against (2x):</p>
                <div className="flex flex-wrap gap-1">
                  {/* For offensive, we need to find types that are weak TO this type */}
                  {typeData.weakTo.map((type) => (
                    <div key={type} className="w-6 h-6 rounded-full overflow-hidden border-2 border-green-400">
                      <Image
                        src={`https://raw.githubusercontent.com/msikma/pokesprite/master/misc/types/gen8/${type}.png`}
                        alt={type}
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
        </div>
      )}
    </div>
  );
}

export default function PokemonHeader({ pokemonId, pokemonName, types, prevId, nextId, maxId }: PokemonHeaderProps) {
  return (
    <div className="flex items-center">
      {/* Left - Back & Random */}
      <div className="flex items-center gap-2">
        <Link href="/">
          <Button variant="outline" size="icon" className="rounded-full">
            <ArrowLeftIcon className="h-4 w-4" />
          </Button>
        </Link>
        <RandomPokemonButton maxId={maxId} />
      </div>

      {/* Center Content with Nav */}
      <div className="flex-1 flex items-center justify-center gap-4">
        <Link href={`/pokemon/${prevId}`}>
          <Button variant="outline" size="icon" className="rounded-full">
            <ChevronLeftIcon className="h-5 w-5" />
          </Button>
        </Link>

        {/* Pokemon Number */}
        <span className="text-muted-foreground text-lg font-medium">
          #{pokemonId.toString().padStart(3, '0')}
        </span>

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
        <h1 className="font-pocket-monk font-extralight text-5xl capitalize leading-none">
          {pokemonName}
        </h1>

        {/* Types */}
        <div className="flex gap-3 items-center">
          {types.map((type) => (
            <TypeIcon key={type.id} typeName={type.name} />
          ))}
        </div>

        <Link href={`/pokemon/${nextId}`}>
          <Button variant="outline" size="icon" className="rounded-full">
            <ChevronRightIcon className="h-5 w-5" />
          </Button>
        </Link>
      </div>
    </div>
  );
}