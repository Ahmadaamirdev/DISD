import React, { useEffect, useRef, useState } from 'react';

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
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (domRef.current) {
            observer.unobserve(domRef.current);
          }
        }
      },
      {
        threshold,
        rootMargin: '0px 0px 60px 0px'
      }
    );

    const currentElem = domRef.current;
    if (currentElem) {
      observer.observe(currentElem);
    }

    return () => {
      if (currentElem) {
        observer.unobserve(currentElem);
      }
    };
  }, [threshold]);

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
