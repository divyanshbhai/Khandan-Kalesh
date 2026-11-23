# Family Fighters — UI Design System (`UI_DESIGN_SYSTEM.md`)

## 1. Visual Inspiration from Original Artwork

Every color, border, lighting accent, and surface token is derived directly from the three supplied arenas and four original pixel-art fighters:

- **Katra Bazaar (`stage_01.png`)**: Warm sunlit sandstone floor (`#d8b382`), marigold & vermilion signage (`#e1352b`, `#f5a623`), cobalt mountain sky, yellow-black iron crowd railings, dappled warm shadow (`#1d1511`).
- **Paonta Sahib Terrace (`stage_02.png`)**: Sunlit white marble reflections (`#f6ead4`), saffron Nishan Sahib accent (`#f59e0b`), Himalayan emerald, tranquil river sky.
- **Purane Saanp Enclave (`stage_03.png`)**: Warm golden-hour sandstone facade, deep terracotta wooden doors (`#9e3223`), vintage mint-green scooter, warm twilight asphalt shadow.

## 2. Core Color Tokens (`src/styles/designTokens.ts`)

| Role | Token | Hex | Usage |
| :--- | :--- | :--- | :--- |
| **Deep Obsidian Ink** | `ink950` | `#0b0807` | Letterbox canvas frame, pixel-art outer strokes, deep panel shadows |
| **Warm Charcoal Surface** | `surface900` | `#17120e` | Primary layered arcade panels, HUD backing plates |
| **Smoked Mahogany** | `surface800` | `#231b15` | Secondary interactive plates, modal interior trays |
| **Sandstone Cream** | `cream100` | `#f8efe0` | High-contrast primary typography on dark surfaces |
| **Muted Parchment** | `cream400` | `#b8a996` | Secondary metadata, hints, unboxed labels |
| **Marigold Brass (Primary Accent)** | `brass500` | `#f5a623` | Primary CTAs, active P1 focus, round timer frame, brass trim |
| **Burnished Highlight** | `brass300` | `#ffd67a` | Top specular bevel highlights, active indicators |
| **Arcade Vermilion** | `crimson500` | `#e1352b` | KO callouts, critical HP pulse, counter-hit & strike plates |
| **Pixel Border Bevel** | `borderWarm` | `#4a3a2b` | Structural hairline dividers & framed borders |

### Character Signature Accents (Used Only Where Character-Scoped)
- **Rahul** (*Iron Heavyweight*): `#f59e0b` (Kinetic Marigold) / `#b45309`
- **Sagar** (*Rhythm Striker*): `#14b8a6` (Harmonic Jade) / `#0f766e`
- **Jatin** (*High-Roller Tactician*): `#22c55e` (Banknote Emerald) / `#15803d`
- **Tony** (*Tech Commander*): `#38bdf8` (Hologram Cyan) / `#0369a1`

## 3. Typography & Framing Rules

- **Display / Arcade Headings**: `Barlow Condensed` (700–800 Italic), tight tracking, crisp dark pixel-compatible outline (`paint-order: stroke fill`).
- **Body / Controls / Descriptions**: `Plus Jakarta Sans` (500–700) — high readability at desktop and mobile sizes.
- **Numeric Telemetry (HP, Timer, Cooldowns, Combo, Damage)**: `JetBrains Mono` with `font-variant-numeric: tabular-nums`.
- **Panel Geometry**: Crisp chamfered / beveled arcade plaques (`2px` outer obsidian ink + `1px` warm brass or character-accent inner edge), zero generic SaaS rounded-2xl glassmorphism, zero `backdrop-filter` over live `<canvas>`, zero static pill badge clutter, zero emoji icons (original pixel-crisp inline `<svg>` pictograms only).

## 4. Motion & Accessibility

- Routine button hover/press feedback settles in `<= 160ms` using `cubic-bezier(0.16, 1, 0.3, 1)` on compositor-only properties (`transform`, `opacity`).
- Touch targets maintain `>= 44px` minimum interactive size with translucent arcade rings so the arena and fighters remain clearly visible.
- **Reduced Motion** setting disables camera shake, screen flash intensity, and decorative menu pulse/particles.
