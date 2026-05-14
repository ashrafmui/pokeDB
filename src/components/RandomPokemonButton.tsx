'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ShuffleIcon } from '@radix-ui/react-icons';

interface RandomPokemonButtonProps {
  maxId: number;
}

export default function RandomPokemonButton({ maxId }: RandomPokemonButtonProps) {
  const router = useRouter();

  const handleRandomPokemon = () => {
    const randomId = Math.floor(Math.random() * maxId) + 1;
    router.push(`/pokemon/${randomId}`, { scroll: false });
  };

  return (
    <Button
      variant="outline"
      size="icon"
      aria-label="Random Pokémon"
      className="h-11 w-11 rounded-full shrink-0"
      onClick={handleRandomPokemon}
    >
      <ShuffleIcon className="h-4 w-4" />
    </Button>
  );
}