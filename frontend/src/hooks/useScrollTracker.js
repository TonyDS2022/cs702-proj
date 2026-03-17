/**
 * useScrollTracker.js
 *
 * Attaches to a scrollable container and emits throttled scroll telemetry events.
 * Records: scrollTop position, direction, and approximate velocity (px/ms).
 *
 * Usage:
 *   const containerRef = useScrollTracker(onScrollEvent);
 *   <div ref={containerRef} className="feed-container">...</div>
 */

import { useRef, useEffect, useCallback } from 'react';

const THROTTLE_MS = 200; // emit at most once every 200 ms

/**
 * @param {Function} onScroll  – ({ scrollTop, direction, velocityPx }) => void
 */
export function useScrollTracker(onScroll) {
  const containerRef   = useRef(null);
  const lastScrollTop  = useRef(0);
  const lastScrollTime = useRef(Date.now());
  const throttleTimer  = useRef(null);
  const onScrollRef    = useRef(onScroll);

  useEffect(() => { onScrollRef.current = onScroll; }, [onScroll]);

  const handleScroll = useCallback(() => {
    if (throttleTimer.current) return; // already scheduled

    throttleTimer.current = setTimeout(() => {
      throttleTimer.current = null;
      const node = containerRef.current;
      if (!node) return;

      const now       = Date.now();
      const scrollTop = node.scrollTop;
      const delta     = scrollTop - lastScrollTop.current;
      const dt        = now - lastScrollTime.current || 1;
      const velocityPx = Math.abs(delta) / dt;        // px/ms

      onScrollRef.current?.({
        scrollTop,
        direction: delta >= 0 ? 'down' : 'up',
        velocityPx: Math.round(velocityPx * 1000) / 1000,
      });

      lastScrollTop.current  = scrollTop;
      lastScrollTime.current = now;
    }, THROTTLE_MS);
  }, []);

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;
    node.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      node.removeEventListener('scroll', handleScroll);
      if (throttleTimer.current) clearTimeout(throttleTimer.current);
    };
  }, [handleScroll]);

  return containerRef;
}

export default useScrollTracker;
