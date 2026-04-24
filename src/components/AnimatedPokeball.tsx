"use client";
import { motion } from "motion/react";
import Image from "next/image";

interface AnimatedPokeballProps {
  onAnimationComplete?: () => void;
}

export default function AnimatedPokeball({ onAnimationComplete }: AnimatedPokeballProps) {
  return (
    <motion.div
      initial={{ x: "-100vw", y: 0, rotate: -1440 }}
      animate={{ x: 0, y: -30, rotate: 0 }}
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
