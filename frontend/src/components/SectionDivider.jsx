import React from 'react';

export default function SectionDivider({ style }) {
  return (
    <div className="disd-section-divider-wrap" style={style} aria-hidden="true">
      <div className="disd-container">
        <div className="disd-section-divider">
          {/* Base track line */}
          <div className="disd-divider-line">
            {/* Animated glowing beam passing across */}
            <div className="disd-divider-beam" />
          </div>
        </div>
      </div>
    </div>
  );
}
