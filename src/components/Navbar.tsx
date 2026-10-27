import Link from 'next/link';
import SearchBar from './SearchBar';

export default function Navbar() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-sm border-t border-gray-200 px-4 py-3">
      <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 sm:gap-4">
          <Link href="/" className="font-pocket-monk text-2xl whitespace-nowrap">
            poKeDB
          </Link>
          <Link href="/play" className="text-sm font-medium text-muted-foreground hover:text-foreground">
            Play
          </Link>
          <Link href="/team-builder" className="whitespace-nowrap text-sm font-medium text-muted-foreground hover:text-foreground">
            Team
          </Link>
          <Link href="/explore" className="whitespace-nowrap text-sm font-medium text-muted-foreground hover:text-foreground">
            Explore
          </Link>
          <Link href="/tracker" className="hidden whitespace-nowrap text-sm font-medium text-muted-foreground hover:text-foreground lg:inline">
            Tracker
          </Link>
          <Link href="/damage-calc" className="hidden whitespace-nowrap text-sm font-medium text-muted-foreground hover:text-foreground lg:inline">
            Calc
          </Link>
          <Link href="/moves" className="hidden whitespace-nowrap text-sm font-medium text-muted-foreground hover:text-foreground lg:inline">
            Moves
          </Link>
          <Link href="/abilities" className="hidden whitespace-nowrap text-sm font-medium text-muted-foreground hover:text-foreground lg:inline">
            Abilities
          </Link>
        </div>
        <div className="flex min-w-0 flex-1 justify-end">
          <SearchBar />
        </div>
      </div>
    </nav>
  );
}