import React from 'react';
import { getCharacterProfile } from '../../config/characters';
import { GameMode } from '../../config/game';
import { soundEngine } from '../../engine/SoundEngine';
import { MatchStats } from '../../engine/types';
import { SpritePreview } from '../SpritePreview';

interface ResultScreenProps {
  stats: MatchStats;
  mode: GameMode;
  highScore: number;
  arcadeProgressLabel?: string | null;
  canAdvanceArcade?: boolean;
  arcadeChampionCleared?: boolean;
  canAdvanceSurvival?: boolean;
  survivalWaveReached?: number;
  onAdvanceRun?: () => void;
  onRematch: () => void;
  onCharacterSelect: () => void;
  onMainMenu: () => void;
}

const RANK_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  S: { bg: '#ffc947', text: '#120a04', border: '#fff5e0' },
  A: { bg: '#22c55e', text: '#090605', border: '#86efac' },
  B: { bg: '#38bdf8', text: '#090605', border: '#bae6fd' },
  C: { bg: '#3b2c1e', text: '#ebd8b7', border: '#6b533b' },
};

export const ResultScreen: React.FC<ResultScreenProps> = ({
  stats,
  mode,
  highScore,
  arcadeProgressLabel,
  canAdvanceArcade = false,
  arcadeChampionCleared = false,
  canAdvanceSurvival = false,
  survivalWaveReached,
  onAdvanceRun,
  onRematch,
  onCharacterSelect,
  onMainMenu,
}) => {
  const winnerProfile = getCharacterProfile(stats.winnerCharId);
  const rankStyle = RANK_COLORS[stats.rankGrade] ?? RANK_COLORS.C;
  const isNewRecord = stats.p1Score > 0 && stats.p1Score >= highScore && mode !== 'pvp';

  return (
    <div
      className="absolute inset-0 z-30 flex items-center justify-center bg-[#090605]/92 p-3 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Match Results"
    >
      <div className="arcade-panel-brass w-full max-w-4xl max-h-[94%] overflow-y-auto p-4 sm:p-5 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
        {/* Winner Animated Victory Pose + Quote */}
        <div className="md:col-span-5 flex flex-col items-center text-center bg-[#110c09] border-2 border-[#594635] p-3.5">
          <span className="font-pixel-ui text-[10px] font-bold uppercase tracking-[0.22em] text-[#f5a623]">
            {arcadeChampionCleared
              ? 'FAMILY CHAMPION CROWNED!'
              : arcadeProgressLabel
                ? arcadeProgressLabel
                : `PLAYER ${stats.winnerSlot} VICTORY`}
          </span>

          <SpritePreview
            sheetUrl={winnerProfile.victorySheetUrl}
            frames={winnerProfile.victoryFrames}
            fps={9}
            holdFinal={true}
            ariaLabel={`${winnerProfile.name} victory pose`}
            className="w-32 h-32 sm:w-40 sm:h-40 object-contain my-1"
          />

          <h1
            className="font-pixel text-base sm:text-lg uppercase tracking-wider leading-snug hud-text-stroke-sm"
            style={{ color: winnerProfile.accentColor }}
          >
            {stats.winnerName} WINS!
          </h1>
          <p className="font-pixel-ui text-[10px] text-[#b39e84] mt-0.5 uppercase">
            {winnerProfile.title}
          </p>

          <div className="mt-2.5 w-full bg-[#1a130e] border border-[#4a3624] px-2.5 py-2 text-[11px] font-pixel-ui text-[#fff5e0] leading-snug">
            &ldquo;{stats.victoryQuote}&rdquo;
          </div>
        </div>

        {/* Tactical Combat Breakdown & Arcade Progression */}
        <div className="md:col-span-7 flex flex-col justify-between gap-3">
          {/* Score + Rank Header */}
          <div className="flex items-center justify-between gap-3 bg-[#110c09] border-2 border-[#4a3624] px-3.5 py-2.5">
            <div>
              <p className="font-pixel-ui text-[9px] font-bold uppercase tracking-[0.2em] text-[#ffd873]">
                {mode === 'survival' && survivalWaveReached
                  ? `SURVIVAL WAVE ${survivalWaveReached}`
                  : `MATCH RECORD · ${stats.totalRoundsPlayed} ROUNDS`}
              </p>
              <div className="flex items-baseline gap-3 mt-0.5">
                <h2 className="font-pixel text-xl sm:text-2xl uppercase tracking-wider text-[#fff5e0] hud-text-stroke-sm">
                  {stats.p1Rounds} - {stats.p2Rounds}
                </h2>
                {mode !== 'pvp' && (
                  <span className="font-pixel-ui text-xs sm:text-sm font-bold text-[#ffd873]">
                    SCORE {String(stats.p1Score).padStart(6, '0')}
                    {isNewRecord && (
                      <span className="ml-1.5 px-1 py-0.5 bg-[#e03126] text-[#fff5e0] text-[9px]">
                        HI!
                      </span>
                    )}
                  </span>
                )}
              </div>
            </div>

            {mode !== 'pvp' && (
              <div
                className="w-12 h-12 sm:w-14 sm:h-14 border-2 flex flex-col items-center justify-center shrink-0 shadow-[2px_2px_0_0_#090605]"
                style={{
                  backgroundColor: rankStyle.bg,
                  color: rankStyle.text,
                  borderColor: rankStyle.border,
                }}
                aria-label={`Rank ${stats.rankGrade}`}
              >
                <span className="font-pixel-ui text-[8px] font-bold leading-none">RANK</span>
                <span className="font-pixel text-xl sm:text-2xl leading-none mt-0.5">
                  {stats.rankGrade}
                </span>
              </div>
            )}
          </div>

          {/* 1P / 2P Stat Comparison */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-[#110c09] border-2 border-[#4a3624] p-2.5 space-y-1">
              <div className="font-pixel-ui text-[10px] font-bold uppercase tracking-wider text-[#ffd873] border-b border-[#3b2c1e] pb-1">
                1P COMBAT LOG
              </div>
              <div className="flex justify-between text-[#ebd8b7]">
                <span>DAMAGE</span>
                <span className="font-pixel-ui font-bold text-[#fff5e0]">{stats.p1DamageDealt}</span>
              </div>
              <div className="flex justify-between text-[#ebd8b7]">
                <span>MAX COMBO</span>
                <span className="font-pixel-ui font-bold text-[#fff5e0]">{stats.p1MaxCombo} HIT</span>
              </div>
              <div className="flex justify-between text-[#ebd8b7]">
                <span>COUNTERS / PUNISH</span>
                <span className="font-pixel-ui font-bold text-[#38bdf8]">
                  {stats.p1CounterHits} / {stats.p1Punishes}
                </span>
              </div>
              <div className="flex justify-between text-[#ebd8b7]">
                <span>GUARD BREAKS</span>
                <span className="font-pixel-ui font-bold text-[#ffd873]">{stats.p1GuardBreaks}</span>
              </div>
            </div>

            <div className="bg-[#110c09] border-2 border-[#4a3624] p-2.5 space-y-1">
              <div className="font-pixel-ui text-[10px] font-bold uppercase tracking-wider text-[#ff6a5c] border-b border-[#3b2c1e] pb-1">
                {mode === 'pvp' ? '2P COMBAT LOG' : 'AI SCOUTING REPORT'}
              </div>
              <div className="flex justify-between text-[#ebd8b7]">
                <span>RIVAL DMG</span>
                <span className="font-pixel-ui font-bold text-[#fff5e0]">{stats.p2DamageDealt}</span>
              </div>
              <div className="flex justify-between text-[#ebd8b7]">
                <span>RIVAL COMBO</span>
                <span className="font-pixel-ui font-bold text-[#fff5e0]">{stats.p2MaxCombo} HIT</span>
              </div>
              <div className="pt-1 border-t border-[#3b2c1e]">
                <div className="font-pixel-ui text-[9px] text-[#b39e84] uppercase">
                  STYLE: <span className="text-[#ffd873]">{stats.detectedPlaystyle}</span>
                </div>
                <div className="text-[10px] text-[#ebd8b7] leading-tight mt-0.5">
                  {stats.cpuAdaptationSummary}
                </div>
              </div>
            </div>
          </div>

          {/* Primary Progression / Rematch Actions */}
          <div className="space-y-2">
            {canAdvanceArcade && onAdvanceRun ? (
              <button
                type="button"
                onClick={() => {
                  soundEngine.playUiConfirm();
                  onAdvanceRun();
                }}
                className="arcade-btn-primary w-full py-2.5 font-pixel text-xs sm:text-sm uppercase tracking-wider cursor-pointer"
              >
                NEXT RIVAL STAGE &gt;
              </button>
            ) : canAdvanceSurvival && onAdvanceRun ? (
              <button
                type="button"
                onClick={() => {
                  soundEngine.playUiConfirm();
                  onAdvanceRun();
                }}
                className="arcade-btn-primary w-full py-2.5 font-pixel text-xs sm:text-sm uppercase tracking-wider cursor-pointer"
              >
                NEXT CHALLENGER (+35% HP) &gt;
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  soundEngine.playUiConfirm();
                  onRematch();
                }}
                className="arcade-btn-primary w-full py-2.5 font-pixel text-xs sm:text-sm uppercase tracking-wider cursor-pointer"
              >
                {arcadeChampionCleared
                  ? 'PLAY NEW TOURNAMENT >'
                  : mode === 'arcade' && stats.winnerSlot === 2
                    ? 'CONTINUE? RETRY STAGE >'
                    : 'REMATCH >'}
              </button>
            )}

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  soundEngine.playUiSelect();
                  onCharacterSelect();
                }}
                className="arcade-btn-secondary py-2 font-pixel-ui text-xs font-bold uppercase tracking-wider cursor-pointer"
              >
                FIGHTER SELECT
              </button>
              <button
                type="button"
                onClick={() => {
                  soundEngine.playUiSelect();
                  onMainMenu();
                }}
                className="arcade-btn-secondary py-2 font-pixel-ui text-xs font-bold uppercase tracking-wider cursor-pointer"
              >
                TITLE SCREEN
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
