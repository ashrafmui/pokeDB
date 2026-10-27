'use client';

import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

// Both games shuffle, time and read localStorage, so they render in the
// browser only to avoid hydration mismatches.

export const WhosThatPokemon = dynamic(() => import('@/components/games/WhosThatPokemon'), {
  ssr: false,
  loading: () => (
    <div className="space-y-4">
      <Skeleton className="h-8 w-full rounded-full" />
      <Skeleton className="mx-auto aspect-square w-full max-w-sm rounded-3xl" />
      <Skeleton className="mx-auto h-12 w-full max-w-sm rounded-xl" />
    </div>
  ),
});

export const NameThemAll = dynamic(() => import('@/components/games/NameThemAll'), {
  ssr: false,
  loading: () => <Skeleton className="mx-auto h-64 w-full max-w-xl rounded-2xl" />,
});
