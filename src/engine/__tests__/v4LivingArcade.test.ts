import assert from 'node:assert/strict';
import test from 'node:test';
import { CharacterId } from '../../config/animations';
import {
  advanceSurvivalRun,
  computeArcadeScore,
  createArcadeRun,
  createSurvivalRun,
  getMatchupIntroLine,
  getVictoryQuote,
} from '../../config/arcadeProgression';
import { computeMinCenterSeparation, computePreferredCombatCenterDist } from '../../config/fighterSpacing';
import { getStageById } from '../../config/stages';
import { getCharacterAIProfile } from '../ai/CharacterAIProfiles';
import { PlayerBehaviorAnalyzer } from '../ai/PlayerBehaviorAnalyzer';
import { AI_DIFFICULTY_TUNING, UtilityAI, UtilityAIContext } from '../ai/UtilityAI';
import { Camera } from '../Camera';
import { CombatSystem } from '../CombatSystem';
import { EffectsManager } from '../EffectsManager';
import { Fighter } from '../Fighter';

function createDeterministicRng(seed = 42): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

function makeBaseAIContext(overrides: Partial<UtilityAIContext> = {}): UtilityAIContext {
  return {
    dt: 1 / 60,
    difficulty: 'hard',
    cpuCharId: 'tony',
    opponentCharId: 'rahul',
    cpuX: 1650,
    cpuY: 960,
    cpuHealthPct: 1,
    cpuGuardPct: 1,
    cpuMeter: 50,
    cpuSpecial1Ready: true,
    cpuSpecial2Ready: true,
    cpuGrounded: true,
    cpuState: 'idle',
    cpuCanAct: true,
    cpuComboCount: 0,
    cpuAttackConnected: false,
    opponentX: 1320,
    opponentY: 960,
    opponentHealthPct: 1,
    opponentGuardPct: 1,
    opponentGrounded: true,
    opponentState: 'idle',
    opponentMove: null,
    opponentAttacking: false,
    opponentBlocking: false,
    opponentAttackConnected: false,
    opponentInvuln: false,
    opponentInRecovery: false,
    incomingProjectile: false,
    stageLeftBound: 130,
    stageRightBound: 3110,
    roundNumber: 1,
    cpuRoundWins: 0,
    opponentRoundWins: 0,
    timerSeconds: 90,
    rng: createDeterministicRng(123),
    ...overrides,
  };
}

test('PlayerBehaviorAnalyzer detects player habits, classifies playstyles, persists across rounds, and respects fair 0.35 cap', () => {
  const analyzer = new PlayerBehaviorAnalyzer();

  // Simulate repeated aerial jump-ins
  for (let i = 0; i < 12; i++) {
    analyzer.recordAction('jump');
  }
  const airSummary = analyzer.getAdaptationSummary(1.0);
  assert.equal(airSummary.detectedPlaystyle, 'AERIAL ASSAULT');
  assert.ok(airSummary.antiAirBonus > 0.15, 'Should raise anti-air readiness against jump spam');
  assert.ok(airSummary.antiAirBonus <= 0.35, 'Adaptation bonus must never exceed fair 0.35 cap');

  // Round boundary reset keeps learned habits while clearing transient timers
  analyzer.recordAction('whiff');
  assert.equal(analyzer.getAdaptationSummary(1.0).recentWhiffDetected, true);
  analyzer.resetTransientForNextRound();
  const afterRoundReset = analyzer.getAdaptationSummary(1.0);
  assert.equal(afterRoundReset.recentWhiffDetected, false, 'Transient whiff timer clears on new round');
  assert.equal(afterRoundReset.detectedPlaystyle, 'AERIAL ASSAULT', 'Learned playstyle persists into Round 2');

  // Full match reset clears everything cleanly
  analyzer.reset();
  assert.equal(analyzer.getAdaptationSummary(1.0).detectedPlaystyle, 'OBSERVING');
});

