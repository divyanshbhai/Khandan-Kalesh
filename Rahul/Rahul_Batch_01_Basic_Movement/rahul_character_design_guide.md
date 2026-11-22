# RAHUL — LOCKED CHARACTER DESIGN GUIDE (PRODUCTION MASTER)

**Project:** Family 2D Pixel-Art Fighting Game — Project Rahul  
**Status:** LOCKED (Authoritative Reference for Batches 01–05)  
**Source Reference:** `Gemini_Generated_Image_gae0b2gae0b2gae0.png` (1536 × 2752 px RGBA PNG; native character bbox 1479 × 2720 px, W/H ratio 0.544)

---

## 1. Face and Facial Identity
- **Structure:** Strong, square-jawed South Asian male face with a stern, focused fighting expression.
- **Brows & Eyes:** Thick, dark, furrowed eyebrows visible just above the sunglasses frame; eyes concealed behind dark brown-tinted rectangular/wayfarer sunglasses with dark frames.
- **Nose & Ears:** Defined bridge and nose visible between the lenses and moustache; right ear visible in 3/4-right profile.
- **Consistency Rule:** Sunglasses must remain on Rahul's face in all Batch 01–05 standard movement frames unless a future damage/KO state explicitly specifies otherwise. Never alter facial structure or remove the sunglasses in movement animations.

## 2. Hairstyle and Facial Hair
- **Hair:** Thick, dense jet-black hair, medium-short length, cleanly combed/swept forward and slightly to the side over the forehead with subtle dark navy-charcoal highlight clusters (`#242434`, `#242C34`).
- **Beard & Moustache:** Full, thick, well-groomed black beard and connected moustache framing the jawline and chin, with a small skin break directly below the lower lip.
- **Consistency Rule:** Maintain the exact hair volume, swept fringe silhouette, and dense full-beard contour across all angles and poses.

## 3. Skin Colour
- **Base Tone:** Warm medium-tan / bronze-brown skin (`#E49464` / `#DC8C64`).
- **Highlights:** Warm peach-tan highlight clusters (`#EC9C6C`) on upper pecs, cheekbones, forearm ridge, and knuckles.
- **Shadows:** Deep warm umber / reddish-brown muscle shadows (`#944C3C`, `#944C34`, `#44140C`) defining pectoral separation, clavicles, deltoid/bicep grooves, forearm flexors, and toes.

## 4. Exact Clothing Design
- **Shirt:** Black-and-white / charcoal-grey checkered plaid collared button-up shirt:
  - Deeply unbuttoned at the front collar/placket, forming a V-opening that reveals Rahul's muscular upper chest, pec cleavage, and upper abdomen.
  - Lower placket closed with small light-grey/white buttons; shirt hem tucked neatly into the jeans waistband.
  - Matching plaid chest pocket on Rahul's left chest (viewer's right).
  - Long sleeves neatly rolled up to the mid-forearms/elbows, exposing his thick muscular forearms.
- **Belt:** Dark charcoal/black belt threaded through jean belt loops with a small rectangular light-grey/silver center buckle.
- **Pants:** Dark charcoal-grey denim jeans (`#343444`, `#545C64`, `#6C7C84`) with standard front pockets, subtle thigh/knee wear highlights, and hems rolled up once into clean cuffs above the ankles.
- **Strict Prohibitions:** Do NOT swap the plaid shirt for a gym vest, tank top, or bodybuilding costume. Do NOT add dumbbells, barbells, wristbands, gloves, or gym props.

## 5. Body Proportions
- **Build:** Powerful, muscular, athletic heavy-brawler physique derived strictly from the reference image (W/H standing ratio ~0.544).
- **Head-to-Body Ratio:** Approximately 6.5–7 heads tall in a slightly knee-bent fighting stance; broad horizontal mass through shoulders and thighs.
- **Anatomical Continuity Rule:** Muscle volume must remain strictly constant across all poses. Show muscular tension via consistent pixel shading clusters rather than inflating or shrinking limbs between frames.

## 6. Shoulder Width
- Broad, wide, squared-off shoulders with full rounded deltoids clearly filling out the upper plaid shirt sleeves.
- Shoulder breadth spans roughly 2.5× head width in the default 3/4-right fighting guard.

## 7. Chest and Upper-Body Structure
- Thick, deep barrel chest and developed pectorals clearly visible through the open plaid shirt V-neck.
- Strong trapezius and thick neck connecting the head to the shoulders; sturdy, powerful upper torso that rotates as a cohesive unit during dashes, walks, and jumps.

