import assert from 'node:assert/strict';
import test from 'node:test';
import { CharacterId } from '../../config/animations';
import { getCharacterAttackData } from '../../config/characters';
import {
  computeMinCenterSeparation,
  computePreferredCombatCenterDist,
  computePreferredNeutralCenterDist,
  FIGHTER_SPACING_CONFIGS,
  getFighterSpacingConfig,
} from '../../config/fighterSpacing';
import { getStageById } from '../../config/stages';
import { UtilityAI } from '../ai/UtilityAI';
import { CollisionSystem } from '../CollisionSystem';
import { CombatSystem } from '../CombatSystem';
import { Camera } from '../Camera';
import { EffectsManager } from '../EffectsManager';
import { Fighter } from '../Fighter';
import { PhysicsEngine } from '../PhysicsEngine';

const ALL_PAIRINGS: [CharacterId, CharacterId][] = [
  ['rahul', 'sagar'],
  ['rahul', 'jatin'],
  ['rahul', 'tony'],
  ['rahul', 'cheeni'],
  ['sagar', 'jatin'],
  ['sagar', 'tony'],
  ['sagar', 'cheeni'],
  ['jatin', 'tony'],
  ['jatin', 'cheeni'],
  ['tony', 'cheeni'],
];

// Measured visible idle front stance reach from center (1920x1080 world px)
const MEASURED_FRONT_REACH: Record<CharacterId, number> = {
  rahul: 126,
  sagar: 91,
  jatin: 117,
  tony: 114,
  cheeni: 113,
};

test('All 10 character pairings enforce non-overlapping minimum separation exceeding visible stance reaches', () => {
  const stage = getStageById('katra');

  for (const [charA, charB] of ALL_PAIRINGS) {
    const minSep = computeMinCenterSeparation(charA, charB);
    const combinedFrontReach = MEASURED_FRONT_REACH[charA] + MEASURED_FRONT_REACH[charB];

    assert.ok(
      minSep >= combinedFrontReach - 2,
      `${charA} vs ${charB}: minSep (${minSep}px) must prevent silhouette overlap (front reaches ${combinedFrontReach}px)`,
    );

    // Orientation 1: A on left, B on right, starting deeply overlapped
    const bodyA = {
      x: 1600,
      y: stage.groundY,
      vx: 300,
      vy: 0,
      isGrounded: true,
      facing: 1 as const,
      characterId: charA,
    };
    const bodyB = {
      x: 1620,
      y: stage.groundY,
      vx: -300,
      vy: 0,
      isGrounded: true,
      facing: -1 as const,
      characterId: charB,
    };

    PhysicsEngine.resolveFighterPushbox(bodyA, bodyB, stage);
    const actualDist = bodyB.x - bodyA.x;
    assert.ok(
      actualDist >= minSep - 0.5,
      `${charA} vs ${charB}: separated dist (${actualDist.toFixed(1)}px) must be >= minSep (${minSep}px)`,
    );
    assert.equal(bodyA.vx, 0, `${charA} inward velocity cancels cleanly on contact`);
    assert.equal(bodyB.vx, 0, `${charB} inward velocity cancels cleanly on contact`);

    // Orientation 2: B on left, A on right
    const revB = {
      x: 1580,
      y: stage.groundY,
      vx: 250,
      vy: 0,
      isGrounded: true,
      facing: 1 as const,
      characterId: charB,
    };
    const revA = {
      x: 1610,
      y: stage.groundY,
      vx: -250,
      vy: 0,
      isGrounded: true,
      facing: -1 as const,
      characterId: charA,
    };
    PhysicsEngine.resolveFighterPushbox(revB, revA, stage);
    assert.ok(revA.x - revB.x >= minSep - 0.5, `${charB} vs ${charA} reversed maintains minSep`);
  }
});

