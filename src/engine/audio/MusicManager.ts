import {
  midiToHz,
  MUSIC_TRACKS,
  MusicIntensity,
  MusicScene,
  StageTrackSpec,
} from '../../config/audioCatalog';
import { StageId } from '../../config/stages';

export interface MusicBusProvider {
  getContext(): AudioContext | null;
  getMusicBus(): GainNode | null;
  getAmbienceBus(): GainNode | null;
  isAudible(): boolean;
}

export class MusicManager {
  private provider: MusicBusProvider;
  private scene: MusicScene = 'silent';
  private stageId: StageId = 'katra';
  private intensity: MusicIntensity = 'normal';

  private schedulerTimer: number | null = null;
  private nextStepTime = 0;
  private stepIndex = 0;
  private ultimateStingUntil = 0;

  private ambienceNode: AudioBufferSourceNode | null = null;
  private ambienceFilter: BiquadFilterNode | null = null;
  private ambienceGain: GainNode | null = null;
  private cachedNoiseBuffer: AudioBuffer | null = null;

  constructor(provider: MusicBusProvider) {
    this.provider = provider;
  }

  getCurrentScene(): MusicScene {
    return this.scene;
  }

  getCurrentIntensity(): MusicIntensity {
    return this.intensity;
  }

  setScene(scene: MusicScene, stageId?: StageId): void {
    const stageChanged = stageId !== undefined && stageId !== this.stageId;
    if (stageId) this.stageId = stageId;

    if (scene === this.scene && !stageChanged) return;
    this.scene = scene;

    if (scene === 'silent') {
      this.stopScheduler();
      this.stopAmbience();
      return;
    }

    if (scene === 'victory') {
      this.stopScheduler();
      this.playVictoryFanfare();
      return;
    }

    if (scene === 'ko') {
      this.stopScheduler();
      this.playKoSting();
      return;
    }

    // Menu or Battle: smoothly keep clock synced or start cleanly
    this.startScheduler();
    if (scene === 'battle') {
      this.startAmbience(this.stageId);
    } else {
      this.stopAmbience();
    }
  }

  setIntensity(intensity: MusicIntensity): void {
    this.intensity = intensity;
    const ctx = this.provider.getContext();
    if (intensity === 'ultimate' && ctx) {
      this.ultimateStingUntil = ctx.currentTime + 2.2;
    }
  }

  onUnlocked(): void {
    if (this.scene === 'menu' || this.scene === 'battle') {
      this.startScheduler();
      if (this.scene === 'battle') {
        this.startAmbience(this.stageId);
      }
    }
  }

  stopAll(): void {
    this.scene = 'silent';
    this.stopScheduler();
    this.stopAmbience();
  }

  private getActiveTrack(): StageTrackSpec {
    if (this.scene === 'menu') return MUSIC_TRACKS.menu;
    return MUSIC_TRACKS[this.stageId] ?? MUSIC_TRACKS.katra;
  }

  private startScheduler(): void {
    const ctx = this.provider.getContext();
    if (!ctx || typeof window === 'undefined') return;
    if (this.schedulerTimer !== null) return;

    this.nextStepTime = ctx.currentTime + 0.06;
    this.stepIndex = 0;

    this.schedulerTimer = window.setInterval(() => {
      this.scheduleAhead();
    }, 35);
  }

  private stopScheduler(): void {
    if (this.schedulerTimer !== null && typeof window !== 'undefined') {
      window.clearInterval(this.schedulerTimer);
      this.schedulerTimer = null;
    }
  }

  private getNoiseBuffer(ctx: AudioContext): AudioBuffer {
    if (this.cachedNoiseBuffer && this.cachedNoiseBuffer.sampleRate === ctx.sampleRate) {
      return this.cachedNoiseBuffer;
    }
    const len = Math.floor(ctx.sampleRate * 0.25);
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const ch = buf.getChannelData(0);
    for (let i = 0; i < len; i++) ch[i] = Math.random() * 2 - 1;
    this.cachedNoiseBuffer = buf;
    return buf;
  }

