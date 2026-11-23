import QRCode from 'qrcode';
import React, { useEffect, useState } from 'react';
import { CharacterId } from '../../config/animations';
import { getPlayableRegistryEntries } from '../../config/characterRegistry';
import { getCharacterProfile } from '../../config/characters';
import { STAGES, StageId } from '../../config/stages';
import { soundEngine } from '../../engine/SoundEngine';
import { TransportMode } from '../../network/MultiplayerClient';
import { ROOM_CODE_REGEX, RoomStatePayload } from '../../network/protocol';
import { SpritePreview } from '../SpritePreview';

interface LocalMultiplayerScreenProps {
  room: RoomStatePayload | null;
  slot: 1 | 2 | null;
  transport: TransportMode;
  latencyMs: number | null;
  errorMessage: string | null;
  isOnline: boolean;
  initialJoinCode?: string;
  onCreateRoom: (displayName: string, charId: CharacterId, stageId: StageId) => Promise<void>;
  onJoinRoom: (code: string, displayName: string, charId: CharacterId) => Promise<void>;
  onSelectCharacter: (charId: CharacterId) => void;
  onSelectStage: (stageId: StageId) => void;
  onToggleReady: (ready: boolean) => void;
  onStartMatch: () => void;
  onLeaveRoom: () => void;
  onBack: () => void;
}

