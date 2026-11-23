import React, { useState } from 'react';
import { soundEngine } from '../../engine/SoundEngine';

interface RotateDeviceOverlayProps {
  visible: boolean;
}

export const RotateDeviceOverlay: React.FC<RotateDeviceOverlayProps> = ({ visible }) => {
  const [lockMessage, setLockMessage] = useState<string | null>(null);

  if (!visible) return null;

  const tryLockLandscape = async () => {
    soundEngine.playUiSelect();
    try {
      const orientation = screen.orientation as ScreenOrientation & {
        lock?: (mode: string) => Promise<void>;
      };
      if (orientation && typeof orientation.lock === 'function') {
        if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
          await document.documentElement.requestFullscreen().catch(() => {});
        }
        await orientation.lock('landscape');
        setLockMessage('Landscape orientation locked.');
      } else {
        setLockMessage('Please turn your phone sideways to play.');
      }
    } catch {
      setLockMessage('Turn your phone sideways — automatic rotation lock is not enabled on this browser.');
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center p-6 bg-[#090609]/98 text-center"
      role="dialog"
      aria-modal="true"
      aria-label="Rotate your device to landscape"
      data-testid="rotate-device-overlay"
    >
      <div className="arcade-panel-brass p-5 max-w-xs w-full flex flex-col items-center gap-3">
        <img
          src="/assets/brand/logo-39-bharat-nagar.png"
          alt="39 Bharat Nagar"
          className="w-24 h-24 object-contain pixelated"
        />

        {/* Crisp Pixel-Art Phone Rotation Graphic */}
        <svg
          width="80"
          height="56"
          viewBox="0 0 80 56"
          fill="none"
          aria-hidden="true"
          className="my-1"
        >
          {/* Portrait outline */}
          <rect x="6" y="8" width="22" height="38" fill="#151020" stroke="#755b42" strokeWidth="2" />
          <rect x="10" y="13" width="14" height="26" fill="#22171b" />
          <rect x="15" y="41" width="4" height="2" fill="#f5b324" />
          {/* Curved pixel arrow */}
          <path d="M33 20H41V16L48 22L41 28V24H33V20Z" fill="#ffc947" />
          {/* Landscape target phone */}
          <rect x="50" y="18" width="26" height="20" fill="#1b1426" stroke="#ffc947" strokeWidth="2" />
          <rect x="54" y="21" width="18" height="14" fill="#2e2021" />
          <rect x="73" y="26" width="2" height="4" fill="#f5b324" />
        </svg>

        <h2 className="font-pixel text-xs uppercase tracking-wider text-[#ffc947] hud-text-stroke-sm">
          ROTATE YOUR DEVICE
        </h2>

        <p className="font-pixel-ui text-[11px] text-[#ebd8b7] leading-snug">
          39 BHARAT NAGAR is built for full-screen landscape combat. Turn your device sideways to
          continue without losing progress.
        </p>

        <button
          type="button"
          onClick={tryLockLandscape}
          className="arcade-btn-primary w-full py-2 px-3 font-pixel text-[10px] uppercase tracking-wider cursor-pointer"
        >
          TRY LANDSCAPE LOCK
        </button>

        {lockMessage && (
          <p className="font-pixel-ui text-[10px] text-[#b8a391] leading-tight">{lockMessage}</p>
        )}
      </div>
    </div>
  );
};
