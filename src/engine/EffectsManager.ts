import { VFX_SHEETS, VfxSheetDef } from '../config/animations';
import { HitLevel } from '../config/combat';
import { StageAmbienceKind } from '../config/stages';
import { AnimationPlayer } from './AnimationPlayer';
import { FighterSlot, Rect } from './types';

export interface ActiveProjectile {
  id: number;
  ownerSlot: FighterSlot;
  vfxId: string;
  player: AnimationPlayer;
  x: number;
  y: number;
  vx: number;
  vy: number;
  facing: 1 | -1;
  scale: number;
  damage: number;
  chipDamage: number;
  guardDamage: number;
  hitLevel: HitLevel;
  hitstun: number;
  knockbackX: number;
  knockbackY: number;
  causesKnockdown: boolean;
  hitboxHalfW: number;
  hitboxHalfH: number;
  lifetime: number;
  maxLifetime: number;
  hasHit: boolean;
  piercing: boolean;
  hitImpactVfxId?: string;
  accentColor: string;
}

export interface ActiveEffect {
  id: number;
  vfxId: string;
  player: AnimationPlayer;
  x: number;
  y: number;
  vx: number;
  facing: 1 | -1;
  scale: number;
  done: boolean;
  attachSlot?: FighterSlot;
  offsetX?: number;
  offsetY?: number;
}

export interface SparkParticle {
  active: boolean;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  life: number;
  maxLife: number;
  gravity: number;
}

export interface ImpactRing {
  active: boolean;
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  color: string;
  life: number;
  maxLife: number;
}

export interface AmbientMote {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  phase: number;
  alpha: number;
}

const PARTICLE_POOL_SIZE = 112;
const RING_POOL_SIZE = 16;
const AMBIENT_POOL_SIZE = 24;

export class EffectsManager {
  public projectiles: ActiveProjectile[] = [];
  public effects: ActiveEffect[] = [];
  public readonly particles: SparkParticle[];
  public readonly impactRings: ImpactRing[];
  public readonly ambientMotes: AmbientMote[];
  private particleCursor = 0;
  private ringCursor = 0;
  private nextId = 1;

  constructor() {
    this.particles = Array.from({ length: PARTICLE_POOL_SIZE }, () => ({
      active: false,
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      size: 6,
      color: '#ffffff',
      life: 0,
      maxLife: 0.3,
      gravity: 0,
    }));

    this.impactRings = Array.from({ length: RING_POOL_SIZE }, () => ({
      active: false,
      x: 0,
      y: 0,
      radius: 8,
      maxRadius: 64,
      color: '#ffffff',
      life: 0,
      maxLife: 0.2,
    }));

    this.ambientMotes = Array.from({ length: AMBIENT_POOL_SIZE }, (_, idx) => ({
      x: (idx * 137) % 3240,
      y: 140 + ((idx * 97) % 720),
      vx: -18 - (idx % 5) * 9,
      vy: 8 + (idx % 4) * 6,
      size: 3 + (idx % 4),
      phase: idx * 0.7,
      alpha: 0.28 + (idx % 4) * 0.12,
    }));
  }

  clear(): void {
    this.projectiles.length = 0;
    this.effects.length = 0;
    for (let i = 0; i < PARTICLE_POOL_SIZE; i++) {
      this.particles[i].active = false;
    }
    for (let i = 0; i < RING_POOL_SIZE; i++) {
      this.impactRings[i].active = false;
    }
  }

  spawnImpactRing(x: number, y: number, color: string, maxRadius = 64): void {
    const r = this.impactRings[this.ringCursor];
    this.ringCursor = (this.ringCursor + 1) % RING_POOL_SIZE;
    r.active = true;
    r.x = x;
    r.y = y;
    r.radius = 12;
    r.maxRadius = maxRadius;
    r.color = color;
    r.life = 0;
    r.maxLife = 0.2;
  }

