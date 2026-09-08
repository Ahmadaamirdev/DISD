import React from 'react';
import Hero3DStudio from './Hero3DStudio.jsx';

/**
 * Continuous Cinematic Hero & Product Detail Section Wrapper
 * 
 * Creates a seamless 240vh scroll track hosting a single, continuous Three.js canvas.
 * Transitions smoothly from:
 * HERO (0 - 40% scroll)
 * ↓
 * CINEMATIC CAMERA APPROACH & SHIFT (40% - 60% scroll)
 * ↓
 * PRODUCT DETAIL & ENGINEERING STORY (60% - 100% scroll)
 */
export default function Hero({ onOpenQuoteModal, onModelLoaded, isSiteReady }) {
  return (
    <section 
      id="hero-experience"
      className="disd-hero-cinematic" 
      style={{ 
        position: 'relative', 
        width: '100%', 
        backgroundColor: '#211F1C',
        contain: 'paint',
        transform: 'translateZ(0)',
      }}
    >
      <Hero3DStudio 
        onOpenQuoteModal={onOpenQuoteModal} 
        onModelLoaded={onModelLoaded}
        isSiteReady={isSiteReady}
      />
    </section>
  );
}
