import Link from 'next/link';
import { ArrowLeftIcon } from '@radix-ui/react-icons';
import { Button } from '@/components/ui/button';

interface HeaderProps {
  title?: string;
  showBackButton?: boolean;
}

export default function Header({ title = "poKeDB", showBackButton = true }: HeaderProps) {
  return (
    <header className="flex items-center gap-4 mb-8">
      {showBackButton && (
        <Link href="/" passHref>
          <Button variant="outline" size="icon" className="rounded-full p-2 bg-white">
            <ArrowLeftIcon className="h-4 w-4" />
          </Button>
        </Link>
      )}
      <h1 className="font-pocket-monk text-6xl">{title}</h1>
    </header>
  );
}