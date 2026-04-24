"use client";

import SearchBar from "@/components/SearchBar";
import GenerationButtons from "@/components/GenerationButtons";
import AnimatedPokeball from "@/components/AnimatedPokeball";
import AnimatedBackground, { TitleDimensions } from '@/components/AnimatedBackground';
import Title from '@/components/Title';
import ClickHintModal from '@/components/ClickHintModal';
import Footer from '@/components/Footer';
import RandomPokemonButton from '@/components/RandomPokemonButton';
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';

export default function Home() {
  const [titleDimensions, setTitleDimensions] = useState<TitleDimensions | null>(null);
  const [pokeballDone, setPokeballDone] = useState(false);

  const handlePokeballComplete = useCallback(() => {
    setPokeballDone(true);
  }, []);

  useEffect(() => {
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  return (
    <main className="overflow-hidden h-screen">
      <AnimatedBackground titleDimensions={titleDimensions} />

      <div className="relative h-screen flex flex-col overflow-hidden">
        <div className="flex flex-1 flex-col items-center justify-center p-8 sm:p-20 font-[family-name:var(--font-geist-sans)]">
          <div className="flex flex-col items-center gap-8">
            <div className="flex items-center justify-center">
              <AnimatedPokeball onAnimationComplete={handlePokeballComplete} />
            </div>

            <AnimatePresence>
              {pokeballDone && (
                <motion.div
                  className="flex flex-col items-center gap-8"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                >
                  <div className="flex items-center justify-center">
                    <Title onDimensions={setTitleDimensions} />
                  </div>
                  <div className="flex items-center justify-center">
                    <SearchBar />
                  </div>
                  <div className="flex items-center justify-center">
                    <GenerationButtons activeGeneration={null}/>
                  </div>
                  <div className="flex items-center justify-center gap-4">
                    <RandomPokemonButton maxId={1025} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <ClickHintModal />
      <Footer />
    </main>
  );
}