import assert from 'node:assert/strict';
import test from 'node:test';
import { CHARACTER_ANIMATIONS, CharacterId } from '../../config/animations';
import { getCharacterControlProfile } from '../../config/characterControlProfiles';
import { getStageById } from '../../config/stages';
import { getCharacterAIProfile } from '../ai/CharacterAIProfiles';
import { CombatMemory } from '../ai/CombatMemory';
import { UtilityAI } from '../ai/UtilityAI';
import { SFXManager } from '../audio/SFXManager';
import { EffectsManager } from '../EffectsManager';
import { Fighter } from '../Fighter';
import { VirtualControls } from '../VirtualControls';

test('All five characters have zero fallback animations including Cheeni', () => {
  const chars: CharacterId[] = ['rahul', 'sagar', 'jatin', 'tony', 'cheeni'];
  for (const id of chars) {
    const anims = CHARACTER_ANIMATIONS[id];
    for (const [key, def] of Object.entries(anims)) {
      assert.ok(def.url.startsWith('/assets/characters/'), `${id}.${key} has valid asset url`);
      assert.notEqual(
        def.isFallback,
        true,
        `${id}.${key} should use genuine original sprite sheet without fallback`,
      );
    }
  }
  assert.equal(
    CHARACTER_ANIMATIONS.sagar.guard_high.url,
    '/assets/characters/sagar/sagar_22_standing_guard_4f.png',
  );
  assert.equal(
    CHARACTER_ANIMATIONS.sagar.guard_break.url,
    '/assets/characters/sagar/sagar_29_guard_break_stunned_5f.png',
  );
  assert.equal(
    CHARACTER_ANIMATIONS.cheeni.special_2.url,
    '/assets/characters/cheeni/cheeni_33_caramel_trap_cast_7f.png',
  );
});

test('Character touch control profiles expose distinct signature abilities per fighter', () => {
  const bumba = getCharacterControlProfile('rahul');
  const beggi = getCharacterControlProfile('sagar');
  const ambani = getCharacterControlProfile('jatin');
  const tony = getCharacterControlProfile('tony');
  const cheeni = getCharacterControlProfile('cheeni');

  const abilityNames = [
    bumba.abilities.map((a) => a.fullName).join('|'),
    beggi.abilities.map((a) => a.fullName).join('|'),
    ambani.abilities.map((a) => a.fullName).join('|'),
    tony.abilities.map((a) => a.fullName).join('|'),
    cheeni.abilities.map((a) => a.fullName).join('|'),
  ];
  assert.equal(new Set(abilityNames).size, 5, 'Each character has unique signature touch abilities');
  assert.equal(bumba.abilities[0].icon, 'rahul_fist');
  assert.equal(beggi.abilities[0].icon, 'sagar_note');
  assert.equal(ambani.abilities[0].icon, 'jatin_cash');
  assert.equal(tony.abilities[1].icon, 'tony_drone');
  assert.equal(cheeni.abilities[0].icon, 'cheeni_sugar');
  assert.equal(cheeni.abilities[1].icon, 'cheeni_caramel');
  assert.equal(cheeni.abilities[2].icon, 'cheeni_legacy');
});

test('VirtualControls isolates Player 1 and Player 2 simultaneous touch inputs cleanly', () => {
  const vc = new VirtualControls();

  // P1 holds right & taps special1 while P2 holds block & taps lightPunch simultaneously
  vc.pointerDownAction(1, 101, 'right', 1000);
  vc.pointerDownAction(1, 102, 'special1', 1000);
  vc.pointerDownAction(2, 201, 'block', 1000);
  vc.pointerDownAction(2, 202, 'lightPunch', 1000);

  const p1 = vc.readPlayerInput(1);
  const p2 = vc.readPlayerInput(2);

  assert.equal(p1.right, true);
  assert.equal(p1.specialPressed, true);
  assert.equal(p1.block, false, 'P2 block must not bleed into P1');
  assert.equal(p1.lightPunchPressed, false, 'P2 punch must not bleed into P1');

  assert.equal(p2.block, true);
  assert.equal(p2.lightPunchPressed, true);
  assert.equal(p2.right, false, 'P1 movement must not bleed into P2');
  assert.equal(p2.specialPressed, false, 'P1 special must not bleed into P2');

  // Releasing P1 pointers leaves P2 pointers completely intact (no stuck or dropped touches)
  vc.pointerRelease(1, 101);
  vc.pointerRelease(1, 102);
  assert.equal(vc.getActivePointerCount(1), 0);
  assert.equal(vc.getActivePointerCount(2), 2);
  assert.equal(vc.isActionHeld(2, 'block'), true);

  // Releasing P2 pointers clears cleanly
  vc.pointerRelease(2, 201);
  vc.pointerRelease(2, 202);
  assert.equal(vc.getActivePointerCount(2), 0);
  assert.equal(vc.isActionHeld(2, 'block'), false);
});

