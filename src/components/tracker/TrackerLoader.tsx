'use client';

import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

// Progress is read from localStorage, so render in the browser only.
const Tracker = dynamic(() => import('@/components/tracker/Tracker'), {
  ssr: false,
  loading: () => (
    <div className="space-y-4">
      <Skeleton className="h-48 w-full rounded-2xl" />
      <Skeleton className="h-96 w-full rounded-2xl" />
    </div>
  ),
});

export default Tracker;
