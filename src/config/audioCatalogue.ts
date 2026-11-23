/**
 * 39 BHARAT NAGAR — Official Audio Catalogue & Replaceable Production Track Registry
 *
 * Maps all 14 arcade gameplay audio events to either future production audio files
 * (drop-in OGG/MP3 slots under /public/assets/audio/) or the active Web Audio synthesizer.
 */
export type AudioEventId =
  | 'menu_music'
  | 'character_select'
  | 'stage_select'
  | 'announcer_ready'
  | 'announcer_fight'
  | 'sfx_punch'
  | 'sfx_kick'
  | 'sfx_block'
  | 'sfx_heavy_impact'
  | 'sfx_special_attack'
  | 'sfx_ultimate_attack'
  | 'announcer_round_win'
  | 'announcer_ko'
  | 'victory_music';

export interface AudioCatalogueEntry {
  id: AudioEventId;
  category: 'music' | 'sfx' | 'announcer';
  label: string;
  loop: boolean;
  /** Optional production asset path when supplied under /public/assets/audio/ */
  productionAssetPath: string | null;
  /** Current V1 runtime implementation status */
  status: 'synthesized_fallback' | 'production_ready';
  notes: string;
}

export const AUDIO_CATALOGUE: Record<AudioEventId, AudioCatalogueEntry> = {
  menu_music: {
    id: 'menu_music',
    category: 'music',
    label: '39 Bharat Nagar Main Theme',
    loop: true,
    productionAssetPath: '/assets/audio/bgm_menu_39bn.ogg',
    status: 'synthesized_fallback',
    notes: 'Original 16-bit Web Audio synth groove active until studio BGM track is supplied.',
  },
  character_select: {
    id: 'character_select',
    category: 'sfx',
    label: 'Character Select Confirm',
    loop: false,
    productionAssetPath: '/assets/audio/sfx_char_select.ogg',
    status: 'synthesized_fallback',
    notes: 'Crisp retro arcade confirmation chime via SoundEngine.',
  },
  stage_select: {
    id: 'stage_select',
    category: 'sfx',
    label: 'Stage Select Lock',
    loop: false,
    productionAssetPath: '/assets/audio/sfx_stage_select.ogg',
    status: 'synthesized_fallback',
    notes: 'Arcade select lock cue via SoundEngine.',
  },
  announcer_ready: {
    id: 'announcer_ready',
    category: 'announcer',
    label: 'ROUND / READY Cue',
    loop: false,
    productionAssetPath: '/assets/audio/vo_ready.ogg',
    status: 'synthesized_fallback',
    notes: 'Percussive arcade round-start chime; voice line slot ready for drop-in.',
  },
  announcer_fight: {
    id: 'announcer_fight',
    category: 'announcer',
    label: 'FIGHT! Bell & Fanfare',
    loop: false,
    productionAssetPath: '/assets/audio/vo_fight.ogg',
    status: 'synthesized_fallback',
    notes: 'Double arcade brass bell via SoundEngine.',
  },
  sfx_punch: {
    id: 'sfx_punch',
    category: 'sfx',
    label: 'Light / Medium Punch Impact',
    loop: false,
    productionAssetPath: '/assets/audio/sfx_punch.ogg',
    status: 'synthesized_fallback',
    notes: 'Snappy transient impact synthesized per character profile.',
  },
  sfx_kick: {
    id: 'sfx_kick',
    category: 'sfx',
    label: 'Kick & Sweep Impact',
    loop: false,
    productionAssetPath: '/assets/audio/sfx_kick.ogg',
    status: 'synthesized_fallback',
    notes: 'Low-mid impact crack via SoundEngine.',
  },
  sfx_block: {
    id: 'sfx_block',
    category: 'sfx',
    label: 'Guard Block Clack',
    loop: false,
    productionAssetPath: '/assets/audio/sfx_block.ogg',
    status: 'synthesized_fallback',
    notes: 'Dampened metallic guard thud via SoundEngine.',
  },
  sfx_heavy_impact: {
    id: 'sfx_heavy_impact',
    category: 'sfx',
    label: 'Heavy Hit / Counter Smash',
    loop: false,
    productionAssetPath: '/assets/audio/sfx_heavy_impact.ogg',
    status: 'synthesized_fallback',
    notes: 'Layered low sub-thump + crunch transient via SoundEngine.',
  },
  sfx_special_attack: {
    id: 'sfx_special_attack',
    category: 'sfx',
    label: 'Signature Special Power',
    loop: false,
    productionAssetPath: '/assets/audio/sfx_special.ogg',
    status: 'synthesized_fallback',
    notes: 'Character-distinct frequency sweep (Iron, Sonic, Cash, Plasma).',
  },
  sfx_ultimate_attack: {
    id: 'sfx_ultimate_attack',
    category: 'sfx',
    label: 'Ultimate Activation & Burst',
    loop: false,
    productionAssetPath: '/assets/audio/sfx_ultimate.ogg',
    status: 'synthesized_fallback',
    notes: 'Dramatic rising chord + impact boom via SoundEngine.',
  },
  announcer_round_win: {
    id: 'announcer_round_win',
    category: 'announcer',
    label: 'Round Win Fanfare',
    loop: false,
    productionAssetPath: '/assets/audio/sfx_round_win.ogg',
    status: 'synthesized_fallback',
    notes: 'Short victory sting via SoundEngine.',
  },
  announcer_ko: {
    id: 'announcer_ko',
    category: 'announcer',
    label: 'K.O. Slow-Mo Crash',
    loop: false,
    productionAssetPath: '/assets/audio/vo_ko.ogg',
    status: 'synthesized_fallback',
    notes: 'Deep dramatic KO drop via SoundEngine; voice line slot ready.',
  },
  victory_music: {
    id: 'victory_music',
    category: 'music',
    label: 'Match Victory Theme',
    loop: false,
    productionAssetPath: '/assets/audio/bgm_victory_39bn.ogg',
    status: 'synthesized_fallback',
    notes: 'Celebratory 16-bit synth arpeggio via SoundEngine.',
  },
};
