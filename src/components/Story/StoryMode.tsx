import React, { useState } from 'react';
import { getCharacterProfile } from '../../config/characters';
import { getStageById } from '../../config/stages';
import { STORY_PANELS } from '../../config/story';
import { soundEngine } from '../../engine/SoundEngine';
import { SpritePreview } from '../SpritePreview';

interface StoryModeProps {
  onComplete: () => void;
  onBack: () => void;
}

export const StoryMode: React.FC<StoryModeProps> = ({ onComplete, onBack }) => {
  const [panelIdx, setPanelIdx] = useState(0);
  const panel = STORY_PANELS[panelIdx];
  const stage = getStageById(panel.stageId);
  const isLast = panelIdx === STORY_PANELS.length - 1;

  const goNext = () => {
    soundEngine.playUiConfirm();
    if (isLast) {
      onComplete();
    } else {
      setPanelIdx((i) => Math.min(STORY_PANELS.length - 1, i + 1));
    }
  };

  const goBack = () => {
    soundEngine.playUiSelect();
    if (panelIdx === 0) onBack();
    else setPanelIdx((i) => Math.max(0, i - 1));
  };

  const replay = () => {
    soundEngine.playUiSelect();
    setPanelIdx(0);
  };

  return (
    <div
      className="absolute inset-0 z-30 flex flex-col justify-between bg-[#090609] overflow-hidden"
      data-testid="story-mode-screen"
    >
      {/* Supplied Stage Backdrop (Proportional) */}
      <img
        src={stage.backgroundUrl}
        alt={stage.name}
        className="pointer-events-none absolute inset-0 w-full h-full object-cover pixelated opacity-55"
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#090609]/85 via-[#151020]/35 to-[#090609]/95" />

      {/* Header Strip */}
      <div className="relative z-10 flex items-center justify-between gap-2 px-3 sm:px-5 pt-2 sm:pt-3 pb-2 border-b-2 border-[#755b42] bg-[#0d0912]/85">
        <div className="flex items-center gap-2.5 min-w-0">
          <img
            src="/assets/brand/logo-39-bharat-nagar.png"
            alt="39 Bharat Nagar"
            className="w-8 h-8 sm:w-10 sm:h-10 object-contain pixelated shrink-0"
          />
          <div className="min-w-0">
            <p className="font-pixel-ui text-[9px] sm:text-[10px] uppercase tracking-[0.2em] text-[#ffc947] truncate">
              {panel.chapterLabel} · {stage.name.toUpperCase()}
            </p>
            <h1 className="font-pixel text-xs sm:text-base uppercase text-[#fff5e0] truncate hud-text-stroke-sm">
              {panel.title}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <span className="hidden sm:inline-block px-2 py-1 bg-[#2a1216] border-2 border-[#e03126] font-pixel-ui text-[9px] uppercase text-[#ff9b8a]">
            {panel.deedStamp}
          </span>
          <button
            type="button"
            onClick={() => {
              soundEngine.playUiSelect();
              onBack();
            }}
            className="arcade-btn-secondary px-2.5 py-1 font-pixel-ui text-[10px] font-bold uppercase cursor-pointer"
          >
            SKIP STORY
          </button>
        </div>
      </div>

      {/* Middle Living Stage Showcase with Original Animated Sprites */}
      <div className="relative z-10 flex-1 flex items-end justify-center px-4 pb-2 min-h-0">
        <div className="flex items-end justify-center gap-4 sm:gap-10">
          {panel.featuredFighters.map((entry, idx) => {
            const prof = getCharacterProfile(entry.characterId);
            return (
              <div key={`${panel.id}-${entry.characterId}-${idx}`} className="flex flex-col items-center">
                <SpritePreview
                  sheetUrl={entry.animType === 'victory' ? prof.victorySheetUrl : prof.idleSheetUrl}
                  frames={entry.animType === 'victory' ? prof.victoryFrames : prof.idleFrames}
                  fps={9}
                  flipX={entry.flipX}
                  ariaLabel={`${prof.name} story pose`}
                  className="w-24 h-24 sm:w-36 sm:h-36 md:w-44 md:h-44 object-contain"
                />
                <span
                  className="px-2 py-0.5 bg-[#090609]/85 border border-[#4a3624] font-pixel text-[8px] sm:text-[9px] uppercase hud-text-stroke-sm"
                  style={{ color: prof.accentColor }}
                >
                  {prof.name}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Property Deed Dialogue Panel & Navigation */}
      <div className="relative z-10 px-3 sm:px-5 pb-2.5 sm:pb-4">
        <div className="arcade-panel-brass p-3 sm:p-4 max-w-4xl mx-auto">
          <div className="flex items-center justify-between gap-2 mb-1.5 border-b border-[#4a3624] pb-1">
            <span
              className="font-pixel text-[9px] sm:text-[11px] uppercase tracking-wider"
              style={{ color: panel.speakerColor }}
            >
              {panel.speaker}
            </span>
            <span className="font-pixel-ui text-[9px] sm:text-[10px] text-[#b8a391] uppercase">
              SCENE {panelIdx + 1} / {STORY_PANELS.length} · HOUSE NO. 39 DEED ARCHIVE
            </span>
          </div>

          <div className="space-y-1 text-xs sm:text-sm md:text-base text-[#fff5e0] leading-snug">
            {panel.lines.map((line, i) => (
              <p key={i}>{line}</p>
            ))}
          </div>

          <div className="mt-2.5 flex items-center justify-between gap-2 pt-2 border-t border-[#4a3624]">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={goBack}
                className="arcade-btn-secondary px-3 py-1.5 font-pixel-ui text-[10px] sm:text-xs font-bold uppercase cursor-pointer"
              >
                &lt; BACK
              </button>
              <button
                type="button"
                onClick={replay}
                className="arcade-btn-secondary px-3 py-1.5 font-pixel-ui text-[10px] sm:text-xs font-bold uppercase text-[#ebd8b7] cursor-pointer"
              >
                REPLAY STORY
              </button>
            </div>

            <button
              type="button"
              onClick={goNext}
              className="arcade-btn-primary px-4 sm:px-5 py-1.5 font-pixel text-[10px] sm:text-xs uppercase tracking-wider cursor-pointer"
            >
              {isLast ? 'ENTER ARENA >' : 'NEXT >'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
