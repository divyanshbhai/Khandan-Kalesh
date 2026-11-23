import { CharacterId } from '../../config/animations';
import { SFX_CATALOG } from '../../config/audioCatalog';
import { getCharacterSoundProfile } from './CharacterSoundProfiles';

export interface SfxBusProvider {
  getContext(): AudioContext | null;
  getSfxBus(): GainNode | null;
  getUiBus(): GainNode | null;
  isAudible(): boolean;
}

export class SFXManager {
  private lastPlayedAt = new Map<string, number>();
  private activeVoiceCount = 0;
  private readonly maxConcurrentVoices = 14;
  private provider: SfxBusProvider;
  private cachedNoiseBuffer: AudioBuffer | null = null;

  constructor(provider: SfxBusProvider) {
    this.provider = provider;
  }

  /**
   * Pure deterministic deduplication check — prevents duplicate SFX firing
   * across consecutive frames or overlapping hit events.
   */
  canPlayEvent(eventKey: string, nowMs: number, customMinIntervalMs?: number): boolean {
    const baseId = eventKey.split(':')[0];
    const entry = SFX_CATALOG[baseId];
    const minInterval = customMinIntervalMs ?? entry?.minIntervalMs ?? 50;
    const prev = this.lastPlayedAt.get(eventKey);
    if (prev !== undefined && nowMs - prev < minInterval) {
      return false;
    }
    this.lastPlayedAt.set(eventKey, nowMs);
    if (this.lastPlayedAt.size > 160) {
      // Keep dedupe map compact
      const cutoff = nowMs - 2000;
      for (const [k, ts] of this.lastPlayedAt.entries()) {
        if (ts < cutoff) this.lastPlayedAt.delete(k);
      }
    }
    return true;
  }

  resetDeduplication(): void {
    this.lastPlayedAt.clear();
  }

  private getTargetBus(isUi: boolean): { ctx: AudioContext; bus: GainNode } | null {
    if (!this.provider.isAudible()) return null;
    if (this.activeVoiceCount >= this.maxConcurrentVoices) return null;
    const ctx = this.provider.getContext();
    const bus = isUi ? this.provider.getUiBus() : this.provider.getSfxBus();
    if (!ctx || !bus) return null;
    return { ctx, bus };
  }

  private playTone(opts: {
    freqStart: number;
    freqEnd: number;
    duration: number;
    type: OscillatorType;
    volume: number;
    delay?: number;
    pitchVariance?: number;
    isUi?: boolean;
  }): void {
    const target = this.getTargetBus(Boolean(opts.isUi));
    if (!target) return;
    const { ctx, bus } = target;
    const now = ctx.currentTime + (opts.delay ?? 0);
    const variance = opts.pitchVariance ?? 0.06;
    const jitter = 1 + (Math.random() * 2 - 1) * variance;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = opts.type;
    osc.frequency.setValueAtTime(Math.max(25, opts.freqStart * jitter), now);
    osc.frequency.exponentialRampToValueAtTime(Math.max(20, opts.freqEnd * jitter), now + opts.duration);

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(opts.volume, now + Math.min(0.01, opts.duration * 0.25));
    gain.gain.exponentialRampToValueAtTime(0.0001, now + opts.duration);

    osc.connect(gain);
    gain.connect(bus);

    this.activeVoiceCount++;
    osc.onended = () => {
      this.activeVoiceCount = Math.max(0, this.activeVoiceCount - 1);
    };
    osc.start(now);
    osc.stop(now + opts.duration + 0.025);
  }

  private getNoiseBuffer(ctx: AudioContext): AudioBuffer {
    if (this.cachedNoiseBuffer && this.cachedNoiseBuffer.sampleRate === ctx.sampleRate) {
      return this.cachedNoiseBuffer;
    }
    const size = Math.max(1, Math.floor(ctx.sampleRate * 0.5));
    const buffer = ctx.createBuffer(1, size, ctx.sampleRate);
    const ch = buffer.getChannelData(0);
    for (let i = 0; i < size; i++) {
      ch[i] = Math.random() * 2 - 1;
    }
    this.cachedNoiseBuffer = buffer;
    return buffer;
  }

  private playNoise(opts: {
    duration: number;
    volume: number;
    highpass?: number;
    lowpass?: number;
    delay?: number;
    isUi?: boolean;
  }): void {
    const target = this.getTargetBus(Boolean(opts.isUi));
    if (!target) return;
    const { ctx, bus } = target;
    const now = ctx.currentTime + (opts.delay ?? 0);

    const src = ctx.createBufferSource();
    src.buffer = this.getNoiseBuffer(ctx);

    const hp = ctx.createBiquadFilter();
    hp.type = 'highpass';
    hp.frequency.value = opts.highpass ?? 500;

    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = opts.lowpass ?? 3800;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(opts.volume, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + opts.duration);

    src.connect(hp);
    hp.connect(lp);
    lp.connect(gain);
    gain.connect(bus);

    this.activeVoiceCount++;
    src.onended = () => {
      this.activeVoiceCount = Math.max(0, this.activeVoiceCount - 1);
    };
    src.start(now);
    src.stop(now + opts.duration + 0.02);
  }

