export type ObservedPlayerAction =
  | 'light_attack'
  | 'heavy_attack'
  | 'low_attack'
  | 'jump'
  | 'block'
  | 'dash'
  | 'special'
  | 'wakeup_attack'
  | 'whiff';

export type DetectedPlaystyle =
  | 'OBSERVING'
  | 'RUSHDOWN'
  | 'TURTLE GUARD'
  | 'AERIAL ASSAULT'
  | 'ZONER'
  | 'HEAVY BRAWLER'
  | 'BALANCED';

export interface AdaptationSummary {
  /** 0..0.35 bounded counter-adaptation weights (never cheats or guarantees 100%) */
  antiLightSpamBonus: number;
  antiAirBonus: number;
  antiBlockMixupBonus: number;
  antiSpecialApproachBonus: number;
  lowGuardAnticipation: number;
  wakeupRespectBonus: number;
  keepAwayUrgency: number;
  recentWhiffDetected: boolean;
  lastWhiffWasHeavy: boolean;
  detectedPlaystyle: DetectedPlaystyle;
  adaptationTier: 0 | 1 | 2;
  summaryText: string;
}

const MAX_WINDOW = 28;
const MAX_ADAPTATION_CAP = 0.35;

/**
 * V4 Match-Scoped Player Behavior Analyzer.
 *
 * Observes the player's visible on-screen combat habits across rounds of a match
 * (persisting between Round 1 -> Round 2 -> Round 3 so the CPU genuinely adapts
 * over the course of a fight) without ever reading future inputs or exceeding fair caps.
 */
export class PlayerBehaviorAnalyzer {
  private history: ObservedPlayerAction[] = [];
  private keepAwaySeconds = 0;
  private lastWhiffTimer = 0;
  private lastWhiffHeavy = false;
  private lastObservedState = '';
  private lastObservedMove: string | null = null;
  private postWakeupWindow = 0;
  private totalObservedSamples = 0;

  /** Full reset for a brand new match */
  reset(): void {
    this.history.length = 0;
    this.keepAwaySeconds = 0;
    this.lastWhiffTimer = 0;
    this.lastWhiffHeavy = false;
    this.lastObservedState = '';
    this.lastObservedMove = null;
    this.postWakeupWindow = 0;
    this.totalObservedSamples = 0;
  }

  /** Round boundary reset: clears transient frame timers while preserving learned habits! */
  resetTransientForNextRound(): void {
    this.keepAwaySeconds = 0;
    this.lastWhiffTimer = 0;
    this.lastWhiffHeavy = false;
    this.lastObservedState = '';
    this.lastObservedMove = null;
    this.postWakeupWindow = 0;
  }

  recordAction(action: ObservedPlayerAction): void {
    this.history.push(action);
    this.totalObservedSamples++;
    if (this.history.length > MAX_WINDOW) {
      this.history.shift();
    }
    if (action === 'whiff') {
      this.lastWhiffTimer = 0.62;
    }
  }

  observeFrame(opts: {
    dt: number;
    distance: number;
    opponentState: string;
    opponentMove: string | null;
    opponentAttackConnected: boolean;
    opponentGrounded: boolean;
  }): void {
    if (this.lastWhiffTimer > 0) {
      this.lastWhiffTimer = Math.max(0, this.lastWhiffTimer - opts.dt);
    }
    if (this.postWakeupWindow > 0) {
      this.postWakeupWindow = Math.max(0, this.postWakeupWindow - opts.dt);
    }

    if (opts.distance > 440) {
      this.keepAwaySeconds = Math.min(4.5, this.keepAwaySeconds + opts.dt);
    } else {
      this.keepAwaySeconds = Math.max(0, this.keepAwaySeconds - opts.dt * 1.45);
    }

    const stateSignature = `${opts.opponentState}:${opts.opponentMove ?? ''}`;
    if (stateSignature === this.lastObservedState) return;

    // Track wake-up window when opponent gets up off the ground
    if (this.lastObservedState.startsWith('get_up:') || opts.opponentState === 'get_up') {
      this.postWakeupWindow = 0.65;
    }

    // Detect whiffed melee/special attack when an attack ends without connecting
    if (
      this.lastObservedState.startsWith('attack:') &&
      !opts.opponentAttackConnected &&
      opts.distance < 420
    ) {
      const prevMove = this.lastObservedMove;
      this.lastWhiffHeavy =
        prevMove === 'heavy_punch' ||
        prevMove === 'heavy_kick' ||
        prevMove === 'sweep' ||
        prevMove === 'anti_air' ||
        prevMove === 'special_1' ||
        prevMove === 'special_2' ||
        prevMove === 'ultimate';
      this.recordAction('whiff');
    }

    this.lastObservedState = stateSignature;
    this.lastObservedMove = opts.opponentMove;

    if (
      opts.opponentState === 'jump_takeoff' ||
      (!opts.opponentGrounded && opts.opponentState === 'airborne')
    ) {
      this.recordAction('jump');
    } else if (opts.opponentState === 'guard_high' || opts.opponentState === 'guard_low') {
      this.recordAction('block');
    } else if (opts.opponentState === 'dash_forward') {
      this.recordAction('dash');
    } else if (
      opts.opponentState === 'special_charge' ||
      opts.opponentMove === 'special_1' ||
      opts.opponentMove === 'special_2'
    ) {
      this.recordAction('special');
    } else if (opts.opponentState === 'attack') {
      if (this.postWakeupWindow > 0) {
        this.recordAction('wakeup_attack');
      }
      if (
        opts.opponentMove === 'crouch_kick' ||
        opts.opponentMove === 'sweep' ||
        opts.opponentMove === 'crouch_punch'
      ) {
        this.recordAction('low_attack');
      } else if (opts.opponentMove === 'light_punch' || opts.opponentMove === 'light_kick') {
        this.recordAction('light_attack');
      } else {
        this.recordAction('heavy_attack');
      }
    }
  }

