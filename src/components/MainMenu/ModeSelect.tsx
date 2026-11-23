import React from 'react';
import { Difficulty, GameMode } from '../../config/game';
import { soundEngine } from '../../engine/SoundEngine';

interface ModeSelectProps {
  difficulty: Difficulty;
  onDifficultyChange: (difficulty: Difficulty) => void;
  onSelectMode: (mode: GameMode) => void;
  onBack: () => void;
}

const DIFFICULTIES: { id: Difficulty; label: string; desc: string }[] = [
  { id: 'easy', label: 'EASY', desc: 'Approachable rhythm with clear openings' },
  { id: 'normal', label: 'NORMAL', desc: 'Tactical spacing, blocking & combo punishes' },
  { id: 'hard', label: 'HARD', desc: 'Sharp anti-airs, adaptation & pressure' },
];

export const ModeSelect: React.FC<ModeSelectProps> = ({
  difficulty,
  onDifficultyChange,
  onSelectMode,
  onBack,
}) => {
  return (
    <div className="absolute inset-0 z-20 flex flex-col justify-between p-4 sm:p-6 md:p-8 bg-[#090605]/92">
      {/* Arcade Header */}
      <div className="flex items-center justify-between gap-2 border-b-2 border-[#6b533b] pb-3">
        <div>
          <p className="font-pixel-ui text-[10px] sm:text-xs font-bold uppercase tracking-[0.22em] text-[#f5a623]">
            STAGE 1 OF 3 · ARCADE CABINET
          </p>
          <h1 className="font-pixel text-base sm:text-xl md:text-2xl uppercase tracking-wider text-[#fff5e0] mt-1 hud-text-stroke-sm">
            SELECT BATTLE MODE
          </h1>
        </div>

        <button
          type="button"
          onClick={() => {
            soundEngine.playUiSelect();
            onBack();
          }}
          className="arcade-btn-secondary px-3.5 py-2 font-pixel-ui text-xs font-bold uppercase tracking-wider cursor-pointer"
        >
          BACK
        </button>
      </div>

      {/* Mode Panels */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 my-auto py-3 overflow-y-auto">
        {/* 1P Arcade vs CPU */}
        <div className="arcade-panel-brass p-4 flex flex-col justify-between gap-3">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-pixel-ui text-[10px] font-bold uppercase tracking-widest text-[#ffd873]">
                1P ARCADE
              </span>
              <span className="font-pixel-ui text-[10px] px-1.5 py-0.5 bg-[#261b13] border-2 border-[#c68a2b] text-[#ffd873]">
                BEST OF 3
              </span>
            </div>
            <h2 className="font-pixel text-sm sm:text-base uppercase tracking-wide text-[#fff5e0] leading-snug">
              PLAYER VS CPU
            </h2>
            <p className="text-xs sm:text-sm text-[#ebd8b7] mt-2 leading-snug">
              Fight reactive character-specific AI rivals with calibrated combat spacing, blocks,
              and counter-punishes.
            </p>

            {/* Difficulty selector */}
            <div className="mt-3 pt-3 border-t-2 border-[#4a3624]">
              <span className="block font-pixel-ui text-[10px] font-bold uppercase tracking-widest text-[#b39e84] mb-2">
                CPU LEVEL
              </span>
              <div className="grid grid-cols-3 gap-1.5">
                {DIFFICULTIES.map((diff) => (
                  <button
                    key={diff.id}
                    type="button"
                    onClick={() => {
                      soundEngine.playUiSelect();
                      onDifficultyChange(diff.id);
                    }}
                    className={`py-1.5 font-pixel-ui text-[10px] font-bold uppercase tracking-wider border-2 cursor-pointer ${
                      difficulty === diff.id
                        ? 'bg-[#f5a623] text-[#120a04] border-[#ffe38f]'
                        : 'bg-[#120c08] text-[#ebd8b7] border-[#594635] hover:border-[#f5b324]'
                    }`}
                  >
                    {diff.label}
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-[#b39e84] mt-1.5">
                {DIFFICULTIES.find((d) => d.id === difficulty)?.desc}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              soundEngine.playUiConfirm();
              onSelectMode('cpu');
            }}
            className="arcade-btn-primary w-full py-2.5 font-pixel text-xs sm:text-sm uppercase tracking-wider cursor-pointer"
          >
            START 1P VS CPU
          </button>
        </div>

        {/* 2P Local Versus */}
        <div className="arcade-panel p-4 flex flex-col justify-between gap-3 hover:border-[#f5b324]">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-pixel-ui text-[10px] font-bold uppercase tracking-widest text-[#38bdf8]">
                2P VERSUS
              </span>
              <span className="font-pixel-ui text-[10px] px-1.5 py-0.5 bg-[#231912] border-2 border-[#594635] text-[#ebd8b7]">
                SHARED SCREEN
              </span>
            </div>
            <h2 className="font-pixel text-sm sm:text-base uppercase tracking-wide text-[#fff5e0] leading-snug">
              LOCAL 2 PLAYER
            </h2>
            <p className="text-xs sm:text-sm text-[#ebd8b7] mt-2 leading-snug">
              Challenge family head-to-head on one keyboard, dual gamepads, or mirrored split-side
              arcade touch controls.
            </p>
            <div className="mt-3 pt-3 border-t-2 border-[#4a3624] space-y-1 text-xs text-[#b39e84]">
              <div>
                <strong className="text-[#ffd873] font-pixel-ui">P1:</strong> WASD + F/G/H/R/T/Y
              </div>
              <div>
                <strong className="text-[#38bdf8] font-pixel-ui">P2:</strong> ARROWS + 1-6 / NUMPAD
              </div>
              <div>
                <strong className="text-[#fff5e0] font-pixel-ui">TOUCH:</strong> Independent P1 &amp; P2 sides
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              soundEngine.playUiConfirm();
              onSelectMode('pvp');
            }}
            className="arcade-btn-secondary w-full py-2.5 font-pixel text-xs sm:text-sm uppercase tracking-wider text-[#fff5e0] border-[#c68a2b] cursor-pointer"
          >
            START LOCAL 2P
          </button>
        </div>

        {/* Training Dojo */}
        <div className="arcade-panel p-4 flex flex-col justify-between gap-3 hover:border-[#22c55e]">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-pixel-ui text-[10px] font-bold uppercase tracking-widest text-[#22c55e]">
                FREE LAB
              </span>
              <span className="font-pixel-ui text-[10px] px-1.5 py-0.5 bg-[#231912] border-2 border-[#594635] text-[#ebd8b7]">
                HITBOX VIEW
              </span>
            </div>
            <h2 className="font-pixel text-sm sm:text-base uppercase tracking-wide text-[#fff5e0] leading-snug">
              TRAINING DOJO
            </h2>
            <p className="text-xs sm:text-sm text-[#ebd8b7] mt-2 leading-snug">
              Practice combos, timing, pushbox spacing, and character specials with configurable
              dummy behavior.
            </p>
            <div className="mt-3 pt-3 border-t-2 border-[#4a3624] space-y-1 text-xs text-[#b39e84]">
              <div>DUMMY: IDLE · GUARD · COUNTER</div>
              <div>LIVE PUSHBOX / HURTBOX / HITBOX OVERLAY</div>
              <div>INSTANT HP &amp; POSITION RESET</div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              soundEngine.playUiConfirm();
              onSelectMode('training');
            }}
            className="arcade-btn-secondary w-full py-2.5 font-pixel text-xs sm:text-sm uppercase tracking-wider text-[#86efac] border-[#22c55e] cursor-pointer"
          >
            ENTER DOJO
          </button>
        </div>
      </div>

      {/* Footer Strip */}
      <div className="text-center font-pixel-ui text-[10px] text-[#b39e84] uppercase tracking-[0.2em] border-t-2 border-[#4a3624] pt-2">
        4 ORIGINAL FAMILY FIGHTERS · FULL MOVE LISTS ON NEXT SCREEN
      </div>
    </div>
  );
};
