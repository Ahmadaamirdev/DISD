import React from 'react';

/**
 * Centered Product Title Component
 * 
 * Cinematic Motion Rules:
 * - Phase 4 Entrance: refined fade + subtle upward movement.
 * - Hierarchy:
 *   1. Category / Organization (letter spacing 2.5px)
 *   2. Product Name (restrained, industrial, bold)
 *   3. Series / Standard Subtitle
 * - Respects prefers-reduced-motion.
 */
export default function HeroProductTitle({
  product,
  revealPhase = 8,
  reducedMotion = false,
  innerRef,
}) {
  const isRevealed = revealPhase >= 4;

  return (
    <div
      ref={innerRef}
      style={{
        position: 'absolute',
        top: 'clamp(24px, 4.5vh, 40px)',
        left: 0,
        right: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        pointerEvents: 'none',
        zIndex: 5,
        opacity: isRevealed ? 1 : 0,
        transform: isRevealed
          ? 'translateY(0)'
          : 'translateY(12px)',
        transition: reducedMotion
          ? 'opacity 0.3s ease'
          : 'opacity 1.4s cubic-bezier(0.16, 1, 0.3, 1), transform 1.4s cubic-bezier(0.16, 1, 0.3, 1)',
        padding: '0 20px',
      }}
    >
      {/* 1. Category / Organization */}
      <div
        style={{
          fontSize: 'clamp(10px, 1.1vw, 11px)',
          fontWeight: 800,
          letterSpacing: '2.5px',
          color: '#FF8A1A',
          textTransform: 'uppercase',
          marginBottom: 6,
        }}
      >
        {product.category}
      </div>

      {/* 2. Primary Product Name */}
      <h1
        style={{
          margin: 0,
          fontSize: 'clamp(18px, 2.2vw, 28px)',
          fontWeight: 800,
          letterSpacing: '-0.3px',
          color: '#F4EFEA',
          fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif",
          lineHeight: 1.2,
        }}
      >
        {product.name}
      </h1>

      {/* 3. Series / Standard Subtitle */}
      <div
        style={{
          fontSize: 'clamp(10px, 1vw, 11px)',
          fontWeight: 600,
          letterSpacing: '1.8px',
          color: '#8E857B',
          textTransform: 'uppercase',
          marginTop: 5,
        }}
      >
        {product.model}
      </div>
    </div>
  );
}
