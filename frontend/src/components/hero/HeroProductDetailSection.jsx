import React from 'react';

/**
 * Editorial Product Detail Section Component
 * 
 * Design Rules:
 * - Two-column composition on desktop: Left column editorial text & features; Right column 3D model framing.
 * - Pure editorial typography: NO cards, NO rectangular boxes, NO dashboard appearance.
 * - Subtle atmospheric technical graphics: thin crosshairs, fine measurement ticks, coordinate labels.
 * - Progressive scroll entrance.
 * - Responsive stacking on mobile.
 */
export default function HeroProductDetailSection({
  product,
  features,
  scrollProgress = 0,
  reducedMotion = false,
  innerRef,
}) {
  // Detail section visibility progression
  // p < 0.35: Hidden (Hero is active)
  // p = 0.35 - 0.55: Fades & slides into prominence
  // p > 0.55: Fully active
  const detailOpacity = Math.min(Math.max((scrollProgress - 0.35) / 0.22, 0), 1);
  const isVisible = detailOpacity > 0.05;

  if (!isVisible) return null;

  const { detail } = product;

  return (
    <div
      ref={innerRef}
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 5,
        display: 'flex',
        alignItems: 'center',
        padding: '0 clamp(24px, 5vw, 90px)',
        opacity: detailOpacity,
        transform: reducedMotion
          ? 'none'
          : `translateY(${(24 * (1 - detailOpacity)).toFixed(1)}px)`,
        transition: 'opacity 0.2s ease-out',
        userSelect: 'none',
      }}
    >
      {/* LEFT COLUMN: Editorial Headline & Technical Feature Narrative */}
      <div
        style={{
          maxWidth: 'clamp(340px, 44vw, 560px)',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 6,
        }}
      >
        {/* Atmospheric Technical Crosshair & Section Marker */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            marginBottom: 12,
          }}
        >
          {/* Technical Crosshair */}
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ opacity: 0.4 }}>
            <line x1="6" y1="0" x2="6" y2="12" stroke="#FF8A1A" strokeWidth="1" />
            <line x1="0" y1="6" x2="12" y2="6" stroke="#FF8A1A" strokeWidth="1" />
          </svg>

          <span
            style={{
              fontSize: 10,
              fontWeight: 800,
              letterSpacing: '2.4px',
              color: '#FF8A1A',
              textTransform: 'uppercase',
            }}
          >
            {detail?.sectionNumber || '01 / PERFORMANCE'}
          </span>

          <span
            style={{
              fontSize: 9,
              fontWeight: 600,
              letterSpacing: '1.5px',
              color: '#6B635A',
              textTransform: 'uppercase',
            }}
          >
            {detail?.badge || 'KES INDUSTRIAL STANDARD'}
          </span>
        </div>

        {/* Large Technical Headline (Warm White with Subdued Tone) */}
        <h2
          style={{
            margin: 0,
            fontSize: 'clamp(28px, 3.4vw, 46px)',
            fontWeight: 900,
            letterSpacing: '-0.8px',
            color: '#F5EFEB',
            fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif",
            lineHeight: 1.1,
            marginBottom: 16,
          }}
        >
          {detail?.headline || 'ENGINEERED TO PERFORM.'}
        </h2>

        {/* Premium Editorial Lead Copy */}
        <p
          style={{
            margin: 0,
            fontSize: 'clamp(13px, 1.15vw, 15px)',
            lineHeight: 1.6,
            color: '#A3998D',
            fontWeight: 400,
            marginBottom: 'clamp(24px, 4vh, 40px)',
            maxWidth: 480,
          }}
        >
          {detail?.lead ||
            'Built for demanding applications where power, reliability and control matter. Manufactured under strict Japanese Komatsu KES standards with high-alloy forged steel components.'}
        </p>

        {/* Technical Features: Pure Editorial Typography (NO cards, NO boxes) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(18px, 2.5vh, 28px)' }}>
          {features.map((feat, idx) => {
            // Progressive appearance thresholds as user scrolls deeper
            const threshold = 0.48 + idx * 0.11;
            const featProgress = Math.min(Math.max((scrollProgress - threshold) / 0.12, 0), 1);
            const isFeatVisible = featProgress > 0.05 || reducedMotion;

            return (
              <div
                key={feat.id}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 16,
                  opacity: reducedMotion ? 1 : featProgress,
                  transform: reducedMotion
                    ? 'none'
                    : `translateY(${(14 * (1 - featProgress)).toFixed(1)}px)`,
                  transition: 'opacity 0.25s ease-out',
                }}
              >
                {/* Thin Technical Number & Accent Indicator */}
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    paddingTop: 3,
                    minWidth: 26,
                  }}
                >
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 800,
                      letterSpacing: '1.5px',
                      color: featProgress > 0.8 ? '#FF8A1A' : '#7C7368',
                      transition: 'color 0.3s ease',
                    }}
                  >
                    {feat.number}
                  </span>
                  {/* Fine technical vertical connector tick */}
                  <div
                    style={{
                      width: 1,
                      height: 18,
                      backgroundColor: 'rgba(255, 138, 26, 0.25)',
                      marginTop: 4,
                    }}
                  />
                </div>

                {/* Feature Content */}
                <div style={{ maxWidth: 440 }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'baseline',
                      gap: 8,
                      marginBottom: 3,
                    }}
                  >
                    <h3
                      style={{
                        margin: 0,
                        fontSize: 'clamp(12px, 1.1vw, 13px)',
                        fontWeight: 800,
                        letterSpacing: '1.2px',
                        color: '#E8E2DA',
                        textTransform: 'uppercase',
                        fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif",
                      }}
                    >
                      {feat.title}
                    </h3>
                    {feat.spec && (
                      <span
                        style={{
                          fontSize: 9,
                          fontWeight: 700,
                          letterSpacing: '1px',
                          color: '#FF8A1A',
                          textTransform: 'uppercase',
                        }}
                      >
                        // {feat.spec}
                      </span>
                    )}
                  </div>
                  <p
                    style={{
                      margin: 0,
                      fontSize: 'clamp(11px, 0.95vw, 12px)',
                      lineHeight: 1.55,
                      color: '#82786D',
                      fontWeight: 400,
                    }}
                  >
                    {feat.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Atmospheric Micro Technical Coordinates (Top Right / Bottom Right accents) */}
      <div
        style={{
          position: 'absolute',
          top: 36,
          right: 'clamp(24px, 5vw, 90px)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          gap: 4,
          opacity: 0.35,
          fontFamily: 'monospace',
          fontSize: 9,
          color: '#A89E92',
          letterSpacing: '1.5px',
        }}
      >
        <span>CAM: [CLOSE-UP // 32° FOV]</span>
        <span>ORIENTATION: KES-TRIANGULAR</span>
      </div>
    </div>
  );
}
