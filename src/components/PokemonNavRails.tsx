import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ChevronLeftIcon, ChevronRightIcon } from '@radix-ui/react-icons';

interface Props {
  prevId: number;
  nextId: number;
}

export default function PokemonNavRails({ prevId, nextId }: Props) {
  return (
    <>
      <Link
        href={`/pokemon/${prevId}`}
        aria-label="Previous Pokémon"
        className="fixed left-4 top-1/2 -translate-y-1/2 z-30 hidden md:block"
      >
        <Button
          variant="outline"
          size="icon"
          className="rounded-full shadow-md h-11 w-11"
        >
          <ChevronLeftIcon className="h-5 w-5" />
        </Button>
      </Link>
      <Link
        href={`/pokemon/${nextId}`}
        aria-label="Next Pokémon"
        className="fixed right-4 top-1/2 -translate-y-1/2 z-30 hidden md:block"
      >
        <Button
          variant="outline"
          size="icon"
          className="rounded-full shadow-md h-11 w-11"
        >
          <ChevronRightIcon className="h-5 w-5" />
        </Button>
      </Link>
    </>
  );
}
