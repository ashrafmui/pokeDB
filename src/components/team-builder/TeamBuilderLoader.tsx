'use client';

import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

// The team comes from the URL and localStorage, so render in the browser only.
const TeamBuilder = dynamic(() => import('@/components/team-builder/TeamBuilder'), {
  ssr: false,
  loading: () => (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-2 sm:gap-3 lg:grid-cols-6">
        {Array.from({ length: 6 }, (_, i) => (
          <Skeleton key={i} className="h-36 rounded-2xl sm:h-40" />
        ))}
      </div>
      <Skeleton className="h-12 w-full rounded-xl" />
    </div>
  ),
});

export default TeamBuilder;
