"use client";
import Image from "next/image";
import React, { useEffect, useState, useCallback } from "react";
import useEmblaCarousel from "embla-carousel-react";
import {ArrowLeftIcon} from "@radix-ui/react-icons"
import {ArrowRightIcon} from "@radix-ui/react-icons"
import { Button } from "@/components/ui/button"

import {
  Card,
  CardContent
} from "@/components/ui/card";
import PokemonTypes from "./PokemonTypes";

interface PokemonData {
  name: string;
  spriteUrl: string;
  types: string[];
}

const pokemonIds = [1, 2, 3]; // Bulbasaur, Ivysaur, and Venusaur

export default function PokemonCarousel() {
  const [pokemonList, setPokemonList] = useState<PokemonData[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Initialize Embla Carousel
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: false });

  // Fetch Pokémon data
  useEffect(() => {
    const fetchPokemonData = async () => {
      const data = await Promise.all(
        pokemonIds.map(async (id) => {
          const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
          const pokemon = await response.json();
          const types = pokemon.types.map((typeInfo: any) => typeInfo.type.name);
          return {
            name: pokemon.name,
            spriteUrl: pokemon.sprites.other["official-artwork"].front_default,
            types,
          };
        })
      );
      setPokemonList(data);
    };
    fetchPokemonData();
  }, []);

  // Update current index when slide changes
  const onSelect = useCallback(() => {
    if (emblaApi) {
      setCurrentIndex(emblaApi.selectedScrollSnap());
    }
  }, [emblaApi]);

  // Attach the onSelect event when Embla API is ready
  useEffect(() => {
    if (emblaApi) {
      emblaApi.on("select", onSelect);
      onSelect(); // Set initial index on load
    }
  }, [emblaApi, onSelect]);

  // Handlers for Next and Previous buttons
  const scrollNext = () => emblaApi && emblaApi.scrollNext();
  const scrollPrev = () => emblaApi && emblaApi.scrollPrev();

  return (
    <div className="flex flex-col items-center justify-center my-4 gap-4">
      <div className="flex items-center justify-center">
        {/* Embla carousel wrapper */}
        <div ref={emblaRef} className="w-full max-w-sm overflow-hidden">
          {/* Carousel container */}
          <div className="flex">
            {pokemonList.map((pokemon, index) => (
              <div key={index} className="flex-none w-full p-1">
                <Card>
                  <CardContent className="flex flex-col items-center justify-center p-6">
                    <Image
                      src={pokemon.spriteUrl}
                      alt={`${pokemon.name} sprite`}
                      width={250}
                      height={250}
                      className="object-contain"
                    />
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Next and Previous Buttons */}
      <div className="flex justify-between w-full max-w-sm mt-4">
        <Button onClick={scrollPrev} variant = "outline" className="p-2">
          <ArrowLeftIcon className="h-4 w-4 rounded-full" />
        </Button>
        <Button onClick={scrollNext} variant = "outline" className="p-2">
          <ArrowRightIcon className="h-4 w-4 rounded-full" />
        </Button>
      </div>

      {/* Display Pokémon Name and Types Outside the Carousel */}
      {pokemonList.length > 0 && (
        <div className="text-center mt-4">
          <h3 className="text-2xl font-bold">
            {pokemonList[currentIndex]?.name}
          </h3>
          <PokemonTypes types={pokemonList[currentIndex]?.types || []} />
        </div>
      )}
    </div>
  );
}
