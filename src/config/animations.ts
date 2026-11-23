export type CharacterId = 'rahul' | 'sagar' | 'jatin' | 'tony';

export type AnimationKey =
  | 'idle'
  | 'walk_forward'
  | 'walk_backward'
  | 'dash_forward'
  | 'dash_backward'
  | 'crouch_enter'
  | 'crouch_idle'
  | 'crouch_exit'
  | 'jump_takeoff'
  | 'airborne'
  | 'landing'
  | 'light_punch'
  | 'heavy_punch'
  | 'light_kick'
  | 'heavy_kick'
  | 'crouch_punch'
  | 'crouch_kick'
  | 'sweep'
  | 'anti_air'
  | 'jump_punch'
  | 'jump_kick'
  | 'guard_high'
  | 'guard_low'
  | 'block_impact_high'
  | 'block_impact_low'
  | 'hit_light'
  | 'hit_heavy'
  | 'hit_crouch'
  | 'hit_air'
  | 'knockback'
  | 'knockdown'
  | 'grounded'
  | 'get_up'
  | 'guard_break'
  | 'special_1_charge'
  | 'special_1'
  | 'special_2'
  | 'special_shield'
  | 'special_recovery'
  | 'ultimate_activation'
  | 'ultimate'
  | 'ultimate_finisher'
  | 'victory'
  | 'defeat'
  | 'ko'
  | 'taunt'
  | 'intro';

export interface SpriteSheetDef {
  url: string;
  frames: number;
  fps: number;
  loop: boolean;
  holdFinal?: boolean;
  frameWidth: number;
  frameHeight: number;
  pivotX: number;
  pivotY: number;
  layout?: 'horizontal' | 'vertical';
  /** True only when a fallback sheet is used for a documented missing asset (e.g. Sagar Batch 3) */
  isFallback?: boolean;
}

export interface VfxSheetDef extends SpriteSheetDef {
  id: string;
  scale?: number;
}

const std = (
  url: string,
  frames: number,
  fps: number,
  loop = false,
  holdFinal = false,
  isFallback = false,
): SpriteSheetDef => ({
  url,
  frames,
  fps,
  loop,
  holdFinal,
  frameWidth: 288,
  frameHeight: 288,
  pivotX: 144,
  pivotY: 272,
  layout: 'horizontal',
  isFallback,
});

