import React from 'react';
import { soundEngine } from '../../engine/SoundEngine';

interface CreditsModalProps {
  onClose: () => void;
}

export const CreditsModal: React.FC<CreditsModalProps> = ({ onClose }) => {
  return (
    <div
      className="absolute inset-0 z-50 flex items-center justify-center bg-[#090609]/92 p-3"
      role="dialog"
      aria-modal="true"
      aria-label="39 Bharat Nagar Credits"
      data-testid="credits-modal"
    >
      <div className="arcade-panel-brass w-full max-w-lg overflow-hidden text-center">
        <div className="px-4 py-2.5 border-b-2 border-[#755b42] bg-[#140e18] flex items-center justify-between">
          <span className="font-pixel-ui text-[10px] font-bold uppercase tracking-[0.22em] text-[#ffc947]">
            OFFICIAL CREDITS · VER 1.0
          </span>
          <button
            type="button"
            onClick={() => {
              soundEngine.playUiSelect();
              onClose();
            }}
            className="arcade-btn-secondary px-2.5 py-1 font-pixel-ui text-[10px] font-bold uppercase cursor-pointer"
          >
            CLOSE
          </button>
        </div>

        <div className="p-4 sm:p-5 flex flex-col items-center gap-3 bg-gradient-to-b from-[#151020] to-[#0f0b12]">
          <img
            src="/assets/brand/logo-39-bharat-nagar.png"
            alt="39 Bharat Nagar Logo"
            className="w-24 h-24 sm:w-28 sm:h-28 object-contain pixelated drop-shadow-[0_4px_0_#090609]"
          />

          <div>
            <h2 className="font-pixel text-sm sm:text-base uppercase tracking-wider text-[#ffc947] hud-text-stroke-sm">
              39 BHARAT NAGAR
            </h2>
            <p className="font-pixel-ui text-[10px] uppercase tracking-[0.2em] text-[#ebd8b7] mt-0.5">
              ONE HOUSE. SEVEN CLAIMS.
            </p>
          </div>

          <div className="w-full bg-[#110c14] border-2 border-[#6b533b] p-3 sm:p-4 space-y-1.5">
            <p className="font-pixel-ui text-[10px] uppercase tracking-[0.22em] text-[#b8a391]">
              CREATED &amp; DEVELOPED BY
            </p>
            <p className="font-pixel text-sm sm:text-lg uppercase tracking-wider text-[#fff5e0] hud-text-stroke-sm">
              DIVYANSH AMA QIM
            </p>
            <p className="font-pixel-ui text-[10px] sm:text-xs uppercase tracking-[0.18em] text-[#ffc947] pt-1">
              Creator · Game Designer · Developer
            </p>
          </div>

          <p className="text-xs sm:text-sm text-[#ebd8b7] leading-snug max-w-md italic">
            &ldquo;An original family fighting-game universe inspired by the rivalries, humour and
            everyday drama of Bharat Nagar.&rdquo;
          </p>
        </div>
      </div>
    </div>
  );
};
