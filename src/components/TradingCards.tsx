'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

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
  const [selectedCard, setSelectedCard] = useState<TCGCard | null>(null);

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
    <>
      <div className="flex gap-4 overflow-x-auto pb-3 snap-x">
        {cards.map((card) => (
          <button
            key={card.id}
            type="button"
            onClick={() => setSelectedCard(card)}
            className="group shrink-0 snap-start text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-lg"
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
          </button>
        ))}
      </div>

      <Dialog open={selectedCard !== null} onOpenChange={(open) => !open && setSelectedCard(null)}>
        <DialogContent className="max-w-[min(90vw,560px)] p-4 sm:p-6 bg-transparent border-0 shadow-none">
          {selectedCard && (
            <>
              <DialogTitle className="sr-only">
                {selectedCard.name} — {selectedCard.set.name}
              </DialogTitle>
              <DialogDescription className="sr-only">
                {selectedCard.set.series}
                {selectedCard.rarity ? ` · ${selectedCard.rarity}` : ''}
              </DialogDescription>
              <div className="relative w-full aspect-[245/342]">
                <Image
                  src={selectedCard.images.large}
                  alt={`${selectedCard.name} — ${selectedCard.set.name}`}
                  fill
                  sizes="(max-width: 640px) 90vw, 560px"
                  className="object-contain drop-shadow-2xl"
                  unoptimized
                  priority
                />
              </div>
              <div className="text-center text-black">
                <p className="text-base font-semibold">{selectedCard.name}</p>
                <p className="text-xs text-black/80">
                  {selectedCard.set.name}
                  {selectedCard.rarity ? ` · ${selectedCard.rarity}` : ''}
                </p>
                <a
                  href={`https://pokemontcg.io/card/${selectedCard.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-block text-xs underline text-black/90 hover:text-white"
                >
                  View on pokemontcg.io
                </a>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
