/**
 * ContentFeedbackFriction.jsx — Soft friction modality: 2-point content rating
 *
 * Lightweight feedback elicitation before advancing. Keeps interaction
 * anchored to the browsing task while introducing a moment of reflection.
 *
 * Props
 * ──────
 *  onComplete – (action: 'relevant' | 'not_relevant') => void
 */

import React from 'react';

export default function ContentFeedbackFriction({ onComplete }) {
  return (
    <div className="friction-overlay" role="dialog" aria-modal="true">
      <div className="friction-card">
        <div className="text-center mb-5">
          <span className="text-2xl">🎯</span>
          <h3 className="text-base font-semibold text-gray-800 mt-1">
            Was this post relevant to you?
          </h3>
          <p className="text-xs text-gray-500 mt-1">
            Your answer helps us understand how you browse.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => onComplete('relevant')}
            className="flex-1 flex flex-col items-center gap-2 py-4 rounded-2xl border-2 border-green-200 bg-green-50 hover:bg-green-100 active:scale-95 transition-all"
          >
            <span className="text-2xl">👍</span>
            <span className="text-sm font-medium text-green-700">Yes, relevant</span>
          </button>

          <button
            onClick={() => onComplete('not_relevant')}
            className="flex-1 flex flex-col items-center gap-2 py-4 rounded-2xl border-2 border-gray-200 bg-gray-50 hover:bg-gray-100 active:scale-95 transition-all"
          >
            <span className="text-2xl">👎</span>
            <span className="text-sm font-medium text-gray-600">Not really</span>
          </button>
        </div>
      </div>
    </div>
  );
}
