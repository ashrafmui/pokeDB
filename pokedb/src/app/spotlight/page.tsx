//import EmblaCarousel from "@/components/EmblaCarousel";
// import {SearchIcon} from "@/components/SearchIcon.tsx";
import Image from "next/image";
import PokemonCarousel from "@/components/PokemonCarousel";
import SimpleRadarChart from "@/components/SimpleRadarChart";
// import PokemonList from "@/components/PokemonList";

export default function Home() {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)] bg-background">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
          <div className="flex items-center justify-center">
            <PokemonCarousel />
            {/* <PokemonList />            */}
          </div>
          <div style={{ width: '450px', height: '450px' }}>
            <SimpleRadarChart />
          </div>
      </main>
    </div>

  );
}