import assert from 'node:assert/strict';
import test from 'node:test';
import { CHARACTER_ANIMATIONS } from '../../config/animations';
import { getCharacterAttackData } from '../../config/characters';
import { getStageById } from '../../config/stages';
import { AnimationPlayer } from '../AnimationPlayer';
import { Camera } from '../Camera';
import { CollisionSystem } from '../CollisionSystem';
import { CombatSystem } from '../CombatSystem';
import { EffectsManager } from '../EffectsManager';
import { Fighter } from '../Fighter';
import { PhysicsEngine } from '../PhysicsEngine';
import { RoundManager } from '../RoundManager';

test('Camera midpoint tracking clamps cleanly within stage boundaries', () => {
  const stage = getStageById('katra');
  const cam = new Camera();
  cam.configure(stage);

  // Midpoint far left clamps to 0
  assert.equal(Camera.computeTargetX(300, 1920, 0, stage.worldWidth - 1920), 0);

  // Midpoint centered scrolls proportionally
  assert.equal(Camera.computeTargetX(1620, 1920, 0, stage.worldWidth - 1920), 660);

  // Midpoint far right clamps to worldWidth - 1920 (1320 for 3240px stage)
  assert.equal(
    Camera.computeTargetX(3000, 1920, 0, stage.worldWidth - 1920),
    stage.worldWidth - 1920,
  );
});

test('CollisionSystem mirrors attack hitboxes accurately when facing left vs right', () => {
  const atk = getCharacterAttackData('rahul', 'light_punch');
  const rightBox = CollisionSystem.getAttackHitbox(1000, 935, 1, atk, 1.75);
  const leftBox = CollisionSystem.getAttackHitbox(1000, 935, -1, atk, 1.75);

  assert.equal(rightBox.width, leftBox.width);
  assert.equal(rightBox.y, leftBox.y);
  assert.ok(rightBox.x > 1000, 'Right-facing hitbox extends forward to the right');
  assert.ok(leftBox.x + leftBox.width < 1000, 'Left-facing hitbox mirrors forward to the left');
});

test('CollisionSystem high/low block rules behave like classic fighting games', () => {
  // Standing block blocks high and mid, loses to low
  assert.equal(CollisionSystem.isAttackBlocked(true, false, -1, 1000, 1200, 'high'), true);
  assert.equal(CollisionSystem.isAttackBlocked(true, false, -1, 1000, 1200, 'mid'), true);
  assert.equal(CollisionSystem.isAttackBlocked(true, false, -1, 1000, 1200, 'low'), false);

  // Crouching block blocks low and mid, loses to high overhead
  assert.equal(CollisionSystem.isAttackBlocked(true, true, -1, 1000, 1200, 'low'), true);
  assert.equal(CollisionSystem.isAttackBlocked(true, true, -1, 1000, 1200, 'mid'), true);
  assert.equal(CollisionSystem.isAttackBlocked(true, true, -1, 1000, 1200, 'high'), false);

  // Facing wrong way cannot block
  assert.equal(CollisionSystem.isAttackBlocked(true, false, 1, 1000, 1200, 'mid'), false);
});

test('CombatSystem deals damage once per attack instance and does not repeat every frame', () => {
  const stage = getStageById('katra');
  const p1 = new Fighter(1, 'rahul');
  const p2 = new Fighter(2, 'tony');
  const effects = new EffectsManager();
  const camera = new Camera();
  const combat = new CombatSystem();
  camera.configure(stage);

  p1.resetForRound(1400, stage.groundY, 1, false);
  p2.resetForRound(1540, stage.groundY, -1, false);

  p1.startAttack('heavy_punch', effects);
  // Advance animation to active frame 3 (fps=14 => ~0.22s)
  p1.animPlayer.update(0.23);
  assert.equal(p1.isAttackActiveFrame(), true);

  const initialHp = p2.health;
  combat.resolveCombat(p1, p2, effects, camera);
  const hpAfterFirstHit = p2.health;
  assert.ok(hpAfterFirstHit < initialHp, 'Opponent HP decreases on active frame hit');

  // Calling resolveCombat again on the same attack instance must NOT deal damage again
  combat.resolveCombat(p1, p2, effects, camera);
  assert.equal(p2.health, hpAfterFirstHit, 'Same attack instance must not repeatedly damage');
});

test('PhysicsEngine prevents fighters from walking through each other and clamps stage bounds', () => {
  const stage = getStageById('ponta');
  const a = { x: 1500, y: stage.groundY, vx: 0, vy: 0, isGrounded: true, facing: 1 as const };
  const b = { x: 1520, y: stage.groundY, vx: 0, vy: 0, isGrounded: true, facing: -1 as const };

  PhysicsEngine.resolveFighterPushbox(a, b, stage);
  assert.ok(Math.abs(b.x - a.x) >= 117, 'Pushbox separates overlapping fighters');

  // Stage left boundary check
  a.x = -200;
  PhysicsEngine.integrateBody(a, stage, 0.016);
  assert.equal(a.x, stage.leftBound);
});

test('AnimationPlayer handles looping, one-shot completion callbacks, and frame triggers', () => {
  const idleDef = CHARACTER_ANIMATIONS.tony.idle;
  const punchDef = CHARACTER_ANIMATIONS.tony.light_punch;
  const player = new AnimationPlayer(idleDef);

  // Looping idle wraps back to frame 0
  player.play(idleDef, { restart: true });
  player.update(idleDef.frames / idleDef.fps + 0.01);
  assert.equal(player.isCompleted(), false);
  assert.equal(player.getFrame(), 0);

  // One-shot attack triggers frame callbacks and fires onComplete once
  const framesSeen: number[] = [];
  let completedCount = 0;
  player.play(punchDef, {
    restart: true,
    callbacks: {
      onFrame: (f) => framesSeen.push(f),
      onComplete: () => completedCount++,
    },
  });
  for (let i = 0; i < 20; i++) {
    player.update(0.05);
  }
  assert.equal(player.isCompleted(), true);
  assert.equal(completedCount, 1);
  assert.equal(framesSeen[0], 0);
  assert.equal(framesSeen[framesSeen.length - 1], punchDef.frames - 1);
});

test('RoundManager completes Best-of-3 match cleanly when a fighter wins 2 rounds', () => {
  let matchWinner: number | null = null;
  const rm = new RoundManager({
    onMatchOver: (w) => {
      matchWinner = w;
    },
  });
  rm.resetMatch();
  // Finish intro
  rm.update(2.0, 1000, 1000, 'Bumba', 'Tony');
  assert.equal(rm.phase, 'fighting');

  // Round 1 KO for P1
  rm.update(0.05, 800, 0, 'Bumba', 'Tony');
  assert.equal(rm.p1Rounds, 1);
  assert.equal(rm.phase, 'ko_slowmo');

  // Advance through KO slowmo + round_over into Round 2
  rm.update(1.0, 800, 0, 'Bumba', 'Tony');
  assert.equal(rm.phase, 'round_over');
  rm.update(2.5, 800, 0, 'Bumba', 'Tony');
  assert.equal(rm.roundNumber, 2);
  assert.equal(rm.phase, 'intro');

  // Round 2 fight start + KO for P1
  rm.update(2.0, 1000, 1000, 'Bumba', 'Tony');
  rm.update(0.05, 650, 0, 'Bumba', 'Tony');
  assert.equal(rm.p1Rounds, 2);
  rm.update(1.0, 650, 0, 'Bumba', 'Tony');
  rm.update(2.5, 650, 0, 'Bumba', 'Tony');
  assert.equal(rm.phase, 'match_over');
  assert.equal(matchWinner, 1);
});
