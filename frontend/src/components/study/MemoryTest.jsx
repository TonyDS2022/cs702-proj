/**
 * MemoryTest.jsx
 *
 * Old/New recognition memory task — directly mirrors the procedure in Ruiz et al.
 *
 * Pool: 20 "old" posts (seen during exposure) + 6 "new" distractors, shuffled.
 * For each post: user presses "Old" (seen it) or "New" (haven't seen it).
 * Response time (RT) from card display to button press is also recorded.
 *
 * On completion, calls onComplete(responses[]).
 */

import React, { useState, useRef, useEffect } from 'react';
import useSessionStore from '../../store/sessionStore';

export default function MemoryTest({ onComplete }) {
  const { memoryTestPool, recordMemoryResponse } = useSessionStore();
  const [index, setIndex]       = useState(0);
  const [imgError, setImgError] = useState(false);
  const cardStartRef            = useRef(Date.now());
  const responsesRef            = useRef([]);

  // Reset img error state when post changes
  useEffect(() => {
    setImgError(false);
    cardStartRef.current = Date.now();
  }, [index]);

  if (!memoryTestPool || memoryTestPool.length === 0) {
    return (
      <div className="phone-frame flex items-center justify-center">
        <p className="text-gray-400 text-sm">Loading memory test…</p>
      </div>
    );
  }

  const post      = memoryTestPool[index];
  const progress  = index / memoryTestPool.length;
  const isLast    = index === memoryTestPool.length - 1;

  function handleResponse(answer) {
    const rtMs     = Date.now() - cardStartRef.current;
    const correct  = answer === post.memoryLabel; // 'old' or 'new'
    const resp = {
      postId:       post.id,
      memoryLabel:  post.memoryLabel,
      participantAnswer: answer,
      correct,
      rtMs,
      category:     post.category,
    };
    recordMemoryResponse(resp);
    responsesRef.current.push(resp);

    if (isLast) {
      onComplete(responsesRef.current);
    } else {
      setIndex(i => i + 1);
    }
  }

  return (
    <div className="phone-frame flex flex-col">
      {/* Header */}
      <div className="bg-purple-600 text-white px-5 pt-8 pb-4">
        <h1 className="text-lg font-bold">Memory Check</h1>
        <p className="text-purple-200 text-xs mt-0.5">
          Did you see this post during your browsing session?
        </p>
        <div className="mt-3 h-1.5 bg-purple-400 rounded-full overflow-hidden">
          <div
            className="h-full bg-white rounded-full transition-all duration-300"
            style={{ width: `${progress * 100}%` }}
          />
        </div>
        <p className="text-purple-200 text-xs mt-1">{index + 1} / {memoryTestPool.length}</p>
      </div>

      {/* Post preview (image + title only — no body to aid recall) */}
      <div className="flex-1 overflow-y-auto px-5 py-5">
        <div className="rounded-2xl overflow-hidden border border-gray-100 shadow-sm mb-6">
          <div className="aspect-video bg-gray-100">
            {!imgError ? (
              <img
                src={post.image}
                alt={post.title}
                className="w-full h-full object-cover"
                onError={() => setImgError(true)}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                {post.category}
              </div>
            )}
          </div>
          <div className="p-3">
            <p className="text-xs font-medium text-blue-600 mb-1">{post.username}</p>
            <p className="text-sm font-semibold text-gray-800 leading-snug">{post.title}</p>
          </div>
        </div>

        {/* Response buttons */}
        <p className="text-center text-sm text-gray-500 mb-4 font-medium">
          Have you seen this post before?
        </p>

        <div className="flex gap-3">
          <button
            onClick={() => handleResponse('old')}
            className="flex-1 py-5 rounded-2xl bg-blue-500 hover:bg-blue-600 text-white font-bold text-base shadow-md active:scale-95 transition-all"
          >
            ✓ Old
            <p className="text-xs font-normal text-blue-200 mt-0.5">I saw this</p>
          </button>
          <button
            onClick={() => handleResponse('new')}
            className="flex-1 py-5 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-base shadow-sm active:scale-95 transition-all"
          >
            ✗ New
            <p className="text-xs font-normal text-gray-400 mt-0.5">I didn't see this</p>
          </button>
        </div>

        <p className="text-center text-xs text-gray-400 mt-4">
          Go with your first impression — don't overthink it.
        </p>
      </div>
    </div>
  );
}
