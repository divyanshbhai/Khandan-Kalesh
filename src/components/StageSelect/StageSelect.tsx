import React, { useState } from 'react';
import { CharacterId } from '../../config/animations';
import { getCharacterProfile } from '../../config/characters';
import { StageId, STAGES } from '../../config/stages';
import { soundEngine } from '../../engine/SoundEngine';

interface StageSelectProps {
  p1Char: CharacterId;
  p2Char: CharacterId;
  initialStage: StageId;
  onConfirm: (stageId: StageId) => void;
  onBack: () => void;
}

export const StageSelect: React.FC<StageSelectProps> = ({
  p1Char,
  p2Char,
  initialStage,
  onConfirm,
  onBack,
}) => {
  const [selected, setSelected] = useState<StageId>(initialStage);
  const p1 = getCharacterProfile(p1Char);
  const p2 = getCharacterProfile(p2Char);
  const activeStage = STAGES.find((s) => s.id === selected) ?? STAGES[0];

  return (
    <div className="absolute inset-0 z-20 flex flex-col justify-between p-4 sm:p-6 md:p-7 bg-[#090605]/94">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-[#6b533b] pb-2.5">
        <div>
          <p className="font-pixel-ui text-[10px] font-bold uppercase tracking-[0.22em] text-[#f5a623]">
            STAGE 3 OF 3 · {p1.name} VS {p2.name}
          </p>
          <h1 className="font-pixel text-sm sm:text-lg md:text-xl uppercase tracking-wider text-[#fff5e0] mt-0.5 hud-text-stroke-sm">
            SELECT ARENA
          </h1>
        </div>

        <button
          type="button"
          onClick={() => {
            soundEngine.playUiSelect();
            onBack();
          }}
          className="arcade-btn-secondary px-3.5 py-1.5 font-pixel-ui text-xs font-bold uppercase tracking-wider cursor-pointer"
        >
          BACK
        </button>
      </div>

      {/* Selected Panoramic Preview */}
      <div className="my-auto py-2.5 space-y-3 overflow-y-auto">
        <div className="arcade-panel-brass overflow-hidden">
          <div className="relative h-36 sm:h-48 md:h-52 w-full bg-[#090605] overflow-hidden">
            <img
              src={activeStage.backgroundUrl}
              alt={`${activeStage.name} fighting arena`}
              className="w-full h-full object-cover object-center pixelated"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#090605]/90 via-transparent to-transparent" />
            <div className="absolute bottom-2.5 left-3.5 right-3.5 flex flex-wrap items-end justify-between gap-2">
              <div>
                <p className="font-pixel-ui text-[10px] font-bold uppercase tracking-[0.2em] text-[#ffd873] hud-text-stroke-sm">
                  {activeStage.location}
                </p>
                <h2 className="font-pixel text-sm sm:text-lg md:text-xl uppercase tracking-wider text-[#fff5e0] hud-text-stroke mt-0.5 leading-snug">
                  {activeStage.name}
                </h2>
              </div>
              <span className="font-pixel-ui text-[10px] px-2 py-0.5 bg-[#16100c] border-2 border-[#f5b324] text-[#ffd873]">
                {activeStage.musicTempoBpm} BPM · 3840x1080
              </span>
            </div>
          </div>
          <div className="px-3.5 py-2 bg-[#16100c] text-xs sm:text-sm text-[#ebd8b7] border-t-2 border-[#4a3624]">
            {activeStage.description}
          </div>
        </div>

        {/* 3 Stage Selector Strip */}
        <div className="grid grid-cols-3 gap-2.5">
          {STAGES.map((stage) => {
            const isSelected = stage.id === selected;
            return (
              <button
                key={stage.id}
                type="button"
                onClick={() => {
                  soundEngine.playUiSelect();
                  setSelected(stage.id);
                }}
                onMouseEnter={() => soundEngine.playUiHover()}
                className={`overflow-hidden border-2 text-left cursor-pointer shadow-[0_0_0_2px_#090605,3px_3px_0_0_#090605] ${
                  isSelected
                    ? 'border-[#ffe38f] bg-[#2a1e14]'
                    : 'border-[#594635] bg-[#16100c] hover:border-[#f5b324]'
                }`}
              >
                <div className="h-14 sm:h-20 w-full overflow-hidden bg-[#090605]">
                  <img
                    src={stage.backgroundUrl}
                    alt={stage.name}
                    className="w-full h-full object-cover object-center pixelated"
                  />
                </div>
                <div className="p-2">
                  <div className="font-pixel-ui text-xs sm:text-sm font-bold uppercase tracking-wide text-[#fff5e0] leading-tight truncate">
                    {stage.name}
                  </div>
                  <div className="text-[10px] text-[#b39e84] truncate">{stage.location}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Footer Confirm */}
      <div className="flex items-center justify-between border-t-2 border-[#6b533b] pt-2.5">
        <div className="font-pixel text-[10px] sm:text-xs uppercase tracking-wider text-[#ebd8b7]">
          <span style={{ color: p1.accentColor }}>{p1.name}</span>{' '}
          <span className="text-[#b39e84]">VS</span>{' '}
          <span style={{ color: p2.accentColor }}>{p2.name}</span>
        </div>

        <button
          type="button"
          onClick={() => {
            soundEngine.playUiConfirm();
            onConfirm(selected);
          }}
          className="arcade-btn-primary px-8 py-2.5 font-pixel text-xs sm:text-base uppercase tracking-wider cursor-pointer"
        >
          FIGHT! ►
        </button>
      </div>
    </div>
  );
};
