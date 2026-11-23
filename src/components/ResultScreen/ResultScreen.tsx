import React from 'react';
import { getCharacterProfile } from '../../config/characters';
import { soundEngine } from '../../engine/SoundEngine';
import { MatchStats } from '../../engine/types';
import { SpritePreview } from '../SpritePreview';

interface ResultScreenProps {
  stats: MatchStats;
  onRematch: () => void;
  onCharacterSelect: () => void;
  onMainMenu: () => void;
}

export const ResultScreen: React.FC<ResultScreenProps> = ({
  stats,
  onRematch,
  onCharacterSelect,
  onMainMenu,
}) => {
  const winnerProfile = getCharacterProfile(stats.winnerCharId);

  return (
    <div
      className="absolute inset-0 z-30 flex items-center justify-center bg-[#090605]/92 p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Match Results"
    >
      <div className="arcade-panel-brass w-full max-w-3xl p-5 sm:p-6 grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
        {/* Winner Animated Victory Pose */}
        <div className="md:col-span-5 flex flex-col items-center text-center bg-[#110c09] border-2 border-[#594635] p-4">
          <span className="font-pixel-ui text-[10px] font-bold uppercase tracking-[0.22em] text-[#f5a623]">
            PLAYER {stats.winnerSlot} VICTORY
          </span>
          <SpritePreview
            sheetUrl={winnerProfile.victorySheetUrl}
            frames={winnerProfile.victoryFrames}
            fps={9}
            holdFinal={true}
            ariaLabel={`${winnerProfile.name} victory pose`}
            className="w-36 h-36 sm:w-44 sm:h-44 object-contain my-1"
          />
          <h1
            className="font-pixel text-base sm:text-xl uppercase tracking-wider leading-snug hud-text-stroke-sm"
            style={{ color: winnerProfile.accentColor }}
          >
            {stats.winnerName} WINS!
          </h1>
          <p className="font-pixel-ui text-[10px] text-[#b39e84] mt-1 uppercase">
            {winnerProfile.title}
          </p>
        </div>

        {/* Match Scoreboard & Arcade Continue Options */}
        <div className="md:col-span-7 flex flex-col justify-between gap-4">
          <div>
            <p className="font-pixel-ui text-[10px] font-bold uppercase tracking-[0.22em] text-[#ffd873]">
              MATCH RECORD · {stats.totalRoundsPlayed} ROUNDS
            </p>
            <h2 className="font-pixel text-2xl sm:text-3xl uppercase tracking-wider text-[#fff5e0] mt-1 hud-text-stroke-sm">
              {stats.p1Rounds} - {stats.p2Rounds}
            </h2>

            <div className="mt-3 grid grid-cols-2 gap-2.5 text-xs">
              <div className="bg-[#110c09] border-2 border-[#4a3624] p-2.5 space-y-1.5">
                <div className="font-pixel-ui text-[11px] font-bold uppercase tracking-wider text-[#ffd873] border-b border-[#3b2c1e] pb-1">
                  1P STATS
                </div>
                <div className="flex justify-between text-[#ebd8b7]">
                  <span>ROUNDS</span>
                  <span className="font-pixel-ui font-bold text-[#fff5e0]">{stats.p1Rounds}</span>
                </div>
                <div className="flex justify-between text-[#ebd8b7]">
                  <span>DAMAGE</span>
                  <span className="font-pixel-ui font-bold text-[#fff5e0]">{stats.p1DamageDealt}</span>
                </div>
                <div className="flex justify-between text-[#ebd8b7]">
                  <span>MAX COMBO</span>
                  <span className="font-pixel-ui font-bold text-[#fff5e0]">{stats.p1MaxCombo} HIT</span>
                </div>
              </div>

              <div className="bg-[#110c09] border-2 border-[#4a3624] p-2.5 space-y-1.5">
                <div className="font-pixel-ui text-[11px] font-bold uppercase tracking-wider text-[#ff6a5c] border-b border-[#3b2c1e] pb-1">
                  2P / CPU STATS
                </div>
                <div className="flex justify-between text-[#ebd8b7]">
                  <span>ROUNDS</span>
                  <span className="font-pixel-ui font-bold text-[#fff5e0]">{stats.p2Rounds}</span>
                </div>
                <div className="flex justify-between text-[#ebd8b7]">
                  <span>DAMAGE</span>
                  <span className="font-pixel-ui font-bold text-[#fff5e0]">{stats.p2DamageDealt}</span>
                </div>
                <div className="flex justify-between text-[#ebd8b7]">
                  <span>MAX COMBO</span>
                  <span className="font-pixel-ui font-bold text-[#fff5e0]">{stats.p2MaxCombo} HIT</span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2.5">
            <button
              type="button"
              onClick={() => {
                soundEngine.playUiConfirm();
                onRematch();
              }}
              className="arcade-btn-primary w-full py-2.5 font-pixel text-xs sm:text-sm uppercase tracking-wider cursor-pointer"
            >
              REMATCH &gt;
            </button>

            <div className="grid grid-cols-2 gap-2.5">
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