export const CHARACTER_ANIMATIONS: Record<CharacterId, Record<AnimationKey, SpriteSheetDef>> = {
  rahul: {
    idle: std('/assets/characters/rahul/rahul_01_idle_8f.png', 8, 10, true),
    walk_forward: std('/assets/characters/rahul/rahul_02_walk_forward_6f.png', 6, 10, true),
    walk_backward: std('/assets/characters/rahul/rahul_03_walk_backward_6f.png', 6, 9, true),
    dash_forward: std('/assets/characters/rahul/rahul_04_dash_forward_6f.png', 6, 16),
    dash_backward: std('/assets/characters/rahul/rahul_05_dash_backward_5f.png', 5, 15),
    crouch_enter: std('/assets/characters/rahul/rahul_06_crouch_enter_2f.png', 2, 16),
    crouch_idle: std('/assets/characters/rahul/rahul_07_crouch_idle_4f.png', 4, 8, true),
    crouch_exit: std('/assets/characters/rahul/rahul_08_crouch_exit_2f.png', 2, 16),
    jump_takeoff: std('/assets/characters/rahul/rahul_09_jump_takeoff_2f.png', 2, 16),
    airborne: std('/assets/characters/rahul/rahul_10_jump_airborne_4f.png', 4, 10, false, true),
    landing: std('/assets/characters/rahul/rahul_11_landing_2f.png', 2, 16),
    light_punch: std('/assets/characters/rahul/rahul_12_light_punch_4f.png', 4, 18),
    heavy_punch: std('/assets/characters/rahul/rahul_13_heavy_punch_6f.png', 6, 14),
    light_kick: std('/assets/characters/rahul/rahul_14_light_kick_5f.png', 5, 16),
    heavy_kick: std('/assets/characters/rahul/rahul_15_heavy_kick_7f.png', 7, 14),
    crouch_punch: std('/assets/characters/rahul/rahul_16_crouch_punch_4f.png', 4, 18),
    crouch_kick: std('/assets/characters/rahul/rahul_17_crouch_kick_5f.png', 5, 15),
    sweep: std('/assets/characters/rahul/rahul_18_sweep_attack_7f.png', 7, 14),
    anti_air: std('/assets/characters/rahul/rahul_19_anti_air_uppercut_6f.png', 6, 15),
    jump_punch: std('/assets/characters/rahul/rahul_20_jumping_punch_5f.png', 5, 15),
    jump_kick: std('/assets/characters/rahul/rahul_21_jumping_kick_5f.png', 5, 14),
    guard_high: std('/assets/characters/rahul/rahul_22_standing_guard_4f.png', 4, 9, true),
    guard_low: std('/assets/characters/rahul/rahul_23_crouching_guard_4f.png', 4, 9, true),
    block_impact_high: std('/assets/characters/rahul/rahul_22_standing_guard_4f.png', 4, 16),
    block_impact_low: std('/assets/characters/rahul/rahul_23_crouching_guard_4f.png', 4, 16),
    hit_light: std('/assets/characters/rahul/rahul_24_light_hit_reaction_3f.png', 3, 14),
    hit_heavy: std('/assets/characters/rahul/rahul_25_heavy_hit_reaction_5f.png', 5, 12),
    hit_crouch: std('/assets/characters/rahul/rahul_24_light_hit_reaction_3f.png', 3, 14),
    hit_air: std('/assets/characters/rahul/rahul_26_launch_knockback_5f.png', 5, 13),
    knockback: std('/assets/characters/rahul/rahul_26_launch_knockback_5f.png', 5, 13),
    knockdown: std('/assets/characters/rahul/rahul_27_knockdown_fall_6f.png', 6, 12, false, true),
    grounded: std('/assets/characters/rahul/rahul_27_knockdown_fall_6f.png', 6, 12, false, true),
    get_up: std('/assets/characters/rahul/rahul_28_get_up_5f.png', 5, 12),
    guard_break: std('/assets/characters/rahul/rahul_29_guard_break_stunned_5f.png', 5, 11, false, true),
    special_1_charge: std('/assets/characters/rahul/rahul_30_iron_fist_charge_6f.png', 6, 16),
    special_1: std('/assets/characters/rahul/rahul_31_iron_fist_release_5f.png', 5, 14),
    special_2: std('/assets/characters/rahul/rahul_33_overload_rush_8f.png', 8, 16),
    special_shield: std('/assets/characters/rahul/rahul_22_standing_guard_4f.png', 4, 10, true),
    special_recovery: std('/assets/characters/rahul/rahul_37_special_move_recovery_5f.png', 5, 14),
    ultimate_activation: std('/assets/characters/rahul/rahul_34_limit_breaker_activation_8f.png', 8, 14),
    ultimate: std('/assets/characters/rahul/rahul_35_limit_breaker_main_attack_8f.png', 8, 14),
    ultimate_finisher: std('/assets/characters/rahul/rahul_36_limit_breaker_finisher_4f.png', 4, 12),
    victory: std('/assets/characters/rahul/rahul_38_victory_6f.png', 6, 10, false, true),
    defeat: std('/assets/characters/rahul/rahul_39_defeat_5f.png', 5, 10, false, true),
    ko: std('/assets/characters/rahul/rahul_40_ko_collapse_6f.png', 6, 12, false, true),
    taunt: std('/assets/characters/rahul/rahul_41_taunt_6f.png', 6, 11),
    intro: std('/assets/characters/rahul/rahul_41_taunt_6f.png', 6, 11),
  },

  sagar: {
    idle: std('/assets/characters/sagar/sagar_01_idle_8f.png', 8, 10, true),
    walk_forward: std('/assets/characters/sagar/sagar_02_walk_forward_6f.png', 6, 11, true),
    walk_backward: std('/assets/characters/sagar/sagar_03_walk_backward_6f.png', 6, 10, true),
    dash_forward: std('/assets/characters/sagar/sagar_04_dash_forward_6f.png', 6, 16),
    dash_backward: std('/assets/characters/sagar/sagar_05_dash_backward_5f.png', 5, 15),
    crouch_enter: std('/assets/characters/sagar/sagar_06_crouch_enter_2f.png', 2, 16),
    crouch_idle: std('/assets/characters/sagar/sagar_07_crouch_idle_4f.png', 4, 8, true),
    crouch_exit: std('/assets/characters/sagar/sagar_08_crouch_exit_2f.png', 2, 16),
    jump_takeoff: std('/assets/characters/sagar/sagar_09_jump_takeoff_2f.png', 2, 16),
    airborne: std('/assets/characters/sagar/sagar_10_jump_airborne_4f.png', 4, 10, true),
    landing: std('/assets/characters/sagar/sagar_11_landing_2f.png', 2, 16),
    light_punch: std('/assets/characters/sagar/sagar_12_light_punch_4f.png', 4, 18),
    heavy_punch: std('/assets/characters/sagar/sagar_13_heavy_punch_6f.png', 6, 14),
    light_kick: std('/assets/characters/sagar/sagar_14_light_kick_5f.png', 5, 16),
    heavy_kick: std('/assets/characters/sagar/sagar_15_heavy_kick_7f.png', 7, 14),
    crouch_punch: std('/assets/characters/sagar/sagar_16_crouch_punch_4f.png', 4, 18),
    crouch_kick: std('/assets/characters/sagar/sagar_17_crouch_kick_5f.png', 5, 15),
    sweep: std('/assets/characters/sagar/sagar_18_sweep_attack_7f.png', 7, 14),
    anti_air: std('/assets/characters/sagar/sagar_19_anti_air_uppercut_6f.png', 6, 15),
    jump_punch: std('/assets/characters/sagar/sagar_20_jumping_punch_5f.png', 5, 15),
    jump_kick: std('/assets/characters/sagar/sagar_21_jumping_kick_5f.png', 5, 14),
    // Genuine Batch 03 Defence & Damage Reactions (integrated in V2 — 8 sheets, 37 frames)
    guard_high: std('/assets/characters/sagar/sagar_22_standing_guard_4f.png', 4, 9, true),
    guard_low: std('/assets/characters/sagar/sagar_23_crouching_guard_4f.png', 4, 9, true),
    block_impact_high: std('/assets/characters/sagar/sagar_22_standing_guard_4f.png', 4, 16),
    block_impact_low: std('/assets/characters/sagar/sagar_23_crouching_guard_4f.png', 4, 16),
    hit_light: std('/assets/characters/sagar/sagar_24_light_hit_reaction_3f.png', 3, 14),
    hit_heavy: std('/assets/characters/sagar/sagar_25_heavy_hit_reaction_5f.png', 5, 12),
    hit_crouch: std('/assets/characters/sagar/sagar_24_light_hit_reaction_3f.png', 3, 14),
    hit_air: std('/assets/characters/sagar/sagar_26_launch_knockback_5f.png', 5, 13),
    knockback: std('/assets/characters/sagar/sagar_26_launch_knockback_5f.png', 5, 13),
    knockdown: std('/assets/characters/sagar/sagar_27_knockdown_fall_6f.png', 6, 12, false, true),
    grounded: std('/assets/characters/sagar/sagar_27_knockdown_fall_6f.png', 6, 12, false, true),
    get_up: std('/assets/characters/sagar/sagar_28_get_up_5f.png', 5, 11),
    guard_break: std('/assets/characters/sagar/sagar_29_guard_break_stunned_5f.png', 5, 11, false, true),
    special_1_charge: std('/assets/characters/sagar/sagar_30_sonic_pulse_charge_6f.png', 6, 16),
    special_1: std('/assets/characters/sagar/sagar_31_sonic_pulse_release_5f.png', 5, 15),
    special_2: std('/assets/characters/sagar/sagar_33_rhythm_break_8f.png', 8, 16),
    special_shield: std('/assets/characters/sagar/sagar_22_standing_guard_4f.png', 4, 9, true),
    special_recovery: std('/assets/characters/sagar/sagar_37_special_move_recovery_5f.png', 5, 14),
    ultimate_activation: std('/assets/characters/sagar/sagar_34_final_chorus_activation_8f.png', 8, 14),
    ultimate: std('/assets/characters/sagar/sagar_35_final_chorus_main_attack_8f.png', 8, 14),
    ultimate_finisher: std('/assets/characters/sagar/sagar_36_final_chorus_finisher_4f.png', 4, 12),
    victory: std('/assets/characters/sagar/sagar_38_victory_6f.png', 6, 10, false, true),
    defeat: std('/assets/characters/sagar/sagar_39_defeat_5f.png', 5, 10, false, true),
    ko: std('/assets/characters/sagar/sagar_40_ko_collapse_6f.png', 6, 13, false, true),
    taunt: std('/assets/characters/sagar/sagar_41_taunt_6f.png', 6, 11),
    intro: std('/assets/characters/sagar/sagar_41_taunt_6f.png', 6, 11),
  },

  jatin: {
    idle: std('/assets/characters/jatin/jatin_01_idle_8f.png', 8, 10, true),
    walk_forward: std('/assets/characters/jatin/jatin_02_walk_forward_6f.png', 6, 10, true),
    walk_backward: std('/assets/characters/jatin/jatin_03_walk_backward_6f.png', 6, 9, true),
    dash_forward: std('/assets/characters/jatin/jatin_04_dash_forward_6f.png', 6, 16),
    dash_backward: std('/assets/characters/jatin/jatin_05_dash_backward_5f.png', 5, 15),
    crouch_enter: std('/assets/characters/jatin/jatin_06_crouch_enter_2f.png', 2, 16),
    crouch_idle: std('/assets/characters/jatin/jatin_07_crouch_idle_4f.png', 4, 8, true),
    crouch_exit: std('/assets/characters/jatin/jatin_08_crouch_exit_2f.png', 2, 16),
    jump_takeoff: std('/assets/characters/jatin/jatin_09_jump_takeoff_2f.png', 2, 16),
    airborne: std('/assets/characters/jatin/jatin_10_jump_airborne_4f.png', 4, 10, true),
    landing: std('/assets/characters/jatin/jatin_11_landing_2f.png', 2, 16),
    light_punch: std('/assets/characters/jatin/jatin_12_light_punch_4f.png', 4, 18),
    heavy_punch: std('/assets/characters/jatin/jatin_13_heavy_punch_6f.png', 6, 14),
    light_kick: std('/assets/characters/jatin/jatin_14_light_kick_5f.png', 5, 16),
    heavy_kick: std('/assets/characters/jatin/jatin_15_heavy_kick_7f.png', 7, 14),
    crouch_punch: std('/assets/characters/jatin/jatin_16_crouch_punch_4f.png', 4, 18),
    crouch_kick: std('/assets/characters/jatin/jatin_17_crouch_kick_5f.png', 5, 15),
    sweep: std('/assets/characters/jatin/jatin_18_sweep_attack_7f.png', 7, 14),
    anti_air: std('/assets/characters/jatin/jatin_19_anti_air_uppercut_6f.png', 6, 15),
    jump_punch: std('/assets/characters/jatin/jatin_20_jumping_punch_5f.png', 5, 15),
    jump_kick: std('/assets/characters/jatin/jatin_21_jumping_kick_5f.png', 5, 14),
    guard_high: std('/assets/characters/jatin/jatin_22_standing_guard_4f.png', 4, 9, true),
    guard_low: std('/assets/characters/jatin/jatin_23_crouching_guard_4f.png', 4, 9, true),
    block_impact_high: std('/assets/characters/jatin/jatin_22_standing_guard_4f.png', 4, 16),
    block_impact_low: std('/assets/characters/jatin/jatin_23_crouching_guard_4f.png', 4, 16),
    hit_light: std('/assets/characters/jatin/jatin_24_light_hit_reaction_3f.png', 3, 14),
    hit_heavy: std('/assets/characters/jatin/jatin_25_heavy_hit_reaction_5f.png', 5, 12),
    hit_crouch: std('/assets/characters/jatin/jatin_24_light_hit_reaction_3f.png', 3, 14),
    hit_air: std('/assets/characters/jatin/jatin_26_launch_knockback_5f.png', 5, 13),
    knockback: std('/assets/characters/jatin/jatin_26_launch_knockback_5f.png', 5, 13),
    knockdown: std('/assets/characters/jatin/jatin_27_knockdown_fall_6f.png', 6, 12, false, true),
    grounded: std('/assets/characters/jatin/jatin_27_knockdown_fall_6f.png', 6, 12, false, true),
    get_up: std('/assets/characters/jatin/jatin_28_get_up_5f.png', 5, 12),
    guard_break: std('/assets/characters/jatin/jatin_29_guard_break_stunned_5f.png', 5, 11, false, true),
    special_1_charge: std('/assets/characters/jatin/jatin_30_cash_flick_charge_5f.png', 5, 15),
    special_1: std('/assets/characters/jatin/jatin_31_cash_flick_release_5f.png', 5, 15),
    special_2: std('/assets/characters/jatin/jatin_33_banknote_barrage_8f.png', 8, 15),
    special_shield: std('/assets/characters/jatin/jatin_22_standing_guard_4f.png', 4, 10, true),
    special_recovery: std('/assets/characters/jatin/jatin_39_special_move_recovery_5f.png', 5, 13),
    ultimate_activation: std('/assets/characters/jatin/jatin_35_cash_storm_activation_8f.png', 8, 13),
    ultimate: std('/assets/characters/jatin/jatin_36_cash_storm_main_attack_8f.png', 8, 14),
    ultimate_finisher: std('/assets/characters/jatin/jatin_38_cash_storm_finisher_4f.png', 4, 12),
    victory: std('/assets/characters/jatin/jatin_40_victory_6f.png', 6, 10, false, true),
    defeat: std('/assets/characters/jatin/jatin_41_defeat_5f.png', 5, 9, false, true),
    ko: std('/assets/characters/jatin/jatin_42_ko_collapse_6f.png', 6, 11, false, true),
    taunt: std('/assets/characters/jatin/jatin_43_taunt_6f.png', 6, 10),
    intro: std('/assets/characters/jatin/jatin_43_taunt_6f.png', 6, 10),
  },

  tony: {
    idle: std('/assets/characters/tony/Tony_Idle.png', 8, 10, true),
    walk_forward: std('/assets/characters/tony/Tony_Walk_Forward.png', 6, 11, true),
    walk_backward: std('/assets/characters/tony/Tony_Walk_Backward.png', 6, 10, true),
    dash_forward: std('/assets/characters/tony/Tony_Dash_Forward.png', 6, 16),
    dash_backward: std('/assets/characters/tony/Tony_Dash_Backward.png', 5, 15),
    crouch_enter: std('/assets/characters/tony/Tony_Crouch_Transition.png', 2, 16),
    crouch_idle: std('/assets/characters/tony/Tony_Crouch_Idle.png', 4, 8, true),
    crouch_exit: std('/assets/characters/tony/Tony_Return_Standing.png', 2, 16),
    jump_takeoff: std('/assets/characters/tony/Tony_Jump_Takeoff.png', 2, 16),
    airborne: std('/assets/characters/tony/Tony_Airborne.png', 4, 10, true),
    landing: std('/assets/characters/tony/Tony_Landing.png', 2, 16),
    light_punch: std('/assets/characters/tony/Tony_Jab_Punch.png', 5, 18),
    heavy_punch: std('/assets/characters/tony/Tony_Heavy_Straight_Punch.png', 6, 14),
    light_kick: std('/assets/characters/tony/Tony_Front_Kick.png', 6, 16),
    heavy_kick: std('/assets/characters/tony/Tony_Roundhouse_Kick.png', 7, 14),
    crouch_punch: std('/assets/characters/tony/Tony_Crouching_Low_Punch.png', 5, 18),
    crouch_kick: std('/assets/characters/tony/Tony_Low_Kick.png', 5, 15),
    sweep: std('/assets/characters/tony/Tony_Low_Kick.png', 5, 13),
    anti_air: std('/assets/characters/tony/Tony_Uppercut.png', 6, 15),
    jump_punch: std('/assets/characters/tony/Tony_Hook_Punch.png', 6, 16),
    jump_kick: std('/assets/characters/tony/Tony_Jumping_Front_Kick.png', 6, 15),
    guard_high: std('/assets/characters/tony/Tony_High_Block.png', 4, 9, true),
    guard_low: std('/assets/characters/tony/Tony_Low_Block.png', 4, 9, true),
    block_impact_high: std('/assets/characters/tony/Tony_High_Block_Impact.png', 3, 16),
    block_impact_low: std('/assets/characters/tony/Tony_Low_Block_Impact.png', 3, 16),
    hit_light: std('/assets/characters/tony/Tony_Standing_Light_Hit.png', 4, 15),
    hit_heavy: std('/assets/characters/tony/Tony_Standing_Heavy_Hit.png', 5, 13),
    hit_crouch: std('/assets/characters/tony/Tony_Crouching_Hit.png', 4, 15),
    hit_air: std('/assets/characters/tony/Tony_Air_Hit_Reaction.png', 5, 13),
    knockback: std('/assets/characters/tony/Tony_Knockback.png', 5, 13),
    knockdown: std('/assets/characters/tony/Tony_Knockdown.png', 6, 12, false, true),
    grounded: std('/assets/characters/tony/Tony_Grounded_Idle.png', 3, 8, true),
    get_up: std('/assets/characters/tony/Tony_Get_Up.png', 5, 12),
    guard_break: std('/assets/characters/tony/Tony_Exhausted_Idle.png', 6, 9, true),
    special_1_charge: std('/assets/characters/tony/Tony_Energy_Pulse_Charging.png', 6, 16),
    special_1: std('/assets/characters/tony/Tony_Energy_Pulse_Release.png', 5, 15),
    special_2: std('/assets/characters/tony/Tony_Drone_Assisted_Strike.png', 6, 14),
    special_shield: std('/assets/characters/tony/Tony_Holographic_Shield.png', 6, 12),
    special_recovery: std('/assets/characters/tony/Tony_Finisher_Recovery.png', 6, 14),
    ultimate_activation: std('/assets/characters/tony/Tony_Ultimate_System_Overload.png', 8, 14),
    ultimate: std('/assets/characters/tony/Tony_Ultimate_Mega_Blast.png', 8, 13),
    ultimate_finisher: std('/assets/characters/tony/Tony_Finisher_Recovery.png', 6, 12),
    victory: std('/assets/characters/tony/Tony_Victory_Pose_01.png', 8, 10, false, true),
    defeat: std('/assets/characters/tony/Tony_Defeat_Stagger.png', 5, 10, false, true),
    ko: std('/assets/characters/tony/Tony_KO_Collapse.png', 6, 12, false, true),
    taunt: std('/assets/characters/tony/Tony_Tech_Interface_Taunt.png', 6, 10),
    intro: std('/assets/characters/tony/Tony_Intro_Entrance.png', 8, 11),
  },
};