test('UtilityAI V4 enforces human-like reaction delay before blocking incoming attacks', () => {
  const ai = new UtilityAI();
  // Frame 1 of opponent attack on Easy (reactionDelaySec = 0.26s): should NOT instantaneously block frame-0
  const frame1 = ai.decide(
    makeBaseAIContext({
      dt: 0.016,
      difficulty: 'easy',
      opponentAttacking: true,
      opponentState: 'attack',
      opponentMove: 'heavy_punch',
      rng: () => 0.01, // Always passes probability roll if reactionReady were true
    }),
  );
  assert.notEqual(
    frame1.state,
    'block',
    'AI must not react instantaneously on frame 0 before human visual reaction latency elapses',
  );

  // Advance past reaction latency on Hard (0.085s) -> AI now reacts and blocks cleanly
  const hardAi = new UtilityAI();
  let blockedAfterDelay = false;
  for (let i = 0; i < 12; i++) {
    const res = hardAi.decide(
      makeBaseAIContext({
        dt: 0.016,
        difficulty: 'hard',
        opponentAttacking: true,
        opponentState: 'attack',
        opponentMove: 'sweep',
        rng: () => 0.05,
      }),
    );
    if (res.state === 'block' && res.blockLow) {
      blockedAfterDelay = true;
      break;
    }
  }
  assert.equal(blockedAfterDelay, true, 'AI should block low after visual reaction delay elapses');
});

test('UtilityAI V4 scales 4 difficulty tiers monotonically from Easy to Master', () => {
  const tiers = ['easy', 'normal', 'hard', 'master'] as const;
  for (let i = 0; i < tiers.length - 1; i++) {
    const cur = AI_DIFFICULTY_TUNING[tiers[i]];
    const next = AI_DIFFICULTY_TUNING[tiers[i + 1]];
    assert.ok(cur.reactionDelaySec > next.reactionDelaySec, `${tiers[i + 1]} should react faster than ${tiers[i]}`);
    assert.ok(cur.reactionChance < next.reactionChance, `${tiers[i + 1]} should have higher reactionChance`);
    assert.ok(cur.comboFollowupChance < next.comboFollowupChance, `${tiers[i + 1]} should combo more reliably`);
    assert.ok(cur.mistakeRate > next.mistakeRate, `${tiers[i + 1]} should make fewer mistakes`);
  }
});

test('UtilityAI V4 holds okizeme spacing against downed opponent instead of mashing into invulnerability', () => {
  const ai = new UtilityAI();
  const minSep = computeMinCenterSeparation('rahul', 'sagar');
  let attackedInvuln = false;
  let heldOkiOrSpacing = false;

  for (let i = 0; i < 20; i++) {
    const res = ai.decide(
      makeBaseAIContext({
        dt: 0.05,
        difficulty: 'master',
        cpuCharId: 'rahul',
        opponentCharId: 'sagar',
        cpuX: 1500,
        opponentX: 1500 - (minSep + 28),
        opponentState: 'grounded',
        opponentInvuln: true,
        rng: createDeterministicRng(77 + i),
      }),
    );
    if (
      res.input.lightPunchPressed ||
      res.input.heavyPunchPressed ||
      res.input.kickPressed ||
      res.input.specialPressed ||
      res.input.ultimatePressed
    ) {
      attackedInvuln = true;
    }
    if (res.state === 'okizeme_pressure' || res.state === 'maintain_distance') {
      heldOkiOrSpacing = true;
    }
  }

  assert.equal(attackedInvuln, false, 'AI should not waste attacks on an invulnerable downed fighter');
  assert.equal(heldOkiOrSpacing, true, 'AI should establish okizeme spacing while opponent is down');
});

test('UtilityAI V4 executes character-specific combo routes on hit and punishes opponent recovery', () => {
  const chars: CharacterId[] = ['rahul', 'sagar', 'jatin', 'tony'];
  for (const id of chars) {
    const profile = getCharacterAIProfile(id);
    assert.ok(profile.comboRoutes.length >= 3, `${id} should define distinct signature combo routes`);
  }

  // Test whiff/recovery punish
  const ai = new UtilityAI();
  let punished = false;
  const combatDist = computePreferredCombatCenterDist('sagar', 'rahul');
  for (let i = 0; i < 15; i++) {
    const res = ai.decide(
      makeBaseAIContext({
        dt: 0.05,
        difficulty: 'master',
        cpuCharId: 'sagar',
        opponentCharId: 'rahul',
        cpuX: 1500,
        opponentX: 1500 - combatDist,
        opponentState: 'special_recovery',
        opponentInRecovery: true,
        rng: () => 0.1,
      }),
    );
    if (res.state === 'punish_whiff') {
      punished = true;
      break;
    }
  }
  assert.equal(punished, true, 'AI should punish opponent caught in recovery frames');
});

