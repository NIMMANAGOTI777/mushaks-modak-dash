import Phaser from 'phaser';
import { BootScene } from './game/scenes/BootScene';
import { PreloadScene } from './game/scenes/PreloadScene';
import { MainMenuScene } from './game/scenes/MainMenuScene';
import { HowToPlayScene } from './game/scenes/HowToPlayScene';
import { GameScene } from './game/scenes/GameScene';
import { PauseScene } from './game/scenes/PauseScene';
import { GameOverScene } from './game/scenes/GameOverScene';
import { LeaderboardScene } from './game/scenes/LeaderboardScene';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'game-container',
  width: window.innerWidth,
  height: window.innerHeight,
  scale: {
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: '100%',
    height: '100%'
  },
  backgroundColor: '#120907',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 0 },
      debug: false
    }
  },
  scene: [
    BootScene,
    PreloadScene,
    MainMenuScene,
    HowToPlayScene,
    GameScene,
    PauseScene,
    GameOverScene,
    LeaderboardScene
  ]
};

async function initApp() {
  // Ensure Epilogue & Plus Jakarta Sans Google Fonts are loaded prior to game render
  if (document.fonts) {
    try {
      await document.fonts.ready;
    } catch {
      // fallback
    }
  }
  new Phaser.Game(config);
}

window.addEventListener('DOMContentLoaded', initApp);
