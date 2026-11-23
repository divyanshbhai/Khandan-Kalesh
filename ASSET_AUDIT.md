# 39 BHARAT NAGAR — V1.0 ASSET AUDIT

**Game Title:** 39 BHARAT NAGAR  
**Tagline:** ONE HOUSE. SEVEN CLAIMS.  
**Creator:** Divyansh Ama QIM  

---

## 1. Official Branding & PWA Icons

| Asset | Path | Dimensions / Notes | Status |
| :--- | :--- | :--- | :--- |
| Official Game Logo | `/public/assets/brand/logo-39-bharat-nagar.png` | `2048×2048` transparent PNG (copied verbatim from user upload) | **VERIFIED ON DISK** |
| PWA Icon (192×192) | `/public/pwa-192x192.png` | Generated programmatically from official logo via `scripts/generate-pwa-icons.mjs` | **VERIFIED ON DISK** |
| PWA Icon (512×512) | `/public/pwa-512x512.png` | Generated programmatically from official logo | **VERIFIED ON DISK** |
| Maskable Icon (512×512) | `/public/pwa-maskable-512x512.png` | Generated with 15% safe-zone padding & opaque `#100b12` brand backing | **VERIFIED ON DISK** |
| Apple Touch Icon (180×180) | `/public/apple-touch-icon.png` | Opaque PNG for iOS Home Screen | **VERIFIED ON DISK** |
| High-Res App Store Source (1024×1024) | `/public/pwa-1024x1024.png` | Square opaque PNG derived from official logo | **VERIFIED ON DISK** |

---

## 2. Playable Character Assets (4 Original Family Fighters)

All four playable characters use 100% original supplied pixel-art sprite sheets. No sprites were replaced or regenerated.

| Character | Folder | PNG Sprite Sheets on Disk | Missing Sheets | Animation Manifest | Status |
| :--- | :--- | :---: | :---: | :--- | :--- |
| **Rahul** | `/public/assets/characters/rahul/` | **40** | 0 | `src/config/animations.ts` | **COMPLETE** |
| **Sagar** | `/public/assets/characters/sagar/` | **40** (Batch 03 Defence & Damage included) | 0 | `src/config/animations.ts` | **COMPLETE** |
| **Jatin** | `/public/assets/characters/jatin/` | **40** | 0 | `src/config/animations.ts` | **COMPLETE** |
| **Tony** | `/public/assets/characters/tony/` | **57** (+ 10 VFX/Drone sheets in `/public/assets/effects/`) | 0 | `src/config/animations.ts` | **COMPLETE** |

*Note on Sagar Batch 03:* Disk audit confirmed all 8 Batch 03 Defence & Damage sprite sheets (`sagar_22_standing_guard_4f.png` through `sagar_29_guard_break_stunned_5f.png`) are present and mapped in `src/config/animations.ts` with zero fallbacks.

---

## 3. Upcoming Roster Placeholders (3 Locked Claimants)

Defined in the central 7-character registry (`src/config/characterRegistry.ts`):

| Claim # | Character | Status | Assets Status |
| :---: | :--- | :--- | :--- |
| #5 | **Chini** | `COMING SOON` (Locked) | Sprite sheets not yet supplied |
| #6 | **Chameto** | `COMING SOON` (Locked) | Sprite sheets not yet supplied |
| #7 | **Moli** | `COMING SOON` (Locked) | Sprite sheets not yet supplied |

No character artwork, combat stats, or fabricated movesets were invented for these three claimants.

---

## 4. Original Fighting Stage Backgrounds (3 Arenas)

| Stage ID | Stage Name | File | Native Dimensions | Aspect Ratio |
| :--- | :--- | :--- | :---: | :---: |
| `katra` | Katra Bazaar | `/public/assets/stages/stage_01.png` | `2172×724` | 3:1 |
| `ponta` | Paonta Sahib Terrace | `/public/assets/stages/stage_02.png` | `2172×724` | 3:1 |
| `enclave` | Purane Saanp Enclave | `/public/assets/stages/stage_03.png` | `2172×724` | 3:1 |

All stage images are rendered proportionally with zero stretching or distortion.

---

## 5. Typography Assets

Self-hosted locally via npm (`@fontsource`) so fonts work offline with zero external CDN failures:
- `@fontsource/press-start-2p` (Arcade Display Headings)
- `@fontsource/silkscreen` (Pixel UI Labels & Counters)
- `@fontsource/barlow-condensed` (Readable Dialogue & Settings Copy)
