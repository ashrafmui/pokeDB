import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
  id: string;
  label: string;
  Icon: LucideIcon;
  iconBg: string;
  iconColor: string;
  isLast?: boolean;
  children: ReactNode;
}

export default function PokemonTimelineSection({
  id,
  label,
  Icon,
  iconBg,
  iconColor,
  isLast,
  children,
}: Props) {
  return (
    <section
      id={id}
      className="relative flex scroll-mt-8 gap-2"
    >
      <div className="sticky top-20 flex w-36 shrink-0 flex-col items-end gap-2 self-start pb-4 max-md:hidden">
        <span
          className={cn(
            'inline-flex h-9 w-9 items-center justify-center rounded-full',
            iconBg,
            iconColor
          )}
        >
          <Icon className="h-5 w-5" />
        </span>
        <div className="text-right text-sm font-semibold">{label}</div>
      </div>

      <div className="flex w-6 shrink-0 flex-col items-center">
        <div className="sticky top-20 flex h-6 w-6 items-center justify-center">
          <span className="flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full bg-primary/20">
            <span className="h-3 w-3 rounded-full bg-primary" />
          </span>
        </div>
        {!isLast && <span className="-mt-2.5 w-px flex-1 border" />}
      </div>

      <div className={cn('flex min-w-0 flex-1 flex-col gap-4 pl-3', !isLast && 'pb-11')}>
        <div className="flex items-center gap-3 md:hidden">
          <span
            className={cn(
              'inline-flex h-9 w-9 items-center justify-center rounded-full',
              iconBg,
              iconColor
            )}
          >
            <Icon className="h-5 w-5" />
          </span>
          <h2 className="text-xl font-semibold">{label}</h2>
        </div>
        {children}
      </div>
    </section>
  );
}
