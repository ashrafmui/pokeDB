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
import { RotateCcw } from 'lucide-react';
import Image from 'next/image';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

// sessionStorage key flipped to "true" once the user has seen the pokeball
// intro in the current browser session. The flag clears when the tab/session
// ends, so the intro replays on a fresh visit but is skipped during in-site
// navigation. Bump the `-vN` suffix to invalidate the cached flag.
const INTRO_SEEN_KEY = 'pokedb:intro-seen-v2';

export default function Home() {
  const [titleDimensions, setTitleDimensions] = useState<TitleDimensions | null>(null);
  const [pokeballDone, setPokeballDone] = useState(false);
  const [pokeballYOffset, setPokeballYOffset] = useState<number | null>(null);
  // null = unresolved (initial render / SSR), false = first visit, true = returning.
  const [hasSeenIntro, setHasSeenIntro] = useState<boolean | null>(null);
  // Bumped on each replay-button press so the AnimatedPokeball remounts and
  // motion replays the intro from its initial state.
  const [replayKey, setReplayKey] = useState(0);
  const contentRef = useRef<HTMLDivElement>(null);

  const handlePokeballComplete = useCallback(() => {
    setPokeballDone(true);
    try {
      sessionStorage.setItem(INTRO_SEEN_KEY, 'true');
    } catch {
      // sessionStorage may be unavailable (private mode, quota); fail silently.
    }
  }, []);

  const handleReplayIntro = useCallback(() => {
    try {
      sessionStorage.removeItem(INTRO_SEEN_KEY);
    } catch {
      // ignore
    }
    setPokeballDone(false);
    setHasSeenIntro(false);
    setReplayKey((k) => k + 1);
  }, []);

  // Resolve the intro-seen flag from sessionStorage after hydration. Visitors
  // who saw the intro earlier in this session skip the pokeball and reveal
  // content immediately; a closed tab resets the flag.
  useEffect(() => {
    let seen = false;
    try {
      seen = sessionStorage.getItem(INTRO_SEEN_KEY) === 'true';
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
                  key={replayKey}
                  onAnimationComplete={handlePokeballComplete}
                  initialYOffset={pokeballYOffset}
                />
              )}
              {hasSeenIntro === true && (
                <Image
                  src="/images/pokeball1.png"
                  alt="poké ball"
                  width={180}
                  height={38}
                  priority
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

      <TooltipProvider delayDuration={150}>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              onClick={handleReplayIntro}
              aria-label="Replay Intro Animation"
              className="fixed bottom-16 left-4 z-50 p-2 rounded-full bg-white/80 backdrop-blur-sm text-gray-600 hover:text-gray-900 hover:bg-white shadow-sm transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="right">
            Replay Intro Animation
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <ClickHintModal />
      <Footer />
    </main>
  );
}