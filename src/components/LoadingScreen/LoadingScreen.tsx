import React from 'react';
import { LoadProgress } from '../../assets/assetManifest';
import { CharacterId } from '../../config/animations';
import { getCharacterProfile } from '../../config/characters';
import { getStageById, StageId } from '../../config/stages';
import { SpritePreview } from '../SpritePreview';

interface LoadingScreenProps {
  p1Char: CharacterId;
  p2Char: CharacterId;
  stageId: StageId;
  progress: LoadProgress;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({
  p1Char,
  p2Char,
  stageId,
  progress,
}) => {
  const p1 = getCharacterProfile(p1Char);
  const p2 = getCharacterProfile(p2Char);
  const stage = getStageById(stageId);

  return (
    <div className="absolute inset-0 z-40 flex flex-col items-center justify-center p-4 bg-[#090609] overflow-hidden">
      <img
        src={stage.backgroundUrl}
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 w-full h-full object-cover pixelated opacity-28"
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#090609]/85 via-[#151020]/60 to-[#090609]/95" />

      <div className="relative z-10 arcade-panel-brass p-5 sm:p-7 w-full max-w-2xl text-center">
        <div className="flex items-center justify-center gap-2">
          <img
            src="/assets/brand/logo-39-bharat-nagar.png"
            alt="39 Bharat Nagar"
            className="w-7 h-7 object-contain pixelated"
          />
          <p className="font-pixel-ui text-[10px] sm:text-xs font-bold uppercase tracking-[0.22em] text-[#ffc947]">
            39 BHARAT NAGAR · {stage.name}
          </p>
        </div>

        <div className="mt-3 flex items-center justify-center gap-6 sm:gap-12">
          <div className="flex flex-col items-center">
            <SpritePreview
              sheetUrl={p1.idleSheetUrl}
              frames={p1.idleFrames}
              fps={10}
              ariaLabel={p1.name}
              className="w-20 h-20 sm:w-28 sm:h-28 object-contain"
            />
            <span
              className="font-pixel text-xs sm:text-base uppercase tracking-wider mt-1 hud-text-stroke-sm"
              style={{ color: p1.accentColor }}
            >
              {p1.name}
            </span>
          </div>

          <span className="font-pixel text-2xl sm:text-4xl uppercase text-[#e03126] hud-text-stroke">
            VS
          </span>

          <div className="flex flex-col items-center">
            <SpritePreview
              sheetUrl={p2.idleSheetUrl}
              frames={p2.idleFrames}
              fps={10}
              flipX={true}
              ariaLabel={p2.name}
              className="w-20 h-20 sm:w-28 sm:h-28 object-contain"
            />
            <span
              className="font-pixel text-xs sm:text-base uppercase tracking-wider mt-1 hud-text-stroke-sm"
              style={{ color: p2.accentColor }}
            >
              {p2.name}
            </span>
          </div>
        </div>

        {/* Stepped Retro Pixel Progress Bar */}
        <div className="mt-4">
          <div className="relative h-4 w-full bg-[#110c14] border-2 border-[#755b42] overflow-hidden p-0.5">
            <div
              className="h-full bg-gradient-to-r from-[#d96b14] via-[#f5a623] to-[#ffe38f] transition-all duration-100"
              style={{ width: `${Math.max(8, progress.percent)}%` }}
            />
            <div className="pointer-events-none absolute inset-0 pixel-bar-ticks" />
          </div>
          <div className="mt-1.5 flex items-center justify-between text-[10px] font-pixel-ui text-[#b8a391] uppercase">
            <span>LOADING SPRITE SHEETS</span>
            <span className="text-[#ffc947]">
              {progress.loaded}/{progress.total} ({progress.percent}%)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
