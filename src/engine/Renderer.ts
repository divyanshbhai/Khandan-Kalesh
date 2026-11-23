import { assetManager } from '../assets/assetManifest';
import { GAME_CONFIG, TrainingOptions } from '../config/game';
import { StageConfig } from '../config/stages';
import { Camera } from './Camera';
import { CollisionSystem } from './CollisionSystem';
import { EffectsManager } from './EffectsManager';
import { Fighter } from './Fighter';

export class Renderer {
  private ctx: CanvasRenderingContext2D;
  private flashCanvas: HTMLCanvasElement | null = null;
  private flashCtx: CanvasRenderingContext2D | null = null;
  private screenFlashAlpha = 0;
  private screenFlashColor = '#ffffff';
  private reducedMotion = false;

  constructor(canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) throw new Error('Unable to acquire 2D canvas context');
    this.ctx = ctx;

    if (typeof document !== 'undefined') {
      this.flashCanvas = document.createElement('canvas');
      this.flashCanvas.width = 288;
      this.flashCanvas.height = 288;
      this.flashCtx = this.flashCanvas.getContext('2d');
    }
  }

  setReducedMotion(reduced: boolean): void {
    this.reducedMotion = reduced;
  }

  triggerScreenFlash(color = '#ffffff', alpha = 0.32): void {
    if (this.reducedMotion) return;
    this.screenFlashColor = color;
    this.screenFlashAlpha = Math.max(this.screenFlashAlpha, alpha);
  }

  render(
    stage: StageConfig,
    camera: Camera,
    p1: Fighter,
    p2: Fighter,
    effects: EffectsManager,
    dt: number,
    trainingDebug?: TrainingOptions | null,
  ): void {
    const ctx = this.ctx;
    const W = GAME_CONFIG.logicalWidth;
    const H = GAME_CONFIG.logicalHeight;

    ctx.save();
    ctx.fillStyle = '#0b0807';
    ctx.fillRect(0, 0, W, H);

    // Subtle zoom impulse around viewport center + camera shake
    if (camera.zoom > 1.0005 && !this.reducedMotion) {
      ctx.translate(W * 0.5, H * 0.55);
      ctx.scale(camera.zoom, camera.zoom);
      ctx.translate(-W * 0.5, -H * 0.55);
    }
    ctx.translate(Math.round(camera.shakeX), Math.round(camera.shakeY));

    // 1. Stage background (exact proportional 3240 x 1080, horizontally scrolled by camera.x)
    this.drawStage(stage, camera);

    // 2. Subtle stage atmospheric motes behind fighters (never reduces fighter readability)
    if (!this.reducedMotion) {
      this.drawAmbientMotes(stage, effects, camera);
    }

    // 3. Ground shadows beneath both fighters
    this.drawFighterShadow(p1, stage, camera);
    this.drawFighterShadow(p2, stage, camera);

    // 4. Draw fighters & dash/special afterimages (attacking fighter drawn on top)
    const order = p1.isAttacking() && !p2.isAttacking() ? [p2, p1] : [p1, p2];
    for (const fighter of order) {
      this.drawAfterimages(fighter, camera);
      this.drawFighter(fighter, camera);
      this.drawCompanionDrone(fighter, camera);
    }

    // 5. Independent sprite-sheet VFX and travelling projectiles
    this.drawVfxAndProjectiles(effects, camera);

    // 6. Impact rings & pooled hit sparks / ground dust particles
    this.drawImpactRings(effects, camera);
    this.drawParticles(effects, camera);

    // 7. Training Mode Hitbox / Hurtbox overlays when toggled
    if (trainingDebug && (trainingDebug.showHitboxes || trainingDebug.showHurtboxes)) {
      this.drawTrainingBoxes(p1, p2, effects, camera, trainingDebug);
    }

    // 8. Subtle stage ambient lighting wash
    if (stage.ambientTint) {
      ctx.fillStyle = stage.ambientTint;
      ctx.fillRect(-40, -40, W + 80, H + 80);
    }

    ctx.restore();

    // 9. Brief screen impact flash (Ultimate / Guard Break / KO)
    if (this.screenFlashAlpha > 0.005) {
      ctx.save();
      ctx.globalAlpha = this.screenFlashAlpha;
      ctx.fillStyle = this.screenFlashColor;
      ctx.fillRect(0, 0, W, H);
      ctx.restore();
      this.screenFlashAlpha = Math.max(0, this.screenFlashAlpha - dt * 2.1);
    }
  }

  private drawStage(stage: StageConfig, camera: Camera): void {
    const ctx = this.ctx;
    const img = assetManager.getImage(stage.backgroundUrl);
    if (!img) {
      const grad = ctx.createLinearGradient(0, 0, 0, GAME_CONFIG.logicalHeight);
      grad.addColorStop(0, '#1e1611');
      grad.addColorStop(1, '#0b0807');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, GAME_CONFIG.logicalWidth, GAME_CONFIG.logicalHeight);
      return;
    }

    // Crisp nearest-neighbor stage scroll snapped to integer camera pixels for authentic retro clarity
    ctx.imageSmoothingEnabled = false;
    const snappedCamX = Math.round(camera.x);
    const srcX = Math.round((snappedCamX / stage.worldWidth) * img.width);
    const srcW = Math.round((GAME_CONFIG.logicalWidth / stage.worldWidth) * img.width);
    ctx.drawImage(
      img,
      srcX,
      0,
      srcW,
      img.height,
      0,
      0,
      GAME_CONFIG.logicalWidth,
      GAME_CONFIG.logicalHeight,
    );
  }

  private drawAmbientMotes(stage: StageConfig, effects: EffectsManager, camera: Camera): void {
    const ctx = this.ctx;
    ctx.save();
    ctx.fillStyle = stage.ambientParticleColor;
    for (let i = 0; i < effects.ambientMotes.length; i++) {
      const m = effects.ambientMotes[i];
      const sx = m.x - camera.x;
      if (sx < -20 || sx > GAME_CONFIG.logicalWidth + 20) continue;
      ctx.globalAlpha = m.alpha;
      if (stage.ambienceKind === 'golden_leaves') {
        ctx.fillRect(Math.round(sx), Math.round(m.y), m.size + 2, m.size);
      } else {
        ctx.fillRect(Math.round(sx), Math.round(m.y), m.size, m.size);
      }
    }
    ctx.restore();
  }

  private drawFighterShadow(fighter: Fighter, stage: StageConfig, camera: Camera): void {
    const ctx = this.ctx;
    const screenX = fighter.x - camera.x;
    const altitude = Math.max(0, stage.groundY - fighter.y);
    const heightFactor = Math.max(0.45, 1 - altitude / 520);
    const radiusX = (fighter.state === 'ko' || fighter.state === 'grounded' ? 145 : 88) * heightFactor;
    const radiusY = 20 * heightFactor;

    ctx.save();
    ctx.fillStyle = `rgba(11, 8, 7, ${stage.shadowOpacity * heightFactor})`;
    ctx.beginPath();
    ctx.ellipse(screenX, stage.groundY + 4, radiusX, radiusY, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  private drawAfterimages(fighter: Fighter, camera: Camera): void {
    if (this.reducedMotion || fighter.afterimages.length === 0) return;
    const ctx = this.ctx;
    const scale = fighter.profile.renderScale;

    for (let i = 0; i < fighter.afterimages.length; i++) {
      const g = fighter.afterimages[i];
      const img = assetManager.getImage(g.url);
      if (!img) continue;
      const sx = Math.round(g.x - camera.x);
      const sy = Math.round(g.y);
      ctx.save();
      ctx.globalAlpha = Math.max(0, g.alpha * 0.55);
      ctx.imageSmoothingEnabled = false;
      ctx.translate(sx, sy);
      if (g.facing === -1) ctx.scale(-1, 1);
      ctx.drawImage(
        img,
        g.sx,
        g.sy,
        g.sw,
        g.sh,
        -g.pivotX * scale,
        -g.pivotY * scale,
        g.sw * scale,
        g.sh * scale,
      );
      ctx.restore();
    }
  }

  private drawFighter(fighter: Fighter, camera: Camera): void {
    const ctx = this.ctx;
    let def = fighter.animPlayer.getDefinition();
    let img = assetManager.getImage(def.url);
    let { sx, sy, sw, sh } = fighter.animPlayer.getSourceRect();

    // Never blink invisible if a secondary sheet is still streaming in (e.g. Title attract demo)
    if (!img) {
      def = fighter.anims.idle;
      img = assetManager.getImage(def.url);
      if (!img) return;
      sx = 0;
      sy = 0;
      sw = def.frameWidth;
      sh = def.frameHeight;
    }

    const scale = fighter.profile.renderScale;
    const drawW = sw * scale * fighter.squashX;
    const drawH = sh * scale * fighter.squashY;
    const pivotOffsetX = def.pivotX * scale * fighter.squashX;
    const pivotOffsetY = def.pivotY * scale * fighter.squashY;

    const screenX = Math.round(fighter.x - camera.x);
    const screenY = Math.round(fighter.y);

    ctx.save();
    ctx.imageSmoothingEnabled = false;
    ctx.translate(screenX, screenY);

    if (fighter.facing === -1) {
      ctx.scale(-1, 1);
    }

    ctx.drawImage(img, sx, sy, sw, sh, -pivotOffsetX, -pivotOffsetY, drawW, drawH);

    // Crisp white/warm hit-flash silhouette overlay on impact
    if (fighter.hitFlashTimer > 0 && this.flashCanvas && this.flashCtx) {
      this.flashCtx.clearRect(0, 0, sw, sh);
      this.flashCtx.globalCompositeOperation = 'source-over';
      this.flashCtx.imageSmoothingEnabled = false;
      this.flashCtx.drawImage(img, sx, sy, sw, sh, 0, 0, sw, sh);
      this.flashCtx.globalCompositeOperation = 'source-in';
      this.flashCtx.fillStyle = 'rgba(255, 245, 225, 0.74)';
      this.flashCtx.fillRect(0, 0, sw, sh);
      this.flashCtx.globalCompositeOperation = 'source-over';

      ctx.drawImage(this.flashCanvas, 0, 0, sw, sh, -pivotOffsetX, -pivotOffsetY, drawW, drawH);
    }

    // Crisp retro pixel-stepped blocking bracket strictly when actively guarding
    if (fighter.isBlocking()) {
      ctx.strokeStyle =
        fighter.characterId === 'tony'
          ? 'rgba(56, 189, 248, 0.88)'
          : 'rgba(251, 191, 36, 0.82)';
      ctx.lineWidth = 6;
      const guardY = fighter.isCrouching() ? -145 : -235;
      const halfH = fighter.isCrouching() ? 64 : 96;
      ctx.beginPath();
      ctx.moveTo(92, guardY - halfH);
      ctx.lineTo(114, guardY - halfH + 20);
      ctx.lineTo(114, guardY + halfH - 20);
      ctx.lineTo(92, guardY + halfH);
      ctx.stroke();
    }

    ctx.restore();
  }

  private drawCompanionDrone(fighter: Fighter, camera: Camera): void {
    if (!fighter.dronePlayer || fighter.state === 'ko' || fighter.state === 'defeat') return;
    const def = fighter.dronePlayer.getDefinition();
    const img = assetManager.getImage(def.url);
    if (!img) return;

    const { sx, sy, sw, sh } = fighter.dronePlayer.getSourceRect();
    const scale = 1.45;
    const hoverY = Math.sin(fighter.droneBobPhase) * 14;
    const droneX = Math.round(fighter.x - camera.x - fighter.facing * 125);
    const droneY = Math.round(fighter.y - 365 + hoverY);

    const ctx = this.ctx;
    ctx.save();
    ctx.imageSmoothingEnabled = false;
    ctx.translate(droneX, droneY);
    if (fighter.facing === -1) ctx.scale(-1, 1);
    ctx.drawImage(
      img,
      sx,
      sy,
      sw,
      sh,
      -def.pivotX * scale,
      -def.pivotY * scale,
      sw * scale,
      sh * scale,
    );
    ctx.restore();
  }

  private drawVfxAndProjectiles(effects: EffectsManager, camera: Camera): void {
    const ctx = this.ctx;
    ctx.save();
    ctx.imageSmoothingEnabled = false;

    for (const eff of effects.effects) {
      const def = eff.player.getDefinition();
      const img = assetManager.getImage(def.url);
      if (!img) continue;
      const { sx, sy, sw, sh } = eff.player.getSourceRect();
      const screenX = Math.round(eff.x - camera.x);
      const screenY = Math.round(eff.y);

      ctx.save();
      ctx.translate(screenX, screenY);
      if (eff.facing === -1) ctx.scale(-1, 1);
      ctx.drawImage(
        img,
        sx,
        sy,
        sw,
        sh,
        -def.pivotX * eff.scale,
        -def.pivotY * eff.scale,
        sw * eff.scale,
        sh * eff.scale,
      );
      ctx.restore();
    }

    for (const proj of effects.projectiles) {
      const def = proj.player.getDefinition();
      const img = assetManager.getImage(def.url);
      if (!img) continue;
      const { sx, sy, sw, sh } = proj.player.getSourceRect();
      const screenX = Math.round(proj.x - camera.x);
      const screenY = Math.round(proj.y);

      ctx.save();
      ctx.translate(screenX, screenY);
      if (proj.facing === -1) ctx.scale(-1, 1);
      ctx.drawImage(
        img,
        sx,
        sy,
        sw,
        sh,
        -def.pivotX * proj.scale,
        -def.pivotY * proj.scale,
        sw * proj.scale,
        sh * proj.scale,
      );
      ctx.restore();
    }

    ctx.restore();
  }

  private drawImpactRings(effects: EffectsManager, camera: Camera): void {
    const ctx = this.ctx;
    ctx.save();
    for (let i = 0; i < effects.impactRings.length; i++) {
      const r = effects.impactRings[i];
      if (!r.active) continue;
      const alpha = Math.max(0, 1 - r.life / r.maxLife);
      ctx.globalAlpha = alpha * 0.8;
      ctx.strokeStyle = r.color;
      ctx.lineWidth = Math.max(2, 6 * alpha);
      ctx.beginPath();
      ctx.arc(r.x - camera.x, r.y, r.radius, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  }

  private drawParticles(effects: EffectsManager, camera: Camera): void {
    const ctx = this.ctx;
    ctx.save();
    for (let i = 0; i < effects.particles.length; i++) {
      const p = effects.particles[i];
      if (!p.active) continue;
      const alpha = Math.max(0, 1 - p.life / p.maxLife);
      ctx.globalAlpha = alpha;
      ctx.fillStyle = p.color;
      const sx = Math.round(p.x - camera.x - p.size * 0.5);
      const sy = Math.round(p.y - p.size * 0.5);
      ctx.fillRect(sx, sy, Math.round(p.size), Math.round(p.size));
    }
    ctx.restore();
  }

  private drawTrainingBoxes(
    p1: Fighter,
    p2: Fighter,
    effects: EffectsManager,
    camera: Camera,
    opts: TrainingOptions,
  ): void {
    const ctx = this.ctx;
    const camX = Math.round(camera.x);
    ctx.save();
    ctx.lineWidth = 3;

    for (const fighter of [p1, p2]) {
      if (opts.showHurtboxes) {
        // Solid body pushbox (amber dashed)
        const pb = CollisionSystem.getPushbox({
          x: fighter.x,
          y: fighter.y,
          characterId: fighter.characterId,
          isCrouching: fighter.isCrouching(),
        });
        ctx.save();
        ctx.setLineDash([8, 6]);
        ctx.strokeStyle = '#f59e0b';
        ctx.strokeRect(Math.round(pb.x - camX), Math.round(pb.y), Math.round(pb.width), Math.round(pb.height));
        ctx.restore();

        // Body hurtbox (emerald)
        const hb = CollisionSystem.getHurtbox({
          x: fighter.x,
          y: fighter.y,
          isCrouching: fighter.isCrouching(),
          isAirborne: !fighter.isGrounded,
          isKnockdown: fighter.state === 'knockdown' || fighter.state === 'grounded',
          scale: fighter.profile.renderScale,
          characterId: fighter.characterId,
        });
        ctx.fillStyle = 'rgba(34, 197, 94, 0.16)';
        ctx.strokeStyle = '#22c55e';
        ctx.fillRect(Math.round(hb.x - camX), Math.round(hb.y), Math.round(hb.width), Math.round(hb.height));
        ctx.strokeRect(Math.round(hb.x - camX), Math.round(hb.y), Math.round(hb.width), Math.round(hb.height));
      }

      if (opts.showHitboxes && fighter.isAttackActiveFrame() && fighter.currentAttackData) {
        const ab = CollisionSystem.getAttackHitbox(
          fighter.x,
          fighter.y,
          fighter.facing,
          fighter.currentAttackData,
          fighter.profile.renderScale,
        );
        ctx.fillStyle = 'rgba(239, 68, 68, 0.25)';
        ctx.strokeStyle = '#ef4444';
        ctx.fillRect(Math.round(ab.x - camX), Math.round(ab.y), Math.round(ab.width), Math.round(ab.height));
        ctx.strokeRect(Math.round(ab.x - camX), Math.round(ab.y), Math.round(ab.width), Math.round(ab.height));
      }
    }

    if (opts.showHitboxes) {
      for (const proj of effects.projectiles) {
        const pb = effects.getProjectileHitbox(proj);
        ctx.fillStyle = 'rgba(245, 158, 11, 0.25)';
        ctx.strokeStyle = '#f59e0b';
        ctx.fillRect(Math.round(pb.x - camX), Math.round(pb.y), Math.round(pb.width), Math.round(pb.height));
        ctx.strokeRect(Math.round(pb.x - camX), Math.round(pb.y), Math.round(pb.width), Math.round(pb.height));
      }
    }

    ctx.restore();
  }
}
