import React, { useEffect, useState } from 'react';
import { getPlayableRegistryEntries } from '../../config/characterRegistry';
import { soundEngine } from '../../engine/SoundEngine';
import { SpritePreview } from '../SpritePreview';

interface MainMenuProps {
  audioUnlocked: boolean;
  muted: boolean;
  modalOpen?: boolean;
  highScore?: number;
  isOnline: boolean;
  isInstalled: boolean;
  onUnlockAudio: () => void;
  onToggleMute: () => void;
  onArcadeMode: () => void;
  onTournamentMode: () => void;
  onLocalMultiplayer: () => void;
  onStory: () => void;
  onRoster: () => void;
  onTraining: () => void;
  onSettings: () => void;
  onCredits: () => void;
  onInstallClick: () => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({
  audioUnlocked,
  muted,
  modalOpen = false,
  highScore = 0,
  isOnline,
  isInstalled,
  onUnlockAudio,
  onToggleMute,
  onArcadeMode,
  onTournamentMode,
  onLocalMultiplayer,
  onStory,
  onRoster,
  onTraining,
  onSettings,
  onCredits,
  onInstallClick,
}) => {
  const playable = getPlayableRegistryEntries();
  const [featuredIndex, setFeaturedIndex] = useState(0);

  // Subtle living stance variation cycling every 4.5s (one fighter subtly cheers/stances)
  useEffect(() => {
    const id = window.setInterval(() => {
      setFeaturedIndex((i) => (i + 1) % playable.length);
    }, 4500);
    return () => window.clearInterval(id);
  }, [playable.length]);

  const trigger = (fn: () => void, confirm = false) => {
    onUnlockAudio();
    if (confirm) soundEngine.playUiConfirm();
    else soundEngine.playUiSelect();
    fn();
  };

  useEffect(() => {
    if (modalOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Enter' || e.code === 'Space') {
        const tag = (e.target as HTMLElement | null)?.tagName;
        if (tag === 'BUTTON' || tag === 'INPUT' || tag === 'SELECT') return;
        e.preventDefault();
        onUnlockAudio();
        soundEngine.playUiConfirm();
        onArcadeMode();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [modalOpen, onArcadeMode, onUnlockAudio]);

  return (
    <div
      className="absolute inset-0 z-20 flex flex-col justify-between px-3 sm:px-5 md:px-7 py-2 sm:py-3.5 bg-gradient-to-b from-[#090609]/88 via-[#151020]/45 to-[#090609]/96 overflow-hidden"
      data-testid="main-menu-screen"
    >
      {/* Top Arcade Marquee Bar */}
      <div className="flex items-center justify-between gap-2 border-b-2 border-[#594635] pb-1.5">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <span className="bg-[#f5a623] text-[#090609] px-2 py-0.5 font-pixel text-[8px] sm:text-[9px] tracking-wider border-2 border-[#090609] shrink-0">
            HOUSE NO. 39
          </span>
          <span className="font-pixel-ui text-[9px] sm:text-xs uppercase tracking-[0.16em] text-[#ffd873] hud-text-stroke-sm truncate">
            HI-SCORE {String(highScore).padStart(6, '0')}
          </span>
          {!isOnline && (
            <span className="px-1.5 py-0.5 bg-[#2b1a0c] border border-[#f5a623] font-pixel-ui text-[8px] uppercase text-[#ffc947] shrink-0">
              OFFLINE READY
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {!isInstalled && (
            <button
              type="button"
              onClick={() => trigger(onInstallClick, true)}
              className="arcade-btn-secondary px-2 sm:px-2.5 py-1 font-pixel-ui text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-[#ffc947] border-[#c68a2b] cursor-pointer whitespace-nowrap"
            >
              INSTALL GAME
            </button>
          )}
          <button
            type="button"
            onClick={() => {
              if (!audioUnlocked) onUnlockAudio();
              onToggleMute();
            }}
            aria-label={muted ? 'Unmute game audio' : 'Mute game audio'}
            className="arcade-btn-secondary px-2 sm:px-2.5 py-1 flex items-center gap-1.5 font-pixel-ui text-[9px] sm:text-[10px] font-bold uppercase tracking-wider cursor-pointer whitespace-nowrap"
          >
            <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden="true">
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
            <span>{muted ? 'MUTED' : audioUnlocked ? 'SOUND ON' : 'SOUND'}</span>
          </button>
        </div>
      </div>

      {/* Main Split Composition: Living Fighters flanking Official Logo & Arcade Command Menu */}
      <div className="flex-1 grid grid-cols-12 items-center gap-2 sm:gap-4 min-h-0 py-1">
        {/* Left Living Fighters (Rahul & Sagar) */}
        <div className="hidden sm:flex col-span-3 items-end justify-around h-full pb-2 pointer-events-none">
          {playable.slice(0, 2).map((entry, idx) => {
            const isActivePose = featuredIndex === idx;
            const scale = entry.renderCalibration.menuScaleMultiplier;
            return (
              <div key={entry.id} className="flex flex-col items-center">
                <div style={{ transform: `scale(${scale})` }} className="origin-bottom">
                  <SpritePreview
                    sheetUrl={isActivePose ? entry.profile.victorySheetUrl : entry.profile.idleSheetUrl}
                    frames={isActivePose ? entry.profile.victoryFrames : entry.profile.idleFrames}
                    fps={9}
                    ariaLabel={`${entry.displayName} animated fighter`}
                    className="w-24 h-24 md:w-32 md:h-32 lg:w-40 lg:h-40 object-contain"
                  />
                </div>
                <span
                  className="mt-0.5 px-1.5 py-0.5 bg-[#090609]/85 border border-[#4a3624] font-pixel text-[7px] md:text-[9px] uppercase hud-text-stroke-sm"
                  style={{ color: entry.accentColor }}
                >
                  {entry.displayName}
                </span>
              </div>
            );
          })}
        </div>

        {/* Center Official Logo + Primary 4-Mode Arcade Navigation */}
        <div className="col-span-12 sm:col-span-6 flex flex-col items-center justify-center text-center min-h-0">
          <div className="flex items-center justify-center gap-3">
            {/* Compact Mobile Left Fighter */}
            <div className="sm:hidden pointer-events-none">
              <SpritePreview
                sheetUrl={playable[0].profile.idleSheetUrl}
                frames={playable[0].profile.idleFrames}
                fps={9}
                ariaLabel="Rahul animated idle"
                className="w-14 h-14 object-contain"
              />
            </div>

            <div className="flex flex-col items-center">
              <h1 className="sr-only">39 BHARAT NAGAR — ONE HOUSE. SEVEN CLAIMS.</h1>
              <img
                src="/assets/brand/logo-39-bharat-nagar.png"
                alt="39 Bharat Nagar Official Logo"
                className="w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 lg:w-44 lg:h-44 object-contain pixelated drop-shadow-[0_6px_0_#090609]"
              />
              <p className="mt-1 px-2.5 py-0.5 bg-[#0d0912]/90 border border-[#755b42] font-pixel text-[8px] sm:text-[10px] md:text-xs text-[#ffc947] tracking-[0.18em] uppercase hud-text-stroke-sm">
                ONE HOUSE. SEVEN CLAIMS.
              </p>
            </div>

            {/* Compact Mobile Right Fighter */}
            <div className="sm:hidden pointer-events-none">
              <SpritePreview
                sheetUrl={playable[1].profile.idleSheetUrl}
                frames={playable[1].profile.idleFrames}
                fps={9}
                flipX={true}
                ariaLabel="Sagar animated idle"
                className="w-14 h-14 object-contain"
              />
            </div>
          </div>

          {/* Primary 4 Arcade Modes */}
          <div className="mt-2 sm:mt-3 grid grid-cols-2 gap-2 w-full max-w-[540px]">
            <button
              type="button"
              data-start="true"
              onClick={() => trigger(onArcadeMode, true)}
              onMouseEnter={() => soundEngine.playUiHover()}
              className="arcade-btn-primary py-2 sm:py-2.5 px-2.5 font-pixel text-[9px] sm:text-xs uppercase tracking-wider whitespace-nowrap cursor-pointer"
            >
              ARCADE MODE
            </button>

            <button
              type="button"
              onClick={() => trigger(onTournamentMode, true)}
              onMouseEnter={() => soundEngine.playUiHover()}
              className="arcade-btn-secondary py-2 sm:py-2.5 px-2.5 font-pixel text-[9px] sm:text-xs uppercase tracking-wider text-[#ffc947] border-[#c68a2b] whitespace-nowrap cursor-pointer"
            >
              TOURNAMENT MODE
            </button>

            <button
              type="button"
              onClick={() => trigger(onLocalMultiplayer, true)}
              onMouseEnter={() => soundEngine.playUiHover()}
              className="arcade-btn-secondary py-2 sm:py-2.5 px-2.5 font-pixel text-[9px] sm:text-xs uppercase tracking-wider text-[#38bdf8] border-[#38bdf8]/70 whitespace-nowrap cursor-pointer"
            >
              LOCAL MULTIPLAYER
            </button>

            <button
              type="button"
              disabled
              aria-disabled="true"
              title="Online Multiplayer is coming in a future update"
              className="bg-[#140f18] border-2 border-[#3a2a36] py-2 sm:py-2.5 px-2 flex flex-col items-center justify-center opacity-70 cursor-not-allowed"
            >
              <span className="font-pixel text-[8px] sm:text-[10px] uppercase text-[#b8a391] whitespace-nowrap">
                ONLINE MULTIPLAYER
              </span>
              <span className="font-pixel-ui text-[7px] sm:text-[8px] uppercase text-[#ffc947]">
                COMING SOON
              </span>
            </button>
          </div>
        </div>

        {/* Right Living Fighters (Jatin & Tony) */}
        <div className="hidden sm:flex col-span-3 items-end justify-around h-full pb-2 pointer-events-none">
          {playable.slice(2, 4).map((entry, idx) => {
            const isActivePose = featuredIndex === idx + 2;
            const scale = entry.renderCalibration.menuScaleMultiplier;
            return (
              <div key={entry.id} className="flex flex-col items-center">
                <div style={{ transform: `scale(${scale})` }} className="origin-bottom">
                  <SpritePreview
                    sheetUrl={isActivePose ? entry.profile.victorySheetUrl : entry.profile.idleSheetUrl}
                    frames={isActivePose ? entry.profile.victoryFrames : entry.profile.idleFrames}
                    fps={9}
                    flipX={true}
                    ariaLabel={`${entry.displayName} animated fighter`}
                    className="w-24 h-24 md:w-32 md:h-32 lg:w-40 lg:h-40 object-contain"
                  />
                </div>
                <span
                  className="mt-0.5 px-1.5 py-0.5 bg-[#090609]/85 border border-[#4a3624] font-pixel text-[7px] md:text-[9px] uppercase hud-text-stroke-sm"
                  style={{ color: entry.accentColor }}
                >
                  {entry.displayName}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Secondary Navigation Strip (Zero Scroll, Single Row) */}
      <div className="border-t-2 border-[#594635] pt-1.5 flex items-center justify-between gap-2">
        <div className="grid grid-cols-5 gap-1.5 sm:gap-2 flex-1 max-w-2xl mx-auto">
          <button
            type="button"
            onClick={() => trigger(onStory)}
            onMouseEnter={() => soundEngine.playUiHover()}
            className="arcade-btn-secondary py-1.5 px-1 font-pixel-ui text-[9px] sm:text-[11px] font-bold uppercase whitespace-nowrap cursor-pointer"
          >
            STORY
          </button>
          <button
            type="button"
            onClick={() => trigger(onRoster)}
            onMouseEnter={() => soundEngine.playUiHover()}
            className="arcade-btn-secondary py-1.5 px-1 font-pixel-ui text-[9px] sm:text-[11px] font-bold uppercase whitespace-nowrap cursor-pointer"
          >
            ROSTER
          </button>
          <button
            type="button"
            onClick={() => trigger(onTraining)}
            onMouseEnter={() => soundEngine.playUiHover()}
            className="arcade-btn-secondary py-1.5 px-1 font-pixel-ui text-[9px] sm:text-[11px] font-bold uppercase whitespace-nowrap cursor-pointer"
          >
            TRAINING
          </button>
          <button
            type="button"
            onClick={() => trigger(onSettings)}
            onMouseEnter={() => soundEngine.playUiHover()}
            className="arcade-btn-secondary py-1.5 px-1 font-pixel-ui text-[9px] sm:text-[11px] font-bold uppercase whitespace-nowrap cursor-pointer"
          >
            SETTINGS
          </button>
          <button
            type="button"
            onClick={() => trigger(onCredits)}
            onMouseEnter={() => soundEngine.playUiHover()}
            className="arcade-btn-secondary py-1.5 px-1 font-pixel-ui text-[9px] sm:text-[11px] font-bold uppercase whitespace-nowrap cursor-pointer"
          >
            CREDITS
          </button>
        </div>
      </div>
    </div>
  );
};
