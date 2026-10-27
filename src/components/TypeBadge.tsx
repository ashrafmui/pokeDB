import { cn } from '@/lib/utils';
import { getTypeBadgeColors } from '@/lib/typeColors';

/** Coloured pill for a Pokémon or move type. */
export default function TypeBadge({ type, className }: { type: string; className?: string }) {
  const { bg, text } = getTypeBadgeColors(type);
  return (
    <span
      className={cn('inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold', className)}
      style={{ backgroundColor: bg, color: text }}
    >
      {type.charAt(0).toUpperCase() + type.slice(1)}
    </span>
  );
}
