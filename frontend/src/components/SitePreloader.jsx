import React, { useEffect, useState, useRef } from 'react';

/**
 * SitePreloader Component
 * 
 * Cinematic 3-4 second website loading animation featuring the official DISD logo.
 * During this duration, the 3D model loads in the background so that upon completion,
 * the 3D model is directly rendered and visible with no intermediate loading screens.
 */
export default function SitePreloader({ isModelLoaded = false, onStartExit, onComplete }) {
  const [isExiting, setIsExiting] = useState(false);
  
  const fillBarRef = useRef(null);
  const percentRef = useRef(null);
  const statusRef = useRef(null);
  const startTimeRef = useRef(Date.now());
  const MIN_DURATION = 3400; // 3.4 seconds (within 3-4s window)
  const MAX_WAIT = 5500; // Safety timeout to prevent permanent blocking

  useEffect(() => {
    // Lock body scroll during preloader
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    let animId;
    const updateProgress = () => {
      const elapsed = Date.now() - startTimeRef.current;
      const timeRatio = Math.min(elapsed / MIN_DURATION, 1);

      // Status text updates based on progress
      let currentLabel = 'INITIALIZING SYSTEMS...';
      if (timeRatio < 0.25) {
        currentLabel = 'INITIALIZING SYSTEMS...';
      } else if (timeRatio < 0.65) {
        currentLabel = 'LOADING 3D MACHINERY STUDIO...';
      } else if (timeRatio < 0.92) {
        currentLabel = 'CALIBRATING HYDRAULIC GEOMETRY...';
      } else {
        currentLabel = isModelLoaded ? 'SYSTEM READY' : 'FINALIZING 3D ENVIRONMENT...';
      }

      if (statusRef.current && statusRef.current.textContent !== currentLabel) {
        statusRef.current.textContent = currentLabel;
      }

      // Calculate displayed progress
      if (timeRatio < 1) {
        // Smooth easing curve
        const eased = 1 - Math.pow(1 - timeRatio, 2.5);
        const currentProgress = Math.min(Math.round(eased * 94), 94);
        if (fillBarRef.current) fillBarRef.current.style.width = `${currentProgress}%`;
        if (percentRef.current) percentRef.current.textContent = `${currentProgress}%`;
        animId = requestAnimationFrame(updateProgress);
      } else {
        // Time has hit minimum duration (3.4s)
        const isSafeToComplete = isModelLoaded || elapsed >= MAX_WAIT;
        if (isSafeToComplete) {
          if (fillBarRef.current) fillBarRef.current.style.width = '100%';
          if (percentRef.current) percentRef.current.textContent = '100%';
          if (statusRef.current) statusRef.current.textContent = 'SYSTEM READY';

          // Brief pause at 100% before smooth fade exit
          setTimeout(() => {
            setIsExiting(true);
            if (onStartExit) onStartExit();
            setTimeout(() => {
              document.body.style.overflow = originalOverflow;
              if (onComplete) onComplete();
            }, 600); // match exit transition duration
          }, 180);
        } else {
          // Model still loading on slower connection; hold smoothly at 97%
          if (fillBarRef.current) fillBarRef.current.style.width = '97%';
          if (percentRef.current) percentRef.current.textContent = '97%';
          animId = requestAnimationFrame(updateProgress);
        }
      }
    };

    animId = requestAnimationFrame(updateProgress);

    return () => {
      cancelAnimationFrame(animId);
      document.body.style.overflow = originalOverflow;
    };
  }, [isModelLoaded, onStartExit, onComplete]);

  return (
    <div
      id="site-preloader"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        backgroundColor: '#181714',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: isExiting ? 0 : 1,
        transform: isExiting ? 'scale(1.02)' : 'scale(1)',
        pointerEvents: isExiting ? 'none' : 'all',
        transition: 'opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1), transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
        userSelect: 'none',
        willChange: 'opacity, transform',
        transformOrigin: 'center center',
      }}
    >
      {/* Ambient background glow */}
      <div
        style={{
          position: 'absolute',
          width: 'min(500px, 90vw)',
          height: 'min(500px, 90vw)',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255, 138, 26, 0.16) 0%, rgba(255, 138, 26, 0.04) 45%, transparent 70%)',
          pointerEvents: 'none',
          animation: 'preloaderPulse 3s ease-in-out infinite',
        }}
      />

      {/* Center content */}
      <div
        style={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '28px',
          zIndex: 2,
        }}
      >
        {/* DISD Brand Logo */}
        <div
          style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <img
            src="https://res.cloudinary.com/nol4eyyl/image/upload/v1788845151/disd_assets/loader_logo.png"
            alt="DISD"
            style={{
              width: 'clamp(200px, 28vw, 320px)',
              height: 'auto',
              display: 'block',
              filter: 'drop-shadow(0 0 25px rgba(255, 138, 26, 0.35))',
              animation: 'logoBreath 3.2s ease-in-out infinite',
            }}
          />
        </div>

        {/* Progress Bar & Telemetry container */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '12px',
            width: 'clamp(220px, 28vw, 300px)',
          }}
        >
          {/* Neon track & fill */}
          <div
            style={{
              width: '100%',
              height: '3.5px',
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
              borderRadius: '9999px',
              overflow: 'hidden',
              position: 'relative',
              boxShadow: 'inset 0 1px 2px rgba(0, 0, 0, 0.5)',
            }}
          >
            <div
              ref={fillBarRef}
              style={{
                width: '0%',
                height: '100%',
                background: 'linear-gradient(90deg, #FF8A1A 0%, #FFA238 100%)',
                boxShadow: '0 0 12px #FF8A1A, 0 0 24px rgba(255, 138, 26, 0.6)',
                borderRadius: '9999px',
                transition: 'width 0.14s linear',
              }}
            />
          </div>

          {/* Telemetry info row */}
          <div
            style={{
              width: '100%',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif",
              fontSize: '11px',
              fontWeight: 600,
              letterSpacing: '1.2px',
            }}
          >
            <span
              ref={statusRef}
              style={{
                color: '#8A8275',
                textTransform: 'uppercase',
                transition: 'color 0.3s ease',
              }}
            >
              INITIALIZING SYSTEMS...
            </span>
            <span
              ref={percentRef}
              style={{
                color: '#FF8A1A',
                fontWeight: 700,
                fontVariantNumeric: 'tabular-nums',
                marginLeft: '12px',
              }}
            >
              0%
            </span>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes preloaderPulse {
          0%, 100% {
            transform: scale(0.96);
            opacity: 0.65;
          }
          50% {
            transform: scale(1.08);
            opacity: 1;
          }
        }
        @keyframes logoBreath {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.025);
          }
        }
        @keyframes preloaderShimmer {
          0% {
            background-position: 200% 0;
          }
          100% {
            background-position: -200% 0;
          }
        }
      `}</style>
    </div>
  );
}
