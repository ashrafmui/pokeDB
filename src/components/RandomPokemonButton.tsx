'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ShuffleIcon } from '@radix-ui/react-icons';

interface RandomPokemonButtonProps {
  maxId?: number;
}

export default function RandomPokemonButton({ maxId = 1025 }: RandomPokemonButtonProps) {
  const router = useRouter();

  const goToRandomPokemon = () => {
    const randomId = Math.floor(Math.random() * maxId) + 1;
    router.push(`/pokemon/${randomId}`);
  };

  return (
    <Button
      variant="outline"
      size="icon"
      className="rounded-full"
      onClick={goToRandomPokemon}
      title="Random Pokémon"
    >
      <ShuffleIcon className="h-4 w-4" />
    </Button>
  );
}