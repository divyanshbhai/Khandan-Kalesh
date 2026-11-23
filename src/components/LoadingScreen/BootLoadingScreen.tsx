import React, { useEffect, useState } from 'react';
import { LoadProgress } from '../../assets/assetManifest';
import { SpritePreview } from '../SpritePreview';

interface BootLoadingScreenProps {
  progress: LoadProgress;
  failedAssets: string[];
  onRetry?: () => void;
}

const LOADING_TIPS = [
  'Learn your character’s moves in Training or the Roster Move List.',
  'Watch your opponent’s distance — spacing wins neutral exchanges.',
  'Block high against jump-ins and crouch-block against low sweeps.',
  'Save your 100% Super Meter for a decisive Ultimate finish.',
  'Hold the key to House No. 39 by winning Arcade or Tournament Mode.',
];

export const BootLoadingScreen: React.FC<BootLoadingScreenProps> = ({
  progress,
  failedAssets,
  onRetry,
}) => {
  const [tipIndex, setTipIndex] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => {
      setTipIndex((i) => (i + 1) % LOADING_TIPS.length);
    }, 2400);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div
      className="absolute inset-0 z-40 flex flex-col items-center justify-between p-3 sm:p-5 bg-[#090609] overflow-hidden"
      data-testid="boot-loading-screen"
    >
      {/* Original Stage Backdrop (Proportional, zero distortion) */}
      <img
        src="/assets/stages/stage_01.png"
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 w-full h-full object-cover opacity-28 pixelated"
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#090609]/85 via-[#151020]/60 to-[#090609]/95" />

      {/* Top Tagline Bar */}
      <div className="relative z-10 w-full flex items-center justify-between border-b-2 border-[#4a3624] pb-1.5">
        <span className="font-pixel-ui text-[9px] sm:text-[11px] uppercase tracking-[0.2em] text-[#ffc947]">
          39 BHARAT NAGAR · VER 1.0
        </span>
        <span className="font-pixel-ui text-[9px] sm:text-[11px] uppercase tracking-[0.18em] text-[#b8a391]">
          ONE HOUSE. SEVEN CLAIMS.
        </span>
      </div>

      {/* Center Crest + Live Walking Fighter */}
      <div className="relative z-10 flex flex-col items-center justify-center my-auto gap-2 sm:gap-3 w-full max-w-xl">
        <div className="flex items-center justify-center gap-4 sm:gap-8">
          <SpritePreview
            sheetUrl="/assets/characters/rahul/rahul_02_walk_forward_6f.png"
            frames={6}
            fps={10}
            ariaLabel="Rahul walking animation"
            className="w-16 h-16 sm:w-24 sm:h-24 object-contain"
          />
          <img
            src="/assets/brand/logo-39-bharat-nagar.png"
            alt="39 Bharat Nagar Official Logo"
            className="w-24 h-24 sm:w-36 sm:h-36 object-contain pixelated drop-shadow-[0_6px_0_#090609]"
          />
          <SpritePreview
            sheetUrl="/assets/characters/sagar/sagar_02_walk_forward_6f.png"
            frames={6}
            fps={10}
            flipX={true}
            ariaLabel="Sagar walking animation"
            className="w-16 h-16 sm:w-24 sm:h-24 object-contain"
          />
        </div>

        {/* Pixel Loading Bar */}
        <div className="w-full max-w-md arcade-panel-brass p-3">
          <div className="flex items-center justify-between font-pixel-ui text-[9px] sm:text-[10px] uppercase text-[#ebd8b7] mb-1.5">
            <span>LOADING ARCADE ASSETS</span>
            <span className="text-[#ffc947]">
              {progress.loaded}/{progress.total} ({progress.percent}%)
            </span>
          </div>
          <div className="relative h-4 w-full bg-[#0e0a12] border-2 border-[#755b42] p-0.5 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#d96b14] via-[#f5a623] to-[#ffe38f] transition-all duration-100"
              style={{ width: `${Math.max(8, progress.percent)}%` }}
            />
            <div className="pointer-events-none absolute inset-0 pixel-bar-ticks" />
          </div>

          {failedAssets.length > 0 && (
            <div className="mt-2 bg-[#2b0f12] border border-[#e03126] p-2 flex items-center justify-between gap-2">
              <span className="font-pixel-ui text-[9px] text-[#ff9b8a] truncate">
                ASSET LOAD WARNING ({failedAssets.length} failed)
              </span>
              {onRetry && (
                <button
                  type="button"
                  onClick={onRetry}
                  className="arcade-btn-secondary px-2 py-0.5 font-pixel-ui text-[9px] uppercase cursor-pointer shrink-0"
                >
                  RETRY
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Tip Strip */}
      <div className="relative z-10 w-full text-center border-t-2 border-[#4a3624] pt-1.5">
        <p className="font-pixel-ui text-[9px] sm:text-[11px] uppercase tracking-wider text-[#ebd8b7]">
          <span className="text-[#ffc947] mr-2">TIP:</span>
          {LOADING_TIPS[tipIndex]}
        </p>
      </div>
    </div>
  );
};
