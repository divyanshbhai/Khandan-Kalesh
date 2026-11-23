import { MusicIntensity, MusicScene } from '../../config/audioCatalog';
import { DEFAULT_SETTINGS } from '../../config/game';
import { StageId } from '../../config/stages';
import { MusicManager } from './MusicManager';
import { SFXManager } from './SFXManager';

export interface AudioMixConfig {
  masterVolume: number;
  musicVolume: number;
  sfxVolume: number;
  ambienceVolume: number;
  uiVolume: number;
  hapticsEnabled: boolean;
}

export class AudioManager {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private ambienceGain: GainNode | null = null;
  private uiGain: GainNode | null = null;

  private muted = false;
  private unlocked = false;
  private mix: AudioMixConfig = {
    masterVolume: DEFAULT_SETTINGS.masterVolume,
    musicVolume: DEFAULT_SETTINGS.musicVolume,
    sfxVolume: DEFAULT_SETTINGS.sfxVolume,
    ambienceVolume: DEFAULT_SETTINGS.ambienceVolume,
    uiVolume: DEFAULT_SETTINGS.uiVolume,
    hapticsEnabled: DEFAULT_SETTINGS.hapticsEnabled,
  };

  public readonly sfx: SFXManager;
  public readonly music: MusicManager;

  constructor() {
    this.sfx = new SFXManager({
      getContext: () => this.ctx,
      getSfxBus: () => this.sfxGain,
      getUiBus: () => this.uiGain,
      isAudible: () => this.isAudible(),
    });
    this.music = new MusicManager({
      getContext: () => this.ctx,
      getMusicBus: () => this.musicGain,
      getAmbienceBus: () => this.ambienceGain,
      isAudible: () => this.isAudible(),
    });
  }

  /** Must be called from a genuine user interaction (click, pointerdown, keydown). */
  unlock(): boolean {
    if (typeof window === 'undefined') return false;
    try {
      if (!this.ctx) {
        const AudioCtx =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
        if (!AudioCtx) return false;
        this.ctx = new AudioCtx();

        const compressor = this.ctx.createDynamicsCompressor();
        compressor.threshold.value = -10;
        compressor.knee.value = 18;
        compressor.ratio.value = 6;
        compressor.attack.value = 0.004;
        compressor.release.value = 0.14;

        this.masterGain = this.ctx.createGain();
        this.musicGain = this.ctx.createGain();
        this.sfxGain = this.ctx.createGain();
        this.ambienceGain = this.ctx.createGain();
        this.uiGain = this.ctx.createGain();

        this.musicGain.connect(this.masterGain);
        this.sfxGain.connect(this.masterGain);
        this.ambienceGain.connect(this.masterGain);
        this.uiGain.connect(this.masterGain);
        this.masterGain.connect(compressor);
        compressor.connect(this.ctx.destination);

        this.applyGains();
      }

      if (this.ctx.state === 'suspended') {
        void this.ctx.resume().then(() => {
          this.unlocked = true;
          this.music.onUnlocked();
        });
      } else {
        this.unlocked = true;
        this.music.onUnlocked();
      }
      return true;
    } catch {
      return false;
    }
  }

  isUnlocked(): boolean {
    return this.unlocked;
  }

  isAudible(): boolean {
    return !this.muted && this.mix.masterVolume > 0.001;
  }

  setMix(partial: Partial<AudioMixConfig>): void {
    this.mix = {
      ...this.mix,
      ...partial,
    };
    this.applyGains();
  }

  setMuted(muted: boolean): void {
    this.muted = muted;
    this.applyGains();
  }

  isMuted(): boolean {
    return this.muted;
  }

  setMusicScene(scene: MusicScene, stageId?: StageId): void {
    this.music.setScene(scene, stageId);
  }

  setMusicIntensity(intensity: MusicIntensity): void {
    this.music.setIntensity(intensity);
  }

  triggerHaptic(pattern: number | number[]): void {
    if (!this.mix.hapticsEnabled) return;
    if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
      try {
        navigator.vibrate(pattern);
      } catch {
        // Ignore unsupported haptics
      }
    }
  }

  private applyGains(): void {
    if (!this.ctx || !this.masterGain || !this.musicGain || !this.sfxGain || !this.ambienceGain || !this.uiGain) {
      return;
    }
    const now = this.ctx.currentTime;
    const clamp = (v: number) => Math.max(0, Math.min(1, v));
    this.masterGain.gain.setTargetAtTime(this.muted ? 0 : clamp(this.mix.masterVolume), now, 0.03);
    this.musicGain.gain.setTargetAtTime(clamp(this.mix.musicVolume) * 0.55, now, 0.05);
    this.sfxGain.gain.setTargetAtTime(clamp(this.mix.sfxVolume), now, 0.03);
    this.ambienceGain.gain.setTargetAtTime(clamp(this.mix.ambienceVolume) * 0.5, now, 0.08);
    this.uiGain.gain.setTargetAtTime(clamp(this.mix.uiVolume), now, 0.03);
  }
}

export const audioManager = new AudioManager();