export const VFX_SHEETS: Record<string, VfxSheetDef> = {
  // Rahul VFX
  rahul_iron_fist_impact: {
    id: 'rahul_iron_fist_impact',
    url: '/assets/effects/rahul_32_iron_fist_impact_vfx_8f.png',
    frames: 8,
    fps: 18,
    loop: false,
    frameWidth: 288,
    frameHeight: 288,
    pivotX: 144,
    pivotY: 144,
    scale: 1.65,
  },
  rahul_limit_breaker_shockwave: {
    id: 'rahul_limit_breaker_shockwave',
    url: '/assets/effects/rahul_35b_limit_breaker_shockwave_vfx_8f.png',
    frames: 8,
    fps: 15,
    loop: false,
    frameWidth: 288,
    frameHeight: 288,
    pivotX: 144,
    pivotY: 272,
    scale: 2.1,
  },
  // Sagar VFX
  sagar_sonic_pulse_projectile: {
    id: 'sagar_sonic_pulse_projectile',
    url: '/assets/effects/sagar_32_sonic_pulse_projectile_vfx_8f.png',
    frames: 8,
    fps: 16,
    loop: true,
    frameWidth: 288,
    frameHeight: 288,
    pivotX: 144,
    pivotY: 144,
    scale: 1.4,
  },
  sagar_final_chorus_wave: {
    id: 'sagar_final_chorus_wave',
    url: '/assets/effects/sagar_35b_final_chorus_wave_vfx_8f.png',
    frames: 8,
    fps: 14,
    loop: false,
    frameWidth: 288,
    frameHeight: 288,
    pivotX: 144,
    pivotY: 144,
    scale: 2.2,
  },
  // Jatin VFX
  jatin_cash_flick_projectile: {
    id: 'jatin_cash_flick_projectile',
    url: '/assets/effects/jatin_32_cash_flick_projectile_vfx_8f.png',
    frames: 8,
    fps: 16,
    loop: true,
    frameWidth: 288,
    frameHeight: 288,
    pivotX: 144,
    pivotY: 144,
    scale: 1.35,
  },
  jatin_banknote_barrage: {
    id: 'jatin_banknote_barrage',
    url: '/assets/effects/jatin_34_banknote_barrage_vfx_8f.png',
    frames: 8,
    fps: 16,
    loop: false,
    frameWidth: 288,
    frameHeight: 288,
    pivotX: 144,
    pivotY: 144,
    scale: 1.85,
  },
  jatin_cash_storm: {
    id: 'jatin_cash_storm',
    url: '/assets/effects/jatin_37_cash_storm_vfx_8f.png',
    frames: 8,
    fps: 15,
    loop: false,
    frameWidth: 288,
    frameHeight: 288,
    pivotX: 144,
    pivotY: 144,
    scale: 2.25,
  },
  // Tony VFX
  tony_energy_pulse_projectile: {
    id: 'tony_energy_pulse_projectile',
    url: '/assets/effects/tony_FX_Energy_Pulse_Projectile.png',
    frames: 4,
    fps: 14,
    loop: true,
    frameWidth: 128,
    frameHeight: 128,
    pivotX: 64,
    pivotY: 64,
    scale: 1.85,
  },
  tony_combat_drone: {
    id: 'tony_combat_drone',
    url: '/assets/effects/tony_FX_Combat_Drone.png',
    frames: 4,
    fps: 12,
    loop: true,
    frameWidth: 96,
    frameHeight: 96,
    pivotX: 48,
    pivotY: 48,
    scale: 1.8,
  },
  tony_drone_strike_beam: {
    id: 'tony_drone_strike_beam',
    url: '/assets/effects/tony_FX_Drone_Strike_Beam.png',
    frames: 4,
    fps: 15,
    loop: false,
    frameWidth: 160,
    frameHeight: 96,
    pivotX: 24,
    pivotY: 48,
    scale: 2.1,
  },
  tony_ground_shockwave: {
    id: 'tony_ground_shockwave',
    url: '/assets/effects/tony_FX_Ground_Shockwave.png',
    frames: 5,
    fps: 14,
    loop: false,
    frameWidth: 192,
    frameHeight: 128,
    pivotX: 32,
    pivotY: 112,
    scale: 2.0,
  },
  tony_ultimate_mega_beam: {
    id: 'tony_ultimate_mega_beam',
    url: '/assets/effects/tony_FX_Ultimate_Mega_Beam.png',
    frames: 6,
    fps: 12,
    loop: false,
    frameWidth: 384,
    frameHeight: 192,
    pivotX: 16,
    pivotY: 96,
    scale: 2.35,
  },
  tony_holo_interface: {
    id: 'tony_holo_interface',
    url: '/assets/effects/tony_FX_Holo_Interface_Activation.png',
    frames: 5,
    fps: 14,
    loop: false,
    frameWidth: 128,
    frameHeight: 96,
    pivotX: 64,
    pivotY: 48,
    scale: 1.7,
  },
  tony_finisher_lock: {
    id: 'tony_finisher_lock',
    url: '/assets/effects/tony_FX_Finisher_Targeting_Lock.png',
    frames: 5,
    fps: 14,
    loop: false,
    frameWidth: 128,
    frameHeight: 128,
    pivotX: 64,
    pivotY: 64,
    scale: 1.9,
  },
  tony_finisher_burst: {
    id: 'tony_finisher_burst',
    url: '/assets/effects/tony_FX_Finisher_Impact_Burst.png',
    frames: 5,
    fps: 14,
    loop: false,
    frameWidth: 192,
    frameHeight: 192,
    pivotX: 96,
    pivotY: 96,
    scale: 2.0,
  },
};

export function getCharacterAssetUrls(charId: CharacterId): string[] {
  const urls = new Set<string>();
  const anims = CHARACTER_ANIMATIONS[charId];
  for (const key of Object.keys(anims) as AnimationKey[]) {
    urls.add(anims[key].url);
  }
  for (const vfx of Object.values(VFX_SHEETS)) {
    if (vfx.id.startsWith(charId + '_')) {
      urls.add(vfx.url);
    }
  }
  return Array.from(urls);
}