  spawnEffect(opts: {
    vfxId: string;
    x: number;
    y: number;
    facing: 1 | -1;
    vx?: number;
    scale?: number;
    attachSlot?: FighterSlot;
    offsetX?: number;
    offsetY?: number;
  }): ActiveEffect | null {
    const def: VfxSheetDef | undefined = VFX_SHEETS[opts.vfxId];
    if (!def) return null;

    const eff: ActiveEffect = {
      id: this.nextId++,
      vfxId: opts.vfxId,
      player: new AnimationPlayer(def),
      x: opts.x,
      y: opts.y,
      vx: opts.vx ?? 0,
      facing: opts.facing,
      scale: opts.scale ?? def.scale ?? 1.7,
      done: false,
      attachSlot: opts.attachSlot,
      offsetX: opts.offsetX,
      offsetY: opts.offsetY,
    };
    eff.player.play(def, {
      restart: true,
      callbacks: {
        onComplete: () => {
          eff.done = true;
        },
      },
    });
    this.effects.push(eff);
    return eff;
  }

  spawnProjectile(opts: {
    ownerSlot: FighterSlot;
    vfxId: string;
    x: number;
    y: number;
    vx: number;
    facing: 1 | -1;
    damage: number;
    chipDamage: number;
    guardDamage: number;
    hitLevel?: HitLevel;
    hitstun?: number;
    knockbackX?: number;
    knockbackY?: number;
    causesKnockdown?: boolean;
    hitboxHalfW?: number;
    hitboxHalfH?: number;
    maxLifetime?: number;
    scale?: number;
    piercing?: boolean;
    hitImpactVfxId?: string;
    accentColor?: string;
  }): ActiveProjectile | null {
    const def = VFX_SHEETS[opts.vfxId];
    if (!def) return null;

    // Prevent unbounded projectile accumulation
    if (this.projectiles.length >= 12) {
      this.projectiles.shift();
    }

    const proj: ActiveProjectile = {
      id: this.nextId++,
      ownerSlot: opts.ownerSlot,
      vfxId: opts.vfxId,
      player: new AnimationPlayer(def),
      x: opts.x,
      y: opts.y,
      vx: opts.vx,
      vy: 0,
      facing: opts.facing,
      scale: opts.scale ?? def.scale ?? 1.5,
      damage: opts.damage,
      chipDamage: opts.chipDamage,
      guardDamage: opts.guardDamage,
      hitLevel: opts.hitLevel ?? 'mid',
      hitstun: opts.hitstun ?? 0.38,
      knockbackX: opts.knockbackX ?? 420,
      knockbackY: opts.knockbackY ?? 0,
      causesKnockdown: opts.causesKnockdown ?? false,
      hitboxHalfW: opts.hitboxHalfW ?? 72,
      hitboxHalfH: opts.hitboxHalfH ?? 64,
      lifetime: 0,
      maxLifetime: opts.maxLifetime ?? 1.85,
      hasHit: false,
      piercing: opts.piercing ?? false,
      hitImpactVfxId: opts.hitImpactVfxId,
      accentColor: opts.accentColor ?? '#38bdf8',
    };
    proj.player.play(def, { restart: true });
    this.projectiles.push(proj);
    return proj;
  }

  spawnHitSparks(x: number, y: number, color: string, count: number, heavy = false): void {
    for (let i = 0; i < count; i++) {
      const p = this.particles[this.particleCursor];
      this.particleCursor = (this.particleCursor + 1) % PARTICLE_POOL_SIZE;
      const angle = Math.random() * Math.PI * 2;
      const speed = (heavy ? 260 : 160) + Math.random() * (heavy ? 540 : 320);
      p.active = true;
      p.x = x;
      p.y = y;
      p.vx = Math.cos(angle) * speed;
      p.vy = Math.sin(angle) * speed - (heavy ? 80 : 40);
      p.size = (heavy ? 7 : 5) + Math.random() * (heavy ? 8 : 5);
      p.color = i % 3 === 0 ? '#ffffff' : color;
      p.life = 0;
      p.maxLife = (heavy ? 0.28 : 0.18) + Math.random() * 0.14;
      p.gravity = 700;
    }
  }

