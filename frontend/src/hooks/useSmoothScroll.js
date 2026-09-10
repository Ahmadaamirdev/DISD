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
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let targetY = window.scrollY;
    let currentY = window.scrollY;
    let isMoving = false;
    let rafId = null;

    const lerp = (start, end, factor) => start + (end - start) * factor;

    const updateScroll = () => {
      currentY = lerp(currentY, targetY, 0.09);
      window.scrollTo(0, Math.round(currentY));

      if (Math.abs(targetY - currentY) > 0.6) {
        rafId = requestAnimationFrame(updateScroll);
      } else {
        window.scrollTo(0, targetY);
        currentY = targetY;
        isMoving = false;
        rafId = null;
      }
    };

    const onWheel = (e) => {
      // If user holds Ctrl or Meta (e.g. browser zoom), let native handle it
      if (e.ctrlKey || e.metaKey) return;

      // Allow native scrolling inside scrollable modals/drawers
      let target = e.target;
      while (target && target !== document.body && target !== document.documentElement) {
        if (target.scrollHeight > target.clientHeight) {
          const style = window.getComputedStyle(target);
          if (style.overflowY === 'auto' || style.overflowY === 'scroll') {
            return;
          }
        }
        target = target.parentElement;
      }

      e.preventDefault();

      // Normalize delta with dampened step size so scrolling doesn't rush past animations
      const step = Math.sign(e.deltaY) * Math.min(Math.abs(e.deltaY) * 0.82, 110);
      const maxScroll = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
      
      // Update target based on current position if user was idle
      if (!isMoving) {
        targetY = window.scrollY;
        currentY = window.scrollY;
      }
      targetY = Math.max(0, Math.min(maxScroll, targetY + step));

      if (!isMoving) {
        isMoving = true;
        rafId = requestAnimationFrame(updateScroll);
      }
    };

    window.addEventListener('wheel', onWheel, { passive: false });

    // Stay in sync if user drags the scrollbar thumb or clicks anchor links
    const onScroll = () => {
      if (!isMoving) {
        targetY = window.scrollY;
        currentY = window.scrollY;
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('scroll', onScroll);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);
}
