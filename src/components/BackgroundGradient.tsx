"use client";

import React, { useEffect, useRef } from 'react';

interface BackgroundGradientProps {
  showGrid?: boolean;
}

export default function BackgroundGradient({ showGrid = true }: BackgroundGradientProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const draw = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      // White background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Grid
      if (showGrid) {
        ctx.strokeStyle = '#f0f0f0';
        ctx.lineWidth = 1;
        ctx.globalAlpha = 0.3;

        for (let x = 0; x <= canvas.width; x += 10) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, canvas.height);
          ctx.stroke();
        }

        for (let y = 0; y <= canvas.height; y += 10) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(canvas.width, y);
          ctx.stroke();
        }

        ctx.globalAlpha = 1;
      }

      // Radial gradient overlay
      const gradient = ctx.createRadialGradient(
        canvas.width / 2, canvas.height / 2, 0,
        canvas.width / 2, canvas.height / 2, Math.max(canvas.width, canvas.height) * 1.2
      );
      gradient.addColorStop(0, 'rgba(255, 255, 255, 0)');
      gradient.addColorStop(0.4, 'rgba(240, 240, 240, 0.1)');
      gradient.addColorStop(0.7, 'rgba(200, 200, 200, 0.4)');
      gradient.addColorStop(1, 'rgba(150, 150, 150, 0.7)');

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    };

    draw();
    window.addEventListener('resize', draw);

    return () => window.removeEventListener('resize', draw);
  }, [showGrid]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-full -z-10 pointer-events-none"
    />
  );
}