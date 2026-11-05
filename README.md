# ⚔️ Algorithm Boss Battle: Speed Math RPG
### TEGAS AI & Mathematics Student Challenge Webapp

A retro 8-bit turn-based math RPG designed from start to finish with a **pure SVG pixelated interface**. Students cast computational spells to defeat rogue AI Overlords while a real-time **Dynamic Difficulty Adjustment (DDA) AI Engine** adapts question tiers to optimize learning, confidence, and excitement.

Students who conquer all 3 bosses unlock an **Official Verified Prize Claim Pass** with a scannable SVG QR code to redeem physical prizes from event organizers.

---

## 🎮 Gameplay & Battle Mechanics

Students take on the role of the **Cyber Mage**, challenging 3 distinct AI bosses in turn-based combat:

1. **Boss 1: Vector Imp (The Glitch Sprite)** — Fast warm-up calculations and number patterns.
2. **Boss 2: Matrix Golem (The Logic Titan)** — Percentages, fractions, and prime number detection.
3. **Boss 3: Derivative Dragon (Calculus Overlord - Final Boss)** — Multi-step algebra and linear equations.

### 🧙‍♂️ Turn Spells & Math Disciplines

Every turn, players choose an attack spell corresponding to a key mathematical topic:

* 🔥 **Fireball (`Speed Mental Arithmetic`):** High-burst damage with a strict 10-second timer. Fast solutions (<3.5s) yield a **Rapid Cognition Multiplier**!
* 🛡️ **Aegis Shield (`Primes, Percentages & Fractions`):** Restores 25 HP and grants 30 Shield Points to completely block incoming boss damage.
* ⚡ **Critical Strike (`Algebraic Linear Equations`):** Solve for $x$ in linear and quadratic equations ($ax \pm b = c$, variables on both sides) for massive critical strikes.
* ❄️ **Time Warp (`Pattern Sequences`):** Identify geometric and arithmetic number patterns to freeze the boss for a free turn.

### ⚡ TEGAS Battle Rush & Arcade Action Mechanics

* **⚔️ In-Arena Holographic HUD (Zero Interruptions):** Replaced disconnected modal popups with a seamless holographic HUD projected between the Mage and Boss. Calculations occur directly inside the heat of battle with rapid keyboard shortcuts (`1/A`, `2/B`, `3/C`, `4/D`).
* **⚠️ Boss Doom Gauge & Stagger Interruption:** Bosses charge devastating ultimate attacks (`GLITCH NOVA`, `BINARY CATACLYSM`, `ASYMPTOTE OBLIVION`). Solving equations swiftly shatters the charge gauge, **STAGGERING** the boss and dealing heavy counter-damage.
* **💥 QTE Timing Strike ("Mega-Crit"):** On critical strikes and high streaks, a moving timing bar appears. Hitting spacebar or tapping within the green zone triggers a **2.5x - 3.5x MEGA CRITICAL** with screen-shattering anime cut-ins.
* **🥋 Fighting Game Dual-Layer Ghost Health Bars:** Health bars now feature trailing yellow/white ghost bars that drain smoothly after each hit, providing heavy arcade weight.
* **🔥 Dynamic Arcade Combo Stamps:** Streaks trigger energetic arcade stamps (*GOOD!*, *SUPER!*, *HYPER!*, and *🔥 GODLIKE COGNITION!*) with audio fanfares and screen shakes.
* **💎 Rogue-lite Cyber Relic Selection:** After each boss round, students choose 1 of 5 permanent computational perks (e.g. *Nanite Edge*, *Kinetic Barrier*, *Overclock Coil*, *Vampiric Equations*, *Chronos Shard*).
* **⚡ TEGAS Hypercharge Mode (3x+ Streak):** Hitting a 3-answer streak enters high-voltage Hypercharge mode with glowing red/yellow neon borders, screen aura, synthesized soaring arpeggios, and a **1.5x Damage & Score Multiplier**.
* **⚠️ Boss Enraged Phase (<35% HP):** When a boss's HP drops below 35%, they pulse with a fiery red aura and become Enraged! Boss attack power increases by 40% and question timers accelerate by 20%, building intense climax tension. Defeating an enraged boss awards a +500 Slayer Bonus!
* **📳 Juicier Haptic & Visual Feedback:** Dynamic multi-axis screen shakes and mobile vibration triggers on attacks, crits, and enrages via `navigator.vibrate`.

