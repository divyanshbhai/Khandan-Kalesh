import React from 'react';
import { soundEngine } from '../../engine/SoundEngine';

interface PWAInstallModalProps {
  isInstalled: boolean;
  isIOS: boolean;
  canPromptInstall: boolean;
  onPromptInstall: () => Promise<'accepted' | 'dismissed' | 'unavailable'>;
  onClose: () => void;
}

export const PWAInstallModal: React.FC<PWAInstallModalProps> = ({
  isInstalled,
  isIOS,
  canPromptInstall,
  onPromptInstall,
  onClose,
}) => {
  return (
    <div
      className="absolute inset-0 z-50 flex items-center justify-center bg-[#090609]/92 p-3"
      role="dialog"
      aria-modal="true"
      aria-label="Install 39 Bharat Nagar"
    >
      <div className="arcade-panel-brass w-full max-w-lg overflow-hidden">
        <div className="px-4 py-2.5 border-b-2 border-[#755b42] bg-[#140e18] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img
              src="/pwa-192x192.png"
              alt="39 Bharat Nagar App Icon"
              className="w-8 h-8 border border-[#f5b324] pixelated"
            />
            <div>
              <p className="font-pixel-ui text-[9px] font-bold uppercase tracking-[0.2em] text-[#f5a623]">
                INSTALLABLE ARCADE APP
              </p>
              <h2 className="font-pixel text-xs sm:text-sm uppercase text-[#fff5e0]">
                INSTALL 39 BHARAT NAGAR
              </h2>
            </div>
          </div>
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

        <div className="p-4 space-y-3 text-xs text-[#ebd8b7]">
          {isInstalled ? (
            <div className="bg-[#151020] border-2 border-[#22c55e] p-3 font-pixel-ui text-[#86efac]">
              39 BHARAT NAGAR is already running as an installed standalone app on this device.
            </div>
          ) : canPromptInstall ? (
            <div className="space-y-2.5">
              <p className="leading-snug">
                Install <strong className="text-[#ffc947]">39 Bharat Nagar</strong> directly to your
                home screen for full-screen landscape play and offline single-player access.
              </p>
              <button
                type="button"
                onClick={async () => {
                  soundEngine.playUiConfirm();
                  await onPromptInstall();
                  onClose();
                }}
                className="arcade-btn-primary w-full py-2.5 font-pixel text-xs uppercase tracking-wider cursor-pointer"
              >
                INSTALL GAME NOW
              </button>
            </div>
          ) : isIOS ? (
            <div className="space-y-2">
              <p className="font-pixel-ui text-[11px] uppercase text-[#ffc947]">
                IPHONE / IPAD SAFARI INSTALLATION:
              </p>
              <ol className="space-y-1.5 bg-[#120d15] border-2 border-[#4a3624] p-3 font-pixel-ui text-[11px]">
                <li>1. Tap the <strong className="text-[#fff5e0]">SHARE</strong> icon in Safari&apos;s toolbar.</li>
                <li>2. Scroll down and tap <strong className="text-[#fff5e0]">ADD TO HOME SCREEN</strong>.</li>
                <li>3. Launch <strong className="text-[#ffc947]">39 Bharat Nagar</strong> as a full-screen Web App.</li>
              </ol>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="font-pixel-ui text-[11px] uppercase text-[#ffc947]">
                BROWSER INSTALLATION STEPS:
              </p>
              <div className="bg-[#120d15] border-2 border-[#4a3624] p-3 font-pixel-ui text-[11px] space-y-1">
                <div>• Chrome / Edge Desktop: Click the install icon in the address bar or Browser Menu → Install 39 Bharat Nagar.</div>
                <div>• Android Chrome: Open Menu (⋮) → Install App / Add to Home Screen.</div>
                <div>• iOS Safari: Share → Add to Home Screen → Open as Web App.</div>
              </div>
            </div>
          )}

          <p className="text-[11px] text-[#b8a391] leading-snug">
            Offline single-player play works once core fighters and stages are cached. Local Wi-Fi
            multiplayer room discovery requires the signalling server to be reachable.
          </p>
        </div>
      </div>
    </div>
  );
};
