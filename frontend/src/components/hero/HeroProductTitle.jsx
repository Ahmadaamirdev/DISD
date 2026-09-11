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
  selectedProductId = 'breaker',
  onToggleProduct,
}) {
  const isRevealed = revealPhase >= 4;

  return (
    <div
      ref={innerRef}
      className="disd-hero-title-container"
      style={{
        position: 'absolute',
        top: 'clamp(20px, 4.2vh, 40px)',
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
        padding: '0 16px',
      }}
    >
      {/* 1. Category / Organization */}
      <div
        className="hero-title-category"
        style={{
          fontSize: 'clamp(9px, 2.2vw, 11px)',
          fontWeight: 800,
          letterSpacing: 'clamp(1.2px, 0.4vw, 2.5px)',
          color: '#FF8A1A',
          textTransform: 'uppercase',
          marginBottom: 5,
        }}
      >
        {product.category}
      </div>

      {/* 2. Primary Product Name */}
      <h1
        className="hero-title-name"
        style={{
          margin: 0,
          fontSize: 'clamp(17px, 4.4vw, 28px)',
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
        className="hero-title-model"
        style={{
          fontSize: 'clamp(9px, 2vw, 11px)',
          fontWeight: 600,
          letterSpacing: 'clamp(0.8px, 0.3vw, 1.8px)',
          color: '#8E857B',
          textTransform: 'uppercase',
          marginTop: 4,
        }}
      >
        {product.model}
      </div>

      {/* 4. Mobile Product Switcher Button (centered directly below subtitle, mobile only) */}
      <div className="disd-mobile-switcher-wrapper">
        <button
          type="button"
          onPointerDown={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onToggleProduct && onToggleProduct();
          }}
          aria-label={selectedProductId === 'breaker' ? 'Switch to Forklift' : 'Switch to Breaker'}
          className="disd-model-switcher-btn disd-mobile-switcher-btn"
        >
          <span className="switcher-btn-text">
            {selectedProductId === 'breaker' ? 'FORKLIFT' : 'BREAKER'}
          </span>
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#FF8A1A"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="switcher-btn-arrow"
          >
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>
    </div>
  );
}
