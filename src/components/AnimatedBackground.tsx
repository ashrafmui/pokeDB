"use client";

import React, { useEffect, useRef } from 'react';

// Fixed colors for each direction
const clickColors = {
  right: '#FFB3B3', // Soft Red
  left: '#FFE89B',  // Soft Yellow
  down: '#A8C5E8',  // Soft Blue
  up: '#B8E6B8'     // Soft Green
};

const gridSize = 10;
const traceLength = gridSize * 5;
const traceSpeed = 0.5;
const traceOpacity = 0.7;

type Direction = 'left' | 'right' | 'up' | 'down';

class Line {
  x: number;
  y: number;
  direction: Direction;
  color: string;
  isUserClick: boolean;
  maxDistance: number;
  distanceTraveled: number;
  currentLength: number;
  opacity: number;

  constructor(x: number, y: number, direction: Direction, color: string, isUserClick: boolean = false) {
    this.x = x;
    this.y = y;
    this.direction = direction;
    this.color = color;
    this.isUserClick = isUserClick;
    this.maxDistance = isUserClick ? gridSize * 15 : Infinity;
    this.distanceTraveled = 0;
    this.currentLength = 0;
    this.opacity = traceOpacity;
  }

  update(canvasWidth: number, canvasHeight: number): boolean {
    // Grow the tail
    if (this.currentLength < traceLength) {
      this.currentLength += traceSpeed * 2;
      if (this.currentLength > traceLength) {
        this.currentLength = traceLength;
      }
    }

    // Track distance traveled
    this.distanceTraveled += traceSpeed;
    if (this.distanceTraveled >= this.maxDistance) {
      return true; // Mark for removal
    }

    // Fade out for user click traces
    if (this.isUserClick && this.maxDistance !== Infinity) {
      const fadeStart = this.maxDistance * 0.6;
      if (this.distanceTraveled > fadeStart) {
        const fadeProgress = (this.distanceTraveled - fadeStart) / (this.maxDistance - fadeStart);
        this.opacity = traceOpacity * (1 - fadeProgress);
      }
    }

    // Move the trace
    switch (this.direction) {
      case 'right':
        this.x += traceSpeed;
        if (this.x - this.currentLength > canvasWidth) return true;
        break;
      case 'left':
        this.x -= traceSpeed;
        if (this.x + this.currentLength < 0) return true;
        break;
      case 'down':
        this.y += traceSpeed;
        if (this.y - this.currentLength > canvasHeight) return true;
        break;
      case 'up':
        this.y -= traceSpeed;
        if (this.y + this.currentLength < 0) return true;
        break;
    }

    return false;
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.lineWidth = gridSize - 2;
    ctx.lineCap = 'butt';

    let startX: number, startY: number, endX: number, endY: number;

    switch (this.direction) {
      case 'right':
        startX = this.x - this.currentLength;
        endX = this.x;
        startY = endY = this.y;
        break;
      case 'left':
        startX = this.x + this.currentLength;
        endX = this.x;
        startY = endY = this.y;
        break;
      case 'down':
        startX = endX = this.x;
        startY = this.y - this.currentLength;
        endY = this.y;
        break;
      case 'up':
        startX = endX = this.x;
        startY = this.y + this.currentLength;
        endY = this.y;
        break;
    }

    const gradient = ctx.createLinearGradient(startX, startY, endX, endY);
    gradient.addColorStop(0, `${this.color}00`);
    gradient.addColorStop(0.3, this.color);
    gradient.addColorStop(1, this.color);

    ctx.strokeStyle = gradient;
    ctx.globalAlpha = this.opacity;
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.stroke();

    // Draw accent square at head
    const accentSize = gridSize - 2;
    ctx.fillStyle = this.color;
    ctx.globalAlpha = this.opacity * 0.6;
    ctx.fillRect(this.x - accentSize / 2, this.y - accentSize / 2, accentSize, accentSize);

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
    let centerLines: Line[] = [];
    let clickLines: Line[] = [];

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Spawn configuration
    const horizontalSpawnInterval = 500;
    const verticalSpawnInterval = 200;
    let lastHorizontalSpawn = 0;
    let lastVerticalSpawn = 250;

    const horizontalSpawnPoints = 4;
    const verticalSpawnPoints = 15;
    const horizontalSpacing = 10;

    let currentHorizontalIndex = 0;
    let currentVerticalIndex = 0;

    const spawnNextHorizontalTrace = () => {
      if (!titleDimensions) return;

      const { x: centerX, y: centerY } = titleDimensions;
      const totalHeight = (horizontalSpawnPoints - 1) * horizontalSpacing;
      const y = centerY - totalHeight / 2 + currentHorizontalIndex * horizontalSpacing;

      centerLines.push(new Line(centerX, y, 'left', clickColors.left));
      centerLines.push(new Line(centerX, y, 'right', clickColors.right));

      currentHorizontalIndex = (currentHorizontalIndex + 1) % horizontalSpawnPoints;
    };

    const spawnNextVerticalTrace = () => {
      if (!titleDimensions) return;

      const { x: centerX, y: centerY, width } = titleDimensions;
      const spacing = width / (verticalSpawnPoints - 1);
      const x = centerX - width / 2 + currentVerticalIndex * spacing;

      centerLines.push(new Line(x, centerY, 'up', clickColors.up));
      centerLines.push(new Line(x, centerY, 'down', clickColors.down));

      currentVerticalIndex = (currentVerticalIndex + 1) % verticalSpawnPoints;
    };

    const handleClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;

      (['right', 'left', 'up', 'down'] as Direction[]).forEach(dir => {
        clickLines.push(new Line(clickX, clickY, dir, clickColors[dir], true));
      });
    };

    window.addEventListener('click', handleClick);

    const animate = (timestamp: number) => {
      // Spawn traces at fixed intervals
      if (timestamp - lastHorizontalSpawn > horizontalSpawnInterval) {
        spawnNextHorizontalTrace();
        lastHorizontalSpawn = timestamp;
      }

      if (timestamp - lastVerticalSpawn > verticalSpawnInterval) {
        spawnNextVerticalTrace();
        lastVerticalSpawn = timestamp;
      }

      // Clear canvas
      ctx.fillStyle = 'rgba(255, 255, 255, 1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw grid
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

      // Update and draw center lines
      centerLines = centerLines.filter(line => {
        const shouldRemove = line.update(canvas.width, canvas.height);
        if (!shouldRemove) {
          line.draw(ctx);
        }
        return !shouldRemove;
      });

      // Update and draw click lines
      clickLines = clickLines.filter(line => {
        const shouldRemove = line.update(canvas.width, canvas.height);
        if (!shouldRemove) {
          line.draw(ctx);
        }
        return !shouldRemove;
      });

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