## 8. Arm and Forearm Muscularity
- Thick upper arms filling the rolled plaid sleeves; heavy, well-defined forearms with visible brachioradialis/extensor shading.
- Large, capable fighting hands held open/semi-clenched in a brawler/grappler guard (rear right hand near chest/ribs, lead left hand raised forward at shoulder/head height).

## 9. Waist and Leg Proportions
- Solid, athletic waist (not pinched into a cartoon hourglass, not overly wide) anchored by the belted denim waistband.
- Thick, muscular thighs and calves filling the charcoal denim jeans; strong knees and ankles capable of explosive push-off and deep crouched compression.

## 10. Footwear
- **Style:** Simple olive-green strap flip-flops (slippers/chappals) with dark brown/olive flat soles and olive-green Y-straps over bare feet, toes clearly visible.
- **Consistency Rule:** Preserve the olive-green flip-flops in every grounded, crouching, and airborne frame; never convert them into sneakers, boots, or bare feet.

## 11. Main Colour Palette (Extracted from Reference)

| Element | Highlight | Midtone / Base | Shadow | Outline |
|---|---|---|---|---|
| **Outlines / Deep Black** | — | `#040414` | `#04040C` | `#04040C` |
| **Hair & Beard** | `#242C34` | `#04041C` | `#04040C` | `#04040C` |
| **Sunglasses** | `#848C94` (glint) | `#44140C` (lens) | `#040414` (frame) | `#04040C` |
| **Skin (Chest/Arms/Feet)** | `#EC9C6C` | `#E49464` / `#DC8C64` | `#944C3C` / `#944C34` | `#040414` |
| **Plaid Shirt** | `#E8ECEF` (white check) | `#848C94` / `#848494` | `#242434` / `#1C242C` | `#040414` |
| **Charcoal Denim Jeans** | `#6C7C84` | `#545C64` / `#343444` | `#2C3444` / `#2C343C` | `#040414` |
| **Flip-Flops** | `#6C8454` (olive strap) | `#4C643C` (strap) | `#3C3C24` (sole) | `#04040C` |

## 12. Pixel-Art Rendering and Outline Style
- **Era / Aesthetic:** Classic 16-bit / 32-bit arcade fighting-game pixel art (CPS-3 / Neo Geo aesthetic).
- **Outlines:** Clean, crisp dark-navy/black (`#04040C`–`#040414`) 1-art-pixel external outlines with selective dark internal creases for muscle and cloth folds.
- **Shading:** Discrete 3–4 value pixel clusters with zero soft airbrushing, zero blurry gradients, and zero anti-aliasing halos against the transparent background.
- **Scaling:** Strictly nearest-neighbour (`Image.NEAREST`) at all export stages.

## 13. Default Fighting Stance
- **Facing:** RIGHT (engine mirrors horizontally for left-facing).
- **Posture:** Grounded, wide, athletic brawler stance with knees slightly bent and weight balanced solidly across both feet (rear right foot planted slightly behind the root pivot, lead left foot forward).
- **Torso:** 3/4-facing right, chest proud and open, shoulders squared with controlled readiness.
- **Guard Hands:** Lead left hand raised forward at upper-chest/chin height with fingers semi-curled; rear right hand held closer to the lower chest/ribs ready to guard or strike.

## 14. Canonical Character Scale & Technical Grid (Locked for Batches 01–05)
- **Frame Cell Dimensions:** `288 × 288 px`
- **Ground Baseline:** `Y = 272 px` (16 px bottom margin)
- **Horizontal Root Pivot:** `X = 144 px`
- **Canonical Standing Height:** `~228 px` (head top at `Y ≈ 44 px`, soles resting on `Y = 272 px`; standing width `~124–140 px`, leaving `>= 60 px` clearance on both horizontal edges for broad shoulders, dashes, and attacks)
- **Canonical Crouch Height:** `~168–178 px` (compressed muscular thighs, feet grounded at `Y = 272 px`)
- **Airborne Convention:** Both feet visibly off `Y = 272 px` (typically `Y = 215–245 px`), full body cleanly inside `288 × 288` with `>= 12 px` cell margin; playback follows `play_once_hold_last` (`loop: false`) while the game engine drives vertical jump trajectory.
- **Format:** 32-bit RGBA PNG, genuine alpha transparency, left-to-right chronological horizontal strips.
