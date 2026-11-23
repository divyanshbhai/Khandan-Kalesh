import React from 'react';
import { CHARACTERS } from '../../config/characters';
import { STAGES } from '../../config/stages';
import { soundEngine } from '../../engine/SoundEngine';

interface CreditsModalProps {
  onClose: () => void;
}

export const CreditsModal: React.FC<CreditsModalProps> = ({ onClose }) => {
  return (
    <div
      className="absolute inset-0 z-50 flex items-center justify-center bg-[#090605]/90 p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Family Fighters Credits"
    >
      <div className="arcade-panel-brass w-full max-w-xl overflow-hidden">
        <div className="px-5 py-3 border-b-2 border-[#6b533b] bg-[#110c09] flex items-center justify-between">
          <div>
            <p className="font-pixel-ui text-[10px] font-bold uppercase tracking-[0.22em] text-[#f5a623]">
              EDITION V4 · LIVING ARCADE
            </p>
            <h2 className="font-pixel text-sm sm:text-base uppercase tracking-wider text-[#fff5e0] mt-0.5">
              CREDITS
            </h2>
          </div>
          <button
            type="button"
            onClick={() => {
              soundEngine.playUiSelect();
              onClose();
            }}
            className="arcade-btn-secondary px-3 py-1 font-pixel-ui text-xs font-bold uppercase tracking-wider cursor-pointer"
          >
            CLOSE
          </button>
        </div>

        <div className="p-5 space-y-4 text-sm text-[#ebd8b7]">
          <p className="leading-snug">
            <strong className="text-[#ffd873]">FAMILY FIGHTERS</strong> is an original 2D retro
            arcade fighting game celebrating our family&apos;s hand-crafted pixel-art characters
            and panoramic Indian fighting arenas.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-[#110c09] border-2 border-[#4a3624] p-3">
              <div className="font-pixel-ui text-[11px] font-bold uppercase tracking-wider text-[#f5a623] mb-2">
                ORIGINAL FIGHTERS (193 SHEETS)
              </div>
              <ul className="space-y-1 text-xs">
                {CHARACTERS.map((c) => (
                  <li key={c.id} className="flex items-center justify-between">
                    <span style={{ color: c.accentColor }} className="font-pixel-ui font-bold uppercase">
                      {c.name}
                    </span>
                    <span className="text-[#b39e84]">{c.title}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-[#110c09] border-2 border-[#4a3624] p-3">
              <div className="font-pixel-ui text-[11px] font-bold uppercase tracking-wider text-[#f5a623] mb-2">
                ORIGINAL ARENAS (3 STAGES)
              </div>
              <ul className="space-y-1.5 text-xs">
                {STAGES.map((s) => (
                  <li key={s.id}>
                    <div className="font-pixel-ui font-bold text-[#fff5e0] uppercase">{s.name}</div>
                    <div className="text-[11px] text-[#b39e84]">{s.location}</div>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="bg-[#110c09] border-2 border-[#4a3624] p-3 text-xs text-[#b39e84] space-y-1">
            <div className="font-pixel-ui text-[11px] font-bold uppercase tracking-wider text-[#ffd873]">
              V4 LIVING ARCADE EXPERIENCE
            </div>
            <div>Adaptive multi-round AI with human reaction timing, character combo routes, footsies, okizeme &amp; whiff punishes.</div>
            <div>3-Stage Arcade Tournament, Survival Gauntlet, S–C Style Ranking, Rival Banter &amp; Live Attract Sparring.</div>
          </div>
        </div>
      </div>
    </div>
  );
};