test('Corner pushbox solver prevents body stacking and crossing at both left and right stage walls', () => {
  const stage = getStageById('ponta');
  const minSep = computeMinCenterSeparation('rahul', 'tony');

  // Left corner: P1 pinned at leftBound, P2 pushing left into P1
  const p1Left = {
    x: stage.leftBound,
    y: stage.groundY,
    vx: 0,
    vy: 0,
    isGrounded: true,
    facing: 1 as const,
    characterId: 'rahul' as CharacterId,
  };
  const p2Left = {
    x: stage.leftBound + 40,
    y: stage.groundY,
    vx: -400,
    vy: 0,
    isGrounded: true,
    facing: -1 as const,
    characterId: 'tony' as CharacterId,
  };

  PhysicsEngine.resolveFighterPushbox(p1Left, p2Left, stage);
  assert.equal(p1Left.x, stage.leftBound, 'Cornered P1 stays clamped to leftBound');
  assert.ok(
    p2Left.x - p1Left.x >= minSep - 0.5,
    'Non-cornered P2 absorbs full pushbox separation at left wall',
  );
  assert.equal(p2Left.vx, 0, 'P2 inward walk velocity cancels cleanly at corner contact');

  // Right corner: P2 pinned at rightBound, P1 pushing right into P2
  const p1Right = {
    x: stage.rightBound - 30,
    y: stage.groundY,
    vx: 400,
    vy: 0,
    isGrounded: true,
    facing: 1 as const,
    characterId: 'rahul' as CharacterId,
  };
  const p2Right = {
    x: stage.rightBound,
    y: stage.groundY,
    vx: 0,
    vy: 0,
    isGrounded: true,
    facing: -1 as const,
    characterId: 'tony' as CharacterId,
  };

  PhysicsEngine.resolveFighterPushbox(p1Right, p2Right, stage);
  assert.equal(p2Right.x, stage.rightBound, 'Cornered P2 stays clamped to rightBound');
  assert.ok(
    p2Right.x - p1Right.x >= minSep - 0.5,
    'Non-cornered P1 absorbs full pushbox separation at right wall',
  );
  assert.equal(p1Right.vx, 0, 'P1 inward walk velocity cancels cleanly at right corner');
});

test('Simultaneous walk-in simulation settles smoothly with zero jitter and zero body overlap', () => {
  const stage = getStageById('enclave');
  const a = {
    x: 1350,
    y: stage.groundY,
    vx: 340,
    vy: 0,
    isGrounded: true,
    facing: 1 as const,
    characterId: 'jatin' as CharacterId,
  };
  const b = {
    x: 1890,
    y: stage.groundY,
    vx: -340,
    vy: 0,
    isGrounded: true,
    facing: -1 as const,
    characterId: 'sagar' as CharacterId,
  };
  const minSep = computeMinCenterSeparation('jatin', 'sagar');

  const distances: number[] = [];
  for (let frame = 0; frame < 90; frame++) {
    a.vx = 340;
    b.vx = -340;
    PhysicsEngine.integrateBody(a, stage, 1 / 60);
    PhysicsEngine.integrateBody(b, stage, 1 / 60);
    PhysicsEngine.resolveFighterPushbox(a, b, stage);
    distances.push(b.x - a.x);
  }

  // After contact, distance must stay locked at minSep with zero oscillation
  const settled = distances.slice(-15);
  for (const d of settled) {
    assert.ok(d >= minSep - 0.5, `Settled distance ${d} must never fall below minSep ${minSep}`);
  }
  const spread = Math.max(...settled) - Math.min(...settled);
  assert.ok(spread < 0.5, `Settled pushbox distance must not jitter (spread=${spread.toFixed(3)}px)`);
});

