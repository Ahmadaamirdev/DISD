import React from 'react';

/**
 * Reusable Circular Technical Specification Marker Component
 * 
 * Cinematic Motion Rules:
 * - Phase 5 Entrance: scales & fades subtly into position.
 * - Understated Idle Pulse: opacity 0.65 → 1 → 0.65, scale 1 → 1.04 → 1 over 4.6s.
 * - Hover / Active: becomes slightly larger & brighter, without glowing neon outlines.
 * - Respects prefers-reduced-motion.
 */
export default function HeroSpecificationMarker({
  spec,
  isHovered = false,
  isOtherHovered = false,
  revealPhase = 8,
  reducedMotion = false,
  onMouseEnter,
  onMouseLeave,
  onClick,
}) {
  const isRevealed = revealPhase >= 1;
  const markerDelayMs = reducedMotion ? 0 : (spec.order - 1) * 80 + 40;

  return (
    <div
      id={`spec-marker-${spec.order || spec.id}`}
      role="button"
      tabIndex={0}
      aria-label={`Highlight ${spec.label}`}
      onMouseEnter={() => onMouseEnter && onMouseEnter(spec.id)}
      onMouseLeave={() => onMouseLeave && onMouseLeave()}
      onClick={() => onClick && onClick(spec.id)}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: 24,
        height: 24,
        marginLeft: -12,
        marginTop: -12,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        pointerEvents: 'auto',
        cursor: 'pointer',
        outline: 'none',
        userSelect: 'none',
        willChange: 'transform, opacity',
      }}
    >
      {/* Inner animated wrapper for independent scale & pop reveal unaffected by outer coordinate translate */}
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: isRevealed
            ? isHovered
              ? 1.0
              : isOtherHovered
              ? 0.45
              : 0.95
            : 0,
          transform: isRevealed ? 'scale(1)' : 'scale(0.1)',
          transition: reducedMotion
            ? 'opacity 0.25s ease'
            : `opacity 0.45s ease ${markerDelayMs}ms, transform 0.65s cubic-bezier(0.34, 1.56, 0.64, 1) ${markerDelayMs}ms`,
        }}
      >
        {/* Thin circular outline with active yellow idle pulse */}
        <div
          style={{
            position: 'absolute',
            inset: isHovered ? -3 : 0,
            borderRadius: '50%',
            border: isHovered ? '2px solid #FFD000' : '1.5px solid #FFB800',
            boxShadow: isHovered ? '0 0 14px rgba(255, 208, 0, 0.9)' : '0 0 8px rgba(255, 184, 0, 0.55)',
            animation: reducedMotion ? 'none' : 'markerPulseUnderstated 3.6s infinite ease-in-out',
            transition: 'all 0.28s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        />

        {/* Numerical index indicator */}
        <span
          style={{
            position: 'absolute',
            top: -13,
            fontSize: 8.5,
            fontWeight: 800,
            letterSpacing: '0.5px',
            color: isHovered ? '#FFFFFF' : '#FFD000',
            textShadow: '0 1px 4px rgba(0, 0, 0, 0.9)',
            pointerEvents: 'none',
            transition: 'color 0.25s ease',
          }}
        >
          {spec.number}
        </span>

        {/* Center point in radiant technical yellow */}
        <div
          style={{
            width: isHovered ? 6.5 : 5,
            height: isHovered ? 6.5 : 5,
            borderRadius: '50%',
            backgroundColor: '#FFC72C',
            boxShadow: isHovered ? '0 0 8px #FFD000' : '0 0 5px rgba(255, 184, 0, 0.75)',
            transition: 'all 0.25s ease',
          }}
        />
      </div>
    </div>
  );
}
