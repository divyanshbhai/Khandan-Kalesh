# Project Sagar — Character Design Guide & Batch 1 Animation Manifest

## 1. Authoritative Character Design Guide (Locked Across All Batches)

Derived directly from the original Sagar reference sprite (`1536×2752` RGBA), every animation across Batches 1–5 strictly preserves the following visual identity:

### Head, Face & Hair

* **Facial Identity**: Adult South Asian male, focused intense brow, dark eyes with crisp single-cluster white sclera highlight, defined nose bridge, serious fighting-game expression.

* **Hairstyle**: Thick jet-black hair swept back into a high-mid man bun (topknot) at the upper-back crown, with loose dark strands flowing at the nape of the neck and a single loose lock curving near the right forehead.

* **Facial Hair**: Full, neatly groomed black beard and mustache with charcoal pixel highlights along the jawline and cheek contours.

### Outfit & Footwear

* **Shirt**: Dark navy-blue and warm ochre/orange plaid flannel button-up collared shirt, worn unbuttoned at the upper chest (revealing collarbones/sternum) with sleeves rolled cleanly to mid-forearm (3/4 length) and untucked hem resting at upper hip.

* **Pants**: Dark charcoal-grey relaxed-fit jogger pants with visible side pocket seams, angular pixel-art knee creases, and elastic cuffed ankles.

* **Footwear**: Barefoot, grounded athletic feet with clearly drawn toes and ankle bone shading.

### Proportions, Palette & Rendering Rules

* **Build & Scale**: Broad-shouldered, athletic fighter (\~6.5–7 heads tall); canonical standing height locked to **212 px** inside a uniform **288×288 px** frame cell across all batches (providing ample horizontal reach for Batch 2 kicks/sweeps and vertical headroom for Batch 2 uppercuts and Batch 4 special moves).

* **Art Style**: Classic 16-bit/32-bit arcade fighting-game pixel art (hard 1px dark outlines, 3–4 tone cel-shaded clusters, zero soft anti-aliasing or painterly blur, nearest-neighbor scaling only).

* **Color Palette Anchors**:

  * Skin tones: warm tan highlight `#E09F70`, mid-tone `#C47F52`, shadow `#8B5233`

  * Hair & beard: base `#181A20`, highlight `#383D4A`, outline `#0B0C10`

  * Plaid shirt: navy base `#1C345E`, navy shadow `#101E38`, ochre plaid stripes `#D97E2A` / `#9E531A`

  * Jogger pants: charcoal base `#2E2E36`, mid-shadow `#202028`, deep crease `#14141A`

* **Default Orientation & Stance**: Facing **RIGHT** in all production sheets (engine mirrors horizontally for facing left). Default martial-arts guard: lead left fist extended forward, rear right open/semi-curled guard hand held near chest, knees lightly flexed.

## 2. Global Technical Specification (Batch 1–5 Standard)

* **Format**: 32-bit RGBA PNG with true alpha transparency (zero background pixels, zero grid lines, zero text, zero borders in production sheets).

* **Uniform Frame Cell Size**: `288 × 288 px` across every Sagar animation sheet.

* **Frame Layout**: Single horizontal strip arranged **left-to-right** in chronological order (`0` to `N-1`).

* **Pivot & Ground Anchor**: Bottom-center ground baseline locked at `(x = 144, y = 272)` — leaving a `16 px` lower safety margin and generous top/side reach margins so no hands, feet, or hair are ever clipped.

* **Resampling**: Nearest-neighbor (`Image.NEAREST`) strictly enforced to preserve hard pixel-art edges.

## 3. Batch 1 Animation Manifest — Basic Movement (11 Sheets, 47 Total Frames)

