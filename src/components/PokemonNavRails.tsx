'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ChevronLeftIcon, ChevronRightIcon } from '@radix-ui/react-icons';

interface Props {
  prevId: number;
  nextId: number;
}

export default function PokemonNavRails({ prevId, nextId }: Props) {
  const router = useRouter();

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
      // Don't hijack arrows while user is typing or has a modifier held
      // (Cmd/Ctrl+Arrow = browser back/forward).
      if (e.metaKey || e.ctrlKey || e.altKey || e.shiftKey) return;
      const target = e.target as HTMLElement | null;
      if (target) {
        const tag = target.tagName;
        if (
          tag === 'INPUT' ||
          tag === 'TEXTAREA' ||
          tag === 'SELECT' ||
          target.isContentEditable
        ) {
          return;
        }
      }

      router.push(`/pokemon/${e.key === 'ArrowLeft' ? prevId : nextId}`);
    }

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [prevId, nextId, router]);

  return (
    <>
      <Link
        href={`/pokemon/${prevId}`}
        aria-label="Previous Pokémon"
        className="fixed left-4 bottom-20 z-30 hidden md:block"
      >
        <Button
          variant="outline"
          size="icon"
          className="rounded-full shadow-md h-11 w-11"
        >
          <ChevronLeftIcon className="h-5 w-5" />
        </Button>
      </Link>
      <Link
        href={`/pokemon/${nextId}`}
        aria-label="Next Pokémon"
        className="fixed right-4 bottom-20 z-30 hidden md:block"
      >
        <Button
          variant="outline"
          size="icon"
          className="rounded-full shadow-md h-11 w-11"
        >
          <ChevronRightIcon className="h-5 w-5" />
        </Button>
      </Link>
    </>
  );
}
