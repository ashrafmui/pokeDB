'use client';

import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

// Results come from localStorage and the puzzle number from today's date.
const PokedleArchive = dynamic(() => import('@/components/pokedle/PokedleArchive'), {
  ssr: false,
  loading: () => <Skeleton className="h-48 w-full rounded-2xl" />,
});

export default PokedleArchive;
