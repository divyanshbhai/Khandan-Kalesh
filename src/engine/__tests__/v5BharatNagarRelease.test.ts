import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import test from 'node:test';
import WebSocket from 'ws';
import { CHARACTER_ANIMATIONS, getCharacterAssetUrls } from '../../config/animations';
import { createArcadeRun } from '../../config/arcadeProgression';
import { AUDIO_CATALOGUE } from '../../config/audioCatalogue';
import {
  CHARACTER_REGISTRY,
  CHARACTER_RENDER_CALIBRATION,
  getPlayableCharacterIds,
  getPlayableRegistryEntries,
  getUpcomingRegistryEntries,
} from '../../config/characterRegistry';
import { GAME_CONFIG } from '../../config/game';
import { getStageById } from '../../config/stages';
import { OFFICIAL_STORY_INTRO, STORY_PANELS } from '../../config/story';
import {
  createTournamentBracket,
  getNextPlayerTournamentMatch,
  recordTournamentPlayerResult,
} from '../../config/tournament';
import { EffectsManager } from '../EffectsManager';
import { Fighter } from '../Fighter';
import {
  CompactInputPacket,
  CompactMatchSnapshot,
  isValidInputPacket,
  isValidRoomCode,
  sanitizeDisplayName,
  SignallingServerMessage,
} from '../../network/protocol';
import { attachSignallingServer } from '../../server/signalling';

function makeDeterministicRng(seed = 42): () => number {
  let state = seed >>> 0;
  return () => {
    state = (1664525 * state + 1013904223) >>> 0;
    return state / 0xffffffff;
  };
}

test('39 Bharat Nagar official brand identity & 7-character registry with Cheeni and renamed fighters', () => {
  assert.equal(GAME_CONFIG.title, '39 BHARAT NAGAR');
  assert.equal(GAME_CONFIG.tagline, 'ONE HOUSE. SEVEN CLAIMS.');
  assert.equal(GAME_CONFIG.creator, 'Divyansh Ama QIM');

  assert.equal(CHARACTER_REGISTRY.length, 7);
  assert.deepEqual(getPlayableCharacterIds(), ['rahul', 'sagar', 'jatin', 'tony', 'cheeni']);
  assert.deepEqual(
    getPlayableRegistryEntries().map((e) => e.displayName),
    ['BUMBA', 'BEGGI', 'AMBANI', 'TONY', 'CHEENI'],
  );
  assert.deepEqual(
    getPlayableRegistryEntries().map((e) => e.profile.name),
    ['Bumba', 'Beggi', 'Ambani', 'Tony', 'Cheeni'],
  );

  const upcoming = getUpcomingRegistryEntries();
  assert.equal(upcoming.length, 2);
  assert.deepEqual(
    upcoming.map((u) => u.displayName),
    ['CHAMETO', 'MOLI'],
  );
  for (const entry of upcoming) {
    assert.equal(entry.available, false);
    assert.equal(entry.statusLabel, 'COMING SOON');
  }

  for (const id of getPlayableCharacterIds()) {
    const cal = CHARACTER_RENDER_CALIBRATION[id];
    assert.ok(cal.gameplayRenderScale > 1.0 && cal.gameplayRenderScale < 2.2);
    assert.ok(cal.menuScaleMultiplier > 0.8 && cal.menuScaleMultiplier < 1.3);
  }
});

