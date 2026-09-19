import Phaser from 'phaser';
import { BootScene } from './game/scenes/BootScene';
import { PreloadScene } from './game/scenes/PreloadScene';
import { MainMenuScene } from './game/scenes/MainMenuScene';
import { HowToPlayScene } from './game/scenes/HowToPlayScene';
import { GameScene } from './game/scenes/GameScene';
import { PauseScene } from './game/scenes/PauseScene';
import { GameOverScene } from './game/scenes/GameOverScene';
import { LeaderboardScene } from './game/scenes/LeaderboardScene';

const urlParams = new URLSearchParams(window.location.search);
const reqW = parseInt(urlParams.get('w') || '0', 10);
const reqH = parseInt(urlParams.get('h') || '0', 10);

const hasExplicitDimensions = reqW > 0 && reqH > 0;
const initWidth = hasExplicitDimensions ? reqW : window.innerWidth;
const initHeight = hasExplicitDimensions ? reqH : window.innerHeight;

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'game-container',
  width: initWidth,
  height: initHeight,
  scale: {
    mode: hasExplicitDimensions ? Phaser.Scale.FIT : Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: initWidth,
    height: initHeight
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
  if (hasExplicitDimensions) {
    const appContainer = document.getElementById('app-container');
    const gameContainer = document.getElementById('game-container');
    if (appContainer) {
      appContainer.style.width = '100vw';
      appContainer.style.height = '100vh';
      appContainer.style.maxWidth = '100vw';
      appContainer.style.maxHeight = '100vh';
      appContainer.style.display = 'flex';
      appContainer.style.justifyContent = 'center';
      appContainer.style.alignItems = 'center';
    }
    if (gameContainer) {
      gameContainer.style.width = '100%';
      gameContainer.style.height = '100%';
      gameContainer.style.display = 'flex';
      gameContainer.style.justifyContent = 'center';
      gameContainer.style.alignItems = 'center';
    }
  }

  // Ensure Epilogue & Plus Jakarta Sans Google Fonts are loaded prior to game render
  if (document.fonts) {
    try {
      await document.fonts.ready;
    } catch {
      // fallback
    }
  }
  const game = new Phaser.Game(config);
  (window as any).__PHASER_GAME__ = game;
  (window as any).goToScene = (sceneName: string, data?: any) => {
    const activeScenes = game.scene.getScenes(true);
    activeScenes.forEach(s => s.scene.stop());
    game.scene.start(sceneName, data);
  };
  (window as any).setMobileViewport = (w: number, h: number) => {
    const appContainer = document.getElementById('app-container');
    const gameContainer = document.getElementById('game-container');
    if (appContainer) {
      appContainer.style.width = `${w}px`;
      appContainer.style.height = `${h}px`;
      appContainer.style.maxWidth = `${w}px`;
      appContainer.style.maxHeight = `${h}px`;
      appContainer.style.margin = '0 auto';
    }
    if (gameContainer) {
      gameContainer.style.width = `${w}px`;
      gameContainer.style.height = `${h}px`;
    }
    game.scale.resize(w, h);
  };
}

window.addEventListener('DOMContentLoaded', initApp);
