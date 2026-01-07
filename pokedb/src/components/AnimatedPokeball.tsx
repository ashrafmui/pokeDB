"use client";
import { motion } from "motion/react";
import Image from "next/image";

export default function AnimatedPokeball() {
  return (
    <motion.div
      initial={{ opacity: 0, y: -30, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
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