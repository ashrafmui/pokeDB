import SearchBar from "@/components/SearchBar";
import Image from "next/image";
import Link from "next/link";
import GenerationButtons from "@/components/GenerationButtons";


export default function Home() {

  // Extract the generation number from the URL
  
  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex flex-1 flex-col items-center justify-center p-8 sm:p-20 font-[family-name:var(--font-geist-sans)] bg-background">
        <main className="flex flex-col items-center gap-8">
          <div className="flex items-center justify-center">
            <Image
              src="/images/pokeball1.png"
              alt="poke bol"
              width={180}
              height={38}
              priority
            />
          </div>
          <div className="flex items-center justify-center">
            <h1 className="outline font-pocket-monk text-6xl">poKeDB</h1>
          </div>
          <div className="flex items-center justify-center">
            <SearchBar />
          </div>
          <div className="flex items-center justify-center">
            <GenerationButtons activeGeneration={null}/>
          </div>
          <div className="flex items-center justify-center">
            <Link href="/spotlight">
              View Pokemon
            </Link>
          </div>
          
        </main>

        {/* <footer className="flex gap-6 flex-wrap items-center justify-center mt-16">
          <a
            className="flex items-center gap-2 hover:underline hover:underline-offset-4"
            href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              aria-hidden
              src="https://nextjs.org/icons/file.svg"
              alt="File icon"
              width={16}
              height={16}
            />
            Learn
          </a>
          <a
            className="flex items-center gap-2 hover:underline hover:underline-offset-4"
            href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              aria-hidden
              src="https://nextjs.org/icons/window.svg"
              alt="Window icon"
              width={16}
              height={16}
            />
            Examples
          </a>
          <a
            className="flex items-center gap-2 hover:underline hover:underline-offset-4"
            href="https://nextjs.org?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              aria-hidden
              src="https://nextjs.org/icons/globe.svg"
              alt="Globe icon"
              width={16}
              height={16}
            />
            Go to nextjs.org →
          </a>
        </footer> */}
      </div>
    </div>
  );
}
