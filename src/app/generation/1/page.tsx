// import Image from "next/image";
// import Link from "next/link";
// // import { Navbar, NavbarBrand, NavbarContent, NavbarItem, Button } from "@nextui-org/react";
// import GenerationButtons from "@/components/GenerationButtons";
// import SpriteGrid from "@/components/SpriteGrid";
// import {ArrowLeftIcon} from "@radix-ui/react-icons"
// import { Button } from "@/components/ui/button"
// import BackgroundGradient from '@/components/BackgroundGradient';

// export default function Home() {
//   return (
//     <>
//     <BackgroundGradient />
//     <div className="flex flex-1 flex-col items-center justify-center p-8 sm:p-20 font-[family-name:var(--font-geist-sans)]">
//         <main className = "relative z-10">
//             <div className="flex items-center justify-left">
//               <Link href = "/" passHref>
//                 <Button variant="outline" size="icon" className = "rounded-full p-2">
//                   <ArrowLeftIcon className="h-4 w-4 rounded-full" />
//                 </Button>
//               </Link>
//               <h1 className="font-pocket-monk text-6xl px-5">Gen 1</h1>
//             </div>
//             <SpriteGrid generation = "gen1"/>
//             <div className="flex items-center justify-center">
//               <GenerationButtons activeGeneration={1}/>
//             </div>
//         </main>
//         <footer className="flex gap-6 flex-wrap items-center justify-center mt-16">
//           <a
//             className="flex items-center gap-2 hover:underline hover:underline-offset-4"
//             href="https://www.pokemon.com/us"
//             target="_blank"
//             rel="noopener noreferrer"
//           >
//             <Image
//               aria-hidden
//               src="https://upload.wikimedia.org/wikipedia/commons/5/53/Pok%C3%A9_Ball_icon.svg"
//               alt="Globe icon"
//               width={16}
//               height={16}
//             />
//             PoKéMON →
//           </a>
//         </footer>
//     </div>
//     </>
//   );
// }

import Image from "next/image";
import GenerationButtons from "@/components/GenerationButtons";
import BackgroundGradient from '@/components/BackgroundGradient';
import Header from "@/components/Header";
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function getPokemon(generation: number) {
  const pokemon = await prisma.pokemon.findMany({
    where: { generation },
    include: { types: true },
    orderBy: { id: 'asc' },
  });
  return pokemon;
}

export default async function Gen1Page() {
  const pokemonList = await getPokemon(1);

  return (
    <>
      <BackgroundGradient />
      <div className="relative z-10 flex flex-1 flex-col items-center justify-center p-8 sm:p-20 font-[family-name:var(--font-geist-sans)]">
        <main>
          <Header title="Gen 1" />
          <div className="grid grid-cols-10 gap-4 p-4">
            {pokemonList.map((pokemon) => (
              <div
                key={pokemon.id}
                className="w-20 h-20 flex items-center justify-center bg-white shadow-lg transform transition duration-300 rounded-3xl hover:scale-150 hover:bg-gray-100 hover:z-10"
              >
                <Image
                  src={pokemon.sprite}
                  alt={pokemon.name}
                  width={72}
                  height={72}
                  className="object-contain"
                />
              </div>
            ))}
          </div>
          <div className="flex items-center justify-center">
            <GenerationButtons activeGeneration={1} />
          </div>
        </main>
      </div>
    </>
  );
}