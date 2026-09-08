import React from 'react';

/**
 * Reusable Specification Connector Path Component
 * 
 * Cinematic Motion Rules:
 * - Truly animates as being drawn from 3D MARKER → CONNECTOR → SPECIFICATION.
 * - Staggered drawing per specification order.
 * - Thin, refined technical lines (1px).
 * - Restrained opacity (0.35 - 0.40 default).
 * - Muted warm gray for most of the line (#857C70) with subtle orange anchor accent.
 * - Respects prefers-reduced-motion.
 */
export default function HeroSpecificationConnector({
  spec,
  isHovered = false,
  isOtherHovered = false,
  revealPhase = 8,
  reducedMotion = false,
}) {
  // Trigger connector line drawing after yellow dots appear
  const isDrawTriggered = revealPhase >= 2;
  const isLineStabilized = revealPhase >= 3;

  // Stagger per specification order (0ms, 120ms, 240ms, 360ms)
  const drawDelayMs = reducedMotion ? 0 : (spec.order - 1) * 120 + 40;

  // Most of the line remains a muted warm gray; orange is only a subtle emphasis near model anchor
  const strokeColor = isHovered
    ? '#D4CCC2'
    : spec.side === 'left'
    ? 'url(#connectorGradLeft)'
    : 'url(#connectorGradRight)';

  // SVG stroke-dasharray and stroke-dashoffset for true directional drawing
  const dashArray = isHovered
    ? 'none'
    : isLineStabilized
    ? '3 3'
    : '650';

  const dashOffset = isDrawTriggered || reducedMotion ? '0' : '650';

  return (
    <path
      id={`connector-line-${spec.order || spec.id}`}
      d=""
      fill="none"
      stroke={strokeColor}
      strokeWidth={isHovered ? '1.25' : '1'}
      strokeDasharray={dashArray}
      strokeDashoffset={dashOffset}
      style={{
        opacity: isDrawTriggered
          ? isHovered
            ? 0.88
            : isOtherHovered
            ? 0.20
            : 0.38
          : 0,
        transition: reducedMotion
          ? 'opacity 0.3s ease'
          : `stroke-dashoffset 0.65s cubic-bezier(0.16, 1, 0.3, 1) ${drawDelayMs}ms, opacity 0.35s ease ${drawDelayMs}ms, stroke 0.25s ease, stroke-width 0.25s ease`,
      }}
    />
  );
}
