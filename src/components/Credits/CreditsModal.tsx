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
      className="absolute inset-0 z-50 flex items-center justify-center bg-[#0b0807]/88 p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Family Fighters Credits"
    >
      <div className="arcade-panel-brass rounded-lg w-full max-w-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-[#4a3a2b] bg-[#140f0c] flex items-center justify-between">
          <div>
            <p className="font-display text-xs font-bold uppercase tracking-[0.26em] text-[#f5a623]">
              Edition V2
            </p>
            <h2 className="font-display text-3xl font-extrabold uppercase tracking-wider text-[#f8efe0] leading-none">
              Family Fighters Credits
            </h2>
          </div>
          <button
            type="button"
            onClick={() => {
              soundEngine.playUiSelect();
              onClose();
            }}
            className="arcade-btn-secondary px-3 py-1.5 rounded font-display text-xs font-bold uppercase tracking-wider cursor-pointer"
          >
            Close
          </button>
        </div>

        <div className="p-6 space-y-4 text-sm text-[#e7dac5]">
          <p className="leading-relaxed">
            <strong>FAMILY FIGHTERS</strong> is an original 2D arcade fighting game built around our
            family&apos;s hand-crafted pixel-art characters and panoramic Indian fighting arenas.
          </p>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[#140f0c] border border-[#4a3a2b] rounded p-3">
              <div className="font-display text-xs font-bold uppercase tracking-widest text-[#f5a623] mb-1.5">
                Original Fighters (193 Sheets)
              </div>
              <ul className="space-y-1 text-xs">
                {CHARACTERS.map((c) => (
                  <li key={c.id} className="flex items-center justify-between">
                    <span style={{ color: c.accentColor }} className="font-bold">
                      {c.name}
                    </span>
                    <span className="text-[#b8a996]">{c.title}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-[#140f0c] border border-[#4a3a2b] rounded p-3">
              <div className="font-display text-xs font-bold uppercase tracking-widest text-[#f5a623] mb-1.5">
                Original Arenas (3 Stages)
              </div>
              <ul className="space-y-1 text-xs">
                {STAGES.map((s) => (
                  <li key={s.id}>
                    <div className="font-bold text-[#f8efe0]">{s.name}</div>
                    <div className="text-[11px] text-[#b8a996]">{s.location}</div>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="bg-[#140f0c] border border-[#4a3a2b] rounded p-3 text-xs text-[#b8a996] space-y-1">
            <div className="font-display text-xs font-bold uppercase tracking-widest text-[#ffd67a]">
              V2 Features &amp; Asset Status
            </div>
            <div>All 4 characters complete across Batches 01–05 (including Sagar Batch 03).</div>
            <div>Adaptive Utility CPU AI, Training Dojo, Procedural Arcade Music &amp; Character SFX, Multi-Touch Controls (1P &amp; Local 2P).</div>
          </div>
        </div>
      </div>
    </div>
  );
};
