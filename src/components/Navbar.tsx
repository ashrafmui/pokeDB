import Link from 'next/link';
import SearchBar from './SearchBar';

export default function Navbar() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-sm border-t border-gray-200 px-4 py-3">
      <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
        <Link href="/" className="font-pocket-monk text-2xl whitespace-nowrap">
          poKeDB
        </Link>
        <SearchBar />
      </div>
    </nav>
  );
}