  private nowMs(): number {
    return typeof performance !== 'undefined' ? performance.now() : Date.now();
  }

  // --- UI ---
  playUiHover(): void {
    if (!this.canPlayEvent('ui_hover', this.nowMs())) return;
    this.playTone({ freqStart: 620, freqEnd: 740, duration: 0.04, type: 'triangle', volume: 0.1, isUi: true });
  }

  playUiSelect(): void {
    if (!this.canPlayEvent('ui_select', this.nowMs())) return;
    this.playTone({ freqStart: 500, freqEnd: 760, duration: 0.075, type: 'triangle', volume: 0.18, isUi: true });
  }

  playUiConfirm(): void {
    if (!this.canPlayEvent('ui_confirm', this.nowMs())) return;
    this.playTone({ freqStart: 440, freqEnd: 660, duration: 0.085, type: 'triangle', volume: 0.2, isUi: true });
    this.playTone({ freqStart: 660, freqEnd: 990, duration: 0.12, type: 'triangle', volume: 0.2, delay: 0.055, isUi: true });
  }

  playTouchButton(accentHz = 560): void {
    if (!this.canPlayEvent('ui_touch_btn', this.nowMs())) return;
    this.playTone({ freqStart: accentHz, freqEnd: accentHz * 1.25, duration: 0.045, type: 'sine', volume: 0.12, isUi: true });
  }

  playPause(isPausing: boolean): void {
    const key = isPausing ? 'ui_pause' : 'ui_resume';
    if (!this.canPlayEvent(key, this.nowMs())) return;
    if (isPausing) {
      this.playTone({ freqStart: 620, freqEnd: 340, duration: 0.11, type: 'triangle', volume: 0.2, isUi: true });
    } else {
      this.playTone({ freqStart: 360, freqEnd: 680, duration: 0.11, type: 'triangle', volume: 0.2, isUi: true });
    }
  }

  // --- Movement ---
  playFootstep(slot = 1): void {
    if (!this.canPlayEvent(`move_footstep:${slot}`, this.nowMs())) return;
    this.playTone({ freqStart: 120, freqEnd: 58, duration: 0.045, type: 'sine', volume: 0.09, pitchVariance: 0.12 });
    this.playNoise({ duration: 0.035, volume: 0.05, highpass: 900, lowpass: 2400 });
  }

  playDash(slot = 1): void {
    if (!this.canPlayEvent(`move_dash:${slot}`, this.nowMs())) return;
    this.playNoise({ duration: 0.13, volume: 0.16, highpass: 450, lowpass: 3200 });
    this.playTone({ freqStart: 220, freqEnd: 460, duration: 0.09, type: 'triangle', volume: 0.1 });
  }

  playJump(slot = 1): void {
    if (!this.canPlayEvent(`move_jump:${slot}`, this.nowMs())) return;
    this.playTone({ freqStart: 175, freqEnd: 390, duration: 0.11, type: 'sine', volume: 0.15 });
  }

  playLand(slot = 1): void {
    if (!this.canPlayEvent(`move_land:${slot}`, this.nowMs())) return;
    this.playTone({ freqStart: 118, freqEnd: 42, duration: 0.095, type: 'sine', volume: 0.18 });
    this.playNoise({ duration: 0.06, volume: 0.1, highpass: 180, lowpass: 1100 });
  }

  playCrouch(slot = 1): void {
    if (!this.canPlayEvent(`move_crouch:${slot}`, this.nowMs())) return;
    this.playNoise({ duration: 0.05, volume: 0.07, highpass: 700, lowpass: 2000 });
  }

  // --- Combat ---
  playWhoosh(heavy = false, isKick = false, slot = 1): void {
    const key = heavy ? `combat_whoosh_heavy:${slot}` : `combat_whoosh_light:${slot}`;
    if (!this.canPlayEvent(key, this.nowMs())) return;
    const hp = isKick ? 260 : heavy ? 320 : 620;
    const lp = isKick ? 1900 : heavy ? 1700 : 3200;
    this.playNoise({ duration: heavy ? 0.13 : 0.075, volume: heavy ? 0.17 : 0.11, highpass: hp, lowpass: lp });
    if (heavy) {
      this.playTone({ freqStart: isKick ? 190 : 240, freqEnd: 95, duration: 0.1, type: 'triangle', volume: 0.09 });
    }
  }

