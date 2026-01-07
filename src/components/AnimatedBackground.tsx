"use client";

import React, { useEffect, useRef } from 'react';

// Pokémon-themed colors (pastel versions)
const colors = [
  '#FFB3B3', // Soft Pokémon Red
  '#A8C5E8', // Soft Pokémon Blue  
  '#FFE89B', // Soft Pikachu Yellow
  '#FFB8B8', // Soft Pokéball Red
  '#C4E4F7', // Soft Water Blue
  '#FFF1A8', // Soft Electric Yellow
  '#F5C4D6', // Soft Fairy Pink
  '#D4C8F0'  // Soft Psychic Purple
];

// Fixed colors for click-spawned traces
const clickColors = {
  right: '#FFB3B3', // Soft Red
  left: '#FFE89B',  // Soft Yellow
  down: '#A8C5E8',  // Soft Blue
  up: '#B8E6B8'     // Soft Green
};

const gridSize = 10;

type Direction = 'left' | 'right' | 'up' | 'down';

class Line {
  isClickSpawned: boolean;
  maxLength: number;
  currentLength: number;
  isHorizontal: boolean;
  row?: number;
  col?: number;
  y: number;
  x: number;
  startX?: number;
  startY?: number;
  direction: number;
  speed: number;
  opacity: number;
  color: string;
  fixedColor: string | null;

  constructor(
    clickX: number | null = null,
    clickY: number | null = null,
    forceDirection: Direction | null = null,
    canvasWidth: number,
    canvasHeight: number,
    color: string | null = null
  ) {
    this.isClickSpawned = clickX !== null && clickY !== null;
    this.fixedColor = color;
    this.maxLength = gridSize * 5;
    this.currentLength = this.isClickSpawned ? 0 : this.maxLength;
    
    this.isHorizontal = false;
    this.y = 0;
    this.x = 0;
    this.direction = 1;
    this.speed = 0;
    this.opacity = 0;
    this.color = '';
    
    this.reset(clickX, clickY, forceDirection, canvasWidth, canvasHeight);
  }

  reset(
    clickX: number | null = null,
    clickY: number | null = null,
    forceDirection: Direction | null = null,
    canvasWidth: number,
    canvasHeight: number
  ) {
    if (clickX !== null && clickY !== null) {
      if (forceDirection !== null) {
        this.isHorizontal = forceDirection === 'left' || forceDirection === 'right';
        
        if (this.isHorizontal) {
          this.row = Math.round(clickY / gridSize);
          this.y = this.row * gridSize;
          this.startX = clickX;
          this.x = clickX;
          this.direction = forceDirection === 'right' ? 1 : -1;
        } else {
          this.col = Math.round(clickX / gridSize);
          this.x = this.col * gridSize;
          this.startY = clickY;
          this.y = clickY;
          this.direction = forceDirection === 'down' ? 1 : -1;
        }
      } else {
        this.isHorizontal = Math.random() > 0.5;
        
        if (this.isHorizontal) {
          this.row = Math.round(clickY / gridSize);
          this.y = this.row * gridSize;
          this.startX = clickX;
          this.x = clickX;
          this.direction = 1;
        } else {
          this.col = Math.round(clickX / gridSize);
          this.x = this.col * gridSize;
          this.startY = clickY;
          this.y = clickY;
          this.direction = 1;
        }
      }
    } else {
      this.isHorizontal = Math.random() > 0.5;
      
      if (this.isHorizontal) {
        this.row = Math.floor(Math.random() * (canvasHeight / gridSize));
        this.y = this.row * gridSize;
        this.x = -200;
        this.direction = 1;
      } else {
        this.col = Math.floor(Math.random() * (canvasWidth / gridSize));
        this.x = this.col * gridSize;
        this.y = -200;
        this.direction = 1;
      }
    }

    this.speed = this.isClickSpawned 
      ? 0.5
      : 0.2 + Math.random() * 0.5;
    this.opacity = 0.5 + Math.random() * 0.3;
    this.color = this.fixedColor || colors[Math.floor(Math.random() * colors.length)];
  }

  update(canvasWidth: number, canvasHeight: number): boolean {
    if (this.isClickSpawned && this.currentLength < this.maxLength) {
      this.currentLength += this.speed * 2;
      if (this.currentLength > this.maxLength) {
        this.currentLength = this.maxLength;
      }
    }

    if (this.isHorizontal) {
      this.x += this.speed * this.direction;
      if (this.direction > 0 && this.x - this.currentLength > canvasWidth) {
        return true;
      } else if (this.direction < 0 && this.x + this.currentLength < 0) {
        return true;
      }
    } else {
      this.y += this.speed * this.direction;
      if (this.direction > 0 && this.y - this.currentLength > canvasHeight) {
        return true;
      } else if (this.direction < 0 && this.y + this.currentLength < 0) {
        return true;
      }
    }
    return false;
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.lineWidth = gridSize - 2;
    ctx.lineCap = 'butt';

    const length = this.isClickSpawned ? this.currentLength : this.maxLength;

    let gradient: CanvasGradient;
    let startX: number, startY: number, endX: number, endY: number;

    if (this.isHorizontal) {
      if (this.direction > 0) {
        startX = this.x - length;
        endX = this.x;
        startY = endY = this.y;
      } else {
        startX = this.x + length;
        endX = this.x;
        startY = endY = this.y;
      }
      gradient = ctx.createLinearGradient(startX, startY, endX, endY);
    } else {
      if (this.direction > 0) {
        startX = endX = this.x;
        startY = this.y - length;
        endY = this.y;
      } else {
        startX = endX = this.x;
        startY = this.y + length;
        endY = this.y;
      }
      gradient = ctx.createLinearGradient(startX, startY, endX, endY);
    }
    
    gradient.addColorStop(0, `${this.color}00`);
    gradient.addColorStop(0.3, this.color);
    gradient.addColorStop(1, this.color);
    
    ctx.strokeStyle = gradient;
    ctx.globalAlpha = this.opacity;
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.stroke();

    const accentSize = gridSize - 2;
    ctx.fillStyle = this.color;
    ctx.globalAlpha = this.opacity * 0.6;
    ctx.fillRect(this.x - accentSize/2, this.y - accentSize/2, accentSize, accentSize);

    ctx.restore();
  }
}

