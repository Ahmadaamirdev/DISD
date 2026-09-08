import React from 'react';

/**
 * Atmospheric Low-Contrast Background Typography Component
 * 
 * Cinematic Rules:
 * - Always sits physically behind the 3D model at z-index 1.
 * - Crossfades smoothly from the Hero word ("IMPACT") to the Product Detail word ("ENGINEERED") as user scrolls.
 * - Low-contrast, environmental, non-intrusive.
 */
export default function HeroTypography({
  heroWord = 'IMPACT',
  revealPhase = 8,
  reducedMotion = false,
  innerRef,
}) {
  const isHeroRevealed = revealPhase >= 1;

  return (
    <div
      ref={innerRef}
      style={{
        position: 'absolute',
        top: '40%',
        left: '50%',
        transform: isHeroRevealed
          ? 'translate(-50%, -50%) scale(1)'
          : 'translate(-50%, -50%) scale(0.96)',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        pointerEvents: 'none',
        zIndex: 1,
        userSelect: 'none',
      }}
    >
      {/* ULTRA-PREMIUM METALLIC TITANIUM "IMPACT" */}
      <div
        style={{
          position: 'relative',
          fontSize: 'clamp(70px, 14.5vw, 210px)',
          fontWeight: 900,
          lineHeight: 1,
          letterSpacing: isHeroRevealed ? '0.22em' : '0.26em',
          textTransform: 'uppercase',
          whiteSpace: 'nowrap',
          fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif",
          background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.16) 0%, rgba(220, 210, 195, 0.10) 40%, rgba(180, 160, 135, 0.07) 75%, rgba(255, 184, 0, 0.12) 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          WebkitTextStroke: '1.2px rgba(255, 255, 255, 0.11)',
          filter: 'drop-shadow(0 20px 40px rgba(0, 0, 0, 0.65))',
          opacity: isHeroRevealed ? 1 : 0,
          transition: reducedMotion
            ? 'opacity 0.4s ease'
            : 'opacity 1.2s cubic-bezier(0.16, 1, 0.3, 1), transform 1.2s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {heroWord}
      </div>
    </div>
  );
}
