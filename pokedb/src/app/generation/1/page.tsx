import SearchBar from "@/components/SearchBar";
import Image from "next/image";
import Link from "next/link";
// import { Navbar, NavbarBrand, NavbarContent, NavbarItem, Button } from "@nextui-org/react";
//import GenerationButtons from "@/components/GenerationButtons";
import SpriteGrid from "@/components/SpriteGrid";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center p-8 sm:p-20 font-[family-name:var(--font-geist-sans)] bg-background">

        <main>
            <h1 className="font-pocket-monk text-6xl">Gen 1</h1>
            <SpriteGrid generation = "gen1"/>
        </main>
        <footer className="flex gap-6 flex-wrap items-center justify-center mt-16">
          
          <a
            className="flex items-center gap-2 hover:underline hover:underline-offset-4"
            href="https://www.pokemon.com/us"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              aria-hidden
              src="https://upload.wikimedia.org/wikipedia/commons/5/53/Pok%C3%A9_Ball_icon.svg"
              alt="Globe icon"
              width={16}
              height={16}
            />
            PoKéMON →
          </a>
        </footer>
    </div>
  );
}
