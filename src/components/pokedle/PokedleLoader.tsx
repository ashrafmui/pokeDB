'use client';

import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

// The game depends on today's date and localStorage, so it renders in the
// browser only; this avoids a hydration mismatch at midnight or on reload.
const Pokedle = dynamic(() => import('@/components/pokedle/Pokedle'), {
  ssr: false,
  loading: () => (
    <div className="space-y-3">
      <Skeleton className="h-10 w-56 rounded-full" />
      <Skeleton className="h-12 w-full rounded-xl" />
      <Skeleton className="h-40 w-full rounded-xl" />
    </div>
  ),
});

export default Pokedle;
