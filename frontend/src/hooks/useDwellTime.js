/**
 * useDwellTime.js
 *
 * Measures how long a post card is visible (≥50% of its height in the viewport)
 * using the IntersectionObserver API.
 *
 * Usage:
 *   const ref = useDwellTime(post.id, onDwellEnd);
 *   <div ref={ref}>...</div>
 *
 * onDwellEnd({ postId, startTs, endTs, dwellMs, scrollDepth }) is called
 * whenever the post leaves the viewport after being seen.
 */

import { useRef, useEffect, useCallback } from 'react';

/**
 * @param {string}   postId
 * @param {Function} onDwellEnd  – called with dwell stats when post exits viewport
 * @param {number}   [threshold=0.5]  – fraction of card that must be visible
 */
export function useDwellTime(postId, onDwellEnd, threshold = 0.5) {
  const ref         = useRef(null);
  const startTsRef  = useRef(null);
  const maxDepthRef = useRef(0);     // max intersection ratio seen (≈ scroll depth proxy)
  const onEndRef    = useRef(onDwellEnd);

  // Keep callback ref fresh without triggering re-subscriptions
  useEffect(() => { onEndRef.current = onDwellEnd; }, [onDwellEnd]);

  const handleIntersect = useCallback((entries) => {
    const entry = entries[0];

    if (entry.isIntersecting) {
      if (startTsRef.current === null) {
        startTsRef.current = Date.now();
      }
      if (entry.intersectionRatio > maxDepthRef.current) {
        maxDepthRef.current = entry.intersectionRatio;
      }
    } else {
      if (startTsRef.current !== null) {
        const endTs   = Date.now();
        const startTs = startTsRef.current;
        onEndRef.current?.({
          postId,
          startTs,
          endTs,
          dwellMs: endTs - startTs,
          scrollDepth: maxDepthRef.current,
        });
        startTsRef.current  = null;
        maxDepthRef.current = 0;
      }
    }
  }, [postId]);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(handleIntersect, {
      threshold: [0, threshold, 1.0],
    });
    observer.observe(node);

    return () => {
      // Flush any open dwell on unmount
      if (startTsRef.current !== null) {
        const endTs = Date.now();
        onEndRef.current?.({
          postId,
          startTs: startTsRef.current,
          endTs,
          dwellMs: endTs - startTsRef.current,
          scrollDepth: maxDepthRef.current,
        });
        startTsRef.current  = null;
        maxDepthRef.current = 0;
      }
      observer.disconnect();
    };
  }, [handleIntersect, postId, threshold]);

  return ref;
}

export default useDwellTime;
