import { cn } from '@/lib/utils';
import { CLASS_LABELS, type MoveClass } from '@/lib/moveData';

const STYLES: Record<MoveClass, string> = {
  physical: 'bg-orange-100 text-orange-900',
  special: 'bg-indigo-100 text-indigo-900',
  status: 'bg-gray-100 text-gray-700',
};

/** Physical / Special / Status pill; the word carries the meaning, colour is extra. */
export default function ClassBadge({ cls, className }: { cls: MoveClass; className?: string }) {
  return (
    <span className={cn('inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold', STYLES[cls], className)}>
      {CLASS_LABELS[cls]}
    </span>
  );
}
