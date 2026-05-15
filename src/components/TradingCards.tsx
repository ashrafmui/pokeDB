'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { Skeleton } from '@/components/ui/skeleton';

interface TCGCard {
  id: string;
  name: string;
  rarity?: string;
  set: { name: string; series: string };
  images: { small: string; large: string };
}

interface TCGResponse {
  data: TCGCard[];
}

interface Props {
  pokemonName: string;
}

export default function TradingCards({ pokemonName }: Props) {
  const [cards, setCards] = useState<TCGCard[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setError(null);
      try {
        const query = encodeURIComponent(`name:"${pokemonName}"`);
        const res = await fetch(
          `https://api.pokemontcg.io/v2/cards?q=${query}&orderBy=-set.releaseDate&pageSize=60`
        );
        if (!res.ok) throw new Error(`TCG API responded ${res.status}`);
        const json: TCGResponse = await res.json();
        if (!cancelled) setCards(json.data ?? []);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load trading cards');
          setCards([]);
        }
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [pokemonName]);

  if (cards === null) {
    return (
      <div className="flex gap-4 overflow-hidden">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-[342px] w-[245px] shrink-0 rounded-lg" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <p className="text-sm text-muted-foreground italic">
        Could not load trading cards ({error}).
      </p>
    );
  }

  if (cards.length === 0) {
    return (
      <p className="text-sm text-muted-foreground italic">
        No trading cards found for this Pokémon.
      </p>
    );
  }

  return (
    <Carousel
      opts={{ align: 'start', dragFree: true }}
      className="w-full"
    >
      <CarouselContent>
        {cards.map((card) => (
          <CarouselItem
            key={card.id}
            className="basis-auto"
          >
            <a
              href={`https://pokemontcg.io/card/${card.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="block group"
            >
              <div className="relative w-[245px] aspect-[245/342] rounded-lg overflow-hidden shadow-md group-hover:shadow-xl group-hover:-translate-y-1 transition-all bg-muted">
                <Image
                  src={card.images.small}
                  alt={`${card.name} — ${card.set.name}`}
                  fill
                  sizes="245px"
                  className="object-contain"
                  unoptimized
                />
              </div>
              <div className="mt-2 w-[245px]">
                <p className="text-sm font-medium truncate">{card.name}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {card.set.name}
                  {card.rarity ? ` · ${card.rarity}` : ''}
                </p>
              </div>
            </a>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  );
}
