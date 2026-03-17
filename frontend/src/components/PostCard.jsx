/**
 * PostCard.jsx
 *
 * Renders a single social-media post card that mirrors the layout shown in
 * Figure 1 of Ruiz et al. (2024): category tag, image, title, author row,
 * body text, and a standard like/comment/share action bar.
 *
 * All conditions (control and friction) use this identical card — the only
 * difference between conditions is the overlay that may appear on top of the
 * feed, not anything inside the card itself.
 *
 * Props
 * ─────
 *  post       – post object from data/posts.js
 *  onDwellEnd – (dwellStats) => void  forwarded from useDwellTime (telemetry only)
 */

import React, { useState } from 'react';
import useDwellTime from '../hooks/useDwellTime';

export default function PostCard({ post, onDwellEnd }) {
  const [imgError, setImgError] = useState(false);
  const cardRef = useDwellTime(post.id, onDwellEnd);

  return (
    <article ref={cardRef} className="post-card border-b border-gray-100">

      {/* ── Category tag ───────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-3 pt-3 pb-1">
        <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
          {post.username}
        </span>
      </div>

      {/* ── Post image ────────────────────────────────────────────── */}
      <div className="w-full bg-gray-100 aspect-video overflow-hidden">
        {!imgError ? (
          <img
            src={post.image}
            alt={post.title}
            className="w-full h-full object-cover"
            onError={() => setImgError(true)}
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
            {post.category}
          </div>
        )}
      </div>

      {/* ── Post header ───────────────────────────────────────────── */}
      <div className="px-3 pt-2">
        <h2 className="font-semibold text-sm text-gray-900 leading-snug">
          {post.title}
        </h2>
      </div>

      {/* ── Author row ────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-3 pt-1 pb-1">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold select-none">
            {post.handle.replace('u/', '').charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-xs font-medium text-gray-800">{post.handle}</p>
            <p className="text-xs text-gray-400">{post.timeAgo}</p>
          </div>
        </div>
        <button className="text-xs text-blue-500 font-medium border border-blue-200 rounded-full px-3 py-0.5 hover:bg-blue-50 active:scale-95 transition-transform">
          Unfollow
        </button>
      </div>

      {/* ── Body text ─────────────────────────────────────────────── */}
      <p className="px-3 pb-2 text-xs text-gray-700 leading-relaxed line-clamp-4">
        {post.body}
      </p>

      {/* ── Action bar ────────────────────────────────────────────── */}
      <div className="flex items-center gap-4 px-3 pb-3 border-t border-gray-50 pt-2">
        <button aria-label="Like" className="flex items-center gap-1 text-gray-400 hover:text-blue-500 transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
          </svg>
          <span className="text-xs">Like</span>
        </button>

        <button aria-label="Comment" className="flex items-center gap-1 text-gray-400 hover:text-blue-500 transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <span className="text-xs">Comment</span>
        </button>

        <button aria-label="Share" className="flex items-center gap-1 text-gray-400 hover:text-blue-500 transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
          <span className="text-xs">Share</span>
        </button>
      </div>
    </article>
  );
}
