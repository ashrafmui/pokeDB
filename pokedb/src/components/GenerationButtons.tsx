"use client";

import Link from "next/link";

interface GneerationButtonsProps {
  activeGeneration: number;
}

export default function GenerationButtons({ activeGeneration }: GneerationButtonsProps) {
  const generations = Array.from({ length: 7 }, (_, index) => `Gen ${index + 1}`);

  return (
    <div className="flex gap-4 justify-center my-4">
      {generations.map((gen, index) => {
        const generationNumber = index + 1;
        const isActive = generationNumber === activeGeneration;

        return (
          <Link key={index} href={`/generation/${generationNumber}`} passHref>
            <button
              className={`font-pocket-monk ml-2 px-4 py-2 rounded-3xl focus:outline-none ${
                isActive
                  ? "bg-blue-600 text-white" // Active styles
                  : "bg-white text-black hover:bg-blue-600 hover:text-white" // Inactive styles
              }`}
            >
              {gen}
            </button>
          </Link>
        );
      })}
    </div>
  );
}
