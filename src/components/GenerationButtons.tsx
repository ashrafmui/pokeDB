"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

interface GenerationButtonsProps {
  activeGeneration: number | null;
}

export default function GenerationButtons({ activeGeneration }: GenerationButtonsProps) {
  const generations = Array.from({ length: 9 }, (_, index) => `Gen ${index + 1}`);

  return (
    <div className="flex gap-4 justify-center my-4 flex-wrap">
      {generations.map((gen, index) => {
        const generationNumber = index + 1;
        const isActive = generationNumber === activeGeneration;

        return (
          <Link key={index} href={`/generation/${generationNumber}`}>
            <Button
              variant={isActive ? "default" : "outline"}
              className="rounded-full font-pocket-monk"
            >
              {gen}
            </Button>
          </Link>
        );
      })}
    </div>
  );
}