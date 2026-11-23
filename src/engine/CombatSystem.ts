import { Camera } from './Camera';
import { CollisionSystem } from './CollisionSystem';
import { EffectsManager } from './EffectsManager';
import { Fighter } from './Fighter';
import { soundEngine } from './SoundEngine';
import { CombatCallout, CombatFeedbackType, FighterSlot } from './types';

export interface CombatTickResult {
  hitstop: number;
  koTriggered: boolean;
  callout: CombatCallout | null;
  screenFlash?: { color: string; alpha: number };
}

let nextCalloutId = 1;

export class CombatSystem {
  private resolvedInstances = new Set<number>();

  reset(): void {
    this.resolvedInstances.clear();
  }

  private makeCallout(slot: FighterSlot, text: string, type: CombatFeedbackType): CombatCallout {
    return {
      id: nextCalloutId++,
      slot,
      text,
      type,
      ttl: 1.05,
    };
  }

  resolveCombat(
    p1: Fighter,
    p2: Fighter,
    effects: EffectsManager,
    camera: Camera,
  ): CombatTickResult {
    let hitstop = 0;
    let koTriggered = false;
    let callout: CombatCallout | null = null;
    let screenFlash: { color: string; alpha: number } | undefined;

    // 1. Melee attack resolution (P1 -> P2, P2 -> P1)
    const pairs: Array<[Fighter, Fighter]> = [
      [p1, p2],
      [p2, p1],
    ];

    for (const [attacker, defender] of pairs) {
      if (!attacker.isAttackActiveFrame() || !attacker.currentAttackData) continue;
      if (attacker.attackHasConnected || this.resolvedInstances.has(attacker.attackInstanceId)) {
        continue;
      }
      if (defender.state === 'ko' || defender.state === 'grounded' || defender.invulnTimer > 0) {
        continue;
      }

      const atkBox = CollisionSystem.getAttackHitbox(
        attacker.x,
        attacker.y,
        attacker.facing,
        attacker.currentAttackData,
        attacker.profile.renderScale,
      );
      const defBox = CollisionSystem.getHurtbox({
        x: defender.x,
        y: defender.y,
        isCrouching: defender.isCrouching(),
        isAirborne: !defender.isGrounded,
        isKnockdown: defender.state === 'knockdown',
        scale: defender.profile.renderScale,
        characterId: defender.characterId,
      });

      if (!CollisionSystem.rectsOverlap(atkBox, defBox)) continue;

      // Mark this attack instance resolved so it NEVER damages twice per swing
      attacker.attackHasConnected = true;
      this.resolvedInstances.add(attacker.attackInstanceId);

      const data = attacker.currentAttackData;
      const contactX =
        (Math.max(atkBox.x, defBox.x) + Math.min(atkBox.x + atkBox.width, defBox.x + defBox.width)) * 0.5;
      const contactY =
        (Math.max(atkBox.y, defBox.y) + Math.min(atkBox.y + atkBox.height, defBox.y + defBox.height)) * 0.5;

      const blocked = CollisionSystem.isAttackBlocked(
        defender.isBlocking(),
        defender.isCrouching(),
        defender.facing,
        attacker.x,
        defender.x,
        data.hitLevel,
      );

      if (blocked) {
        const { guardBroken } = defender.receiveBlock({
          chipDamage: data.chipDamage,
          guardDamage: data.guardDamage,
          blockstun: data.blockstun,
          knockbackX: data.knockbackX,
          attackerX: attacker.x,
        });
        attacker.meter = Math.min(attacker.maxMeter, attacker.meter + Math.round(data.meterGainOnHit * 0.55));
        if (guardBroken) {
          soundEngine.playGuardBreak(defender.slot);
          soundEngine.triggerHaptic([25, 15, 35]);
          effects.spawnHitSparks(contactX, contactY, '#ef4444', 24, true);
          effects.spawnImpactRing(contactX, contactY, '#ef4444', 90);
          camera.addTrauma(0.55);
          camera.addZoomImpulse(0.012);
          hitstop = Math.max(hitstop, 0.088);
          callout = this.makeCallout(attacker.slot, 'GUARD BREAK!', 'guard_break');
          screenFlash = { color: '#ef4444', alpha: 0.22 };
        } else {
          soundEngine.playBlock(defender.slot);
          soundEngine.triggerHaptic(10);
          effects.spawnHitSparks(contactX, contactY, '#7dd3fc', 12, false);
          effects.spawnImpactRing(contactX, contactY, '#93c5fd', 56);
          camera.addTrauma(0.18);
          hitstop = Math.max(hitstop, 0.034);
          callout = this.makeCallout(defender.slot, 'BLOCKED', 'block');
        }
      } else {
        const isCounter = defender.isInStartup();
        const isLowHpClutch = attacker.health / attacker.maxHealth <= 0.28 && Boolean(data.isHeavy);
        const isCritical = isLowHpClutch || (attacker.comboCount >= 3 && Boolean(data.isHeavy));

        const damageMult = (isCounter ? 1.15 : 1) * (isCritical ? 1.12 : 1);
        const finalDamage = Math.round(data.damage * damageMult);

        const { isKO } = defender.receiveHit({
          damage: finalDamage,
          hitstun: data.hitstun * (isCounter ? 1.15 : 1),
          knockbackX: data.knockbackX * (isCritical ? 1.12 : 1),
          knockbackY: data.knockbackY,
          attackerX: attacker.x,
          causesKnockdown: data.causesKnockdown,
          causesLaunch: data.causesLaunch,
          isHeavy: Boolean(data.isHeavy) || isCritical,
        });

        attacker.meter = Math.min(attacker.maxMeter, attacker.meter + data.meterGainOnHit);
        attacker.recordHitDealt(finalDamage);

        const sparkColor = isCritical ? '#ffd67a' : isCounter ? '#fb7185' : attacker.profile.accentColor;
        effects.spawnHitSparks(
          contactX,
          contactY,
          sparkColor,
          isCritical ? 24 : data.isHeavy ? 18 : 11,
          Boolean(data.isHeavy) || isCritical,
        );
        effects.spawnImpactRing(
          contactX,
          contactY,
          sparkColor,
          isCritical ? 88 : data.isHeavy ? 68 : 44,
        );

        if (isKO) {
          soundEngine.playKO();
          soundEngine.triggerHaptic([40, 20, 60]);
          camera.addTrauma(0.82);
          camera.addZoomImpulse(0.018);
          hitstop = Math.max(hitstop, 0.115);
          koTriggered = true;
          screenFlash = { color: '#ffffff', alpha: 0.42 };
        } else {
          soundEngine.playHit(Boolean(data.isHeavy), {
            counter: isCounter,
            critical: isCritical,
            attackerId: attacker.characterId,
            slot: attacker.slot,
          });
          soundEngine.triggerHaptic(isCritical ? 26 : data.isHeavy ? 18 : 9);
          camera.addTrauma(isCritical ? 0.48 : data.isHeavy ? 0.36 : 0.18);
          if (data.key === 'ultimate') {
            camera.addZoomImpulse(0.016);
          }
          hitstop = Math.max(hitstop, data.hitstop + (isCounter ? 0.018 : 0));

          if (data.key === 'ultimate') {
            callout = this.makeCallout(attacker.slot, attacker.profile.kit.ultimateName.toUpperCase(), 'ultimate');
          } else if (isCritical) {
            callout = this.makeCallout(attacker.slot, 'CRITICAL HIT!', 'critical');
          } else if (isCounter) {
            callout = this.makeCallout(attacker.slot, 'COUNTER!', 'counter');
          } else if (data.key === 'special_1' || data.key === 'special_2') {
            callout = this.makeCallout(
              attacker.slot,
              data.key === 'special_1' ? attacker.profile.kit.special1Name : attacker.profile.kit.special2Name,
              'special',
            );
          }
        }
      }
    }

    // 2. Projectile hit detection (independent VFX projectiles)
    for (const proj of effects.projectiles) {
      if (proj.hasHit) continue;
      const attacker = proj.ownerSlot === 1 ? p1 : p2;
      const defender = proj.ownerSlot === 1 ? p2 : p1;
      if (defender.state === 'ko' || defender.state === 'grounded' || defender.invulnTimer > 0) {
        continue;
      }

      const projBox = effects.getProjectileHitbox(proj);
      const defBox = CollisionSystem.getHurtbox({
        x: defender.x,
        y: defender.y,
        isCrouching: defender.isCrouching(),
        isAirborne: !defender.isGrounded,
        isKnockdown: defender.state === 'knockdown',
        scale: defender.profile.renderScale,
        characterId: defender.characterId,
      });

      if (!CollisionSystem.rectsOverlap(projBox, defBox)) continue;

      proj.hasHit = true;

      const blocked = CollisionSystem.isAttackBlocked(
        defender.isBlocking(),
        defender.isCrouching(),
        defender.facing,
        proj.x,
        defender.x,
        proj.hitLevel,
      );

      if (proj.hitImpactVfxId) {
        effects.spawnEffect({
          vfxId: proj.hitImpactVfxId,
          x: defender.x,
          y: defender.y - 210,
          facing: proj.facing,
        });
      }

      if (blocked) {
        const { guardBroken } = defender.receiveBlock({
          chipDamage: proj.chipDamage,
          guardDamage: proj.guardDamage,
          blockstun: 0.24,
          knockbackX: proj.knockbackX,
          attackerX: proj.x,
        });
        if (guardBroken) {
          soundEngine.playGuardBreak(defender.slot);
          effects.spawnHitSparks(proj.x, proj.y, '#ef4444', 22, true);
          effects.spawnImpactRing(proj.x, proj.y, '#ef4444', 86);
          camera.addTrauma(0.5);
          hitstop = Math.max(hitstop, 0.08);
          callout = this.makeCallout(attacker.slot, 'GUARD BREAK!', 'guard_break');
        } else {
          soundEngine.playBlock(defender.slot);
          effects.spawnHitSparks(proj.x, proj.y, '#7dd3fc', 12, false);
          effects.spawnImpactRing(proj.x, proj.y, '#93c5fd', 56);
          camera.addTrauma(0.22);
          hitstop = Math.max(hitstop, 0.036);
        }
      } else {
        const { isKO } = defender.receiveHit({
          damage: proj.damage,
          hitstun: proj.hitstun,
          knockbackX: proj.knockbackX,
          knockbackY: proj.knockbackY,
          attackerX: proj.x,
          causesKnockdown: proj.causesKnockdown,
          causesLaunch: proj.causesKnockdown,
          isHeavy: true,
        });

        attacker.recordHitDealt(proj.damage);
        effects.spawnHitSparks(proj.x, proj.y, proj.accentColor, 22, true);
        effects.spawnImpactRing(proj.x, proj.y, proj.accentColor, 82);

        if (isKO) {
          soundEngine.playKO();
          camera.addTrauma(0.82);
          camera.addZoomImpulse(0.018);
          hitstop = Math.max(hitstop, 0.115);
          koTriggered = true;
          screenFlash = { color: '#ffffff', alpha: 0.42 };
        } else {
          soundEngine.playHit(true, { attackerId: attacker.characterId, slot: attacker.slot });
          camera.addTrauma(0.4);
          hitstop = Math.max(hitstop, 0.065);
          callout = this.makeCallout(attacker.slot, proj.piercing ? 'ULTIMATE IMPACT!' : 'SPECIAL HIT!', proj.piercing ? 'ultimate' : 'special');
        }
      }
    }

    if (this.resolvedInstances.size > 128) {
      this.resolvedInstances.clear();
    }

    return { hitstop, koTriggered, callout, screenFlash };
  }
}
