# JATIN — LOCKED CHARACTER DESIGN GUIDE (MASTER REFERENCE)

**Project:** Family Fighting Game — Project Jatin  
**Document Status:** LOCKED (Authoritative Reference for Batches 01–05)  
**Authoritative Visual Source:** Original 2D Pixel-Art Reference (`Gemini_Generated_Image_g7zporg7zporg7zp.png`)  
**Default Facing Direction:** RIGHT  

---

## 1. Facial Identity and Features
- **Ethnicity & Age:** Modern South Asian young man (mid-to-late 20s).
- **Face Shape:** Medium-broad, slightly square jawline framed by a full beard; balanced cheekbones and medium-length nose.
- **Eyes & Brows:** Dark brown/black expressive eyes with thick, slightly furrowed dark eyebrows conveying calm focus, confidence, and sharp situational awareness.
- **Expression:** Composed, alert, slightly confident/assertive fighter's gaze directed forward toward the opponent (RIGHT). Never panicked, goofy, or overly aggressive during basic movement.
- **Eyewear (Locked):** Rectangular dark/black-framed glasses worn consistently across all frames and animations. Thin dark pixel frame with subtle light pixel glints on lenses.

## 2. Hairstyle and Facial Hair
- **Hairstyle:** Short, thick jet-black hair with subtle textured pixel fringe across the forehead and neat taper on the sides/back.
- **Hair Palette:** Deep black (`#080810`–`#101020`) with dark charcoal-grey pixel highlights (`#383850`) for volume.
- **Facial Hair:** Full, neatly trimmed black beard and connected mustache covering the upper lip, chin, and jawline cleanly. Must never be omitted or thinned across frames.

## 3. Skin Tone and Palette
- **Base Skin Tone:** Warm medium-tan / warm brown (`#F0A878` / `#E09868`).
- **Highlight Tone:** Warm peach-tan (`#F8B888`) on forehead, nose bridge, cheekbones, and upper forearms/knuckles.
- **Mid-Shadow Tone:** Rich warm brown (`#C07048` / `#A85838`) on neck, lower jaw, underarms, and palm interiors.
- **Deep Shadow Tone:** Dark umber (`#683020`) for deep crease accents and chin shadow.

## 4. Exact Clothing Design
- **Shirt:** Bright cyan / sky-blue collared button-up casual shirt, worn untucked with the top collar button open.
  - **Sleeves:** Rolled neatly to mid-forearm on both arms, showing crisp fold cuffs.
  - **Placket & Buttons:** Vertical front placket with small white/off-white pixel buttons (`#E8F0F8`) running down the center.
  - **Shirt Palette:**
    - Highlight: `#28D8FF` / `#00C8F8`
    - Midtone: `#0098D8` / `#0090D0`
    - Shadow: `#0060A0` / `#0058A0`
    - Deep Fold: `#003870`
- **Trousers:** Light cool-grey slim-straight denim jeans/trousers with front side pockets, natural fabric creases at thighs and ankles, and **distinctive horizontal bright-red accent stripes** across both knees.
  - **Knee Stripes (Locked):** Single crisp horizontal crimson/red band (`#E01818` with `#981010` shadow) wrapping across the front of both left and right knees.
  - **Trousers Palette:**
    - Highlight: `#C0C8D0` / `#B8C0D0`
    - Midtone: `#98A0B0`
    - Shadow: `#707890` / `#687088`
    - Deep Crease: `#383850`
- **Footwear:** Medium-dark royal blue athletic sneakers with crisp white midsoles/soles (`#F0F4F8`), darker blue tongue/lace area, and black outsole line.
  - **Sneaker Palette:** `#2858A8` (mid), `#4078C8` (highlight), `#183870` (shadow), `#F0F4F8` (sole).