test('Calibrated attacks connect cleanly at proper non-overlapping combat spacing across all 10 matchups', () => {
  const stage = getStageById('katra');
  const moves = ['light_punch', 'heavy_punch', 'light_kick', 'heavy_kick', 'sweep'] as const;

  for (const [attackerId, defenderId] of ALL_PAIRINGS) {
    const minSep = computeMinCenterSeparation(attackerId, defenderId);
    const combatDist = minSep + 16; // Realistic non-overlapping combat stance gap

    for (const move of moves) {
      const p1 = new Fighter(1, attackerId);
      const p2 = new Fighter(2, defenderId);
      const effects = new EffectsManager();
      const camera = new Camera();
      const combat = new CombatSystem();
      camera.configure(stage);

      p1.resetForRound(1400, stage.groundY, 1, false);
      p2.resetForRound(1400 + combatDist, stage.groundY, -1, false);

      // Verify pushboxes are strictly non-overlapping before attack
      const pushA = CollisionSystem.getPushbox({ x: p1.x, y: p1.y, characterId: p1.characterId });
      const pushB = CollisionSystem.getPushbox({ x: p2.x, y: p2.y, characterId: p2.characterId });
      assert.equal(
        CollisionSystem.rectsOverlap(pushA, pushB),
        false,
        `${attackerId} vs ${defenderId} pushboxes must not overlap before ${move}`,
      );

      p1.startAttack(move, effects);
      const atkData = getCharacterAttackData(attackerId, move);
      // Advance directly into active window
      let connected = false;
      for (let step = 0; step < 30; step++) {
        p1.animPlayer.update(1 / 60);
        if (p1.isAttackActiveFrame()) {
          const initialHp = p2.health;
          combat.resolveCombat(p1, p2, effects, camera);
          if (p2.health < initialHp) {
            connected = true;
            break;
          }
        }
      }

      assert.equal(
        connected,
        true,
        `${attackerId} ${move} (hitbox offsetX=${atkData.hitbox.offsetX}, w=${atkData.hitbox.width}) must connect on ${defenderId} at non-overlapping combat spacing (${combatDist}px)`,
      );
    }
  }
});

test('CPU UtilityAI brakes before body overlap, backs off if crowded, and differentiates fighter spacing', () => {
  const stage = getStageById('katra');

  // 1. Braking test: Rahul CPU placed right at preferred combat distance from Sagar must NOT walk forward into body overlap
  const ai = new UtilityAI();
  const minSep = computeMinCenterSeparation('rahul', 'sagar');
  const closeDist = minSep + 18;
  let walkedIntoOverlap = false;
  for (let i = 0; i < 10; i++) {
    const decision = ai.decide({
      dt: 0.1,
      difficulty: 'normal',
      cpuCharId: 'rahul',
      opponentCharId: 'sagar',
      cpuX: 1400 + closeDist,
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
      opponentX: 1400,
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
      rng: () => 0.45,
    });
    if (decision.input.left || decision.input.dashLeftPressed) {
      walkedIntoOverlap = true;
    }
  }
  assert.equal(
    walkedIntoOverlap,
    false,
    'CPU must brake cleanly at combat range instead of walking into player pushbox',
  );

  // 2. Crowding back-off test: when right on pushbox boundary, CPU steps back cleanly
  const crowdAi = new UtilityAI();
  let steppedBack = false;
  for (let i = 0; i < 6; i++) {
    const decision = crowdAi.decide({
      dt: 0.12,
      difficulty: 'normal',
      cpuCharId: 'jatin',
      opponentCharId: 'rahul',
      cpuX: 1400 + computeMinCenterSeparation('jatin', 'rahul') + 2,
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
      opponentX: 1400,
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
      rng: () => 0.5,
    });
    if (decision.input.right || decision.input.dashRightPressed) {
      steppedBack = true;
    }
  }
  assert.equal(steppedBack, true, 'CPU should step back cleanly when crowded against opponent pushbox');

  // 3. Per-character spacing config sanity
  assert.ok(
    computePreferredNeutralCenterDist('jatin', 'rahul') >
      computePreferredNeutralCenterDist('rahul', 'jatin'),
    'Zoner Jatin maintains wider preferred neutral spacing than brawler Rahul',
  );
  assert.ok(
    computePreferredCombatCenterDist('rahul', 'sagar') > computeMinCenterSeparation('rahul', 'sagar'),
    'Preferred combat distance is always strictly wider than minimum pushbox separation',
  );
  assert.equal(Object.keys(FIGHTER_SPACING_CONFIGS).length, 5);
  assert.ok(getFighterSpacingConfig('tony').movementBrakingDistance > 0);
  assert.ok(getFighterSpacingConfig('cheeni').movementBrakingDistance > 0);
});