  playHit(opts: {
    heavy?: boolean;
    counter?: boolean;
    critical?: boolean;
    attackerId?: CharacterId;
    slot?: number;
  }): void {
    const key = opts.critical
      ? `combat_hit_critical:${opts.slot ?? 0}`
      : opts.counter
        ? `combat_hit_counter:${opts.slot ?? 0}`
        : opts.heavy
          ? `combat_hit_heavy:${opts.slot ?? 0}`
          : `combat_hit_light:${opts.slot ?? 0}`;
    if (!this.canPlayEvent(key, this.nowMs())) return;

    const profile = opts.attackerId ? getCharacterSoundProfile(opts.attackerId) : null;

    if (opts.heavy || opts.critical) {
      this.playTone({
        freqStart: opts.critical ? 230 : 185,
        freqEnd: profile?.impactSubHz ?? 44,
        duration: opts.critical ? 0.24 : 0.18,
        type: 'sawtooth',
        volume: opts.critical ? 0.36 : 0.32,
      });
      this.playTone({
        freqStart: 125,
        freqEnd: 34,
        duration: 0.22,
        type: 'triangle',
        volume: 0.3,
      });
      this.playNoise({ duration: 0.15, volume: 0.28, highpass: 240, lowpass: 2800 });
    } else {
      this.playTone({ freqStart: 270, freqEnd: 82, duration: 0.095, type: 'triangle', volume: 0.24 });
      this.playNoise({ duration: 0.07, volume: 0.19, highpass: 720, lowpass: 4000 });
    }

    if (opts.counter) {
      this.playTone({ freqStart: 940, freqEnd: 1320, duration: 0.11, type: 'sine', volume: 0.18 });
    }
    if (opts.critical) {
      this.playTone({ freqStart: 620, freqEnd: 1180, duration: 0.16, type: 'triangle', volume: 0.22, delay: 0.02 });
    }
  }

  playBlock(slot = 1): void {
    if (!this.canPlayEvent(`combat_block:${slot}`, this.nowMs())) return;
    this.playTone({ freqStart: 820, freqEnd: 340, duration: 0.085, type: 'square', volume: 0.16 });
    this.playNoise({ duration: 0.065, volume: 0.16, highpass: 1500, lowpass: 5400 });
  }

  playGuardBreak(slot = 1): void {
    if (!this.canPlayEvent(`combat_guard_break:${slot}`, this.nowMs())) return;
    this.playTone({ freqStart: 700, freqEnd: 85, duration: 0.34, type: 'sawtooth', volume: 0.32 });
    this.playTone({ freqStart: 1280, freqEnd: 420, duration: 0.22, type: 'square', volume: 0.18, delay: 0.03 });
    this.playNoise({ duration: 0.26, volume: 0.28, highpass: 900, lowpass: 5200 });
  }

  playKnockdown(slot = 1): void {
    if (!this.canPlayEvent(`combat_knockdown:${slot}`, this.nowMs())) return;
    this.playTone({ freqStart: 98, freqEnd: 32, duration: 0.2, type: 'sine', volume: 0.28 });
    this.playNoise({ duration: 0.15, volume: 0.2, highpass: 120, lowpass: 900 });
  }

  // --- Character-Specific Special & Ultimate Sounds ---
  playSpecialCharge(characterId: CharacterId, slot = 1): void {
    if (!this.canPlayEvent(`special_charge:${slot}`, this.nowMs())) return;
    const p = getCharacterSoundProfile(characterId);
    if (p.timbre === 'musical_harmonic') {
      // Sagar: rising harmonic triad
      this.playTone({ freqStart: 392, freqEnd: 440, duration: 0.12, type: 'triangle', volume: 0.2 });
      this.playTone({ freqStart: 493.88, freqEnd: 587.33, duration: 0.14, type: 'triangle', volume: 0.18, delay: 0.06 });
      this.playTone({ freqStart: 659.25, freqEnd: 783.99, duration: 0.16, type: 'sine', volume: 0.16, delay: 0.12 });
    } else if (p.timbre === 'paper_cash') {
      // Jatin: rapid fluttering banknote shuffle + snap
      this.playNoise({ duration: 0.06, volume: 0.18, highpass: 2400, lowpass: 7200 });
      this.playNoise({ duration: 0.07, volume: 0.18, highpass: 2600, lowpass: 7600, delay: 0.07 });
      this.playTone({ freqStart: p.chargeBaseHz, freqEnd: p.chargeTargetHz, duration: 0.14, type: 'triangle', volume: 0.14 });
    } else if (p.timbre === 'cyber_tech') {
      // Tony: electronic energy charge + holo chirp
      this.playTone({ freqStart: 280, freqEnd: 1180, duration: 0.22, type: 'sawtooth', volume: 0.18 });
      this.playTone({ freqStart: 880, freqEnd: 1560, duration: 0.12, type: 'sine', volume: 0.12, delay: 0.08 });
    } else {
      // Rahul: deep coiled kinetic rumble
      this.playTone({ freqStart: p.chargeBaseHz, freqEnd: p.chargeTargetHz, duration: 0.22, type: 'sawtooth', volume: 0.24 });
      this.playNoise({ duration: 0.18, volume: 0.16, highpass: 180, lowpass: 1400 });
    }
  }

