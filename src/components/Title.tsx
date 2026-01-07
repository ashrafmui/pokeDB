"use client";

import { useRef, useEffect } from 'react';
import { TitleDimensions } from './AnimatedBackground';

interface TitleProps {
  onDimensions?: (dims: TitleDimensions) => void;
}

export default function Title({ onDimensions }: TitleProps) {
  const ref = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (!ref.current || !onDimensions) return;
    
    const update = () => {
      const rect = ref.current!.getBoundingClientRect();
      onDimensions({
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
        width: rect.width,
        height: rect.height,
      });
    };
    
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, [onDimensions]);

  return (
    <h1 ref={ref} className="outline font-pocket-monk text-6xl title">
      poKeDB
    </h1>
  );
}