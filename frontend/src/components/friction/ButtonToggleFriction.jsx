/**
 * ButtonToggleFriction.jsx — Soft friction modality: button/toggle
 *
 * Minimal motor-based interruption. User must tap a button to continue.
 * Lowest intrusiveness of all friction types.
 *
 * Props
 * ──────
 *  onComplete – (action: 'continue') => void
 */

import React, { useState } from 'react';

export default function ButtonToggleFriction({ onComplete }) {
  const [pressed, setPressed] = useState(false);

  function handlePress() {
    if (pressed) return;
    setPressed(true);
    setTimeout(() => onComplete('continue'), 300);
  }

  return (
    <div className="friction-overlay" role="dialog" aria-modal="true">
      <div className="friction-card text-center">
        <p className="text-sm text-gray-500 mb-5">
          Take a brief moment before continuing.
        </p>

        <button
          onClick={handlePress}
          disabled={pressed}
          className={`w-full py-4 rounded-2xl text-base font-semibold shadow-md transition-all duration-200 active:scale-95
            ${pressed
              ? 'bg-green-500 text-white'
              : 'bg-blue-500 text-white hover:bg-blue-600'}`}
        >
          {pressed ? '✓ Continuing…' : 'Continue browsing'}
        </button>

        <p className="text-xs text-gray-400 mt-3">
          Tap the button to see the next post.
        </p>
      </div>
    </div>
  );
}
