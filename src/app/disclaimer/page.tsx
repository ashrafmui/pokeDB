import Link from 'next/link';

export default function Disclaimer() {
  return (
    <main className="min-h-screen bg-white py-12 px-4 sm:px-8">
      <div className="max-w-3xl mx-auto">
        <Link href="/" className="text-blue-600 hover:underline mb-8 inline-block">
          ← Back to Home
        </Link>
        
        <h1 className="text-3xl font-bold mb-8">Disclaimer & Legal Notice</h1>
        
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3">Trademark Notice</h2>
          <p className="text-gray-700 mb-4">
            Pokémon, Pikachu, and all other Pokémon character names, logos, and related media are registered trademarks of Nintendo, Game Freak, Creatures Inc., and The Pokémon Company. This website is not affiliated with, endorsed by, sponsored by, or specifically approved by Nintendo, Game Freak, Creatures Inc., or The Pokémon Company.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3">Fan Project Declaration</h2>
          <p className="text-gray-700 mb-4">
            poKeDB is an unofficial, non-commercial fan project created for educational and entertainment purposes only. This project is made by fans, for fans, and is intended to celebrate the Pokémon franchise. We do not claim ownership of any Pokémon-related intellectual property.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3">Fair Use Statement</h2>
          <p className="text-gray-700 mb-4">
            The use of Pokémon imagery, names, and related content on this website is believed to fall under "fair use" as defined by copyright law, as this project is:
          </p>
          <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
            <li>Non-commercial in nature with no monetary gain</li>
            <li>Educational, providing information about Pokémon for fans</li>
            <li>Transformative, presenting information in a unique database format</li>
            <li>Not a substitute for official Pokémon products or services</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3">Data Attribution</h2>
          <p className="text-gray-700 mb-4">
            Pokémon data displayed on this website is sourced from the <a href="https://pokeapi.co/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">PokéAPI</a>, a free and open RESTful API. We are grateful to the PokéAPI team for providing this resource to the community.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3">Copyright Compliance</h2>
          <p className="text-gray-700 mb-4">
            We respect the intellectual property rights of Nintendo, Game Freak, Creatures Inc., and The Pokémon Company. If any content on this website is believed to infringe upon your copyright, please contact us and we will promptly address the concern. We are committed to complying with all applicable copyright laws and will remove any infringing content upon request.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3">No Warranty</h2>
          <p className="text-gray-700 mb-4">
            This website is provided "as is" without warranty of any kind. The information presented may contain errors or inaccuracies. For official Pokémon information, please visit the official Pokémon website at <a href="https://www.pokemon.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">pokemon.com</a>.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3">Contact</h2>
          <p className="text-gray-700">
            For any questions, concerns, or takedown requests regarding this website, please open an issue on our GitHub repository or contact the project maintainer.
          </p>
        </section>

        <div className="border-t pt-6 mt-8 text-sm text-gray-500">
          <p>Last updated: January 2025</p>
        </div>
      </div>
    </main>
  );
}