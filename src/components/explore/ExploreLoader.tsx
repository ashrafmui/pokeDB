'use client';

import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

// Filters are read from the URL on load, so render in the browser only.
const Explore = dynamic(() => import('@/components/explore/Explore'), {
  ssr: false,
  loading: () => (
    <div className="space-y-4">
      <Skeleton className="h-8 w-full rounded-full" />
      <Skeleton className="h-10 w-full rounded-xl" />
      <Skeleton className="h-96 w-full rounded-2xl" />
    </div>
  ),
});

export default Explore;