---

## 🤖 How AI is Used: Dynamic Difficulty Adjustment (DDA)

The webapp features a client-side **Cognitive Flow & DDA Engine** (`math-engine.js`):

* **Real-time Speed & Accuracy Telemetry:** Tracks reaction time, answer streaks, and consecutive misses.
* **Tier Escalation & Flow State:** 
  * If a student answers swiftly (<40% of time limit) on a streak, the AI promotes them from Tier 1 up to **Tier 5 (Overdrive)**.
  * Higher tiers boost score multipliers, increase XP, and unlock critical damage bonuses.
* **Adaptive Cognitive Relief & Tactical Hints:**
  * If a student struggles or misses questions, the AI recalibrates downward to reinforce core concepts and automatically displays **AI Tactical Hints** before timer expiry.
* **Live AI HUD Feedback:** An active retro ticker informs students of the AI's real-time assessment (e.g., `AI DDA: Rapid cognition (2.1s)! Tier elevated to T3 (+Damage Boost)`).

---

## 🎁 Real Prize Distribution & Anti-Cheat Mechanic

When defeating the Final Boss:
1. **Victory Ceremony:** The student enters their Full Name, School/Institution, and Contact Information.
2. **Cryptographic Claim Code:** The game generates a unique, tamper-resistant Claim Token (e.g. `TEGAS-AI-INT-A89F21`).
3. **Pure SVG QR Code Generator:** Renders a functional, scannable SVG QR Code encoding the student's score, name, and verification token.
4. **Print / Save Pass:** A built-in `@media print` layout lets students print a clean, pocket-sized tournament voucher or screenshot it for the TEGAS prize counter.
5. **Hall of Fame Leaderboard:** Records student rankings, maximum combos, accuracy, and scores in browser `localStorage`.

---

## 🎨 Pure SVG Pixelated Visuals & Retro Audio

* **100% Crisp SVG Pixel Sprites:** Player Hero (Idle & Cast), Vector Imp, Matrix Golem, Derivative Dragon, Fireballs, Shields, Lightning, and UI Icons rendered purely via SVG `<rect>` pixel grids with `shape-rendering="crispEdges"`.
* **Procedural 8-bit Web Audio:** Zero external audio files or network dependencies. Web Audio API synthesizes retro square and sawtooth waves for blips, fireballs, thunder strikes, shield chimes, damage explosions, and toggleable retro chiptune BGM.
* **Zero Build Step:** Native ES6 modules, zero compilation required. Runs straight out of the box in any browser.

---

## 🚀 How to Run Locally

You can launch the webapp instantly in any modern web browser:

### Option A: Direct Open
Simply double-click `index.html` in your file explorer or open it via your browser:
```bash
open index.html
```

### Option B: Local Web Server
```bash
npm start
# or:
npx serve -l 3000 .
# or Python:
python3 -m http.server 3000
```
Then navigate to `http://localhost:3000`.

---

## 📁 File Structure

* `index.html` — Accessible HTML5 interface, semantic arena stage, spell deck, and `<dialog closedby="any">` modals.
* `styles.css` — Retro 8-bit arcade styling, pixel borders, glowing health meters, combat animations, and print stylesheet.
* `svg-assets.js` — Pure SVG pixel-art generators for all characters, bosses, spell VFX, and scannable QR codes.
* `audio.js` — Procedural Web Audio API sound synthesizer and retro chiptune arpeggiator.
* `math-engine.js` — Procedural math question generator and Dynamic Difficulty Adjustment (DDA) AI.
* `game.js` — RPG battle flow manager, turns, damage calculations, voucher claims, and Hall of Fame persistence.
* `package.json` — Metadata and quick launch script.