| \# | Animation Name | Production File | Frames | Sheet Size (px) | Frame Order | Rec. FPS | Loop | Gameplay Purpose | Pivot / Anchor Notes | 
| ----- | ----- | ----- | ----- | ----- | ----- | ----- | ----- | ----- | ----- | 
| 01 | **Idle Breathing** | `sagar_01_idle_8f.png` | 8 | `2304 × 288` | L → R (0–7) | 10 FPS | Yes | Default neutral combat stance breathing & rhythmic bounce loop | Feet anchored to `(144, 272)` across all 8 frames; seamless loop F8 → F1 | 
| 02 | **Forward Walking** | `sagar_02_walk_forward_6f.png` | 6 | `1728 × 288` | L → R (0–5) | 10 FPS | Yes | Advancing toward opponent while keeping guard active | Planted foot anchored to `y = 272` on every frame | 
| 03 | **Backward Walking** | `sagar_03_walk_backward_6f.png` | 6 | `1728 × 288` | L → R (0–5) | 9 FPS | Yes | Defensive retreat while facing opponent with high guard | Planted foot anchored to `y = 272` on every frame | 
| 04 | **Forward Dash** | `sagar_04_dash_forward_6f.png` | 6 | `1728 × 288` | L → R (0–5) | 15 FPS | No | High-speed forward burst to close gap or start pressure | Coil (F1) → Launch/Sprint (F2–F4) → Brake (F5) → Guard Recovery (F6) at `y = 272` | 
| 05 | **Backward Dash** | `sagar_05_dash_backward_5f.png` | 5 | `1440 × 288` | L → R (0–4) | 14 FPS | No | Evasive backstep hop to escape pressure or bait whiffs | Ground baseline `y = 272`; F3 preserves natural airborne backstep hop elevation | 
| 06 | **Crouch Transition** | `sagar_06_crouch_enter_2f.png` | 2 | `576 × 288` | L → R (0–1) | 16 FPS | No | Fast drop from standing guard into low crouch | Feet anchored at `y = 272`; F1 mid-squat → F2 deep low crouch | 
| 07 | **Crouch Idle** | `sagar_07_crouch_idle_4f.png` | 4 | `1152 × 288` | L → R (0–3) | 8 FPS | Yes | Low-profile crouching breathing loop ready for low moves | Anchored at `y = 272`; matches F2 profile of Crouch Transition | 
| 08 | **Return to Standing** | `sagar_08_crouch_exit_2f.png` | 2 | `576 × 288` | L → R (0–1) | 16 FPS | No | Smooth upward recovery from crouch back to standing guard | Anchored at `y = 272`; F2 aligns directly into Idle Breathing F1 | 
| 09 | **Jump Take-Off** | `sagar_09_jump_takeoff_2f.png` | 2 | `576 × 288` | L → R (0–1) | 16 FPS | No | Pre-jump squat anticipation (F1) and explosive launch (F2) | F1 planted on `y = 272`; F2 springs upward off bare toes | 
| 10 | **Jumping / Airborne Loop** | `sagar_10_jump_airborne_4f.png` | 4 | `1152 × 288` | L → R (0–3) | 10 FPS | Yes | Mid-air ascent (F1), apex tuck (F2), and descent (F3–F4) | Center-balanced inside `288 × 288` cell; game engine drives Y-arc | 
| 11 | **Landing** | `sagar_11_landing_2f.png` | 2 | `576 × 288` | L → R (0–1) | 15 FPS | No | Impact squash absorption (F1) and guard recovery (F2) | Both bare feet firmly planted on `y = 272`; transitions into Idle F1 | 

## 4. Quality Control Summary (Batch 1)

* **Identity & Outfit Consistency**: Verified across all 47 frames — exact face, man bun + loose nape strands, full beard, blue/orange plaid shirt with rolled sleeves, charcoal cuffed joggers, and bare feet preserved without redesign.

* **Anti-Static Regeneration**: Initial Idle, Forward Walk, Backward Walk, and Crouch Idle strips were inspected and regenerated to ensure genuine full-body frame-to-frame motion and matching crouch silhouettes.

* **2D Connected-Component Isolation**: Every frame was segmented in 2D and cleaned via outer flood-fill + 2-pass fringe removal (preserving interior eye sclera highlights) so neighboring outstretched limbs never bleed across cell boundaries.