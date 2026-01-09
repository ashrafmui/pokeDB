"use client";

import SearchBar from "@/components/SearchBar";
import Link from "next/link";
import GenerationButtons from "@/components/GenerationButtons";
import AnimatedPokeball from "@/components/AnimatedPokeball";
import AnimatedBackground, { TitleDimensions } from '@/components/AnimatedBackground';
import Title from '@/components/Title';
import ClickHintModal from '@/components/ClickHintModal';
import Footer from '@/components/Footer';
import { useState, useEffect } from 'react';

export default function Home() {
  const [titleDimensions, setTitleDimensions] = useState<TitleDimensions | null>(null);

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
              <AnimatedPokeball />
            </div>
            <div className="flex items-center justify-center">
              <Title onDimensions={setTitleDimensions} />
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
          </div>
        </div>
      </div>

      <ClickHintModal />
      <Footer />
    </main>
  );
}