test('VirtualControls joystick maps vectors cleanly and triggers double-tap dash', () => {
  const vc = new VirtualControls();

  // Double-tap right on joystick
  vc.pointerMoveStick(1, 301, 0.85, 0, 1000);
  vc.pointerRelease(1, 301);
  vc.pointerMoveStick(1, 302, 0.9, 0, 1180);

  const input = vc.readPlayerInput(1);
  assert.equal(input.right, true);
  assert.equal(input.dashRightPressed, true, 'Rapid double push right triggers forward dash');

  // Release stick -> zero stuck directions
  vc.pointerRelease(1, 302);
  const afterRelease = vc.readPlayerInput(1);
  assert.equal(afterRelease.right, false);
  assert.equal(afterRelease.left, false);
});

test('Fighter tracks special cooldowns and exposes accurate HUD readiness states', () => {
  const stage = getStageById('katra');
  const fighter = new Fighter(1, 'sagar');
  const effects = new EffectsManager();
  fighter.resetForRound(stage.initialP1X, stage.groundY, 1, false);
  fighter.meter = 100;

  const before = fighter.toHudSnapshot(0);
  assert.equal(before.specialReady, true);
  assert.equal(before.special2Ready, true);
  assert.equal(before.ultimateReady, true);

  fighter.startSpecial('special_1', effects);
  const during = fighter.toHudSnapshot(0);
  assert.ok(during.special1Cooldown > 0, 'Special 1 enters cooldown immediately');
  assert.equal(during.specialReady, false);
  assert.ok(during.meter < 100, 'Special 1 spends super meter');
});

test('UtilityAI actively closes distance at long range and adapts within bounded cap', () => {
  const ai = new UtilityAI();
  const stage = getStageById('katra');

  // Simulate long distance (720px apart) with Rahul (brawler)
  let movedTowardOpponent = false;
  for (let i = 0; i < 6; i++) {
    const decision = ai.decide({
      dt: 0.12,
      difficulty: 'normal',
      cpuCharId: 'rahul',
      cpuX: 2100,
      cpuY: stage.groundY,
      cpuHealthPct: 1,
      cpuMeter: 0,
      cpuSpecial1Ready: false,
      cpuSpecial2Ready: false,
      cpuGrounded: true,
      cpuState: 'idle',
      cpuCanAct: true,
      cpuComboCount: 0,
      cpuAttackConnected: false,
      opponentX: 1380,
      opponentY: stage.groundY,
      opponentHealthPct: 1,
      opponentGrounded: true,
      opponentState: 'idle',
      opponentMove: null,
      opponentAttacking: false,
      opponentBlocking: false,
      opponentAttackConnected: false,
      incomingProjectile: false,
      stageLeftBound: stage.leftBound,
      stageRightBound: stage.rightBound,
      rng: () => 0.4,
    });
    if (decision.input.left || decision.input.dashLeftPressed) {
      movedTowardOpponent = true;
    }
  }
  assert.equal(movedTowardOpponent, true, 'CPU must actively close distance when far apart');

  // Distinct character profiles: Rahul prefers closer range than Jatin zoner
  const rahulProfile = getCharacterAIProfile('rahul');
  const jatinProfile = getCharacterAIProfile('jatin');
  assert.ok(
    rahulProfile.preferredMaxDist < jatinProfile.preferredMaxDist,
    'Rahul brawler prefers tighter spacing than Jatin zoner',
  );

  // Bounded CombatMemory adaptation never exceeds 0.35 cap
  const mem = new CombatMemory();
  for (let i = 0; i < 20; i++) {
    mem.recordAction('jump');
    mem.recordAction('light_attack');
  }
  const summary = mem.getAdaptationSummary(1.0);
  assert.ok(summary.antiAirBonus <= 0.35, 'Adaptation bonus stays fairly capped at <= 0.35');
  assert.ok(summary.antiLightSpamBonus <= 0.35, 'Anti-light adaptation stays fairly capped');
});

test('SFXManager deduplicates rapid duplicate sound events deterministically', () => {
  const sfx = new SFXManager({
    getContext: () => null,
    getSfxBus: () => null,
    getUiBus: () => null,
    isAudible: () => false,
  });

  assert.equal(sfx.canPlayEvent('combat_hit_heavy:1', 1000, 60), true);
  assert.equal(sfx.canPlayEvent('combat_hit_heavy:1', 1020, 60), false, 'Blocked inside dedupe window');
  assert.equal(sfx.canPlayEvent('combat_hit_heavy:1', 1065, 60), true, 'Allowed once interval passes');
  assert.equal(sfx.canPlayEvent('combat_hit_heavy:2', 1065, 60), true, 'Separate slot is independent');
});