export const LocalMultiplayerScreen: React.FC<LocalMultiplayerScreenProps> = ({
  room,
  slot,
  transport,
  latencyMs,
  errorMessage,
  isOnline,
  initialJoinCode = '',
  onCreateRoom,
  onJoinRoom,
  onSelectCharacter,
  onSelectStage,
  onToggleReady,
  onStartMatch,
  onLeaveRoom,
  onBack,
}) => {
  const playable = getPlayableRegistryEntries();
  const [tab, setTab] = useState<'create' | 'join'>(initialJoinCode ? 'join' : 'create');
  const [playerName, setPlayerName] = useState('PLAYER');
  const [joinCode, setJoinCode] = useState(initialJoinCode.toUpperCase());
  const [pickedChar, setPickedChar] = useState<CharacterId>('rahul');
  const [pickedStage, setPickedStage] = useState<StageId>('katra');
  const [busy, setBusy] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!room?.code) {
      setQrDataUrl(null);
      return;
    }
    const joinUrl = `${window.location.origin}/?join=${encodeURIComponent(room.code)}`;
    void QRCode.toDataURL(joinUrl, {
      width: 180,
      margin: 1,
      color: { dark: '#090609', light: '#fff5e0' },
    })
      .then((url) => setQrDataUrl(url))
      .catch(() => setQrDataUrl(null));
  }, [room?.code]);

  const handleCreate = async () => {
    setLocalError(null);
    setBusy(true);
    try {
      soundEngine.playUiConfirm();
      await onCreateRoom(playerName.trim() || 'PLAYER 1', pickedChar, pickedStage);
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : 'Failed to create room.');
    } finally {
      setBusy(false);
    }
  };

  const handleJoin = async () => {
    const clean = joinCode.trim().toUpperCase();
    if (!ROOM_CODE_REGEX.test(clean)) {
      setLocalError('Enter a valid 6-character room code (A–Z, 2–9).');
      return;
    }
    setLocalError(null);
    setBusy(true);
    try {
      soundEngine.playUiConfirm();
      await onJoinRoom(clean, playerName.trim() || 'PLAYER 2', pickedChar);
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : 'Failed to join room.');
    } finally {
      setBusy(false);
    }
  };

  const handleCopyCode = () => {
    if (!room?.code) return;
    void navigator.clipboard?.writeText(room.code).then(() => {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    });
  };

  const myParticipant = room ? (slot === 1 ? room.host : room.guest) : null;
  const bothReady = Boolean(room?.host.ready && room?.guest?.ready);
  const displayError = localError || errorMessage;

  return (
    <div
      className="absolute inset-0 z-30 flex flex-col justify-between p-2.5 sm:p-4 bg-[#090609] overflow-hidden"
      data-testid="local-multiplayer-screen"
    >
      <img
        src="/assets/stages/stage_01.png"
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 w-full h-full object-cover pixelated opacity-18"
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#090609]/92 via-[#151020]/80 to-[#090609]/96" />

      {/* Top Header */}
      <div className="relative z-10 flex items-center justify-between gap-2 border-b-2 border-[#755b42] pb-2">
        <div>
          <p className="font-pixel-ui text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.2em] text-[#ffc947]">
            TWO SEPARATE DEVICES · SAME WI-FI NETWORK (WEBRTC + SIGNALLING)
          </p>
          <h1 className="font-pixel text-xs sm:text-base md:text-lg uppercase text-[#fff5e0] hud-text-stroke-sm">
            LOCAL MULTIPLAYER
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <span className="hidden sm:inline font-pixel-ui text-[9px] uppercase text-[#b8a391]">
            {transport === 'webrtc'
              ? `P2P WEBRTC${latencyMs ? ` · ${latencyMs}ms` : ''}`
              : transport === 'relay'
                ? `SIGNALLING LINK${latencyMs ? ` · ${latencyMs}ms` : ''}`
                : isOnline
                  ? 'READY TO CONNECT'
                  : 'OFFLINE'}
          </span>
          <button
            type="button"
            onClick={() => {
              soundEngine.playUiSelect();
              if (room) onLeaveRoom();
              onBack();
            }}
            className="arcade-btn-secondary px-3 py-1.5 font-pixel-ui text-[10px] sm:text-xs font-bold uppercase cursor-pointer"
          >
            BACK
          </button>
        </div>
      </div>

      {/* Main Content */}
      {!room ? (
        <div className="relative z-10 flex-1 grid grid-cols-12 gap-2.5 sm:gap-3 py-2 min-h-0 items-stretch">
          {/* Left: Same Wi-Fi Create / Join Room */}
          <div className="col-span-8 arcade-panel-brass p-3 sm:p-4 flex flex-col justify-between min-h-0">
            <div>
              <div className="grid grid-cols-2 gap-2 mb-2.5">
                <button
                  type="button"
                  onClick={() => {
                    soundEngine.playUiSelect();
                    setTab('create');
                    setLocalError(null);
                  }}
                  className={`py-1.5 font-pixel text-[9px] sm:text-[11px] uppercase border-2 cursor-pointer ${
                    tab === 'create'
                      ? 'bg-[#f5a623] text-[#120a04] border-[#ffe38f]'
                      : 'bg-[#1a131f] text-[#ebd8b7] border-[#594635]'
                  }`}
                >
                  CREATE ROOM (P1)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    soundEngine.playUiSelect();
                    setTab('join');
                    setLocalError(null);
                  }}
                  className={`py-1.5 font-pixel text-[9px] sm:text-[11px] uppercase border-2 cursor-pointer ${
                    tab === 'join'
                      ? 'bg-[#f5a623] text-[#120a04] border-[#ffe38f]'
                      : 'bg-[#1a131f] text-[#ebd8b7] border-[#594635]'
                  }`}
                >
                  JOIN ROOM (P2)
                </button>
              </div>

              {!isOnline && (
                <div className="mb-2 bg-[#2b0f12] border border-[#e03126] px-2.5 py-1.5 font-pixel-ui text-[10px] text-[#ff9b8a]">
                  NETWORK REQUIRED: Room discovery needs the signalling server to be reachable.
                </div>
              )}

              <div className="grid grid-cols-2 gap-2 mb-2">
                <div>
                  <label
                    htmlFor="mp-name"
                    className="block font-pixel-ui text-[9px] text-[#b8a391] uppercase mb-1"
                  >
                    YOUR NAME
                  </label>
                  <input
                    id="mp-name"
                    type="text"
                    maxLength={16}
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    placeholder="PLAYER 1"
                    className="w-full bg-[#110c14] border-2 border-[#6b533b] px-2.5 py-1.5 font-pixel-ui text-xs text-[#fff5e0] uppercase"
                  />
                </div>

                {tab === 'join' ? (
                  <div>
                    <label
                      htmlFor="mp-code"
                      className="block font-pixel-ui text-[9px] text-[#ffc947] uppercase mb-1"
                    >
                      6-CHAR ROOM CODE
                    </label>
                    <input
                      id="mp-code"
                      type="text"
                      maxLength={6}
                      value={joinCode}
                      onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                      placeholder="E.G. B7K4M9"
                      className="w-full bg-[#110c14] border-2 border-[#f5b324] px-2.5 py-1.5 font-pixel text-xs text-[#ffc947] tracking-[0.2em] uppercase"
                    />
                  </div>
                ) : (
                  <div>
                    <label
                      htmlFor="mp-stage"
                      className="block font-pixel-ui text-[9px] text-[#b8a391] uppercase mb-1"
                    >
                      ARENA STAGE
                    </label>
                    <select
                      id="mp-stage"
                      value={pickedStage}
                      onChange={(e) => setPickedStage(e.target.value as StageId)}
                      className="w-full bg-[#110c14] border-2 border-[#6b533b] px-2.5 py-1.5 font-pixel-ui text-xs text-[#fff5e0] uppercase"
                    >
                      {STAGES.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Fighter Quick Picker */}
              <div>
                <span className="block font-pixel-ui text-[9px] text-[#b8a391] uppercase mb-1">
                  STARTING FIGHTER
                </span>
                <div className="grid grid-cols-4 gap-1.5">
                  {playable.map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => {
                        soundEngine.playUiSelect();
                        setPickedChar(f.id);
                      }}
                      style={{ borderColor: pickedChar === f.id ? '#ffe38f' : '#4a3624' }}
                      className={`border-2 py-1 px-1 flex flex-col items-center cursor-pointer ${
                        pickedChar === f.id ? 'bg-[#2a1d24]' : 'bg-[#120d16]'
                      }`}
                    >
                      <SpritePreview
                        sheetUrl={f.profile.idleSheetUrl}
                        frames={f.profile.idleFrames}
                        fps={7}
                        ariaLabel={f.displayName}
                        className="w-8 h-8 sm:w-11 sm:h-11 object-contain"
                      />
                      <span
                        className="font-pixel text-[7px] sm:text-[8px] uppercase"
                        style={{ color: f.accentColor }}
                      >
                        {f.displayName}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-[#4a3624] flex items-center justify-between gap-2">
              <div className="text-[10px] font-pixel-ui text-[#ff9b8a] truncate">
                {displayError ||
                  (tab === 'create'
                    ? 'Generates a Room Code + QR for Phone 2 on the same Wi-Fi.'
                    : 'Scan Phone 1’s QR code or enter the 6-character Room Code.')}
              </div>

              <button
                type="button"
                disabled={busy || !isOnline}
                onClick={tab === 'create' ? handleCreate : handleJoin}
                className="arcade-btn-primary px-4 sm:px-5 py-2 font-pixel text-[10px] sm:text-xs uppercase tracking-wider shrink-0 cursor-pointer disabled:opacity-50"
              >
                {busy
                  ? 'CONNECTING...'
                  : tab === 'create'
                    ? 'CREATE ROOM >'
                    : 'JOIN ROOM >'}
              </button>
            </div>
          </div>

          {/* Right: Future Transports + Honest Same Wi-Fi Architecture Note */}
          <div className="col-span-4 flex flex-col justify-between gap-2 min-h-0">
            <div className="arcade-panel p-2.5 opacity-80">
              <div className="flex items-center justify-between gap-1">
                <span className="font-pixel text-[8px] sm:text-[9px] text-[#ffc947] uppercase">
                  BLUETOOTH NEARBY
                </span>
                <span className="px-1.5 py-0.5 bg-[#2e2021] text-[#ffc947] font-pixel-ui text-[7px] uppercase">
                  COMING SOON
                </span>
              </div>
              <p className="text-[10px] text-[#b8a391] leading-snug mt-1">
                Cross-platform phone-to-phone Bluetooth gameplay requires a future native mobile
                build. Web browsers do not expose peer-to-peer Bluetooth sockets across iOS &amp;
                Android.
              </p>
            </div>

            <div className="arcade-panel p-2.5 opacity-80">
              <div className="flex items-center justify-between gap-1">
                <span className="font-pixel text-[8px] sm:text-[9px] text-[#38bdf8] uppercase">
                  ONLINE MULTIPLAYER
                </span>
                <span className="px-1.5 py-0.5 bg-[#2e2021] text-[#38bdf8] font-pixel-ui text-[7px] uppercase">
                  COMING SOON
                </span>
              </div>
              <p className="text-[10px] text-[#b8a391] leading-snug mt-1">
                Global matchmaking, ranked ladders, and dedicated rollback relays are planned for a
                future release.
              </p>
            </div>

            <div className="arcade-panel p-2.5 flex-1 flex flex-col justify-center">
              <div className="font-pixel-ui text-[9px] font-bold uppercase text-[#ebd8b7]">
                SAME WI-FI PWA NOTE
              </div>
              <p className="text-[10px] text-[#b8a391] leading-snug mt-1">
                Connect both phones to the same Wi-Fi for low-latency WebRTC DataChannel sync. The
                signalling service must be reachable for initial room handshake.
              </p>
            </div>
          </div>
        </div>
      ) : (
        /* Active Room Lobby (Host + Guest) */
        <div className="relative z-10 flex-1 grid grid-cols-12 gap-2.5 sm:gap-3 py-2 min-h-0 items-stretch">
          {/* Room Code + QR Panel */}
          <div className="col-span-4 arcade-panel-brass p-2.5 sm:p-3 flex flex-col items-center justify-between text-center">
            <div className="w-full">
              <p className="font-pixel-ui text-[9px] uppercase tracking-[0.2em] text-[#ffc947]">
                ROOM CODE
              </p>
              <div className="mt-1 flex items-center justify-center gap-2">
                <span
                  className="font-pixel text-base sm:text-xl tracking-[0.22em] text-[#fff5e0] hud-text-stroke-sm"
                  data-testid="room-code-display"
                >
                  {room.code}
                </span>
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="arcade-btn-secondary px-2 py-0.5 font-pixel-ui text-[8px] uppercase cursor-pointer"
                >
                  {copied ? 'COPIED' : 'COPY'}
                </button>
              </div>
            </div>

            {qrDataUrl && (
              <div className="bg-[#fff5e0] p-1.5 border-2 border-[#f5b324] my-1">
                <img
                  src={qrDataUrl}
                  alt={`QR Code to join room ${room.code}`}
                  className="w-24 h-24 sm:w-32 sm:h-32 block pixelated"
                />
              </div>
            )}

            <div className="w-full space-y-1">
              <div className="font-pixel-ui text-[9px] uppercase text-[#ebd8b7]">
                {room.guest ? 'PLAYER 2 CONNECTED!' : 'WAITING FOR PLAYER 2...'}
              </div>
              <button
                type="button"
                onClick={() => {
                  soundEngine.playUiSelect();
                  onLeaveRoom();
                }}
                className="arcade-btn-secondary w-full py-1 font-pixel-ui text-[9px] uppercase text-[#ff9b8a] cursor-pointer"
              >
                LEAVE ROOM
              </button>
            </div>
          </div>

          {/* Players & Character Selection */}
          <div className="col-span-8 arcade-panel p-2.5 sm:p-3 flex flex-col justify-between min-h-0">
            <div className="grid grid-cols-2 gap-2">
              {[room.host, room.guest].map((participant, idx) => {
                const isSlot1 = idx === 0;
                const prof = participant ? getCharacterProfile(participant.characterId) : null;
                return (
                  <div
                    key={idx}
                    className={`p-2 border-2 flex items-center gap-2 ${
                      participant?.ready
                        ? 'bg-[#172219] border-[#22c55e]'
                        : 'bg-[#120d16] border-[#4a3624]'
                    }`}
                  >
                    {prof ? (
                      <SpritePreview
                        sheetUrl={prof.idleSheetUrl}
                        frames={prof.idleFrames}
                        fps={9}
                        flipX={!isSlot1}
                        ariaLabel={prof.name}
                        className="w-12 h-12 sm:w-16 sm:h-16 object-contain shrink-0"
                      />
                    ) : (
                      <div className="w-12 h-12 sm:w-16 sm:h-16 bg-[#090609] border border-[#4a3624] flex items-center justify-center font-pixel text-sm text-[#755b42]">
                        ?
                      </div>
                    )}
                    <div className="min-w-0">
                      <div className="font-pixel text-[8px] sm:text-[9px] uppercase text-[#ffc947]">
                        {isSlot1 ? 'P1 HOST' : 'P2 GUEST'}
                      </div>
                      <div className="font-pixel-ui text-[10px] sm:text-xs font-bold text-[#fff5e0] truncate">
                        {participant ? participant.displayName : 'WAITING...'}
                      </div>
                      <div
                        className="font-pixel text-[8px] uppercase"
                        style={{ color: prof?.accentColor ?? '#b8a391' }}
                      >
                        {prof ? prof.name : 'OPEN SLOT'}
                      </div>
                      <div className="font-pixel-ui text-[8px] uppercase mt-0.5">
                        {participant ? (
                          participant.ready ? (
                            <span className="text-[#86efac]">READY</span>
                          ) : (
                            <span className="text-[#b8a391]">SELECTING...</span>
                          )
                        ) : (
                          <span className="text-[#b8a391]">SHARE CODE / QR</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Select Your Character & Stage (Host) */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between gap-2">
                <span className="font-pixel-ui text-[9px] uppercase text-[#ffc947]">
                  SELECT YOUR CHARACTER (SLOT P{slot})
                </span>
                {slot === 1 && (
                  <select
                    aria-label="Room Stage"
                    value={room.stageId}
                    onChange={(e) => onSelectStage(e.target.value as StageId)}
                    className="bg-[#110c14] border border-[#6b533b] px-2 py-0.5 font-pixel-ui text-[9px] text-[#fff5e0] uppercase"
                  >
                    {STAGES.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="grid grid-cols-4 gap-1.5">
                {playable.map((f) => {
                  const selected = myParticipant?.characterId === f.id;
                  return (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => {
                        soundEngine.playUiSelect();
                        onSelectCharacter(f.id);
                      }}
                      style={{ borderColor: selected ? '#ffe38f' : '#4a3624' }}
                      className={`border-2 py-1 px-1.5 font-pixel text-[8px] sm:text-[9px] uppercase cursor-pointer ${
                        selected ? 'bg-[#2a1d24]' : 'bg-[#120d16]'
                      }`}
                    >
                      <span style={{ color: f.accentColor }}>{f.displayName}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Ready + Host Start Bar */}
            <div className="flex items-center justify-between gap-2 pt-2 border-t border-[#4a3624]">
              <button
                type="button"
                onClick={() => {
                  soundEngine.playUiConfirm();
                  onToggleReady(!myParticipant?.ready);
                }}
                className={`px-4 py-2 font-pixel text-[10px] uppercase cursor-pointer border-2 ${
                  myParticipant?.ready
                    ? 'bg-[#22c55e] text-[#090609] border-[#86efac]'
                    : 'arcade-btn-secondary text-[#ffc947]'
                }`}
              >
                {myParticipant?.ready ? 'READY ✓' : 'CONFIRM READY'}
              </button>

              {slot === 1 ? (
                <button
                  type="button"
                  disabled={!bothReady}
                  onClick={() => {
                    soundEngine.playUiConfirm();
                    onStartMatch();
                  }}
                  className="arcade-btn-primary px-5 py-2 font-pixel text-[10px] sm:text-xs uppercase tracking-wider cursor-pointer disabled:opacity-45"
                >
                  START MATCH &gt;
                </button>
              ) : (
                <span className="font-pixel-ui text-[10px] uppercase text-[#ebd8b7]">
                  {bothReady ? 'WAITING FOR HOST TO START...' : 'CONFIRM READY WHEN SET'}
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
