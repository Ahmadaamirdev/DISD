import React, { useRef } from 'react';

/**
 * Mobile Specification Carousel & Indicator Dock
 * 
 * Exclusively rendered on mobile / tablet screens (<= 768px):
 * - Guarantees all 4 specifications are 100% visible and accessible.
 * - Prevents text congestion and eliminates overlap with the 3D model.
 * - Two-way interaction: tapping 3D hotspot pins updates the active spec,
 *   and selecting specs highlights the corresponding 3D hotspot.
 * - Supports touch swiping, segmented tabs, and previous/next arrows.
 */
export default function HeroMobileSpecifications({
  specifications = [],
  activeHoverId = null,
  onSelectSpec,
  revealPhase = 8,
}) {
  const touchStartX = useRef(null);

  if (!specifications || specifications.length === 0) return null;

  // Resolve current active spec (default to first specification if none hovered)
  const activeIndex = Math.max(
    0,
    specifications.findIndex((s) => s.id === activeHoverId)
  );
  const currentSpec = specifications[activeIndex] || specifications[0];

  const handlePrev = (e) => {
    e.stopPropagation();
    const prevIndex = (activeIndex - 1 + specifications.length) % specifications.length;
    onSelectSpec && onSelectSpec(specifications[prevIndex].id);
  };

  const handleNext = (e) => {
    e.stopPropagation();
    const nextIndex = (activeIndex + 1) % specifications.length;
    onSelectSpec && onSelectSpec(specifications[nextIndex].id);
  };

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (diff > 40) {
      // Swiped left -> next
      handleNext(e);
    } else if (diff < -40) {
      // Swiped right -> prev
      handlePrev(e);
    }
    touchStartX.current = null;
  };

  const isRevealed = revealPhase >= 3;

  return (
    <div
      className="disd-mobile-specs-dock"
      style={{
        position: 'absolute',
        bottom: 56,
        left: 0,
        right: 0,
        zIndex: 20,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '0 16px',
        pointerEvents: 'auto',
        opacity: isRevealed ? 1 : 0,
        transform: isRevealed ? 'translateY(0)' : 'translateY(16px)',
        transition: 'opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1), transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* 1. SEGMENTED TABS: 01, 02, 03, 04 */}
      <div
        className="disd-mobile-specs-tabs"
        style={{
          display: 'flex',
          gap: 6,
          marginBottom: 8,
          maxWidth: '100%',
          overflowX: 'auto',
          WebkitOverflowScrolling: 'touch',
          scrollbarWidth: 'none',
          padding: '2px 4px',
        }}
      >
        {specifications.map((spec, idx) => {
          const isActive = idx === activeIndex;
          // Short label for compact pill
          const shortLabel = spec.label.split(' ')[0] || spec.number;

          return (
            <button
              key={spec.id}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onSelectSpec && onSelectSpec(spec.id);
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                padding: '5px 11px',
                borderRadius: 9999,
                fontSize: 10.5,
                fontWeight: 800,
                fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif",
                letterSpacing: '0.8px',
                textTransform: 'uppercase',
                border: isActive
                  ? '1.5px solid #FF8A1A'
                  : '1px solid rgba(255, 255, 255, 0.12)',
                background: isActive
                  ? '#FF8A1A'
                  : 'rgba(28, 25, 22, 0.88)',
                color: isActive ? '#12100E' : '#A3998D',
                cursor: 'pointer',
                transition: 'all 0.22s ease',
                boxShadow: isActive
                  ? '0 2px 10px rgba(255, 138, 26, 0.45)'
                  : 'none',
                backdropFilter: 'blur(8px)',
                whiteSpace: 'nowrap',
              }}
              aria-label={`View specification ${spec.number}: ${spec.label}`}
            >
              <span style={{ opacity: isActive ? 1 : 0.85 }}>{spec.number}</span>
              <span>{shortLabel}</span>
            </button>
          );
        })}
      </div>

      {/* 2. ACTIVE SPECIFICATION CARD */}
      <div
        style={{
          width: '100%',
          maxWidth: 390,
          background: 'rgba(24, 22, 19, 0.94)',
          border: '1.5px solid rgba(255, 138, 26, 0.42)',
          borderRadius: 14,
          padding: '10px 14px 11px',
          boxShadow: '0 8px 26px rgba(0, 0, 0, 0.65), 0 0 16px rgba(255, 138, 26, 0.15)',
          backdropFilter: 'blur(14px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 10,
        }}
      >
        {/* Previous Arrow */}
        <button
          type="button"
          onClick={handlePrev}
          aria-label="Previous specification"
          style={{
            background: 'rgba(40, 36, 31, 0.9)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: '50%',
            width: 28,
            height: 28,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFFFFF',
            cursor: 'pointer',
            flexShrink: 0,
            padding: 0,
            transition: 'background 0.2s ease',
          }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#FF8A1A" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>

        {/* Center Content */}
        <div style={{ flex: 1, minWidth: 0, textAlign: 'center' }}>
          {/* Top Label */}
          <div
            style={{
              fontSize: 9.5,
              fontWeight: 800,
              letterSpacing: '1.4px',
              color: '#FF8A1A',
              textTransform: 'uppercase',
              marginBottom: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 5,
            }}
          >
            <span>{currentSpec.number}</span>
            <span style={{ opacity: 0.5 }}>•</span>
            <span style={{ color: '#F4EFEA', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {currentSpec.label}
            </span>
          </div>

          {/* Value + Unit */}
          <div
            style={{
              fontSize: 'clamp(20px, 5.5vw, 24px)',
              fontWeight: 900,
              color: '#FFFFFF',
              fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif",
              lineHeight: 1.15,
              display: 'flex',
              alignItems: 'baseline',
              justifyContent: 'center',
              gap: 6,
            }}
          >
            <span>{currentSpec.value}</span>
            {currentSpec.unit && (
              <span
                style={{
                  fontSize: '0.52em',
                  fontWeight: 800,
                  letterSpacing: '1px',
                  color: '#FFA238',
                  textTransform: 'uppercase',
                }}
              >
                {currentSpec.unit}
              </span>
            )}
          </div>

          {/* Description */}
          {currentSpec.description && (
            <div
              style={{
                fontSize: 10.5,
                fontWeight: 500,
                color: '#C7BDB1',
                marginTop: 2,
                lineHeight: 1.3,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {currentSpec.description}
            </div>
          )}
        </div>

        {/* Next Arrow */}
        <button
          type="button"
          onClick={handleNext}
          aria-label="Next specification"
          style={{
            background: 'rgba(40, 36, 31, 0.9)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: '50%',
            width: 28,
            height: 28,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFFFFF',
            cursor: 'pointer',
            flexShrink: 0,
            padding: 0,
            transition: 'background 0.2s ease',
          }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#FF8A1A" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>

      {/* Swipe / Hotspot hint */}
      <div
        style={{
          marginTop: 5,
          fontSize: 9,
          fontWeight: 600,
          letterSpacing: '0.8px',
          color: '#8A8175',
          textTransform: 'uppercase',
        }}
      >
        TAP 3D HOTSPOTS ON MACHINE OR SWIPE
      </div>
    </div>
  );
}
