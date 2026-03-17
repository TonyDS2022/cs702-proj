/**
 * ReactionFriction.jsx — Paper's original intervention
 *
 * Reaction buttons are embedded directly inside the PostCard (via PostCard's
 * showReactions prop). This component acts as the *gate*: the next post is
 * blocked until the user selects a reaction or presses "Not Interested".
 *
 * It renders an overlay prompt when the gate is active.
 *
 * Props
 * ──────
 *  onComplete   – (action: string) => void
 */

import React from 'react';

const REACTIONS = [
  { label: 'Like',             emoji: '👍', color: 'bg-blue-50 border-blue-200 hover:bg-blue-100' },
  { label: 'Congratulations!', emoji: '🎉', color: 'bg-yellow-50 border-yellow-200 hover:bg-yellow-100' },
  { label: 'Inspiring!',       emoji: '💡', color: 'bg-purple-50 border-purple-200 hover:bg-purple-100' },
  { label: 'Love it!',         emoji: '❤️',  color: 'bg-red-50 border-red-200 hover:bg-red-100' },
];

export default function ReactionFriction({ onComplete }) {
  return (
    <div className="friction-overlay" role="dialog" aria-modal="true" aria-label="React to continue">
      <div className="friction-card">
        <div className="text-center mb-4">
          <span className="text-2xl">💭</span>
          <h3 className="text-base font-semibold text-gray-800 mt-1">
            What did you think of that post?
          </h3>
          <p className="text-xs text-gray-500 mt-1">
            Select a reaction to see the next one.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-3">
          {REACTIONS.map(r => (
            <button
              key={r.label}
              onClick={() => onComplete(r.label)}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-medium transition-all active:scale-95 ${r.color}`}
            >
              <span className="text-lg">{r.emoji}</span>
              <span className="text-gray-700">{r.label}</span>
            </button>
          ))}
        </div>

        <button
          onClick={() => onComplete('not_interested')}
          className="w-full py-2.5 text-sm text-gray-400 hover:text-gray-600 border border-gray-200 rounded-xl transition-colors hover:bg-gray-50"
        >
          Not Interested
        </button>
      </div>
    </div>
  );
}
