import React, { useEffect } from 'react';
import { CHARACTERS } from '../../config/characters';
import { soundEngine } from '../../engine/SoundEngine';
import { SpritePreview } from '../SpritePreview';

interface MainMenuProps {
  audioUnlocked: boolean;
  muted: boolean;
  modalOpen?: boolean;
  onUnlockAudio: () => void;
  onToggleMute: () => void;
  onPlay: () => void;
  onTraining: () => void;
  onCharacterSelect: () => void;
  onStageSelect: () => void;
  onControls: () => void;
  onSettings: () => void;
  onCredits: () => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({
  audioUnlocked,
  muted,
  modalOpen = false,
  onUnlockAudio,
  onToggleMute,
  onPlay,
  onTraining,
  onCharacterSelect,
  onStageSelect,
  onControls,
  onSettings,
  onCredits,
}) => {
  const trigger = (fn: () => void, confirm = false) => {
    onUnlockAudio();
    if (confirm) soundEngine.playUiConfirm();
    else soundEngine.playUiSelect();
    fn();
  };

  // Classic arcade Enter / Space start handshake when no modal is blocking
  useEffect(() => {
    if (modalOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Enter' || e.code === 'Space') {
        const tag = (e.target as HTMLElement | null)?.tagName;
        if (tag === 'BUTTON' || tag === 'INPUT' || tag === 'SELECT') return;
        e.preventDefault();
        onUnlockAudio();
        soundEngine.playUiConfirm();
        onPlay();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [modalOpen, onPlay, onUnlockAudio]);

  return (
    <div className="absolute inset-0 z-20 flex flex-col justify-between p-3 sm:p-5 md:p-7 bg-gradient-to-b from-[#090605]/86 via-[#090605]/42 to-[#090605]/94">
      {/* Top Arcade Cabinet Status Strip */}
      <div className="flex items-center justify-between gap-2 border-b-2 border-[#4a3624] pb-2">
        <div className="flex items-center gap-3">
          <span className="bg-[#f5a623] text-[#090605] px-2 py-0.5 font-pixel text-[9px] sm:text-[10px] tracking-wider border-2 border-[#090605]">
            1P / 2P
          </span>
          <span className="font-pixel-ui text-[10px] sm:text-xs uppercase tracking-[0.18em] text-[#ffd873] hud-text-stroke-sm">
            CREDIT 09 · VER 3.0
          </span>
        </div>

        <button
          type="button"
          onClick={() => {
            if (!audioUnlocked) onUnlockAudio();
            onToggleMute();
          }}
          aria-label={muted ? 'Unmute game audio' : 'Mute game audio'}
          className="arcade-btn-secondary px-2.5 py-1 flex items-center gap-2 font-pixel-ui text-[10px] sm:text-xs font-bold uppercase tracking-wider cursor-pointer"
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <rect x="2" y="6" width="3" height="4" fill="currentColor" />
            <path d="M5 6L9 3V13L5 10V6Z" fill="currentColor" />
            {muted ? (
              <path d="M11 5L15 11M15 5L11 11" stroke="#e03126" strokeWidth="2" />
            ) : (
              <>
                <rect x="11" y="6" width="1.5" height="4" fill="#f5a623" />
                <rect x="13.5" y="4" width="1.5" height="8" fill="#f5a623" />
              </>
            )}
          </svg>
          <span>{muted ? 'SFX OFF' : audioUnlocked ? 'SFX ON' : 'SOUND'}</span>
        </button>
      </div>

      {/* Center Hero Arcade Logo & Command Menu */}
      <div className="flex flex-col items-center text-center my-auto py-1">
        {/* Chunky 16-Bit Pixel Arcade Emblem */}
        <div className="w-full max-w-[660px] px-1">
          <div className="inline-flex items-center gap-2 mb-1.5">
            <span className="w-6 sm:w-10 h-1 bg-[#f5a623] border border-[#090605]" />
            <span className="font-pixel-ui text-[9px] sm:text-[11px] uppercase tracking-[0.26em] text-[#ffe38f] hud-text-stroke-sm">
              1994 ARCADE EDITION
            </span>
            <span className="w-6 sm:w-10 h-1 bg-[#f5a623] border border-[#090605]" />
          </div>

          <h1 className="sr-only">FAMILY FIGHTERS</h1>
          <svg
            viewBox="0 0 760 154"
            className="w-full h-auto"
            role="img"
            aria-label="FAMILY FIGHTERS"
          >
            <defs>
              <linearGradient id="ffPixelGold" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#fff6cc" />
                <stop offset="35%" stopColor="#ffc947" />
                <stop offset="68%" stopColor="#f5a623" />
                <stop offset="100%" stopColor="#b04e05" />
              </linearGradient>
              <linearGradient id="ffPixelRed" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ff9b8a" />
                <stop offset="45%" stopColor="#e03126" />
                <stop offset="100%" stopColor="#7a0f0a" />
              </linearGradient>
            </defs>
            {/* Pixel stepped arcade plate rule */}
            <rect x="64" y="6" width="632" height="5" fill="#090605" />
            <rect x="68" y="8" width="624" height="3" fill="#f5b324" />

            {/* Hard pixel drop shadow + brass block typography */}
            <text
              x="386"
              y="76"
              textAnchor="middle"
              fontFamily="'Press Start 2P', monospace"
              fontSize="58"
              letterSpacing="6"
              fill="#090605"
            >
              FAMILY
            </text>
            <text
              x="380"
              y="70"
              textAnchor="middle"
              fontFamily="'Press Start 2P', monospace"
              fontSize="58"
              letterSpacing="6"
              fill="url(#ffPixelGold)"
              stroke="#090605"
              strokeWidth="9"
              paintOrder="stroke fill"
            >
              FAMILY
            </text>

            <text
              x="386"
              y="138"
              textAnchor="middle"
              fontFamily="'Press Start 2P', monospace"
              fontSize="48"
              letterSpacing="8"
              fill="#090605"
            >
              FIGHTERS
            </text>
            <text
              x="380"
              y="132"
              textAnchor="middle"
              fontFamily="'Press Start 2P', monospace"
              fontSize="48"
              letterSpacing="8"
              fill="url(#ffPixelRed)"
              stroke="#090605"
              strokeWidth="8"
              paintOrder="stroke fill"
            >
              FIGHTERS
            </text>

            <rect x="104" y="146" width="552" height="5" fill="#090605" />
            <rect x="108" y="148" width="544" height="3" fill="#e03126" />
          </svg>
        </div>

        {/* Blinking Classic Arcade Prompt */}
        <p className="animate-arcade-blink font-pixel text-[10px] sm:text-xs text-[#ffe38f] tracking-[0.2em] uppercase mt-1.5 hud-text-stroke-sm">
          PRESS START · SELECT MODE
        </p>

        {/* Primary Arcade Command Stack */}
        <div className="mt-3 sm:mt-4 flex flex-col items-center gap-2.5 w-full max-w-[620px]">
          <div className="grid grid-cols-2 gap-3 w-full">
            <button
              type="button"
              data-start="true"
              onClick={() => trigger(onPlay, true)}
              onMouseEnter={() => soundEngine.playUiHover()}
              className="arcade-btn-primary py-2.5 sm:py-3 px-4 font-pixel text-xs sm:text-sm md:text-base uppercase tracking-wider whitespace-nowrap cursor-pointer"
            >
              PLAY ARCADE
            </button>
            <button
              type="button"
              onClick={() => trigger(onTraining, true)}
              onMouseEnter={() => soundEngine.playUiHover()}
              className="arcade-btn-secondary py-2.5 sm:py-3 px-4 font-pixel text-xs sm:text-sm md:text-base uppercase tracking-wider text-[#ffd873] border-[#c68a2b] whitespace-nowrap cursor-pointer"
            >
              TRAINING
            </button>
          </div>

          <div className="grid grid-cols-5 gap-1.5 sm:gap-2 w-full">
            <button
              type="button"
              onClick={() => trigger(onCharacterSelect)}
              onMouseEnter={() => soundEngine.playUiHover()}
              className="arcade-btn-secondary py-1.5 sm:py-2 px-1 font-pixel-ui text-[9px] sm:text-[11px] font-bold uppercase tracking-normal whitespace-nowrap cursor-pointer"
            >
              Fighters
            </button>
            <button
              type="button"
              onClick={() => trigger(onStageSelect)}
              onMouseEnter={() => soundEngine.playUiHover()}
              className="arcade-btn-secondary py-1.5 sm:py-2 px-1 font-pixel-ui text-[9px] sm:text-[11px] font-bold uppercase tracking-normal whitespace-nowrap cursor-pointer"
            >
              Stages
            </button>
            <button
              type="button"
              onClick={() => trigger(onControls)}
              onMouseEnter={() => soundEngine.playUiHover()}
              className="arcade-btn-secondary py-1.5 sm:py-2 px-1 font-pixel-ui text-[9px] sm:text-[11px] font-bold uppercase tracking-normal whitespace-nowrap cursor-pointer"
            >
              Controls
            </button>
            <button
              type="button"
              onClick={() => trigger(onSettings)}
              onMouseEnter={() => soundEngine.playUiHover()}
              className="arcade-btn-secondary py-1.5 sm:py-2 px-1 font-pixel-ui text-[9px] sm:text-[11px] font-bold uppercase tracking-normal whitespace-nowrap cursor-pointer"
            >
              Settings
            </button>
            <button
              type="button"
              onClick={() => trigger(onCredits)}
              onMouseEnter={() => soundEngine.playUiHover()}
              className="arcade-btn-secondary py-1.5 sm:py-2 px-1 font-pixel-ui text-[9px] sm:text-[11px] font-bold uppercase tracking-normal whitespace-nowrap cursor-pointer"
            >
              Credits
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Live Animated Roster Lineup (100% Original Pixel-Art Sprites) */}
      <div className="pt-1 border-t-2 border-[#4a3624]">
        <div className="flex items-end justify-center gap-4 sm:gap-8 md:gap-12">
          {CHARACTERS.map((char, idx) => (
            <div key={char.id} className="flex flex-col items-center">
              <SpritePreview
                sheetUrl={char.idleSheetUrl}
                frames={char.idleFrames}
                fps={9}
                flipX={idx >= 2}
                ariaLabel={`${char.name} animated idle stance`}
                className="w-14 h-14 sm:w-20 sm:h-20 md:w-24 md:h-24 -mb-1.5 object-contain"
              />
              <span
                className="font-pixel text-[8px] sm:text-[10px] uppercase tracking-wider hud-text-stroke-sm"
                style={{ color: char.accentColor }}
              >
                {char.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
