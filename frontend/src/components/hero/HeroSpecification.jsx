import React from 'react';

/**
 * Reusable Specification Callout Typography Component
 * 
 * Cinematic Entrance (Phase 7):
 * - Enters right after its associated connector line draws.
 * - Staggered entrance timing per specification.
 * - Opacity: 0 → 1, Transform: translateY(14px) → 0.
 * - Visually dominant primary value with refined easing.
 * - Full accessibility: mouse hover, touch click, keyboard navigation.
 */
export default function HeroSpecification({
  spec,
  isHovered = false,
  isOtherHovered = false,
  revealPhase = 8,
  reducedMotion = false,
  onMouseEnter,
  onMouseLeave,
  onClick,
  registerCardRef,
}) {
  const isRevealed = revealPhase >= 3;
  const isLeft = spec.side === 'left';

  // Stagger entrance per specification order (slides in slower after yellow dots)
  const entranceDelayMs = reducedMotion ? 0 : (spec.order - 1) * 160 + 80;

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick && onClick(spec.id);
    }
  };

  return (
    <div
      ref={(el) => registerCardRef && registerCardRef(spec.id, el)}
      role="button"
      tabIndex={0}
      aria-label={`${spec.label}: ${spec.value} ${spec.unit || ''}`}
      onMouseEnter={() => onMouseEnter && onMouseEnter(spec.id)}
      onMouseLeave={() => onMouseLeave && onMouseLeave()}
      onClick={() => onClick && onClick(spec.id)}
      onKeyDown={handleKeyDown}
      style={{
        pointerEvents: 'auto',
        cursor: 'pointer',
        textAlign: isLeft ? 'left' : 'right',
        outline: 'none',
        opacity: isRevealed
          ? isHovered
            ? 1.0
            : isOtherHovered
            ? 0.65
            : 0.98
          : 0,
        transform: isRevealed
          ? isHovered
            ? isLeft
              ? 'translateX(6px)'
              : 'translateX(-6px)'
            : 'translateX(0) translateY(0)'
          : isLeft
          ? 'translateX(-85px)'
          : 'translateX(85px)',
        transition: reducedMotion
          ? 'opacity 0.3s ease'
          : isHovered || isOtherHovered
          ? 'opacity 0.25s ease, transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
          : `opacity 1.35s ease ${entranceDelayMs}ms, transform 1.5s cubic-bezier(0.16, 1, 0.3, 1) ${entranceDelayMs}ms`,
        maxWidth: 280,
        userSelect: 'none',
      }}
    >
      {/* 1. Simple Sequence Number */}
      <div
        style={{
          fontSize: 11,
          fontWeight: 800,
          letterSpacing: '2px',
          color: isHovered ? '#FFA238' : '#FF8A1A',
          marginBottom: 4,
          textShadow: '0 1px 4px rgba(0, 0, 0, 0.8)',
          transition: 'color 0.25s ease',
        }}
      >
        {spec.number}
      </div>

      {/* 2. Bold High-Contrast Category Label */}
      <div
        style={{
          fontSize: 12,
          fontWeight: 800,
          letterSpacing: '1.8px',
          color: isHovered ? '#FFFFFF' : '#F5EFEA',
          textTransform: 'uppercase',
          marginBottom: 4,
          textShadow: '0 1px 6px rgba(0, 0, 0, 0.9)',
          transition: 'color 0.25s ease',
        }}
      >
        {spec.label}
      </div>

      {/* 3. Visually Dominant Primary Value + High Contrast Unit */}
      <div
        style={{
          fontSize: 'clamp(26px, 2.6vw, 36px)',
          fontWeight: 900,
          letterSpacing: '-0.5px',
          color: '#FFFFFF',
          fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif",
          lineHeight: 1.15,
          display: 'flex',
          alignItems: 'baseline',
          justifyContent: isLeft ? 'flex-start' : 'flex-end',
          gap: 8,
          textShadow: '0 2px 14px rgba(0, 0, 0, 0.9), 0 0 4px rgba(0, 0, 0, 0.8)',
          transition: 'color 0.25s ease',
        }}
      >
        <span>{spec.value}</span>
        {spec.unit && (
          <span
            style={{
              fontSize: '0.50em',
              fontWeight: 700,
              letterSpacing: '1.2px',
              color: '#FFA238',
              textTransform: 'uppercase',
              textShadow: '0 1px 6px rgba(0, 0, 0, 0.8)',
              transition: 'color 0.25s ease',
            }}
          >
            {spec.unit}
          </span>
        )}
      </div>

      {/* 4. Bright, Legible Supporting Technical Description */}
      {spec.description && (
        <div
          style={{
            fontSize: 12,
            fontWeight: 500,
            letterSpacing: '0.2px',
            color: isHovered ? '#EFE9E2' : '#D6CCC2',
            marginTop: 6,
            lineHeight: 1.45,
            textShadow: '0 1px 6px rgba(0, 0, 0, 0.85)',
            transition: 'color 0.25s ease',
          }}
        >
          {spec.description}
        </div>
      )}
    </div>
  );
}
