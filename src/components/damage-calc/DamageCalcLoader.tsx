'use client';

import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

// The matchup comes from the URL, so render in the browser only.
const DamageCalc = dynamic(() => import('@/components/damage-calc/DamageCalc'), {
  ssr: false,
  loading: () => (
    <div className="space-y-4">
      <Skeleton className="h-96 w-full rounded-2xl" />
      <Skeleton className="h-40 w-full rounded-2xl" />
    </div>
  ),
});

export default DamageCalc;
