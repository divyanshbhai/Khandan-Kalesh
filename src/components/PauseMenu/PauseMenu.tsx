import React from 'react';
import { soundEngine } from '../../engine/SoundEngine';

interface PauseMenuProps {
  onResume: () => void;
  onRestartRound: () => void;
  onMoveList: () => void;
  onControls: () => void;
  onSettings: () => void;
  onMainMenu: () => void;
}

export const PauseMenu: React.FC<PauseMenuProps> = ({
  onResume,
  onRestartRound,
  onMoveList,
  onControls,
  onSettings,
  onMainMenu,
}) => {
  return (
    <div
      className="absolute inset-0 z-40 flex items-center justify-center bg-[#090605]/86 p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Game Paused"
    >
      <div className="arcade-panel-brass w-full max-w-sm p-5 sm:p-6 text-center">
        <p className="font-pixel-ui text-[10px] font-bold uppercase tracking-[0.24em] text-[#f5a623]">
          MATCH PAUSED
        </p>
        <h2 className="font-pixel text-xl sm:text-2xl uppercase tracking-wider text-[#fff5e0] mt-1 mb-5 hud-text-stroke-sm">
          PAUSE
        </h2>

        <div className="space-y-2">
          <button
            type="button"
            onClick={() => {
              soundEngine.playUiConfirm();
              onResume();
            }}
            className="arcade-btn-primary w-full py-2.5 font-pixel text-xs sm:text-sm uppercase tracking-wider cursor-pointer"
          >
            RESUME FIGHT
          </button>

          <button
            type="button"
            onClick={() => {
              soundEngine.playUiSelect();
              onRestartRound();
            }}
            className="arcade-btn-secondary w-full py-2 font-pixel-ui text-xs sm:text-sm font-bold uppercase tracking-wider cursor-pointer"
          >
            RESTART ROUND
          </button>

          <button
            type="button"
            onClick={() => {
              soundEngine.playUiSelect();
              onMoveList();
            }}
            className="arcade-btn-secondary w-full py-2 font-pixel-ui text-xs sm:text-sm font-bold uppercase tracking-wider text-[#ffd873] cursor-pointer"
          >
            MOVE LIST
          </button>

          <button
            type="button"
            onClick={() => {
              soundEngine.playUiSelect();
              onControls();
            }}
            className="arcade-btn-secondary w-full py-2 font-pixel-ui text-xs sm:text-sm font-bold uppercase tracking-wider cursor-pointer"
          >
            CONTROLS &amp; TOUCH
          </button>

          <button
            type="button"
            onClick={() => {
              soundEngine.playUiSelect();
              onSettings();
            }}
            className="arcade-btn-secondary w-full py-2 font-pixel-ui text-xs sm:text-sm font-bold uppercase tracking-wider cursor-pointer"
          >
            SETTINGS &amp; CRT
          </button>

          <button
            type="button"
            onClick={() => {
              soundEngine.playUiSelect();
              onMainMenu();
            }}
            className="arcade-btn-danger w-full py-2 font-pixel-ui text-xs sm:text-sm font-bold uppercase tracking-wider cursor-pointer mt-2"
          >
            QUIT TO TITLE
          </button>
        </div>
      </div>
    </div>
  );
};
