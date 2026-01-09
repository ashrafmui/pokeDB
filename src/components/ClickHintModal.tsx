"use client";

import { useState } from 'react';

export default function ClickHintModal() {
  const [isMinimized, setIsMinimized] = useState(false);

  if (isMinimized) {
    return (
      <button
        onClick={() => setIsMinimized(false)}
        className="fixed bottom-16 right-4 bg-white/90 backdrop-blur-sm rounded-full shadow-lg p-3 border border-gray-200 z-50 hover:bg-white transition-colors"
        aria-label="Show hint"
      >
        <span className="text-lg">✨</span>
      </button>
    );
  }

  return (
    <div className="fixed bottom-16 right-4 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-4 max-w-xs border border-gray-200 z-50">
      <button
        onClick={() => setIsMinimized(true)}
        className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 text-sm leading-none"
        aria-label="Minimize"
      >
        −
      </button>
      <p className="text-sm text-gray-700 pr-4">
        ✨ Click around the screen and see what happens!
      </p>
    </div>
  );
}