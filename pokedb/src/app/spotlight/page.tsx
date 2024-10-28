//import EmblaCarousel from "@/components/EmblaCarousel";
// import {SearchIcon} from "@/components/SearchIcon.tsx";
import Image from "next/image";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/EmblaCarousel"
import {
  Card,
  CardContent
} from "@/components/ui/card"

const pokemonSprites = [
  "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/dream-world/1.svg",
  "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/dream-world/2.svg",
  "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/dream-world/3.svg"
];

export default function Home() {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)] bg-background">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
          <div className="flex items-center justify-center">
              <Carousel
                  opts={{
                      align: "start",
                  }}
              className="w-full max-w-sm"
              >
              <CarouselContent>
                  {pokemonSprites.map((spriteUrl, index) => (
                  <CarouselItem key={index} className="">
                      <div className="p-1">
                      <Card>
                          <CardContent className="flex aspect-square items-center justify-center p-6">
                            <Image
                              src={spriteUrl}
                              alt={'Pokemon ${index + 1}'}
                              width={250}
                              height={250}
                              className="object-contain"
                            />
                          {/* <span className="text-3xl font-semibold">{index + 1}</span> */}
                          </CardContent>
                      </Card>
                      </div>
                  </CarouselItem>
                  ))}
              </CarouselContent>
              <CarouselPrevious />
              <CarouselNext />
              </Carousel>
          </div>
          
      </main>
    </div>

  );
}