## 5. Accessories
- **Crossbody Sling Bag (Locked):** Matte black crossbody sling/messenger strap running diagonally from Jatin's **left shoulder** (viewer's right) down across his chest to his **right hip** (viewer's left), connected to a compact black sling bag resting behind his right hip.
  - **Strap Palette:** Black (`#080810`) with subtle charcoal highlight (`#383850`).
- **Wristband (Locked):** Slim black wristband/watch band on his **left wrist** (lead hand).
- **Strict Prohibition:** Do NOT add suits, ties, sunglasses, gold chains, crowns, rings, luxury watches, or handheld cash props to his base model or basic movement animations.

## 6. Body Proportions
- **Build:** Solid, medium-athletic / slightly stocky young-adult build — grounded and sturdy without being hyper-muscular (distinct from Rahul's heavy strength build) or overly lanky.
- **Head-to-Body Ratio:** Classic 16-bit/32-bit arcade fighting-game proportions (~6.5 heads tall).
- **Silhouette Readability:** Clean separation between lead arm, torso/sling strap, rear arm, and wide fighting stance legs so poses read instantaneously at arcade gameplay speed.

## 7. Character Height and Scale
- **Reference Source Dimensions:** 1536 × 2752 px (character bounding box: 1199 × 2494 px; native pixel block ~12 px → ~104 × 216 logical pixels).
- **Production Frame Cell:** **288 × 288 px** (32-bit RGBA PNG, genuine alpha transparency).
- **Ground Baseline:** **Y = 272 px** (soles of grounded feet rest cleanly on Y = 272).
- **Horizontal Root Pivot:** **X = 144 px** (center of mass / stance center aligned to X = 144).
- **Locked Standing Height in Frame:** **~228–236 px** (head crown near Y = 38–44 px, feet grounded at Y = 272 px), preserving ~38–44 px overhead clearance and generous horizontal margins for lunges, dashes, and extended limbs.
- **Scaling Method:** Nearest-neighbour only (never bilinear/bicubic blur).

## 8. Shoulder and Torso Proportions
- **Shoulders:** Broad, relaxed, and square; sloped naturally with confident posture.
- **Torso:** Medium-broad chest and waist; untucked cyan shirt hem sits cleanly over the upper hips/pockets without billowing excessively.
- **Posture:** Upright yet slightly angled in a 3/4 fighting stance (chest angled ~35–45° toward viewer while head and lead shoulder face RIGHT).

## 9. Arm and Leg Proportions
- **Arms:** Well-proportioned forearms (exposed below rolled cyan cuffs) and expressive hands; elbows naturally bent in guard.
- **Legs:** Solid thighs and calves; knees clearly articulated (with red knee bands tracking knee bend accurately in walk, crouch, dash, and jump frames); ankles taper neatly into the blue sneakers.

## 10. Default Fighting Stance
- **Footwork:** Balanced, shoulder-width-plus fighting stance. Rear foot (right foot, viewer's left) planted firmly angled slightly forward-right; lead foot (left foot, viewer's right) planted forward pointing RIGHT.
- **Guard Hands:** Lead left hand (wearing black wristband) raised forward at chest/shoulder height in a relaxed, semi-open/cupped ready posture; rear right hand held closer to the chest/sling strap in a loose, ready fist.
- **Attitude:** Confident, composed, stylish, and sharp — relaxed yet immediately ready to react.

## 11. Pixel-Art Outlines and Shading
- **Style:** Classic 16-bit/32-bit arcade fighting-game pixel art (Neo Geo / CPS-2 / modern indie fighter aesthetic).
- **Outlines:** Crisp, dark 1-logical-pixel black outer silhouettes (`#000000` / `#080810`) with selective dark-tinted interior linework for clothing folds, fingers, glasses, and pockets.
- **Shading:** Clean 3-to-4-tone cel-shaded pixel clusters with light coming from upper-front-right; minimal dithering, zero soft airbrushing, zero anti-aliased alpha halos on outer edges.

## 12. Default Facing Direction
- **Locked Facing:** **RIGHT** across all 11 Batch 01 animations (including backward walk and backward dash — Jatin never turns his back to the opponent).
- **Engine Flipping:** Left-facing gameplay is handled by horizontal mirroring in the game engine; source sprites always face RIGHT.

## 13. Future Money-Based Visual Identity (LOCKED FOR BATCHES 02–05)
- **Theme:** Modern wealth, cash manipulation, financial confidence, and sleek luxury energy.
- **Approved FX Elements (Specials / Supers / Selected Gestures Only):**
  - Fictional modern green paper banknotes (strictly fictional abstract currency graphics — never real-world portraits, seals, serial numbers, or authentic denomination layouts).
  - Crisp cash bundles, flying banknote trails, cash storms, emerald-green energy arcs, and sleek financial FX.
- **Approved FX Palette:**
  - Emerald Green (`#00C853` / `#10B981`)
  - Dark Green (`#064E3B` / `#0A6640`)
  - Black (`#0A0A0F`) & Charcoal (`#262630`)
  - Clean White (`#F8FAFC`) & Controlled Neon-Green Highlights (`#39FF14` / `#4ADE80`)
- **Strict Prohibitions (Permanent):**
  - NO gold coins, silver coins, medieval treasure, chests, crowns, royal/king costumes, gold armor, or generic golden superhero energy.
  - NO banknotes or cash props in Jatin's hands during standard Batch 01 basic movement animations (idle, walk, dash, crouch, jump, landing).
  - Do NOT alter Jatin's cyan shirt, grey/red-stripe jeans, or blue sneakers to green — the green palette applies to his *money-based visual effects*, while his original reference outfit remains locked.

## 14. Design Consistency Rules
1. **Identity Lock:** Facial structure, black rectangular glasses, short black hair, full black beard, and warm medium-tan skin tone are immutable across all batches.
2. **Costume Lock:** Cyan rolled-sleeve button-up shirt, black diagonal crossbody sling bag, black left wristband, light grey jeans with red knee stripes, and blue/white sneakers must appear consistently in every frame.
3. **Zero Static Recycling:** Every animation frame must be genuinely illustrated with full-body articulation (head, shoulders, torso, arms, wrists, hips, knees, ankles, feet) following `Anticipation → Movement → Follow-Through → Recovery`.
4. **Cross-Animation Continuity:** Idle F1 serves as the canonical standing anchor for Walk, Dash recovery, Crouch Enter F1, Crouch Exit F2, and Landing F2. Crouch Enter F2 matches Crouch Idle F1. Jump Take-Off F2 flows cleanly into Jump Airborne F1, and Airborne F4 flows cleanly into Landing F1.
5. **Technical Lock:** Every sprite sheet is 32-bit RGBA PNG, transparent background, 288 × 288 px cells, horizontal left-to-right chronological order, ground baseline Y = 272 px, root pivot X = 144 px, nearest-neighbour scaling only.
