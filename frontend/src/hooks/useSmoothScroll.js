import { useEffect } from 'react';

/**
 * Lightweight Hardware-Accelerated Smooth Scroll Hook
 * - Uses native compositor-driven smooth scrolling
 * - Eliminates wheel event hijacking, input lag, and layout thrashing
 * - Respects prefers-reduced-motion accessibility preferences
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
