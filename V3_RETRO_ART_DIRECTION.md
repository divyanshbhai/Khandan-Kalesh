# FAMILY FIGHTERS — V3 RETRO ARCADE ART DIRECTION

## 1. Visual Concept
FAMILY FIGHTERS V3 unifies the entire interface, HUD, and touch control layer with the hand-crafted 288×288 pixel-art character sprites and panoramic Indian fighting stages. All modern web SaaS surfaces (rounded cards, soft shadows, glossy gradients, blur overlays) have been replaced with a cohesive **1990s coin-op arcade cabinet** visual identity inspired by golden-age Capcom / SNK / Namco fighting cabinets.

## 2. Color System
- **Cabinet Obsidian (`#090605`)**: Hard outer pixel outlines, drop shadows, and arcade bezel casing.
- **Warm Cabinet Surface (`#16100c`, `#18110c`, `#231912`)**: High-contrast opaque dark panels that frame pixel sprites without competing with stage colors.
- **Arcade Brass Gold (`#f5a623`, `#ffc947`, `#ffe38f`)**: Primary action buttons, active P1 cursor highlights, health bar frames, and round gems.
- **Arcade Crimson (`#d62b22`, `#ef3b32`)**: KO banners, P2 cursor highlights, critical health pulses, and danger actions.
- **Per-Character Accents**:
  - **Rahul**: Kinetic Gold (`#f5a623`)
  - **Sagar**: Harmonic Jade (`#14d4bc`)
  - **Jatin**: Banknote Emerald (`#26d663`)
  - **Tony**: Hologram Cyan (`#38bdf8`)

## 3. Typography System
- **Primary Arcade Pixel Display (`Press Start 2P`)**: Main title emblem, `PRESS START`, `ROUND / FIGHT / K.O.`, timer digits, and P1/P2 arcade headers.
- **Pixel UI (`Silkscreen`)**: Fighter names, HUD numbers, buttons, move list labels, and touch control short tags — crisp and legible even on compact smartphone landscape screens.
- **Condensed Support (`Barlow Condensed`)**: Multi-word descriptions and Move List notes where longer prose benefits from tighter horizontal measure.
- **Rendering Discipline**: All numerals use `tabular-nums`, hard 2px–3px pixel drop shadows (no fuzzy blur), and zero uppercase-micro-label clutter.

## 4. Pixel Borders, Bevels & Framing
- Strictly square edges (`border-radius: 0`) on panels, cards, health meters, and arcade menu buttons.
- 3-layer crisp framing: `2px` colored inner border + `2px` solid `#090605` outer outline + hard pixel offset shadow (`4px 4px 0 #090605`) + top-left pixel bevel highlight.
- Desktop viewports wrap the 16:9 game screen inside a restrained dark arcade bezel; mobile landscape viewports keep 100% of the screen dedicated to gameplay and safe-area-anchored controls.

## 5. Pixel-Perfect Canvas Rendering & Optional Retro CRT Mode
- Character sprites, VFX sheets, and scrolled stage backgrounds render with `imageSmoothingEnabled = false` and integer-snapped camera coordinates (`Math.round(camera.x)`) to prevent sub-pixel shimmer or blurry scaling.
- Default `scalingMode` is `pixel` (`image-rendering: pixelated`).
- **Retro CRT Mode** (adjustable in Settings):
  - **Off (Default)**: Razor-sharp pixel presentation.
  - **Subtle**: Light 2px horizontal scanlines + gentle peripheral vignette.
  - **Arcade**: Classic CRT scanlines + faint RGB phosphor aperture texture + corner vignette + optional subtle screen curvature.
  - Strictly `pointer-events: none` so touch controls are never obstructed.

## 6. Mobile-First Physical Retro Arcade Controls
- Bottom-edge safe-area anchored controls leaving the entire center combat arena clear.
- Hierarchical physical arcade push-button sizing: larger primary attacks (`LP`, `HP`, `KICK`, `GUARD` ≥ 52–58px on mobile landscape), slightly tighter secondary character specials (`SP1`, `SP2` ≥ 48–52px), and a distinct corner-framed `ULT` trigger.
- Semi-transparent resting opacity (`78%` default, user-adjustable `35%–95%`), strong depressed bevel frame on press, pixelated cooldown meter overlay, and character-specific verified icons/labels only.
