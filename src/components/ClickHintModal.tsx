"use client";

import { useState } from 'react';

export default function ClickHintModal() {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-4 max-w-xs border border-gray-200 z-50">
      <button
        onClick={() => setIsVisible(false)}
        className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 text-xl leading-none"
        aria-label="Close"
      >
        ×
      </button>
      <p className="text-sm text-gray-700 pr-4">
        ✨ Click around the screen and see what happens!
      </p>
    </div>
  );
}