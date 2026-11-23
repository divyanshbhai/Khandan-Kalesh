import React from 'react';
import { CrtMode } from '../../config/game';

interface CRTOverlayProps {
  mode: CrtMode;
  curvature: boolean;
}

/**
 * Purely visual optional 1990s Retro Arcade CRT presentation layer.
 * - Strictly pointer-events-none so it NEVER interferes with touch controls or clicks.
 * - Default mode is 'off' so gameplay stays razor-sharp unless enabled by the player.
 */
export const CRTOverlay: React.FC<CRTOverlayProps> = ({ mode, curvature }) => {
  if (mode === 'off') return null;

  const isArcade = mode === 'arcade';

  return (
    <div
      data-testid="crt-overlay"
      data-crt-mode={mode}
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 z-60 overflow-hidden ${
        curvature ? 'crt-curvature-frame' : ''
      }`}
    >
      {/* Scanlines + subtle RGB phosphor aperture grille in arcade mode */}
      <div
        className={`absolute inset-0 ${
          isArcade ? 'crt-scanlines-arcade' : 'crt-scanlines-subtle'
        }`}
      />
      {/* Gentle edge vignette simulating curved CRT glass */}
      <div
        className={`absolute inset-0 ${
          isArcade ? 'crt-vignette-arcade' : 'crt-vignette-subtle'
        }`}
      />
      {/* Subtle top-edge specular CRT glass sheen */}
      {isArcade && (
        <div
          className="absolute inset-x-0 top-0 h-10 opacity-15"
          style={{
            background:
              'linear-gradient(180deg, rgba(255, 245, 224, 0.45) 0%, rgba(255, 245, 224, 0) 100%)',
          }}
        />
      )}
    </div>
  );
};