export interface TitleDimensions {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface AnimatedBackgroundProps {
  titleDimensions?: TitleDimensions | null;
}

export default function AnimatedBackground({ titleDimensions }: AnimatedBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let clickLines: Line[] = [];

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    

    // Center burst lines that create kaleidoscope effect
    let centerLines: Line[] = [];
    const horizontalSpawnInterval = 500; // 2 seconds between horizontal spawns
    const verticalSpawnInterval = 200;   // 2 seconds between vertical spawns
    let lastHorizontalSpawn = 0;
    let lastVerticalSpawn = 1000; // Offset so they don't spawn at the same time
    
    const horizontalSpawnPoints = 4;
    const verticalSpawnPoints = 15;
    let currentHorizontalIndex = 0;
    let currentVerticalIndex = 0;
    let verticalDirection: 'right' | 'left' = 'right';

    const spawnNextHorizontalTrace = () => {
      if (!titleDimensions) return;
      
      const { x: centerX, y: centerY } = titleDimensions;
      
      const horizontalSpacing = 8;
      const totalHorizontalHeight = horizontalSpawnPoints * horizontalSpacing;
      
      const randomOffset = (Math.random() - 0.5) * 6;
      const y = centerY - totalHorizontalHeight / 2 + currentHorizontalIndex * horizontalSpacing + randomOffset;
      
      (['left', 'right'] as Direction[]).forEach(dir => {
        centerLines.push(new Line(centerX, y, dir, canvas.width, canvas.height, clickColors[dir]));
      });
      
      currentHorizontalIndex = (currentHorizontalIndex + 1) % horizontalSpawnPoints;
    };

    const spawnNextVerticalTrace = () => {
      if (!titleDimensions) return;
      
      const { x: centerX, y: centerY, width } = titleDimensions;
      
      const baseX = centerX - width / 2 + (width / (verticalSpawnPoints - 1)) * currentVerticalIndex;
      const randomXOffset = (Math.random() - 0.5) * 30;
      const x = baseX + randomXOffset;
      
      (['up', 'down'] as Direction[]).forEach(dir => {
        const line = new Line(x, centerY, dir, canvas.width, canvas.height, clickColors[dir]);
        if (verticalDirection === 'right') {
          line.x = x + Math.random() * 20;
        } else {
          line.x = x - Math.random() * 20;
        }
        centerLines.push(line);
      });
      
      currentVerticalIndex++;
      if (currentVerticalIndex >= verticalSpawnPoints) {
        currentVerticalIndex = 0;
        verticalDirection = verticalDirection === 'right' ? 'left' : 'right';
      }
    };

    const handleClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;
      
      (Object.keys(clickColors) as Direction[]).forEach(dir => {
        clickLines.push(new Line(clickX, clickY, dir, canvas.width, canvas.height, clickColors[dir]));
      });
    };

    window.addEventListener('click', handleClick);

    const animate = (timestamp: number) => {
      // Spawn horizontal traces one at a time
      if (timestamp - lastHorizontalSpawn > horizontalSpawnInterval) {
        spawnNextHorizontalTrace();
        lastHorizontalSpawn = timestamp;
      }
      
      // Spawn vertical traces one at a time
      if (timestamp - lastVerticalSpawn > verticalSpawnInterval) {
        spawnNextVerticalTrace();
        lastVerticalSpawn = timestamp;
      }

      ctx.fillStyle = 'rgba(255, 255, 255, 1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.strokeStyle = '#f0f0f0';
      ctx.lineWidth = 1;
      ctx.globalAlpha = 0.3;
      
      for (let x = 0; x <= canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      
      for (let y = 0; y <= canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }
      
      ctx.globalAlpha = 1;

      // Update and draw center burst lines
      centerLines = centerLines.filter(line => {
        const shouldRemove = line.update(canvas.width, canvas.height);
        if (!shouldRemove) {
          line.draw(ctx);
        }
        return !shouldRemove;
      });

      clickLines = clickLines.filter(line => {
        const shouldRemove = line.update(canvas.width, canvas.height);
        if (!shouldRemove) {
          line.draw(ctx);
        }
        return !shouldRemove;
      });

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

      animationFrameId = requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('click', handleClick);
      cancelAnimationFrame(animationFrameId);
    };
  }, [titleDimensions]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-full -z-10 cursor-pointer"
    />
  );
}