  getAdaptationSummary(adaptationStrength: number): AdaptationSummary {
    const scale = Math.max(0, Math.min(1, adaptationStrength));
    const total = Math.max(5, this.history.length);

    let lights = 0;
    let heavies = 0;
    let lows = 0;
    let jumps = 0;
    let blocks = 0;
    let dashes = 0;
    let specials = 0;
    let wakeups = 0;

    for (const act of this.history) {
      if (act === 'light_attack') lights++;
      else if (act === 'heavy_attack') heavies++;
      else if (act === 'low_attack') lows++;
      else if (act === 'jump') jumps++;
      else if (act === 'block') blocks++;
      else if (act === 'dash') dashes++;
      else if (act === 'special') specials++;
      else if (act === 'wakeup_attack') wakeups++;
    }

    const clampCap = (raw: number) => Math.min(MAX_ADAPTATION_CAP, Math.max(0, raw * scale));

    const antiLightSpamBonus = clampCap(Math.max(0, (lights + dashes * 0.5) / total - 0.22) * 0.85);
    const antiAirBonus = clampCap(Math.max(0, jumps / total - 0.16) * 0.95);
    const antiBlockMixupBonus = clampCap(Math.max(0, blocks / total - 0.2) * 0.85);
    const antiSpecialApproachBonus = clampCap(Math.max(0, specials / total - 0.16) * 0.9);
    const lowGuardAnticipation = clampCap(Math.max(0, lows / total - 0.16) * 0.85);
    const wakeupRespectBonus = clampCap(Math.max(0, wakeups / Math.max(3, total * 0.4) - 0.15) * 0.8);

    const detectedPlaystyle = this.classifyPlaystyle({
      samples: this.history.length,
      lights,
      heavies,
      lows,
      jumps,
      blocks,
      dashes,
      specials,
      total,
    });

    const maxBonus = Math.max(
      antiLightSpamBonus,
      antiAirBonus,
      antiBlockMixupBonus,
      antiSpecialApproachBonus,
      lowGuardAnticipation,
    );
    const adaptationTier: 0 | 1 | 2 =
      this.totalObservedSamples < 6 || maxBonus < 0.08
        ? 0
        : maxBonus < 0.2
          ? 1
          : 2;

    const summaryText = this.buildSummaryText(detectedPlaystyle, adaptationTier);

    return {
      antiLightSpamBonus,
      antiAirBonus,
      antiBlockMixupBonus,
      antiSpecialApproachBonus,
      lowGuardAnticipation,
      wakeupRespectBonus,
      keepAwayUrgency: Math.min(1, this.keepAwaySeconds / 2.2),
      recentWhiffDetected: this.lastWhiffTimer > 0,
      lastWhiffWasHeavy: this.lastWhiffTimer > 0 && this.lastWhiffHeavy,
      detectedPlaystyle,
      adaptationTier,
      summaryText,
    };
  }

  private classifyPlaystyle(counts: {
    samples: number;
    lights: number;
    heavies: number;
    lows: number;
    jumps: number;
    blocks: number;
    dashes: number;
    specials: number;
    total: number;
  }): DetectedPlaystyle {
    if (counts.samples < 5) return 'OBSERVING';

    const jumpRate = counts.jumps / counts.total;
    const blockRate = counts.blocks / counts.total;
    const specialRate = counts.specials / counts.total;
    const rushRate = (counts.lights + counts.dashes + counts.lows) / counts.total;
    const heavyRate = counts.heavies / counts.total;

    if (jumpRate >= 0.28) return 'AERIAL ASSAULT';
    if (blockRate >= 0.32) return 'TURTLE GUARD';
    if (specialRate >= 0.28) return 'ZONER';
    if (rushRate >= 0.44) return 'RUSHDOWN';
    if (heavyRate >= 0.32) return 'HEAVY BRAWLER';
    return 'BALANCED';
  }

  private buildSummaryText(style: DetectedPlaystyle, tier: 0 | 1 | 2): string {
    if (tier === 0 || style === 'OBSERVING') {
      return 'CPU SCOUTED NEUTRAL TIMING';
    }
    switch (style) {
      case 'AERIAL ASSAULT':
        return 'CPU ADAPTED WITH ANTI-AIR TIMING';
      case 'TURTLE GUARD':
        return 'CPU SHIFTED TO LOW SWEEP & GUARD PRESSURE';
      case 'ZONER':
        return 'CPU TIMED JUMP-INS & DASH APPROACHES';
      case 'RUSHDOWN':
        return 'CPU READ RUSH RHYTHM WITH COUNTERS';
      case 'HEAVY BRAWLER':
        return 'CPU BAITED HEAVY SWINGS FOR WHIFF PUNISHES';
      default:
        return 'CPU MATCHED BALANCED FOOTSIES TEMPO';
    }
  }
}