  playSpecialRelease(characterId: CharacterId, move: 'special_1' | 'special_2' = 'special_1', slot = 1): void {
    if (!this.canPlayEvent(`special_release:${slot}:${move}`, this.nowMs())) return;
    const p = getCharacterSoundProfile(characterId);
    if (p.timbre === 'musical_harmonic') {
      // Sagar Sonic Pulse / Rhythm Break: shimmering chord snap
      this.playTone({ freqStart: 523.25, freqEnd: 659.25, duration: 0.18, type: 'triangle', volume: 0.24 });
      this.playTone({ freqStart: 783.99, freqEnd: 1046.5, duration: 0.2, type: 'sine', volume: 0.18, delay: 0.03 });
      this.playNoise({ duration: 0.1, volume: 0.12, highpass: 1400, lowpass: 5200 });
    } else if (p.timbre === 'paper_cash') {
      // Jatin Cash Flick / Banknote Barrage: crisp bill whip + cascade
      this.playNoise({ duration: 0.09, volume: 0.24, highpass: 2200, lowpass: 8000 });
      this.playTone({ freqStart: 1180, freqEnd: 540, duration: 0.11, type: 'triangle', volume: 0.18 });
      if (move === 'special_2') {
        this.playNoise({ duration: 0.14, volume: 0.2, highpass: 1800, lowpass: 7200, delay: 0.08 });
        this.playNoise({ duration: 0.14, volume: 0.18, highpass: 2000, lowpass: 7600, delay: 0.16 });
      }
    } else if (p.timbre === 'cyber_tech') {
      // Tony Energy Pulse / Drone Strike laser
      if (move === 'special_2') {
        // Drone laser beam
        this.playTone({ freqStart: 1620, freqEnd: 340, duration: 0.24, type: 'sawtooth', volume: 0.24 });
        this.playTone({ freqStart: 1100, freqEnd: 660, duration: 0.16, type: 'square', volume: 0.12, delay: 0.03 });
      } else {
        this.playTone({ freqStart: 960, freqEnd: 220, duration: 0.2, type: 'sawtooth', volume: 0.22 });
        this.playNoise({ duration: 0.12, volume: 0.14, highpass: 1800, lowpass: 6200 });
      }
    } else {
      // Rahul Iron Fist / Overload Rush
      this.playTone({ freqStart: 190, freqEnd: 46, duration: 0.22, type: 'sawtooth', volume: 0.3 });
      this.playNoise({ duration: 0.18, volume: 0.24, highpass: 240, lowpass: 2100 });
    }
  }

  playUltimateActivate(characterId: CharacterId, slot = 1): void {
    if (!this.canPlayEvent(`ultimate_activate:${slot}`, this.nowMs())) return;
    const p = getCharacterSoundProfile(characterId);
    p.ultimateChordHz.forEach((hz, idx) => {
      this.playTone({
        freqStart: hz * 0.85,
        freqEnd: hz * 1.15,
        duration: 0.44,
        type: idx % 2 === 0 ? 'sawtooth' : 'triangle',
        volume: 0.18,
        delay: idx * 0.04,
      });
    });
    this.playNoise({ duration: 0.32, volume: 0.22, highpass: 450, lowpass: 4400 });
  }

  playRoundBell(): void {
    if (!this.canPlayEvent('round_bell', this.nowMs())) return;
    this.playTone({ freqStart: 690, freqEnd: 684, duration: 0.36, type: 'triangle', volume: 0.26, pitchVariance: 0 });
    this.playTone({ freqStart: 1035, freqEnd: 1028, duration: 0.32, type: 'sine', volume: 0.18, delay: 0.02, pitchVariance: 0 });
  }

  playKO(): void {
    if (!this.canPlayEvent('round_ko', this.nowMs())) return;
    this.playTone({ freqStart: 240, freqEnd: 36, duration: 0.62, type: 'sawtooth', volume: 0.38, pitchVariance: 0 });
    this.playTone({ freqStart: 148, freqEnd: 28, duration: 0.72, type: 'triangle', volume: 0.34, delay: 0.03, pitchVariance: 0 });
    this.playNoise({ duration: 0.35, volume: 0.32, highpass: 150, lowpass: 2200 });
  }
}