  spawnGroundDust(x: number, y: number, facing: 1 | -1, count = 6): void {
    for (let i = 0; i < count; i++) {
      const p = this.particles[this.particleCursor];
      this.particleCursor = (this.particleCursor + 1) % PARTICLE_POOL_SIZE;
      p.active = true;
      p.x = x + (Math.random() - 0.5) * 44;
      p.y = y - 6 - Math.random() * 14;
      p.vx = -facing * (35 + Math.random() * 140) + (Math.random() - 0.5) * 60;
      p.vy = -28 - Math.random() * 88;
      p.size = 6 + Math.random() * 9;
      p.color = 'rgba(232, 216, 188, 0.78)';
      p.life = 0;
      p.maxLife = 0.26 + Math.random() * 0.16;
      p.gravity = 160;
    }
  }

  getProjectileHitbox(proj: ActiveProjectile): Rect {
    return {
      x: proj.x - proj.hitboxHalfW,
      y: proj.y - proj.hitboxHalfH,
      width: proj.hitboxHalfW * 2,
      height: proj.hitboxHalfH * 2,
    };
  }

  updateAmbient(dt: number, worldWidth: number, kind: StageAmbienceKind): void {
    for (let i = 0; i < AMBIENT_POOL_SIZE; i++) {
      const m = this.ambientMotes[i];
      m.phase += dt * (kind === 'golden_leaves' ? 2.2 : 1.4);
      const driftX = kind === 'river_breeze' ? -42 : kind === 'golden_leaves' ? -24 : -14;
      const driftY = kind === 'golden_leaves' ? 26 : kind === 'river_breeze' ? 4 : -6;
      m.x += (m.vx * 0.4 + driftX) * dt;
      m.y += (driftY + Math.sin(m.phase) * 14) * dt;
      if (m.x < -20) m.x = worldWidth + 20;
      if (m.x > worldWidth + 20) m.x = -20;
      if (m.y > 900) m.y = 120;
      if (m.y < 100) m.y = 860;
    }
  }

  update(
    dt: number,
    worldWidth: number,
    fighterPositions: Record<FighterSlot, { x: number; y: number; facing: 1 | -1 }>,
  ): void {
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const proj = this.projectiles[i];
      proj.lifetime += dt;
      proj.x += proj.vx * dt;
      proj.y += proj.vy * dt;
      proj.player.update(dt);

      const expired =
        proj.lifetime >= proj.maxLifetime ||
        proj.x < -300 ||
        proj.x > worldWidth + 300 ||
        (!proj.piercing && proj.hasHit) ||
        (!proj.player.getDefinition().loop && proj.player.isCompleted());

      if (expired) {
        this.projectiles.splice(i, 1);
      }
    }

    for (let i = this.effects.length - 1; i >= 0; i--) {
      const eff = this.effects[i];
      if (eff.attachSlot) {
        const anchor = fighterPositions[eff.attachSlot];
        eff.x = anchor.x + (eff.offsetX ?? 0) * anchor.facing;
        eff.y = anchor.y + (eff.offsetY ?? 0);
        eff.facing = anchor.facing;
      } else {
        eff.x += eff.vx * dt;
      }
      eff.player.update(dt);
      if (eff.done) {
        this.effects.splice(i, 1);
      }
    }

    for (let i = 0; i < PARTICLE_POOL_SIZE; i++) {
      const p = this.particles[i];
      if (!p.active) continue;
      p.life += dt;
      if (p.life >= p.maxLife) {
        p.active = false;
        continue;
      }
      p.vy += p.gravity * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
    }

    for (let i = 0; i < RING_POOL_SIZE; i++) {
      const r = this.impactRings[i];
      if (!r.active) continue;
      r.life += dt;
      if (r.life >= r.maxLife) {
        r.active = false;
        continue;
      }
      const t = r.life / r.maxLife;
      r.radius = 12 + (r.maxRadius - 12) * (1 - (1 - t) * (1 - t));
    }
  }
}
