# 🐭 Mushak's Modak Dash

[![Ganesh Chaturthi 2026](https://img.shields.io/badge/Contest-Ganesh%20Chaturthi%202026-orange.svg)](https://github.com)
[![Team](https://img.shields.io/badge/Team-BAPPA%20BYTES-gold.svg)](https://github.com)
[![Engine](https://img.shields.io/badge/Engine-Phaser%203.87-blue.svg)](https://phaser.io)
[![TypeScript](https://img.shields.io/badge/Language-TypeScript-3178C6.svg)](https://www.typescriptlang.org)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

**Mushak's Modak Dash** is a joyful, fast-paced, festive 2.5D endless runner browser game developed by **Team BAPPA BYTES** for the **Ganesh Chaturthi Game Design Contest 2026**.

---

## 🌟 Game Overview

Take control of **Mushak**, Lord Ganesha's devoted and nimble divine vahana, on a thrilling festival dash through the vibrant, rangoli-adorned streets of Maharashtra during Ganesh Chaturthi!

- 🥟 **Collect Modaks**: Gather delicious steamed Modaks (+10 pts) and glowing golden Jumbo Modaks (+50 pts).
- 🌿 **Harness Durva Grass**: Activate the 5-second sacred **Durva Shield** to safely absorb obstacle hits.
- ⚡ **Build Combos**: Chain consecutive modak pickups to unlock **x2** and **x3** score multipliers.
- 🚧 **Dodge Festive Obstacles**: Leap over flower carts, crates, and barriers; slide beneath low-hanging floral torans.
- 🏆 **Compete on the Verified Leaderboard**: Submit your high scores with built-in server-side anti-cheat verification.

---

## 🎮 How to Play & Controls

| Action | Desktop / Laptop | Mobile / Touch |
| :--- | :--- | :--- |
| **Move Left** | `A` or `Left Arrow (←)` | Swipe Left / On-screen Left Arrow |
| **Move Right** | `D` or `Right Arrow (→)` | Swipe Right / On-screen Right Arrow |
| **Jump** | `W` / `Up Arrow (↑)` / `Space` | Swipe Up / On-screen Up Arrow |
| **Slide / Duck** | `S` or `Down Arrow (↓)` | Swipe Down / On-screen Down Arrow |
| **Pause Game** | `P` or `Escape (Esc)` | HUD Pause Button |

---

## 🛠️ Tech Stack & Architecture

- **Game Engine**: [Phaser 3](https://phaser.io/) (v3.87) with Arcade Physics & Object Pooling.
- **Language & Bundler**: TypeScript + [Vite](https://vitejs.dev/) for sub-second hot reload and optimal asset bundling.
- **Visual Engine**: HTML5 Canvas Vector Procedural Texture Generator (`AssetGenerator.ts`) ensuring 100% crisp scaling across mobile (9:16) and desktop (16:9) with zero external asset loading latency.
- **Audio Engine**: Custom Web Audio API Synthesizer (`AudioSystem.ts`) delivering authentic 140 BPM Dhol-Tasha festive rhythm loops and responsive sound effects.
- **Backend & Leaderboard**: Lightweight Node.js/Express server with anti-cheat mathematical sanity verification and rate limiting.

---

## 📁 Project Structure

```
Mushak's Modak Dash/
├── index.html                  # Main responsive HTML5 container & Google Fonts
├── package.json                # Dependencies and build scripts
├── tsconfig.json               # TypeScript configuration
├── vite.config.ts              # Vite bundler & API proxy configuration
├── src/
│   ├── main.ts                 # Phaser game initialization & scale configuration
│   ├── config/
│   │   └── gameConfig.ts       # Central gameplay constants (speeds, scoring, colors)
│   ├── game/
│   │   ├── scenes/
│   │   │   ├── BootScene.ts        # Texture generation entry
│   │   │   ├── PreloadScene.ts     # BAPPA BYTES animated loading screen
│   │   │   ├── MainMenuScene.ts    # Title screen with animated Mushak & navigation
│   │   │   ├── HowToPlayScene.ts   # Interactive visual instructions
│   │   │   ├── GameScene.ts        # Core endless runner loop & parallax engine
│   │   │   ├── PauseScene.ts       # Pause overlay modal
│   │   │   ├── GameOverScene.ts    # Score breakdown & leaderboard submission
│   │   │   └── LeaderboardScene.ts # Top verified scores display
│   │   ├── entities/
│   │   │   ├── Mushak.ts           # Player character with jump/slide/shield physics
│   │   │   ├── Collectible.ts      # Modak, Jumbo Modak, Durva grass entities
│   │   │   └── Obstacle.ts         # Flower Cart, Crates, Barrier, Pot, Hanging Toran
│   │   ├── systems/
│   │   │   ├── ScoreSystem.ts      # Score calculation & stat tracking
│   │   │   ├── ComboSystem.ts      # x2 / x3 multiplier state machine
│   │   │   ├── DifficultySystem.ts # Dynamic acceleration & tier progression
│   │   │   ├── AudioSystem.ts      # Web Audio synthesizer & Dhol Tasha loop
│   │   │   ├── InputSystem.ts      # Multi-platform input mapper
│   │   │   └── LeaderboardSystem.ts# Client-side API sync & offline fallback
│   │   └── ui/
│   │       └── HUD.ts              # Score, combo badges, shield bar, touch buttons
│   ├── assets/
│   │   └── assetGenerator.ts   # High-resolution vector sprite rendering
│   └── styles/
│       └── main.css            # Responsive layout & festive styles
├── server/
│   ├── server.js               # Express API server
│   ├── validator.js            # Anti-cheat physical sanity validator
│   └── leaderboardStore.js     # Top scores store
├── docs/
│   ├── HOW_TO_PLAY.md          # Detailed gameplay guide
│   └── ASSET_LICENSES.md       # Asset licensing and cultural respect statement
└── README.md
```

---

## 🚀 Getting Started Locally

### Prerequisites
- [Node.js](https://nodejs.org/) (v18+ recommended)
- `npm`

### Installation & Run
```bash
# 1. Clone repository & install dependencies
npm install

# 2. Start development frontend & backend
npm run dev

# 3. Start leaderboard backend server (in a separate terminal)
npm run server
```
Open your browser at `http://localhost:3000` to play!

### Production Build
```bash
npm run build
npm start
```

---

## 🔒 Leaderboard Security & Anti-Cheat

The game implements server-side anti-cheat verification:
1. **Mathematical Score Sanity**: Compares submitted score against maximum theoretical score:
   $$\text{Score}_{\text{max}} = \text{Distance} + (\text{Modaks} \times 10 \times 3) + (\text{JumboModaks} \times 50 \times 3)$$
2. **Kinematic Bounds Check**: Validates that distance does not exceed $\text{Duration} \times \text{MaxSpeed}$.
3. **Spawn Frequency Check**: Ensures collectible pickup rate does not exceed physical spawn rates.
4. **Rate Limiting**: Restricts submissions per IP to prevent spamming.

---

## 🏆 Contest Compliance

- [x] **Festival Centered**: Ganesh Chaturthi festive atmosphere, Dhol Tasha, Modaks, Durva, Rangoli, and illuminated pandals.
- [x] **Cultural Respect**: Lord Ganesha is respectfully depicted in the central illuminated temple sanctum and never as an obstacle or combatant.
- [x] **Cross-Platform**: Fully responsive across mobile browsers (Android/iOS) and desktop/laptop browsers.
- [x] **Zero Friction**: No forced accounts, passwords, or personal data collection.
- [x] **High Performance**: 60 FPS target with Arcade physics, object pooling, and zero asset loading latency.

---

**Team BAPPA BYTES** • *Small Steps, Big Devotion. Happy Ganesh Chaturthi!*
