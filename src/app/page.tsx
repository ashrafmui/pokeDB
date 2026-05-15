"use client";

import SearchBar from "@/components/SearchBar";
import GenerationButtons from "@/components/GenerationButtons";
import AnimatedPokeball from "@/components/AnimatedPokeball";
import AnimatedBackground, { TitleDimensions } from '@/components/AnimatedBackground';
import Title from '@/components/Title';
import ClickHintModal from '@/components/ClickHintModal';
import Footer from '@/components/Footer';
import RandomPokemonButton from '@/components/RandomPokemonButton';
import RandomPokemonOfTheDay from '@/components/RandomPokemonOfTheDay';
import { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'motion/react';

// localStorage key flipped to "true" once the user has seen the pokeball
// intro at least once. Subsequent visits skip it. Bump the `-vN` suffix to
// invalidate every existing user's cached flag (forces the intro to play
// once more on their next visit).
const INTRO_SEEN_KEY = 'pokedb:intro-seen-v2';

export default function Home() {
  const [titleDimensions, setTitleDimensions] = useState<TitleDimensions | null>(null);
  const [pokeballDone, setPokeballDone] = useState(false);
  const [pokeballYOffset, setPokeballYOffset] = useState<number | null>(null);
  // null = unresolved (initial render / SSR), false = first visit, true = returning.
  const [hasSeenIntro, setHasSeenIntro] = useState<boolean | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const handlePokeballComplete = useCallback(() => {
    setPokeballDone(true);
    try {
      localStorage.setItem(INTRO_SEEN_KEY, 'true');
    } catch {
      // localStorage may be unavailable (private mode, quota); fail silently.
    }
  }, []);

  // Resolve the intro-seen flag from localStorage after hydration. Returning
  // visitors skip the pokeball entirely and reveal content immediately.
  useEffect(() => {
    let seen = false;
    try {
      seen = localStorage.getItem(INTRO_SEEN_KEY) === 'true';
    } catch {
      // ignore
    }
    setHasSeenIntro(seen);
    if (seen) setPokeballDone(true);
  }, []);

  useEffect(() => {
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  // Measure the reserved content stack so the pokeball can roll in at the
  // viewport-center y, then animate up to its with-content position.
  // Offset = (content_height + gap) / 2, where gap = 32px (gap-8).
  useEffect(() => {
    if (contentRef.current) {
      const height = contentRef.current.offsetHeight;
      setPokeballYOffset((height + 32) / 2);
    }
  }, []);

  return (
    <main className="overflow-hidden h-screen">
      {pokeballDone && <AnimatedBackground titleDimensions={titleDimensions} />}

      <div className="relative h-screen flex flex-col overflow-hidden">
        <div className="flex flex-1 flex-col items-center justify-center p-8 sm:p-20 font-[family-name:var(--font-geist-sans)]">
          <div className="flex flex-col items-center gap-8">
            <div className="flex items-center justify-center">
              {hasSeenIntro === false && pokeballYOffset !== null && (
                <AnimatedPokeball
                  onAnimationComplete={handlePokeballComplete}
                  initialYOffset={pokeballYOffset}
                />
              )}
            </div>

            <motion.div
              ref={contentRef}
              className="flex flex-col items-center gap-8"
              initial={{ opacity: 0, y: 20 }}
              animate={pokeballDone ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              style={{ pointerEvents: pokeballDone ? 'auto' : 'none' }}
              aria-hidden={!pokeballDone}
            >
              <div className="flex items-center justify-center">
                <Title onDimensions={setTitleDimensions} />
              </div>
              <div className="flex items-center justify-center gap-3">
                <SearchBar />
                <RandomPokemonButton maxId={1025} />
              </div>
              <div className="flex items-center justify-center">
                <GenerationButtons activeGeneration={null}/>
              </div>
              <div className="flex items-center justify-center">
                <RandomPokemonOfTheDay />
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      <ClickHintModal />
      <Footer />
    </main>
  );
}