import Image from "next/image";
import Link from "next/link";
import GenerationButtons from "@/components/GenerationButtons";
import SpriteGrid from "@/components/SpriteGrid";
import {ArrowLeftIcon} from "@radix-ui/react-icons"
import { Button } from "@/components/ui/button"


export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center p-8 sm:p-20 font-[family-name:var(--font-geist-sans)] bg-background">

        <main>
            <div className="flex items-center justify-left">
              <Link href = "/" passHref>
                <Button variant="outline" size="icon" className = "rounded-full p-2">
                  <ArrowLeftIcon className="h-4 w-4 rounded-full" />
                </Button>
              </Link>
            <h1 className="font-pocket-monk text-6xl px-5">Gen 6</h1>
            </div>
            <SpriteGrid generation = "gen6"/>
            <div className="flex items-center justify-center">
              <GenerationButtons activeGeneration={6}/>
            </div>
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
