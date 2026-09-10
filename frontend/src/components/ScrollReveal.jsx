import React, { useEffect, useRef, useState } from 'react';

// Singleton IntersectionObserver to share across all ScrollReveal instances
// drastically minimizes CPU/memory usage, garbage collection, and event loop overhead
const callbacks = new Map();
let sharedObserver = null;

function getSharedObserver() {
  if (typeof window === 'undefined' || !('IntersectionObserver' in window)) return null;
  if (!sharedObserver) {
    sharedObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const cb = callbacks.get(entry.target);
            if (cb) {
              cb();
              callbacks.delete(entry.target);
              sharedObserver.unobserve(entry.target);
            }
          }
        });
      },
      {
        threshold: 0,
        rootMargin: '0px 0px 140px 0px'
      }
    );
  }
  return sharedObserver;
}

export default function ScrollReveal({
  children,
  animation = 'fade-up',
  delay = 0,
  stagger = false,
  staggerDelay = 80,
  className = '',
  style = {},
  threshold = 0.05
}) {
  const domRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = domRef.current;
    if (!el) return;

    const observer = getSharedObserver();
    if (!observer) {
      setIsVisible(true);
      return;
    }

    callbacks.set(el, () => {
      setIsVisible(true);
    });
    observer.observe(el);

    return () => {
      callbacks.delete(el);
      if (observer) {
        observer.unobserve(el);
      }
    };
  }, []);

  const animationClass = `disd-reveal-${animation}`;
  const statusClass = isVisible ? 'disd-reveal-visible' : 'disd-reveal-hidden';
  const staggerClass = stagger ? 'disd-reveal-stagger' : '';

  const combinedStyle = {
    ...style,
    transitionDelay: `${delay}ms`,
    '--stagger-delay': `${staggerDelay}ms`
  };

  return (
    <div
      ref={domRef}
      className={`disd-reveal-wrapper ${animationClass} ${statusClass} ${staggerClass} ${className}`}
      style={combinedStyle}
    >
      {children}
    </div>
  );
}
