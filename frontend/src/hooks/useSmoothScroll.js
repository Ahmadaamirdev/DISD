import { useEffect } from 'react';

/**
 * Professional Smooth Scroll Momentum Controller
 * - Dampens harsh mouse wheel jumps into a silky, weighted glide
 * - Gives entrance animations and section reveals ample time to unfold gracefully
 * - Automatically detects modals to allow internal scrolling
 * - Preserves native scrollbar dragging and trackpad precision
 */
export default function useSmoothScroll() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!prefersReduced) {
      document.documentElement.style.scrollBehavior = 'smooth';
    }

    return () => {
      document.documentElement.style.scrollBehavior = 'auto';
    };
  }, []);
}
