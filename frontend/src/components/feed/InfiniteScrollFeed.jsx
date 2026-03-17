/**
 * InfiniteScrollFeed.jsx — Control condition
 *
 * Standard infinite-scroll feed: posts load dynamically as the user scrolls.
 * No friction, no reactions required.
 *
 * Telemetry captured:
 *   – post_view  (via useDwellTime on each PostCard)
 *   – scroll     (via useScrollTracker on the container)
 *
 * Props
 * ──────
 *  posts        – array of post objects (EXPOSURE_POSTS)
 *  onComplete   – () => void  called after the user has seen all posts
 */

import React, { useCallback, useState, useEffect, useRef } from 'react';
import PostCard from '../PostCard';
import useSessionStore from '../../store/sessionStore';
import useScrollTracker from '../../hooks/useScrollTracker';

const POSTS_PER_PAGE = 5; // how many posts to render at a time

export default function InfiniteScrollFeed({ posts, onComplete }) {
  const { logPostView, logScroll, postsViewed } = useSessionStore();
  const [visibleCount, setVisibleCount] = useState(POSTS_PER_PAGE);
  const sentinelRef = useRef(null);
  const completedRef = useRef(false);

  // Scroll telemetry
  const handleScroll = useCallback(
    (data) => logScroll(data),
    [logScroll],
  );
  const containerRef = useScrollTracker(handleScroll);

  // Dwell-time handler forwarded to each PostCard
  const handleDwellEnd = useCallback(
    (stats) => logPostView(stats),
    [logPostView],
  );

  // Infinite-load sentinel: reveal more posts as user reaches bottom
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisibleCount(prev => {
            const next = Math.min(prev + POSTS_PER_PAGE, posts.length);
            return next;
          });
        }
      },
      { threshold: 0.1 },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [posts.length]);

  // Fire onComplete once the user has scrolled through all posts
  useEffect(() => {
    if (!completedRef.current && visibleCount >= posts.length) {
      // Give them a moment to dwell on the last post
      const timer = setTimeout(() => {
        if (!completedRef.current) {
          completedRef.current = true;
          onComplete?.();
        }
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [visibleCount, posts.length, onComplete]);

  const visiblePosts = posts.slice(0, visibleCount);

  return (
    <div
      ref={containerRef}
      className="feed-container"
      role="feed"
      aria-label="Social media feed"
    >
      {/* Progress indicator */}
      <div className="sticky top-0 z-10 bg-white/90 backdrop-blur-sm border-b border-gray-100 px-4 py-2 flex items-center justify-between">
        <span className="text-xs text-gray-500 font-medium">Discover</span>
        <div className="flex items-center gap-2">
          <div className="w-20 h-1 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="progress-bar rounded-full"
              style={{ width: `${(postsViewed.length / posts.length) * 100}%` }}
            />
          </div>
          <span className="text-xs text-gray-400">
            {postsViewed.length}/{posts.length}
          </span>
        </div>
      </div>

      {/* Post stream */}
      {visiblePosts.map(post => (
        <PostCard
          key={post.id}
          post={post}
          onDwellEnd={handleDwellEnd}
          showReactions={false}
        />
      ))}

      {/* Infinite-load sentinel */}
      {visibleCount < posts.length && (
        <div ref={sentinelRef} className="h-16 flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* End-of-feed notice */}
      {visibleCount >= posts.length && (
        <div className="py-10 flex flex-col items-center gap-2 text-gray-400">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M5 13l4 4L19 7" />
          </svg>
          <p className="text-sm font-medium">You've seen all posts</p>
          <p className="text-xs">Moving to the next step…</p>
        </div>
      )}
    </div>
  );
}
