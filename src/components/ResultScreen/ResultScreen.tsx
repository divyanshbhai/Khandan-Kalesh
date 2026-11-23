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
  arcadeRunSummary?: {
    wins: number;
    losses: number;
    totalDamage: number;
    elapsedSeconds: number;
  } | null;
  canAdvanceArcade?: boolean;
  arcadeChampionCleared?: boolean;
  canAdvanceSurvival?: boolean;
  survivalWaveReached?: number;
  onAdvanceRun?: () => void;
  onReturnToBracket?: () => void;
  onReturnToRoom?: () => void;
  onRematch: () => void;
  onCharacterSelect: () => void;
  onMainMenu: () => void;
}

const RANK_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  S: { bg: '#ffc947', text: '#120a04', border: '#fff5e0' },
  A: { bg: '#22c55e', text: '#090609', border: '#86efac' },
  B: { bg: '#38bdf8', text: '#090609', border: '#bae6fd' },
  C: { bg: '#3b2c1e', text: '#ebd8b7', border: '#6b533b' },
};

export const ResultScreen: React.FC<ResultScreenProps> = ({
  stats,
  mode,
  highScore,
  arcadeProgressLabel,
  arcadeRunSummary,
  canAdvanceArcade = false,
  arcadeChampionCleared = false,
  canAdvanceSurvival = false,
  survivalWaveReached,
  onAdvanceRun,
  onReturnToBracket,
  onReturnToRoom,
  onRematch,
  onCharacterSelect,
  onMainMenu,
}) => {
  const winnerProfile = getCharacterProfile(stats.winnerCharId);
  const rankStyle = RANK_COLORS[stats.rankGrade] ?? RANK_COLORS.C;
  const isVsHuman = mode === 'pvp' || mode === 'local_net';
  const isNewRecord = stats.p1Score > 0 && stats.p1Score >= highScore && !isVsHuman;

  return (
    <div
      className="absolute inset-0 z-30 flex items-center justify-center bg-[#090609]/92 p-2.5 sm:p-4 overflow-hidden"
      role="dialog"
      aria-modal="true"
      aria-label="Match Results"
      data-testid="result-screen"
    >
      <div className="arcade-panel-brass w-full max-w-4xl max-h-[96%] overflow-hidden p-3 sm:p-5 grid grid-cols-12 gap-3 sm:gap-4 items-stretch">
        {/* Winner Animated Victory Pose + Quote */}
        <div className="col-span-5 flex flex-col items-center justify-between text-center bg-[#110c14] border-2 border-[#594635] p-2.5 sm:p-3.5">
          <span className="font-pixel-ui text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.2em] text-[#ffc947]">
            {arcadeChampionCleared
              ? '39 BHARAT NAGAR CHAMPION!'
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
            className="w-24 h-24 sm:w-36 sm:h-36 object-contain my-0.5"
          />

          <div>
            <h1
              className="font-pixel text-sm sm:text-lg uppercase tracking-wider leading-snug hud-text-stroke-sm"
              style={{ color: winnerProfile.accentColor }}
            >
              {stats.winnerName} WINS!
            </h1>
            <p className="font-pixel-ui text-[9px] sm:text-[10px] text-[#b8a391] mt-0.5 uppercase">
              {winnerProfile.title}
            </p>
          </div>

          <div className="mt-1.5 w-full bg-[#1a131f] border border-[#4a3624] px-2 py-1.5 text-[10px] sm:text-[11px] font-pixel-ui text-[#fff5e0] leading-snug">
            &ldquo;{stats.victoryQuote}&rdquo;
          </div>
        </div>

        {/* Tactical Combat Breakdown & Progression */}
        <div className="col-span-7 flex flex-col justify-between gap-2.5">
          {/* Score + Rank Header */}
          <div className="flex items-center justify-between gap-2 bg-[#110c14] border-2 border-[#4a3624] px-3 py-2">
            <div>
              <p className="font-pixel-ui text-[9px] font-bold uppercase tracking-[0.18em] text-[#ffd873]">
                {mode === 'survival' && survivalWaveReached
                  ? `SURVIVAL WAVE ${survivalWaveReached}`
                  : mode === 'tournament'
                    ? 'TOURNAMENT BOUT COMPLETE'
                    : mode === 'local_net'
                      ? 'LOCAL WI-FI MATCH RESULT'
                      : `MATCH RECORD · ${stats.totalRoundsPlayed} ROUNDS`}
              </p>
              <div className="flex items-baseline gap-3 mt-0.5">
                <h2 className="font-pixel text-lg sm:text-2xl uppercase tracking-wider text-[#fff5e0] hud-text-stroke-sm">
                  {stats.p1Rounds} - {stats.p2Rounds}
                </h2>
                {!isVsHuman && (
                  <span className="font-pixel-ui text-xs sm:text-sm font-bold text-[#ffd873]">
                    SCORE {String(stats.p1Score).padStart(6, '0')}
                    {isNewRecord && (
                      <span className="ml-1.5 px-1 py-0.5 bg-[#e03126] text-[#fff5e0] text-[8px]">
                        HI!
                      </span>
                    )}
                  </span>
                )}
              </div>
            </div>

            {!isVsHuman && (
              <div
                className="w-11 h-11 sm:w-13 sm:h-13 border-2 flex flex-col items-center justify-center shrink-0 shadow-[2px_2px_0_0_#090609]"
                style={{
                  backgroundColor: rankStyle.bg,
                  color: rankStyle.text,
                  borderColor: rankStyle.border,
                }}
                aria-label={`Rank ${stats.rankGrade}`}
              >
                <span className="font-pixel-ui text-[8px] font-bold leading-none">RANK</span>
                <span className="font-pixel text-lg sm:text-2xl leading-none mt-0.5">
                  {stats.rankGrade}
                </span>
              </div>
            )}
          </div>

          {/* 1P / 2P Stat Comparison */}
          <div className="grid grid-cols-2 gap-2 text-[11px] sm:text-xs">
            <div className="bg-[#110c14] border-2 border-[#4a3624] p-2 space-y-0.5">
              <div className="font-pixel-ui text-[9px] font-bold uppercase tracking-wider text-[#ffd873] border-b border-[#3b2c1e] pb-0.5">
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
                <span>COUNTER / PUNISH</span>
                <span className="font-pixel-ui font-bold text-[#38bdf8]">
                  {stats.p1CounterHits} / {stats.p1Punishes}
                </span>
              </div>
            </div>

            <div className="bg-[#110c14] border-2 border-[#4a3624] p-2 space-y-0.5">
              <div className="font-pixel-ui text-[9px] font-bold uppercase tracking-wider text-[#ff6a5c] border-b border-[#3b2c1e] pb-0.5">
                {isVsHuman ? '2P COMBAT LOG' : 'SCOUTING REPORT'}
              </div>
              <div className="flex justify-between text-[#ebd8b7]">
                <span>RIVAL DMG</span>
                <span className="font-pixel-ui font-bold text-[#fff5e0]">{stats.p2DamageDealt}</span>
              </div>
              <div className="flex justify-between text-[#ebd8b7]">
                <span>RIVAL COMBO</span>
                <span className="font-pixel-ui font-bold text-[#fff5e0]">{stats.p2MaxCombo} HIT</span>
              </div>
              <div className="font-pixel-ui text-[9px] text-[#b8a391] uppercase truncate pt-0.5 border-t border-[#3b2c1e]">
                STYLE: <span className="text-[#ffd873]">{stats.detectedPlaystyle}</span>
              </div>
            </div>
          </div>

          {arcadeChampionCleared && arcadeRunSummary && (
            <div className="bg-[#1a1412] border-2 border-[#ffc947] px-3 py-1.5 flex items-center justify-between text-[10px] font-pixel-ui uppercase text-[#fff5e0]">
              <span>RUN W-L: {arcadeRunSummary.wins}-{arcadeRunSummary.losses}</span>
              <span>TOTAL DMG: {arcadeRunSummary.totalDamage}</span>
              <span>TIME: {arcadeRunSummary.elapsedSeconds}S</span>
            </div>
          )}

          {/* Primary Progression / Rematch Actions */}
          <div className="space-y-1.5">
            {mode === 'tournament' && onReturnToBracket ? (
              <button
                type="button"
                onClick={() => {
                  soundEngine.playUiConfirm();
                  onReturnToBracket();
                }}
                className="arcade-btn-primary w-full py-2 font-pixel text-[10px] sm:text-xs uppercase tracking-wider cursor-pointer"
              >
                VIEW UPDATED BRACKET &gt;
              </button>
            ) : mode === 'local_net' && onReturnToRoom ? (
              <button
                type="button"
                onClick={() => {
                  soundEngine.playUiConfirm();
                  onReturnToRoom();
                }}
                className="arcade-btn-primary w-full py-2 font-pixel text-[10px] sm:text-xs uppercase tracking-wider cursor-pointer"
              >
                RETURN TO WI-FI ROOM &gt;
              </button>
            ) : canAdvanceArcade && onAdvanceRun ? (
              <button
                type="button"
                onClick={() => {
                  soundEngine.playUiConfirm();
                  onAdvanceRun();
                }}
                className="arcade-btn-primary w-full py-2 font-pixel text-[10px] sm:text-xs uppercase tracking-wider cursor-pointer"
              >
                NEXT RANDOM OPPONENT &gt;
              </button>
            ) : canAdvanceSurvival && onAdvanceRun ? (
              <button
                type="button"
                onClick={() => {
                  soundEngine.playUiConfirm();
                  onAdvanceRun();
                }}
                className="arcade-btn-primary w-full py-2 font-pixel text-[10px] sm:text-xs uppercase tracking-wider cursor-pointer"
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
                className="arcade-btn-primary w-full py-2 font-pixel text-[10px] sm:text-xs uppercase tracking-wider cursor-pointer"
              >
                {arcadeChampionCleared
                  ? 'START NEW ARCADE RUN >'
                  : mode === 'arcade' && stats.winnerSlot === 2
                    ? 'RETRY STAGE >'
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
                className="arcade-btn-secondary py-1.5 font-pixel-ui text-[10px] sm:text-xs font-bold uppercase tracking-wider cursor-pointer"
              >
                FIGHTER SELECT
              </button>
              <button
                type="button"
                onClick={() => {
                  soundEngine.playUiSelect();
                  onMainMenu();
                }}
                className="arcade-btn-secondary py-1.5 font-pixel-ui text-[10px] sm:text-xs font-bold uppercase tracking-wider cursor-pointer"
              >
                MAIN MENU
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