test('All 40 unique Cheeni animation sheets and 3 Cheeni VFX sheets exist on disk', () => {
  const uniqueAnimUrls = new Set(Object.values(CHARACTER_ANIMATIONS.cheeni).map((d) => d.url));
  assert.equal(uniqueAnimUrls.size, 40);
  const allUrls = getCharacterAssetUrls('cheeni');
  assert.equal(allUrls.length, 43);
  const publicDir = path.resolve(process.cwd(), 'public');
  for (const url of allUrls) {
    const filePath = path.join(publicDir, url.replace(/^\//, ''));
    assert.equal(fs.existsSync(filePath), true, `Missing Cheeni asset on disk: ${url}`);
  }
});

test('Cheeni signature abilities spawn Sugar Shot, grounded Caramel Trap (holdFinal), and Sweet Legacy', () => {
  const stage = getStageById('katra');
  const cheeni = new Fighter(1, 'cheeni');
  const effects = new EffectsManager();
  const positions = {
    1: { x: 1400, y: stage.groundY, facing: 1 as const },
    2: { x: 1900, y: stage.groundY, facing: -1 as const },
  };
  cheeni.resetForRound(1400, stage.groundY, 1, false);
  cheeni.meter = 100;

  // 1. Sugar Shot (special_1 projectile — transitions from special_charge into special_1)
  cheeni.startSpecial('special_1', effects);
  for (let i = 0; i < 60; i++) {
    cheeni.update(1 / 60, stage, effects);
    effects.update(1 / 60, stage.worldWidth, positions);
    if (effects.projectiles.some((p) => p.vfxId === 'cheeni_sugar_shot_projectile')) break;
  }
  const sugarShot = effects.projectiles.find((p) => p.vfxId === 'cheeni_sugar_shot_projectile');
  assert.ok(sugarShot, 'Cheeni special_1 spawns Sugar Shot projectile');
  assert.ok(sugarShot.vx > 0, 'Sugar Shot travels forward');

  // 2. Caramel Trap (special_2 grounded floor_trap with holdFinal lingering past animation completion)
  effects.clear();
  cheeni.resetForRound(1400, stage.groundY, 1, false);
  cheeni.meter = 100;
  cheeni.startSpecial('special_2', effects);
  for (let i = 0; i < 45; i++) {
    cheeni.update(1 / 60, stage, effects);
    effects.update(1 / 60, stage.worldWidth, positions);
    if (effects.projectiles.some((p) => p.vfxId === 'cheeni_caramel_trap_vfx')) break;
  }
  const trap = effects.projectiles.find((p) => p.vfxId === 'cheeni_caramel_trap_vfx');
  assert.ok(trap, 'Cheeni special_2 spawns Caramel Trap floor hazard');
  assert.equal(trap.vx, 0, 'Caramel Trap stays anchored on the floor');
  assert.equal(trap.hitLevel, 'low', 'Caramel Trap hits low');
  // Advance 1.2s (well past its 8f / 14fps = 0.57s animation duration) and verify it stays active!
  for (let i = 0; i < 72; i++) {
    effects.update(1 / 60, stage.worldWidth, positions);
  }
  assert.equal(
    effects.projectiles.some((p) => p.id === trap.id),
    true,
    'Caramel Trap holds final frame and remains active until maxLifetime',
  );

  // 3. Sweet Legacy (ultimate sweet_storm)
  effects.clear();
  cheeni.resetForRound(1400, stage.groundY, 1, false);
  cheeni.meter = 100;
  cheeni.startUltimate(effects);
  for (let i = 0; i < 80; i++) {
    cheeni.update(1 / 60, stage, effects);
    effects.update(1 / 60, stage.worldWidth, positions);
    if (effects.projectiles.some((p) => p.vfxId === 'cheeni_sweet_legacy_vfx')) break;
  }
  const legacy = effects.projectiles.find((p) => p.vfxId === 'cheeni_sweet_legacy_vfx');
  assert.ok(legacy, 'Cheeni ultimate spawns Sweet Legacy storm');
  assert.equal(legacy.piercing, true, 'Sweet Legacy is piercing');
});

test('Story mode contains official narrative and 4 concise panels', () => {
  assert.ok(OFFICIAL_STORY_INTRO.includes('One house. One disputed property.'));
  assert.ok(OFFICIAL_STORY_INTRO.includes('Five fighters have entered the arena'));
  assert.ok(OFFICIAL_STORY_INTRO.includes('Two more challengers are waiting.'));
  assert.equal(STORY_PANELS.length, 4);
  for (const panel of STORY_PANELS) {
    assert.ok(panel.lines.length >= 1 && panel.lines.length <= 4);
    assert.ok(panel.featuredFighters.length >= 1);
  }
});

test('Arcade mode draws 4 non-repeating randomized opponents and stages for 5-fighter roster', () => {
  const run = createArcadeRun('cheeni', 'normal', makeDeterministicRng(1337));
  assert.equal(run.playerCharId, 'cheeni');
  assert.equal(run.bouts.length, 4);

  const seenOpponents = new Set<string>();
  for (const bout of run.bouts) {
    assert.notEqual(bout.opponentCharId, 'cheeni');
    assert.equal(seenOpponents.has(bout.opponentCharId), false);
    seenOpponents.add(bout.opponentCharId);
    assert.ok(['katra', 'ponta', 'enclave'].includes(bout.stageId));
  }
  assert.equal(run.bouts[run.bouts.length - 1].isFinalBoss, true);
});

test('Tournament mode handles 4-slot bracket progression, simulated CPU bouts, and championship', () => {
  const rng = makeDeterministicRng(99);
  const initial = createTournamentBracket('rahul', 'normal', ['rahul', 'sagar', 'jatin', 'tony'], rng);
  assert.equal(initial.bracketSize, 4);
  assert.equal(initial.rounds.length, 2);

  const sf1 = getNextPlayerTournamentMatch(initial);
  assert.ok(sf1);
  assert.equal(sf1.id, 'sf-1');
  assert.equal(sf1.slotA, 'rahul');

  // Player wins Semifinal A -> Semifinal B is simulated and flagged as isSimulated: true
  const afterSemi = recordTournamentPlayerResult(initial, sf1.id, 'rahul', 2, 0, rng);
  const sf2 = afterSemi.rounds[0][1];
  assert.ok(sf2.winner);
  assert.equal(sf2.isSimulated, true);
  assert.ok(sf2.scoreLabel?.includes('(SIM)'));

  const finalMatch = getNextPlayerTournamentMatch(afterSemi);
  assert.ok(finalMatch);
  assert.equal(finalMatch.id, 'final');
  assert.equal(finalMatch.slotA, 'rahul');
  assert.equal(finalMatch.slotB, sf2.winner);

  // Player wins Championship Final
  const crowned = recordTournamentPlayerResult(afterSemi, finalMatch.id, 'rahul', 2, 1, rng);
  assert.equal(crowned.champion, 'rahul');
  assert.equal(crowned.playerEliminated, false);
  assert.equal(getNextPlayerTournamentMatch(crowned), null);
});

test('Tournament mode handles 5-fighter 8-slot bracket cleanly with 3 BYEs and zero empty matches', () => {
  const rng = makeDeterministicRng(77);
  const bracket = createTournamentBracket(
    'cheeni',
    'normal',
    ['rahul', 'sagar', 'jatin', 'tony', 'cheeni'],
    rng,
  );
  assert.equal(bracket.bracketSize, 8);
  assert.equal(bracket.rounds.length, 3);
  assert.equal(bracket.rounds[0].length, 4);

  // Every QF must have at least slotA filled (no [null, null] dead matches!)
  for (const qf of bracket.rounds[0]) {
    assert.ok(qf.slotA, `${qf.id} must have a seeded fighter in slotA`);
  }
  const byeCount = bracket.rounds[0].filter((m) => m.isBye).length;
  assert.equal(byeCount, 3);

  // Player fights QF1 -> SF1 -> Final and wins the Championship
  const qf1 = getNextPlayerTournamentMatch(bracket);
  assert.ok(qf1 && qf1.id === 'qf-1');
  assert.equal(qf1.slotA, 'cheeni');
  assert.ok(qf1.slotB, 'Player QF1 has a real opponent');

  const afterQf = recordTournamentPlayerResult(bracket, qf1.id, 'cheeni', 2, 0, rng);
  const sf1 = getNextPlayerTournamentMatch(afterQf);
  assert.ok(sf1 && sf1.id === 'sf-1');
  assert.equal(sf1.slotA, 'cheeni');
  assert.ok(sf1.slotB, 'Semifinal A has a valid BYE winner opponent');

  const afterSf = recordTournamentPlayerResult(afterQf, sf1.id, 'cheeni', 2, 1, rng);
  const finalMatch = getNextPlayerTournamentMatch(afterSf);
  assert.ok(finalMatch && finalMatch.id === 'final');
  assert.equal(finalMatch.slotA, 'cheeni');
  assert.ok(finalMatch.slotB, 'Championship Final has a valid Semifinal B winner');

  const crowned = recordTournamentPlayerResult(afterSf, finalMatch.id, 'cheeni', 2, 0, rng);
  assert.equal(crowned.champion, 'cheeni');
  assert.equal(crowned.playerEliminated, false);
  assert.equal(getNextPlayerTournamentMatch(crowned), null);
});

test('Tournament mode automatically scales to 8-slot bracket with 1 BYE when 7 fighters exist', () => {
  const expanded = ['rahul', 'sagar', 'jatin', 'tony', 'cheeni', 'chameto', 'moli'] as unknown as Parameters<
    typeof createTournamentBracket
  >[2];
  const bracket = createTournamentBracket('rahul', 'normal', expanded, makeDeterministicRng(7));
  assert.equal(bracket.bracketSize, 8);
  assert.equal(bracket.rounds.length, 3);
  assert.equal(bracket.rounds[0].length, 4);
  const byeCount = bracket.rounds[0].filter((m) => m.isBye).length;
  assert.equal(byeCount, 1);
});

test('Audio asset catalogue defines all 14 replaceable slots', () => {
  const entries = Object.values(AUDIO_CATALOGUE);
  assert.equal(entries.length, 14);
  const ids = new Set(entries.map((a) => a.id));
  assert.equal(ids.size, 14);
});

test('Multiplayer protocol validators reject malformed room codes and input packets', () => {
  assert.equal(isValidRoomCode('B7K4M9'), true);
  assert.equal(isValidRoomCode('abc123'), false);
  assert.equal(isValidRoomCode('SHORT'), false);
  assert.equal(isValidRoomCode('DROP;TABLE'), false);

  assert.equal(sanitizeDisplayName('  Bumba <script>!  ', 'P1'), 'Bumba script');
  assert.equal(sanitizeDisplayName('   ', 'FALLBACK'), 'FALLBACK');

  const validPacket: CompactInputPacket = {
    type: 'net_input',
    seq: 1,
    ts: Date.now(),
    left: true,
    right: false,
    up: false,
    down: false,
    guard: false,
    lp: true,
    hp: false,
    kick: false,
    special: false,
    special2: false,
    ult: false,
    dashLeft: false,
    dashRight: false,
  };
  assert.equal(isValidInputPacket(validPacket), true);
  assert.equal(isValidInputPacket({ ...validPacket, seq: -5 }), false);
  assert.equal(isValidInputPacket({ type: 'other' }), false);
});

/**
 * Live Two-Client Integration Test for Local Wi-Fi Signalling Server:
 * Verifies real WebSocket room creation, invalid-code rejection, joining,
 * independent character selection, readiness sync, match launch, WebRTC signalling relay,
 * gameplay input/snapshot relay, and clean disconnect notification.
 */
test('Live two-client WebSocket signalling & relay integration', async () => {
  const server = http.createServer((_req, res) => {
    res.writeHead(200);
    res.end('ok');
  });
  const signalling = attachSignallingServer(server);

  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  const address = server.address();
  assert.ok(address && typeof address === 'object');
  const wsUrl = `ws://127.0.0.1:${address.port}/ws/signalling`;

  const connectClient = () =>
    new Promise<{
      ws: WebSocket;
      nextMessage: (predicate?: (m: SignallingServerMessage) => boolean) => Promise<SignallingServerMessage>;
    }>((resolve, reject) => {
      const ws = new WebSocket(wsUrl);
      const queue: SignallingServerMessage[] = [];
      const waiters: Array<{
        predicate?: (m: SignallingServerMessage) => boolean;
        resolve: (m: SignallingServerMessage) => void;
      }> = [];

      ws.on('message', (data) => {
        const msg = JSON.parse(data.toString()) as SignallingServerMessage;
        const waiterIdx = waiters.findIndex((w) => !w.predicate || w.predicate(msg));
        if (waiterIdx >= 0) {
          const [waiter] = waiters.splice(waiterIdx, 1);
          waiter.resolve(msg);
        } else {
          queue.push(msg);
        }
      });

      const nextMessage = (predicate?: (m: SignallingServerMessage) => boolean) => {
        const idx = queue.findIndex((m) => !predicate || predicate(m));
        if (idx >= 0) {
          const [found] = queue.splice(idx, 1);
          return Promise.resolve(found);
        }
        return new Promise<SignallingServerMessage>((res, rej) => {
          const timer = setTimeout(() => rej(new Error('Timed out waiting for WS message')), 3000);
          waiters.push({
            predicate,
            resolve: (m) => {
              clearTimeout(timer);
              res(m);
            },
          });
        });
      };

      ws.once('open', () => resolve({ ws, nextMessage }));
      ws.once('error', reject);
    });

  const c1 = await connectClient();
  const c2 = await connectClient();

  try {
    // 1. Host creates room
    c1.ws.send(
      JSON.stringify({
        type: 'create_room',
        displayName: 'HostPhone',
        characterId: 'rahul',
        stageId: 'katra',
      }),
    );
    const created = await c1.nextMessage((m) => m.type === 'room_created');
    assert.equal(created.type, 'room_created');
    const code = created.room.code;
    assert.equal(isValidRoomCode(code), true);
    assert.equal(signalling.getRoomCount(), 1);

    // 2. Guest attempts invalid room code first -> server rejects cleanly
    c2.ws.send(JSON.stringify({ type: 'join_room', code: 'BAD', displayName: 'GuestPhone' }));
    const errMsg = await c2.nextMessage((m) => m.type === 'error');
    assert.equal(errMsg.type, 'error');
    assert.equal(errMsg.code, 'INVALID_CODE');

    // 3. Guest joins valid room
    c2.ws.send(
      JSON.stringify({
        type: 'join_room',
        code,
        displayName: 'GuestPhone',
        characterId: 'tony',
      }),
    );
    const joined = await c2.nextMessage((m) => m.type === 'room_joined');
    assert.equal(joined.type, 'room_joined');
    assert.equal(joined.room.guest?.characterId, 'tony');

    const hostUpdate = await c1.nextMessage((m) => m.type === 'room_updated' && Boolean(m.room.guest));
    assert.equal(hostUpdate.type, 'room_updated');

    // 4. Guest changes character independently & both mark ready
    c2.ws.send(JSON.stringify({ type: 'select_char', characterId: 'sagar' }));
    await c1.nextMessage((m) => m.type === 'room_updated' && m.room.guest?.characterId === 'sagar');

    c1.ws.send(JSON.stringify({ type: 'set_ready', ready: true }));
    c2.ws.send(JSON.stringify({ type: 'set_ready', ready: true }));
    await c1.nextMessage(
      (m) => m.type === 'room_updated' && Boolean(m.room.host.ready && m.room.guest?.ready),
    );

    // 5. Host launches match
    c1.ws.send(JSON.stringify({ type: 'start_match' }));
    const [m1, m2] = await Promise.all([
      c1.nextMessage((m) => m.type === 'match_started'),
      c2.nextMessage((m) => m.type === 'match_started'),
    ]);
    assert.equal(m1.type, 'match_started');
    assert.equal(m2.type, 'match_started');
    assert.equal(m1.matchSeed, m2.matchSeed);

    // 6. WebRTC Offer / Answer signalling relay
    c1.ws.send(JSON.stringify({ type: 'webrtc_offer', sdp: 'v=0\r\nmock-offer' }));
    const offerRec = await c2.nextMessage((m) => m.type === 'webrtc_offer');
    assert.equal(offerRec.type, 'webrtc_offer');
    assert.equal(offerRec.sdp, 'v=0\r\nmock-offer');

    c2.ws.send(JSON.stringify({ type: 'webrtc_answer', sdp: 'v=0\r\nmock-answer' }));
    const ansRec = await c1.nextMessage((m) => m.type === 'webrtc_answer');
    assert.equal(ansRec.type, 'webrtc_answer');
    assert.equal(ansRec.sdp, 'v=0\r\nmock-answer');

    // 7. Gameplay input packet & authoritative snapshot relay
    const inputPkt: CompactInputPacket = {
      type: 'net_input',
      seq: 12,
      ts: Date.now(),
      left: true,
      right: false,
      up: false,
      down: false,
      guard: false,
      lp: true,
      hp: false,
      kick: false,
      special: false,
      special2: false,
      ult: false,
      dashLeft: false,
      dashRight: false,
    };
    c2.ws.send(JSON.stringify({ type: 'relay_input', packet: inputPkt }));
    const relayedIn = await c1.nextMessage((m) => m.type === 'relay_input');
    assert.equal(relayedIn.type, 'relay_input');
    assert.equal(relayedIn.packet.seq, 12);
    assert.equal(relayedIn.packet.lp, true);

    const snap: CompactMatchSnapshot = {
      type: 'net_snapshot',
      seq: 4,
      ts: Date.now(),
      roundNumber: 1,
      p1Rounds: 0,
      p2Rounds: 0,
      timerSeconds: 95,
      phase: 'fighting',
      announcement: null,
      subAnnouncement: null,
      cameraX: 500,
      p1: {
        x: 900,
        y: 940,
        vx: 0,
        vy: 0,
        facing: 1,
        state: 'idle',
        animKey: 'idle',
        animFrame: 2,
        health: 950,
        maxHealth: 1000,
        trailHealth: 1000,
        guard: 100,
        meter: 45,
        comboCount: 0,
        comboDamage: 0,
        hitFlashTimer: 0,
        special1Cooldown: 0,
        special2Cooldown: 0,
      },
      p2: {
        x: 1320,
        y: 940,
        vx: 0,
        vy: 0,
        facing: -1,
        state: 'attack',
        animKey: 'light_punch',
        animFrame: 1,
        health: 1000,
        maxHealth: 1000,
        trailHealth: 1000,
        guard: 100,
        meter: 40,
        comboCount: 1,
        comboDamage: 50,
        hitFlashTimer: 0,
        special1Cooldown: 0,
        special2Cooldown: 0,
      },
      winnerSlot: null,
    };
    c1.ws.send(JSON.stringify({ type: 'relay_snapshot', packet: snap }));
    const relayedSnap = await c2.nextMessage((m) => m.type === 'relay_snapshot');
    assert.equal(relayedSnap.type, 'relay_snapshot');
    assert.equal(relayedSnap.packet.p1.health, 950);
    assert.equal(relayedSnap.packet.p2.state, 'attack');

    // 8. Guest disconnects -> Host receives peer_disconnected cleanly
    c2.ws.close();
    const disc = await c1.nextMessage((m) => m.type === 'peer_disconnected');
    assert.equal(disc.type, 'peer_disconnected');
    assert.equal(disc.slot, 2);
  } finally {
    c1.ws.close();
    c2.ws.close();
    await signalling.close();
    await new Promise<void>((resolve) => server.close(() => resolve()));
  }
});