  private scheduleAhead(): void {
    const ctx = this.provider.getContext();
    const bus = this.provider.getMusicBus();
    if (!ctx || !bus || !this.provider.isAudible() || ctx.state !== 'running') return;

    const track = this.getActiveTrack();
    const effectiveBpm = this.intensity === 'low_health' ? track.bpm * 1.07 : track.bpm;
    const sixteenthDur = 60 / effectiveBpm / 4;

    // Resync clock if tab or headless clock jumped ahead (prevents unbounded catch-up bursts)
    if (this.nextStepTime < ctx.currentTime - 0.12) {
      this.nextStepTime = ctx.currentTime + 0.04;
    }

    let stepsScheduled = 0;
    while (this.nextStepTime < ctx.currentTime + 0.14 && stepsScheduled < 4) {
      this.scheduleStep(ctx, bus, track, this.stepIndex, this.nextStepTime, sixteenthDur);
      this.nextStepTime += sixteenthDur;
      this.stepIndex = (this.stepIndex + 1) % 32;
      stepsScheduled++;
    }
  }

  private scheduleStep(
    ctx: AudioContext,
    bus: GainNode,
    track: StageTrackSpec,
    step32: number,
    time: number,
    stepDur: number,
  ): void {
    const step = step32 % 16;
    const isMenu = this.scene === 'menu';
    const isUltimateBoost = time < this.ultimateStingUntil;
    const isLowHealth = this.intensity === 'low_health' && !isMenu;

    // 1. Kick & Snare & Hi-hat percussion
    if (!isMenu) {
      if (step === 0 || step === 6 || step === 8 || (step === 14 && step32 >= 16)) {
        this.scheduleKick(ctx, bus, time, isUltimateBoost ? 0.32 : 0.25);
      }
      if (step === 4 || step === 12) {
        this.scheduleSnare(ctx, bus, time, 0.18);
      }
      if (step % 2 === 0 || isLowHealth) {
        this.scheduleHat(ctx, bus, time, step % 4 === 2 ? 0.08 : 0.045);
      }
    } else if (step === 0 || step === 8) {
      this.scheduleKick(ctx, bus, time, 0.12);
    } else if (step % 4 === 2) {
      this.scheduleHat(ctx, bus, time, 0.03);
    }

    // 2. Bassline
    const bassMidi = track.bassNotes[step];
    if (bassMidi > 0) {
      this.scheduleSynthNote(
        ctx,
        bus,
        midiToHz(bassMidi),
        time,
        stepDur * 1.65,
        isMenu ? 'triangle' : 'sawtooth',
        isMenu ? 0.12 : 0.15,
        520,
      );
    }

    // 3. Lead melody (alternates phrase slightly on bar 2)
    const leadMidi = track.leadNotes[step];
    if (leadMidi > 0 && (!isMenu || step32 < 16)) {
      const transpose = step32 >= 16 && step >= 12 ? 2 : 0;
      this.scheduleSynthNote(
        ctx,
        bus,
        midiToHz(leadMidi + transpose),
        time,
        stepDur * 1.45,
        isMenu ? 'sine' : 'square',
        isMenu ? 0.075 : isUltimateBoost ? 0.13 : 0.095,
        isMenu ? 1400 : 2200,
      );
    }

    // 4. Supporting atmospheric chord pad on beat 1 of each bar
    if (step === 0) {
      for (const chordMidi of track.padChord) {
        this.scheduleSynthNote(
          ctx,
          bus,
          midiToHz(chordMidi),
          time,
          stepDur * 14,
          'triangle',
          isUltimateBoost ? 0.06 : 0.036,
          1100,
        );
      }
    }

    // 5. Dynamic tension arpeggio in Low Health or Ultimate
    if (isLowHealth || isUltimateBoost) {
      const arpMidi = track.tensionArp[step];
      if (arpMidi > 0) {
        this.scheduleSynthNote(
          ctx,
          bus,
          midiToHz(arpMidi),
          time,
          stepDur * 0.8,
          'triangle',
          0.065,
          2800,
        );
      }
    }
  }

  private scheduleSynthNote(
    ctx: AudioContext,
    bus: GainNode,
    freq: number,
    time: number,
    duration: number,
    wave: OscillatorType,
    volume: number,
    cutoffHz: number,
  ): void {
    const osc = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();

    osc.type = wave;
    osc.frequency.setValueAtTime(freq, time);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(cutoffHz, time);

    gain.gain.setValueAtTime(0.0001, time);
    gain.gain.linearRampToValueAtTime(volume, time + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + duration);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(bus);

    osc.start(time);
    osc.stop(time + duration + 0.02);
  }

