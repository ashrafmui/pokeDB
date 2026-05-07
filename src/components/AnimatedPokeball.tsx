"use client";
import { motion } from "motion/react";
import Image from "next/image";

interface AnimatedPokeballProps {
  onAnimationComplete?: () => void;
  // y offset (px) where the pokeball rolls in. After rolling, it animates
  // up to y: 0 — which is the pokeball's natural flex position when content
  // below it is in the layout. Pass `(contentHeight + gap) / 2` so the
  // pokeball visually starts at the viewport-center.
  initialYOffset?: number;
}

export default function AnimatedPokeball({ onAnimationComplete, initialYOffset = 0 }: AnimatedPokeballProps) {
  return (
    <motion.div
      initial={{ x: "-100vw", y: initialYOffset, rotate: -1440 }}
      animate={{ x: 0, y: 0, rotate: 0 }}
      transition={{
        duration: 2.5,
        ease: "easeOut",
        x: { duration: 2, ease: "easeOut" },
        rotate: { duration: 2, ease: "easeOut" },
        y: { duration: 0.6, ease: "easeOut", delay: 2 },
      }}
      onAnimationComplete={onAnimationComplete}
    >
      <Image
        src="/images/pokeball1.png"
        alt="poké ball"
        width={180}
        height={38}
        priority
      />
    </motion.div>
  );
}
