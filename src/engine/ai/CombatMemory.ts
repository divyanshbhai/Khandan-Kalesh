export type ObservedPlayerAction =
  | 'light_attack'
  | 'heavy_attack'
  | 'jump'
  | 'block'
  | 'special'
  | 'whiff';

export interface AdaptationSummary {
  /** 0..0.35 bounded counter-adaptation weights (never cheats or guarantees 100%) */
  antiLightSpamBonus: number;
  antiAirBonus: number;
  antiBlockMixupBonus: number;
  antiSpecialApproachBonus: number;
  keepAwayUrgency: number;
  recentWhiffDetected: boolean;
}

const MAX_WINDOW = 20;
const MAX_ADAPTATION_CAP = 0.35;

/**
 * Rolling match-scoped observation window that tracks opponent habits
 * without reading future inputs or applying unfair bonuses.
 */
export class CombatMemory {
  private history: ObservedPlayerAction[] = [];
  private keepAwaySeconds = 0;
  private lastWhiffTimer = 0;
  private lastObservedState = '';

  reset(): void {
    this.history.length = 0;
    this.keepAwaySeconds = 0;
    this.lastWhiffTimer = 0;
    this.lastObservedState = '';
  }

  recordAction(action: ObservedPlayerAction): void {
    this.history.push(action);
    if (this.history.length > MAX_WINDOW) {
      this.history.shift();
    }
    if (action === 'whiff') {
      this.lastWhiffTimer = 0.55;
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

    if (opts.distance > 440) {
      this.keepAwaySeconds = Math.min(4.0, this.keepAwaySeconds + opts.dt);
    } else {
      this.keepAwaySeconds = Math.max(0, this.keepAwaySeconds - opts.dt * 1.4);
    }

    // Only log state transitions so sustained frames don't inflate history
    const stateSignature = `${opts.opponentState}:${opts.opponentMove ?? ''}`;
    if (stateSignature === this.lastObservedState) return;

    // Detect whiffed attack if previous state was an attack that ended without connecting
    if (this.lastObservedState.startsWith('attack:') && !opts.opponentAttackConnected && opts.distance < 360) {
      this.recordAction('whiff');
    }

    this.lastObservedState = stateSignature;

    if (opts.opponentState === 'jump_takeoff' || (!opts.opponentGrounded && opts.opponentState === 'airborne')) {
      this.recordAction('jump');
    } else if (opts.opponentState === 'guard_high' || opts.opponentState === 'guard_low') {
      this.recordAction('block');
    } else if (opts.opponentState === 'special_charge' || opts.opponentMove === 'special_1' || opts.opponentMove === 'special_2') {
      this.recordAction('special');
    } else if (opts.opponentState === 'attack') {
      if (opts.opponentMove === 'light_punch' || opts.opponentMove === 'crouch_punch' || opts.opponentMove === 'light_kick') {
        this.recordAction('light_attack');
      } else {
        this.recordAction('heavy_attack');
      }
    }
  }

  getAdaptationSummary(adaptationStrength: number): AdaptationSummary {
    const scale = Math.max(0, Math.min(1, adaptationStrength));
    const total = Math.max(4, this.history.length);

    let lights = 0;
    let jumps = 0;
    let blocks = 0;
    let specials = 0;
    for (const act of this.history) {
      if (act === 'light_attack') lights++;
      else if (act === 'jump') jumps++;
      else if (act === 'block') blocks++;
      else if (act === 'special') specials++;
    }

    const clampCap = (raw: number) => Math.min(MAX_ADAPTATION_CAP, Math.max(0, raw * scale));

    return {
      antiLightSpamBonus: clampCap(Math.max(0, lights / total - 0.25) * 0.8),
      antiAirBonus: clampCap(Math.max(0, jumps / total - 0.18) * 0.9),
      antiBlockMixupBonus: clampCap(Math.max(0, blocks / total - 0.22) * 0.8),
      antiSpecialApproachBonus: clampCap(Math.max(0, specials / total - 0.18) * 0.85),
      keepAwayUrgency: Math.min(1, this.keepAwaySeconds / 2.2),
      recentWhiffDetected: this.lastWhiffTimer > 0,
    };
  }
}
