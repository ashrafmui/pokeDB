import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="fixed bottom-0 left-0 w-full py-3 px-8 text-center text-xs text-gray-500 bg-white/80 backdrop-blur-sm z-40">
      <p className="max-w-2xl mx-auto">
        Pokémon and all related media are trademarks of Nintendo, Game Freak, and The Pokémon Company.
        This is an unofficial fan project and is not affiliated with or endorsed by Nintendo, Game Freak, or The Pokémon Company.
        All Pokémon content is used for educational and non-commercial purposes under fair use.
        {' '}<Link href="/disclaimer" className="underline hover:text-gray-700">Full Disclaimer</Link>
      </p>
    </footer>
  );
}