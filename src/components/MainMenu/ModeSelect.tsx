import React from 'react';
import { ArcadeProfileRecord } from '../../config/arcadeProgression';
import { Difficulty, GameMode } from '../../config/game';
import { soundEngine } from '../../engine/SoundEngine';

interface ModeSelectProps {
  difficulty: Difficulty;
  profile: ArcadeProfileRecord;
  onDifficultyChange: (difficulty: Difficulty) => void;
  onSelectMode: (mode: GameMode) => void;
  onBack: () => void;
}

const DIFFICULTIES: { id: Difficulty; label: string; desc: string }[] = [
  { id: 'easy', label: 'EASY', desc: 'Forgiving reaction windows & light combo openings' },
  { id: 'normal', label: 'NORMAL', desc: 'Classic arcade spacing, honest blocks & Round 2 adaptation' },
  { id: 'hard', label: 'HARD', desc: 'Sharp footsies, anti-airs, whiff punishes & mixups' },
  { id: 'master', label: 'MASTER', desc: 'Boss-level reads, full combos & ruthless okizeme' },
];

export const ModeSelect: React.FC<ModeSelectProps> = ({
  difficulty,
  profile,
  onDifficultyChange,
  onSelectMode,
  onBack,
}) => {
  const totalClears = Object.values(profile.arcadeClears).reduce((a, b) => a + b, 0);

  return (
    <div className="absolute inset-0 z-20 flex flex-col justify-between p-3 sm:p-5 md:p-6 bg-[#090605]/93">
      {/* Arcade Header */}
      <div className="flex items-center justify-between gap-2 border-b-2 border-[#6b533b] pb-2.5">
        <div>
          <p className="font-pixel-ui text-[10px] sm:text-xs font-bold uppercase tracking-[0.22em] text-[#f5a623]">
            STAGE 1 OF 3 · LIVING ARCADE CABINET
          </p>
          <h1 className="font-pixel text-sm sm:text-lg md:text-xl uppercase tracking-wider text-[#fff5e0] mt-0.5 hud-text-stroke-sm">
            SELECT BATTLE MODE
          </h1>
        </div>

        <button
          type="button"
          onClick={() => {
            soundEngine.playUiSelect();
            onBack();
          }}
          className="arcade-btn-secondary px-3 py-1.5 font-pixel-ui text-xs font-bold uppercase tracking-wider cursor-pointer"
        >
          BACK
        </button>
      </div>

      {/* Shared CPU Intelligence Difficulty Bar */}
      <div className="mt-2.5 bg-[#110c09] border-2 border-[#4a3624] px-3 py-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="min-w-0">
          <span className="font-pixel-ui text-[10px] font-bold uppercase tracking-widest text-[#ffd873]">
            ADAPTIVE CPU SKILL:
          </span>
          <span className="ml-2 text-[11px] text-[#ebd8b7] hidden md:inline">
            {DIFFICULTIES.find((d) => d.id === difficulty)?.desc}
          </span>
        </div>
        <div className="grid grid-cols-4 gap-1.5 shrink-0">
          {DIFFICULTIES.map((diff) => (
            <button
              key={diff.id}
              type="button"
              onClick={() => {
                soundEngine.playUiSelect();
                onDifficultyChange(diff.id);
              }}
              className={`px-2.5 py-1 font-pixel-ui text-[10px] font-bold uppercase tracking-wider border-2 cursor-pointer ${
                difficulty === diff.id
                  ? diff.id === 'master'
                    ? 'bg-[#e03126] text-[#fff5e0] border-[#ff9b8a]'
                    : 'bg-[#f5a623] text-[#120a04] border-[#ffe38f]'
                  : 'bg-[#1a130e] text-[#ebd8b7] border-[#594635] hover:border-[#f5b324]'
              }`}
            >
              {diff.label}
            </button>
          ))}
        </div>
      </div>

      {/* Core 4-Mode Arcade Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3 my-auto py-2.5 overflow-y-auto">
        {/* 1. Arcade Tournament Ladder */}
        <div className="arcade-panel-brass p-3 sm:p-3.5 flex flex-col justify-between gap-2.5">
          <div>
            <div className="flex items-center justify-between gap-1 mb-1.5">
              <span className="font-pixel-ui text-[9px] font-bold uppercase tracking-widest text-[#ffd873]">
                STORY LADDER
              </span>
              <span className="font-pixel-ui text-[9px] px-1.5 py-0.5 bg-[#261b13] border border-[#c68a2b] text-[#ffd873]">
                3 STAGES
              </span>
            </div>
            <h2 className="font-pixel text-xs sm:text-sm uppercase tracking-wide text-[#fff5e0] leading-snug">
              ARCADE TOURNAMENT
            </h2>
            <p className="text-[11px] sm:text-xs text-[#ebd8b7] mt-1.5 leading-snug">
              Battle all 3 family rivals across Katra, Highway &amp; Metro with escalating adaptive
              AI and S–C ranking.
            </p>
            <div className="mt-2 pt-2 border-t border-[#4a3624] font-pixel-ui text-[9px] text-[#ffd873] uppercase">
              CLEARS: {totalClears} · HI: {profile.highScore}
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              soundEngine.playUiConfirm();
              onSelectMode('arcade');
            }}
            className="arcade-btn-primary w-full py-2 font-pixel text-[10px] sm:text-xs uppercase tracking-wider cursor-pointer"
          >
            PLAY LADDER
          </button>
        </div>

        {/* 2. Quick 1P vs CPU */}
        <div className="arcade-panel p-3 sm:p-3.5 flex flex-col justify-between gap-2.5 hover:border-[#f5b324]">
          <div>
            <div className="flex items-center justify-between gap-1 mb-1.5">
              <span className="font-pixel-ui text-[9px] font-bold uppercase tracking-widest text-[#f5a623]">
                1P VERSUS
              </span>
              <span className="font-pixel-ui text-[9px] px-1.5 py-0.5 bg-[#231912] border border-[#594635] text-[#ebd8b7]">
                BEST OF 3
              </span>
            </div>
            <h2 className="font-pixel text-xs sm:text-sm uppercase tracking-wide text-[#fff5e0] leading-snug">
              SINGLE VS CPU
            </h2>
            <p className="text-[11px] sm:text-xs text-[#ebd8b7] mt-1.5 leading-snug">
              Pick any fighter, rival &amp; stage. Face character-authentic combos, footsies,
              anti-airs &amp; multi-round reads.
            </p>
            <div className="mt-2 pt-2 border-t border-[#4a3624] font-pixel-ui text-[9px] text-[#b39e84] uppercase">
              CPU LEVEL: {difficulty.toUpperCase()}
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              soundEngine.playUiConfirm();
              onSelectMode('cpu');
            }}
            className="arcade-btn-secondary w-full py-2 font-pixel text-[10px] sm:text-xs uppercase tracking-wider text-[#ffd873] border-[#c68a2b] cursor-pointer"
          >
            START VS CPU
          </button>
        </div>

        {/* 3. Survival Gauntlet */}
        <div className="arcade-panel p-3 sm:p-3.5 flex flex-col justify-between gap-2.5 hover:border-[#e03126]">
          <div>
            <div className="flex items-center justify-between gap-1 mb-1.5">
              <span className="font-pixel-ui text-[9px] font-bold uppercase tracking-widest text-[#ff6a5c]">
                ENDLESS
              </span>
              <span className="font-pixel-ui text-[9px] px-1.5 py-0.5 bg-[#231912] border border-[#e03126] text-[#ff9b8a]">
                1 CREDIT
              </span>
            </div>
            <h2 className="font-pixel text-xs sm:text-sm uppercase tracking-wide text-[#fff5e0] leading-snug">
              SURVIVAL GAUNTLET
            </h2>
            <p className="text-[11px] sm:text-xs text-[#ebd8b7] mt-1.5 leading-snug">
              Defeat wave after wave of escalating rivals. Recover +35% HP on each win and push your
              win streak.
            </p>
            <div className="mt-2 pt-2 border-t border-[#4a3624] font-pixel-ui text-[9px] text-[#ff9b8a] uppercase">
              BEST STREAK: {profile.bestSurvivalStreak} WAVES
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              soundEngine.playUiConfirm();
              onSelectMode('survival');
            }}
            className="arcade-btn-secondary w-full py-2 font-pixel text-[10px] sm:text-xs uppercase tracking-wider text-[#ff9b8a] border-[#e03126] cursor-pointer"
          >
            ENTER SURVIVAL
          </button>
        </div>

        {/* 4. Local 2 Player */}
        <div className="arcade-panel p-3 sm:p-3.5 flex flex-col justify-between gap-2.5 hover:border-[#38bdf8]">
          <div>
            <div className="flex items-center justify-between gap-1 mb-1.5">
              <span className="font-pixel-ui text-[9px] font-bold uppercase tracking-widest text-[#38bdf8]">
                2P VERSUS
              </span>
              <span className="font-pixel-ui text-[9px] px-1.5 py-0.5 bg-[#231912] border border-[#594635] text-[#ebd8b7]">
                SHARED
              </span>
            </div>
            <h2 className="font-pixel text-xs sm:text-sm uppercase tracking-wide text-[#fff5e0] leading-snug">
              LOCAL 2 PLAYER
            </h2>
            <p className="text-[11px] sm:text-xs text-[#ebd8b7] mt-1.5 leading-snug">
              Head-to-head family showdown on one keyboard, dual gamepads, or mirrored split-side
              arcade touch controls.
            </p>
            <div className="mt-2 pt-2 border-t border-[#4a3624] font-pixel-ui text-[9px] text-[#7dd3fc] uppercase">
              P1: WASD+FGHR · P2: ARROWS+1-6
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              soundEngine.playUiConfirm();
              onSelectMode('pvp');
            }}
            className="arcade-btn-secondary w-full py-2 font-pixel text-[10px] sm:text-xs uppercase tracking-wider text-[#7dd3fc] border-[#38bdf8] cursor-pointer"
          >
            START LOCAL 2P
          </button>
        </div>
      </div>

      {/* Bottom Training Dojo Dock */}
      <div className="border-t-2 border-[#4a3624] pt-2.5 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="px-1.5 py-0.5 bg-[#16100c] border border-[#22c55e] font-pixel-ui text-[9px] font-bold uppercase text-[#86efac]">
            FREE LAB
          </span>
          <span className="font-pixel-ui text-[10px] sm:text-xs text-[#ebd8b7] uppercase truncate">
            TRAINING DOJO · HITBOXES, PUSHBOXES &amp; LIVE CPU SPARRING
          </span>
        </div>
        <button
          type="button"
          onClick={() => {
            soundEngine.playUiConfirm();
            onSelectMode('training');
          }}
          className="arcade-btn-secondary px-4 py-1.5 font-pixel text-[10px] sm:text-xs uppercase tracking-wider text-[#86efac] border-[#22c55e] cursor-pointer"
        >
          ENTER DOJO &gt;
        </button>
      </div>
    </div>
  );
};