test('Arcade Tournament ladder, Survival Gauntlet progression, and S-C scoring/ranking work deterministically', () => {
  const chars: CharacterId[] = ['rahul', 'sagar', 'jatin', 'tony'];
  for (const player of chars) {
    const run = createArcadeRun(player, 'normal');
    assert.equal(run.bouts.length, 3, 'Arcade ladder has 3 distinct family rival bouts');
    assert.equal(
      run.bouts.some((b) => b.opponentCharId === player),
      false,
      `${player} should never fight themselves in Arcade Tournament`,
    );
    assert.equal(run.bouts[2].isFinalBoss, true, 'Stage 3 is flagged as Final Rival');
    assert.equal(run.bouts[2].difficulty, 'hard', 'Normal arcade escalates Final Rival to Hard');
    for (const bout of run.bouts) {
      assert.equal(getStageById(bout.stageId).id, bout.stageId, `Stage ${bout.stageId} must exist in STAGES`);
    }
    assert.ok(getMatchupIntroLine(player, run.bouts[0].opponentCharId).length > 10);
    assert.ok(getVictoryQuote(player, 1).length > 10);
  }

  // Survival progression recovers +35% HP capped at 100% and escalates difficulty
  const surv1 = createSurvivalRun('rahul', 'normal');
  assert.equal(surv1.wave, 1);
  const surv2 = advanceSurvivalRun(surv1, 0.4, 8500, 'normal');
  assert.equal(surv2.wave, 2);
  assert.ok(Math.abs(surv2.carryHealthPct - 0.75) < 0.001, 'Survival recovers +35% HP on wave clear');
  const surv3 = advanceSurvivalRun(surv2, 0.9, 9000, 'normal');
  assert.equal(surv3.carryHealthPct, 1, 'Survival HP recovery caps at 100%');
  assert.equal(surv3.currentDifficulty, 'hard', 'Survival escalates difficulty at Wave 3');

  // Scoring & Grade tiers
  const sRank = computeArcadeScore({
    wonMatch: true,
    p1DamageDealt: 2000,
    p1MaxCombo: 5,
    counterHits: 3,
    punishes: 2,
    guardBreaks: 1,
    firstAttacks: 2,
    perfectRounds: 1,
    comebackRounds: 0,
    remainingHealthPct: 1,
    difficulty: 'hard',
  });
  assert.equal(sRank.rank, 'S');
  assert.ok(sRank.totalScore > 25000);

  const lossRank = computeArcadeScore({
    wonMatch: false,
    p1DamageDealt: 600,
    p1MaxCombo: 2,
    counterHits: 0,
    punishes: 0,
    guardBreaks: 0,
    firstAttacks: 0,
    perfectRounds: 0,
    comebackRounds: 0,
    remainingHealthPct: 0,
    difficulty: 'normal',
  });
  assert.equal(lossRank.rank, 'C');
});

test('CombatSystem V4 awards FIRST ATTACK, PUNISH, and live P1 score deltas accurately', () => {
  const stage = getStageById('katra');
  const p1 = new Fighter(1, 'rahul');
  const p2 = new Fighter(2, 'sagar');
  const effects = new EffectsManager();
  const camera = new Camera();
  const combat = new CombatSystem();

  const combatDist = computePreferredCombatCenterDist('rahul', 'sagar');
  p1.resetForRound(1200, stage.groundY, 1, false);
  p2.resetForRound(1200 + combatDist, stage.groundY, -1, false);
  p2.setState('special_recovery', 'special_recovery', true);

  p1.startAttack('heavy_punch', effects);
  let gotFirstAttack = false;
  let scoreTotal = 0;

  for (let i = 0; i < 40; i++) {
    p1.update(1 / 60, stage, effects);
    p2.update(1 / 60, stage, effects);
    const tick = combat.resolveCombat(p1, p2, effects, camera);
    scoreTotal += tick.p1ScoreDelta;
    if (tick.callout?.type === 'first_attack') {
      gotFirstAttack = true;
    }
  }

  assert.equal(gotFirstAttack, true, 'Opening unblocked hit should award FIRST ATTACK!');
  assert.equal(p1.firstAttacksLanded, 1);
  assert.equal(p1.punishesLanded, 1, 'Hitting opponent in special_recovery should record a Punish');
  assert.ok(scoreTotal > 1000, 'Live arcade score delta should accumulate on landed hits');
});