  private scheduleKick(ctx: AudioContext, bus: GainNode, time: number, volume: number): void {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(140, time);
    osc.frequency.exponentialRampToValueAtTime(42, time + 0.11);

    gain.gain.setValueAtTime(volume, time);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.13);

    osc.connect(gain);
    gain.connect(bus);
    osc.start(time);
    osc.stop(time + 0.15);
  }

  private scheduleSnare(ctx: AudioContext, bus: GainNode, time: number, volume: number): void {
    const src = ctx.createBufferSource();
    src.buffer = this.getNoiseBuffer(ctx);

    const hp = ctx.createBiquadFilter();
    hp.type = 'highpass';
    hp.frequency.value = 1100;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(volume, time);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.09);

    src.connect(hp);
    hp.connect(gain);
    gain.connect(bus);
    src.start(time);
    src.stop(time + 0.1);
  }

  private scheduleHat(ctx: AudioContext, bus: GainNode, time: number, volume: number): void {
    const src = ctx.createBufferSource();
    src.buffer = this.getNoiseBuffer(ctx);

    const hp = ctx.createBiquadFilter();
    hp.type = 'highpass';
    hp.frequency.value = 6500;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(volume, time);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.03);

    src.connect(hp);
    hp.connect(gain);
    gain.connect(bus);
    src.start(time);
    src.stop(time + 0.04);
  }

  private playVictoryFanfare(): void {
    const ctx = this.provider.getContext();
    const bus = this.provider.getMusicBus();
    if (!ctx || !bus || !this.provider.isAudible()) return;
    const now = ctx.currentTime + 0.04;
    const notes = [62, 66, 69, 74, 73, 74];
    const times = [0, 0.14, 0.28, 0.44, 0.72, 0.88];
    const durs = [0.13, 0.13, 0.15, 0.26, 0.14, 0.65];
    notes.forEach((m, i) => {
      this.scheduleSynthNote(ctx, bus, midiToHz(m), now + times[i], durs[i], 'triangle', 0.18, 2600);
      this.scheduleSynthNote(ctx, bus, midiToHz(m - 12), now + times[i], durs[i], 'sawtooth', 0.09, 1200);
    });
  }

  private playKoSting(): void {
    const ctx = this.provider.getContext();
    const bus = this.provider.getMusicBus();
    if (!ctx || !bus || !this.provider.isAudible()) return;
    const now = ctx.currentTime + 0.02;
    [50, 49, 46, 43].forEach((m, i) => {
      this.scheduleSynthNote(ctx, bus, midiToHz(m), now + i * 0.11, 0.28, 'sawtooth', 0.14, 900);
    });
  }

  private startAmbience(stageId: StageId): void {
    const ctx = this.provider.getContext();
    const bus = this.provider.getAmbienceBus();
    if (!ctx || !bus) return;

    this.stopAmbience();
    const spec = MUSIC_TRACKS[stageId] ?? MUSIC_TRACKS.katra;
    const len = ctx.sampleRate * 2;
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const ch = buf.getChannelData(0);
    // Soft pink-ish filtered noise bed for wind/bazaar air
    let b0 = 0;
    let b1 = 0;
    let b2 = 0;
    for (let i = 0; i < len; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99765 * b0 + white * 0.099046;
      b1 = 0.963 * b1 + white * 0.2965164;
      b2 = 0.57 * b2 + white * 1.0526913;
      ch[i] = (b0 + b1 + b2 + white * 0.1848) * 0.04;
    }

    const src = ctx.createBufferSource();
    src.buffer = buf;
    src.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = spec.ambienceFilterHz;
    filter.Q.value = spec.ambienceQ;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.24, ctx.currentTime + 0.6);

    src.connect(filter);
    filter.connect(gain);
    gain.connect(bus);
    src.start();

    this.ambienceNode = src;
    this.ambienceFilter = filter;
    this.ambienceGain = gain;
  }

  private stopAmbience(): void {
    try {
      this.ambienceNode?.stop();
      this.ambienceNode?.disconnect();
      this.ambienceFilter?.disconnect();
      this.ambienceGain?.disconnect();
    } catch {
      // Ignore already stopped audio nodes
    }
    this.ambienceNode = null;
    this.ambienceFilter = null;
    this.ambienceGain = null;
  }
}
