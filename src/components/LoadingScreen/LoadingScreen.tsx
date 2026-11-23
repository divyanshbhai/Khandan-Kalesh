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
    <div className="absolute inset-0 z-40 flex flex-col items-center justify-center p-6 bg-[#090605]">
      <div className="arcade-panel-brass p-6 sm:p-8 w-full max-w-2xl text-center">
        <p className="font-pixel-ui text-xs font-bold uppercase tracking-[0.24em] text-[#f5a623]">
          NOW LOADING · {stage.name}
        </p>

        <div className="mt-4 flex items-center justify-center gap-6 sm:gap-12">
          <div className="flex flex-col items-center">
            <SpritePreview
              sheetUrl={p1.idleSheetUrl}
              frames={p1.idleFrames}
              fps={10}
              ariaLabel={p1.name}
              className="w-24 h-24 sm:w-28 sm:h-28 object-contain"
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
              className="w-24 h-24 sm:w-28 sm:h-28 object-contain"
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
        <div className="mt-6">
          <div className="relative h-4 w-full bg-[#110c09] border-2 border-[#6b533b] overflow-hidden p-0.5">
            <div
              className="h-full bg-[#f5a623] transition-all duration-100"
              style={{ width: `${Math.max(8, progress.percent)}%` }}
            />
            <div className="pointer-events-none absolute inset-0 pixel-bar-ticks" />
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] font-pixel-ui text-[#b39e84] uppercase">
            <span>LOADING SPRITE SHEETS</span>
            <span className="text-[#ffd873]">
              {progress.loaded}/{progress.total} ({progress.percent}%)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
