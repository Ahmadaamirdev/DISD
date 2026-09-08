import React, { useRef, useState } from 'react';
import { Play, Pause, RotateCcw, Zap, Activity, HardHat, Compass } from 'lucide-react';

export default function VideoShowcase() {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const restartVideo = () => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = 0;
    videoRef.current.play();
    setIsPlaying(true);
  };

  return (
    <section id="video-showcase" className="section-padding video-showcase-section">
      <div className="container">
        {/* Section Header */}
        <div className="section-header">
          <span className="badge-tag">
            <HardHat size={14} className="text-amber" />
            FIELD PERFORMANCE VERIFICATION
          </span>
          <h2 className="section-title">
            Witness High-Impact <span>Hydraulic Kinetic Energy</span>
          </h2>
          <p className="section-subtitle">
            Direct high-speed video capture of DISD heavy chisel demolition impact against reinforced volcanic bedrock.
          </p>
        </div>

        {/* Video Cinema Showcase Frame */}
        <div className="showcase-cinema-box glass-card">
          <div className="cinema-media-viewport">
            <video
              ref={videoRef}
              className="showcase-video-elem"
              src="/videos/hero_video.mp4"
              loop
              playsInline
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
            />

            {/* Custom Control Overlay */}
            {!isPlaying && (
              <div className="cinema-play-overlay" onClick={togglePlay}>
                <button className="cinema-play-btn" aria-label="Play field test video">
                  <Play size={32} />
                </button>
                <span className="cinema-play-caption">Click to Watch Full Breaker Impact Test</span>
              </div>
            )}
          </div>

          {/* Under-Video Technical Telemetry Ribbon */}
          <div className="cinema-control-bar">
            <div className="cinema-btn-actions">
              <button className="cinema-mini-btn" onClick={togglePlay}>
                {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                <span>{isPlaying ? 'Pause Demo' : 'Play Demo'}</span>
              </button>
              <button className="cinema-mini-btn" onClick={restartVideo}>
                <RotateCcw size={16} />
                <span>Restart</span>
              </button>
            </div>

            <div className="cinema-badges-row">
              <div className="cinema-badge-item">
                <span className="dot-pulse"></span>
                <span>Chisel Strike Load: <strong>14,800 Joules</strong></span>
              </div>
              <div className="cinema-badge-item">
                <span>Anti-Blank Firing: <strong>Active</strong></span>
              </div>
              <div className="cinema-badge-item">
                <span>Hydraulic Back-Pressure: <strong>&lt; 15 Bar</strong></span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
