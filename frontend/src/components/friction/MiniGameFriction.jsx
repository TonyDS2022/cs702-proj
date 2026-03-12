/**
 * MiniGameFriction.jsx — Soft friction modality: tap-target mini-game
 *
 * A brief, playful interaction: 3 coloured targets appear one at a time and
 * the user taps each one. Takes ~5 seconds at a relaxed pace.
 * Designed as a lighthearted pause rather than a demanding task.
 *
 * Props
 * ──────
 *  onComplete – (action: 'game_won' | 'game_skipped') => void
 */

import React, { useState, useEffect, useRef } from 'react';

const TARGETS = [
  { id: 1, color: 'bg-red-400',    label: '🔴', x: 20, y: 30 },
  { id: 2, color: 'bg-yellow-400', label: '🟡', x: 65, y: 55 },
  { id: 3, color: 'bg-green-400',  label: '🟢', x: 40, y: 75 },
];

export default function MiniGameFriction({ onComplete }) {
  const [step, setStep]       = useState(0);   // which target to show (0-based)
  const [done, setDone]       = useState(false);
  const [startTs]             = useState(Date.now);
  const timerRef              = useRef(null);

  // Auto-skip after 12 s in case the user gets stuck
  useEffect(() => {
    timerRef.current = setTimeout(() => onComplete('game_skipped'), 12_000);
    return () => clearTimeout(timerRef.current);
  }, [onComplete]);

  function handleTap() {
    if (done) return;
    const next = step + 1;
    if (next >= TARGETS.length) {
      setDone(true);
      clearTimeout(timerRef.current);
      setTimeout(() => onComplete('game_won'), 600);
    } else {
      setStep(next);
    }
  }

  const current = TARGETS[step];

  return (
    <div className="friction-overlay" role="dialog" aria-modal="true" aria-label="Quick game">
      <div className="friction-card overflow-hidden">
        <div className="text-center mb-2">
          <p className="text-xs text-gray-500 font-medium">
            Quick break — tap each dot!
          </p>
          <div className="flex justify-center gap-1.5 mt-1">
            {TARGETS.map((t, i) => (
              <div
                key={t.id}
                className={`w-2 h-2 rounded-full transition-colors ${
                  i < step ? 'bg-green-400' : i === step ? 'bg-blue-400' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Game area */}
        <div className="relative w-full h-40 bg-gray-50 rounded-xl border border-gray-100">
          {!done ? (
            <button
              onClick={handleTap}
              style={{ position: 'absolute', left: `${current.x}%`, top: `${current.y}%`, transform: 'translate(-50%, -50%)' }}
              className={`w-12 h-12 ${current.color} rounded-full flex items-center justify-center text-xl shadow-lg active:scale-90 transition-all duration-150`}
              aria-label={`Tap target ${step + 1}`}
            >
              {current.label}
            </button>
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
              <span className="text-3xl">🎉</span>
              <span className="text-sm font-semibold text-green-600">Great!</span>
            </div>
          )}
        </div>

        <button
          onClick={() => onComplete('game_skipped')}
          className="w-full mt-3 py-1.5 text-xs text-gray-400 hover:text-gray-600 transition-colors"
        >
          Skip
        </button>
      </div>
    </div>
  );
}
