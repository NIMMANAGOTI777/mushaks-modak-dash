import Phaser from 'phaser';
import { GAME_CONFIG } from '../../config/gameConfig';
import { Mushak } from '../entities/Mushak';
import { Collectible, CollectibleType } from '../entities/Collectible';
import { Obstacle, ObstacleType } from '../entities/Obstacle';
import { ScoreSystem } from '../systems/ScoreSystem';
import { ComboSystem } from '../systems/ComboSystem';
import { DifficultySystem } from '../systems/DifficultySystem';
import { AudioSystem } from '../systems/AudioSystem';
import { InputSystem } from '../systems/InputSystem';
import { HUD } from '../ui/HUD';

export class GameScene extends Phaser.Scene {
  // Entities & Systems
  private mushak!: Mushak;
  private scoreSystem!: ScoreSystem;
  private comboSystem!: ComboSystem;
  private difficultySystem!: DifficultySystem;
  private inputSystem!: InputSystem;
  private hud!: HUD;

  // Environment Parallax Layers
  private bgSky!: Phaser.GameObjects.TileSprite;
  private bgPandals!: Phaser.GameObjects.TileSprite;
  private groundStreet!: Phaser.GameObjects.TileSprite;
  private groundCollider!: Phaser.GameObjects.Rectangle;

  // Object Pools
  private collectiblesPool: Collectible[] = [];
  private obstaclesPool: Obstacle[] = [];

  // Spawning Timers
  private nextObstacleSpawnTime: number = 0;
  private nextCollectibleSpawnTime: number = 0;

  // Durva Shield State
  private shieldRemainingMs: number = 0;

  // Game Loop State
  private isGameOver: boolean = false;
  private isPaused: boolean = false;

  constructor() {
    super({ key: 'GameScene' });
  }

  public create(): void {
    const { width, height } = this.scale;
    const groundY = GAME_CONFIG.getGroundY(height, width);
    const lanes = GAME_CONFIG.getLaneXPositions(width, height);

    this.isGameOver = false;
    this.isPaused = false;
    this.shieldRemainingMs = 0;

    // 1. Initialize Systems
    this.scoreSystem = new ScoreSystem();
    this.difficultySystem = new DifficultySystem((tier) => {
      this.hud.showFloatingFeedback(width / 2, height * 0.35, `${tier} MODE!`, '#FF7A00');
    });
    this.comboSystem = new ComboSystem((mult) => {
      this.hud.updateCombo(mult);
      if (mult > 1) {
        this.hud.showFloatingFeedback(this.mushak.x, this.mushak.y - 40, `x${mult} COMBO!`, '#FFC72C');
      }
    });

    // 2. Parallax Environment (Edge-to-Edge)
    if (this.textures.exists('ui_festive_street_bg')) {
      const bg = this.add.image(width / 2, height / 2, 'ui_festive_street_bg');
      const bgScale = Math.max(width / bg.width, height / bg.height);
      bg.setScale(bgScale).setScrollFactor(0);
      this.add.rectangle(width / 2, height / 2, width, height, 0x120907, 0.35).setScrollFactor(0);
    } else {
      this.bgSky = this.add.tileSprite(0, 0, width, height, 'bg_sky').setOrigin(0, 0).setScrollFactor(0);
    }

    this.bgPandals = this.add.tileSprite(0, groundY - 260, width, 300, 'bg_pandals').setOrigin(0, 0).setScrollFactor(0);
    this.groundStreet = this.add.tileSprite(0, groundY - 20, width, 160, 'ground_street').setOrigin(0, 0).setScrollFactor(0);
    this.groundStreet.setDepth(10);

    // Invisible Ground Collider
    this.groundCollider = this.add.rectangle(width / 2, groundY + 10, width * 2, 20, 0x000000, 0);
    this.physics.add.existing(this.groundCollider, true);

    // 3. Mushak Player
    this.mushak = new Mushak(this, lanes[1], groundY - 10);
    this.mushak.setDepth(20);
    this.physics.add.collider(this.mushak, this.groundCollider);

    // 4. Object Pools
    this.initObjectPools();

    // 5. Input System
    this.inputSystem = new InputSystem(this, {
      onMoveLeft: () => this.mushak.moveLeft(),
      onMoveRight: () => this.mushak.moveRight(),
      onJump: () => this.mushak.jump(),
      onSlide: () => this.mushak.slide(),
      onPause: () => this.togglePause()
    });

    this.events.on('input-move-left', () => this.mushak.moveLeft());
    this.events.on('input-move-right', () => this.mushak.moveRight());
    this.events.on('input-jump', () => this.mushak.jump());
    this.events.on('input-slide', () => this.mushak.slide());

    // 6. HUD
    this.hud = new HUD(this, () => this.togglePause());

    // 7. Initial Spawn Timers
    const now = Date.now();
    this.nextCollectibleSpawnTime = now + 600;
    this.nextObstacleSpawnTime = now + 1800;

    // Start Festival BGM
    AudioSystem.getInstance().startBGM();

    this.scale.on('resize', this.handleResize, this);
  }

  private handleResize(gameSize: Phaser.Structs.Size): void {
    const width = gameSize.width;
    const height = gameSize.height;
    const groundY = GAME_CONFIG.getGroundY(height, width);

    if (this.bgSky) this.bgSky.setSize(width, height);
    if (this.bgPandals) {
      this.bgPandals.setSize(width, 300);
      this.bgPandals.y = groundY - 260;
    }
    if (this.groundStreet) {
      this.groundStreet.setSize(width, 160);
      this.groundStreet.y = groundY - 20;
    }
    if (this.groundCollider) {
      this.groundCollider.setPosition(width / 2, groundY + 10);
      this.groundCollider.setSize(width * 2, 20);
    }
  }

  private initObjectPools(): void {
    this.collectiblesPool = [];
    for (let i = 0; i < 20; i++) {
      const c = new Collectible(this, -100, -100, 'MODAK');
      c.deactivate();
      c.setDepth(15);
      this.collectiblesPool.push(c);
      this.physics.add.overlap(this.mushak, c, () => this.handleCollectibleOverlap(c));
    }

    this.obstaclesPool = [];
    const obsTypes: ObstacleType[] = ['FLOWER_CART', 'CRATES', 'BARRIER', 'POT', 'HANGING'];
    for (let i = 0; i < 15; i++) {
      const type = obsTypes[i % obsTypes.length];
      const o = new Obstacle(this, -100, -100, type);
      o.deactivate();
      o.setDepth(18);
      this.physics.add.overlap(this.mushak, o, () => this.handleObstacleOverlap(o));
    }
  }

  // ==========================================
  // UPDATE LOOP
  // ==========================================
  public update(time: number, delta: number): void {
    if (this.isGameOver || this.isPaused) return;

    const deltaSec = delta / 1000;

    // Update Difficulty & Running Speed
    this.difficultySystem.update(deltaSec);
    const speed = this.difficultySystem.getSpeed();

    // Parallax Scrolling
    if (this.bgSky) {
      this.bgSky.tilePositionX += speed * 0.08 * deltaSec;
    }
    this.bgPandals.tilePositionX += speed * 0.25 * deltaSec;
    this.groundStreet.tilePositionX += speed * 1.0 * deltaSec;

    // Player Update
    this.mushak.update();

    // Distance & Score Update
    const distanceDelta = (speed * deltaSec) * 0.1;
    this.scoreSystem.updateDistance(distanceDelta);
    this.hud.updateScore(this.scoreSystem.getScore(), this.scoreSystem.getDistance());

    // Combo System Update
    this.comboSystem.update();

    // Durva Shield Countdown
    if (this.shieldRemainingMs > 0) {
      this.shieldRemainingMs = Math.max(0, this.shieldRemainingMs - delta);
      this.hud.updateShield(this.shieldRemainingMs / 1000, GAME_CONFIG.SHIELD_DURATION_MS / 1000);
      if (this.shieldRemainingMs === 0) {
        this.mushak.deactivateShield();
      }
    }

    // Update Active Collectibles & Obstacles
    this.collectiblesPool.forEach((c) => c.update(speed, delta));
    this.obstaclesPool.forEach((o) => o.update(speed, delta));

    // Spawning Logic
    const now = Date.now();
    if (now >= this.nextCollectibleSpawnTime) {
      this.spawnCollectiblePattern();
      this.nextCollectibleSpawnTime = now + this.difficultySystem.getCollectibleSpawnIntervalMs();
    }

    if (now >= this.nextObstacleSpawnTime) {
      this.spawnObstaclePattern();
      this.nextObstacleSpawnTime = now + this.difficultySystem.getObstacleSpawnIntervalMs();
    }
  }

  // ==========================================
  // SPAWNING PATTERNS
  // ==========================================
  private spawnCollectiblePattern(): void {
    const spawnX = this.scale.width + 80;
    const groundY = GAME_CONFIG.getGroundY(this.scale.height, this.scale.width);

    const roll = Math.random();
    let type: CollectibleType = 'MODAK';
    if (roll < 0.12) {
      type = 'DURVA';
    } else if (roll < 0.35) {
      type = 'JUMBO_MODAK';
    }

    const isAirborne = Math.random() < 0.25;
    const spawnY = isAirborne ? groundY - 100 : groundY - 25;

    this.spawnSingleCollectible(spawnX, spawnY, type);

    if (type === 'MODAK' && Math.random() < 0.5) {
      this.spawnSingleCollectible(spawnX + 90, spawnY, 'MODAK');
      this.spawnSingleCollectible(spawnX + 180, spawnY, 'MODAK');
    }
  }

  private spawnSingleCollectible(x: number, y: number, type: CollectibleType): void {
    const collectible = this.collectiblesPool.find((c) => !c.active);
    if (collectible) {
      collectible.spawn(x, y, type);
    }
  }

  private spawnObstaclePattern(): void {
    const spawnX = this.scale.width + 100;
    const groundY = GAME_CONFIG.getGroundY(this.scale.height, this.scale.width);
    const tier = this.difficultySystem.getDifficulty();

    const obsTypes: ObstacleType[] = ['FLOWER_CART', 'CRATES', 'BARRIER', 'POT', 'HANGING'];
    const chosenType = Phaser.Utils.Array.GetRandom(obsTypes);

    let spawnY = groundY - 10;
    if (chosenType === 'HANGING') {
      spawnY = groundY - 110;
    }

    const obstacle = this.obstaclesPool.find((o) => !o.active);
    if (obstacle) {
      obstacle.spawn(spawnX, spawnY, chosenType);
    }

    if (tier === 'HARD' && Math.random() < 0.45) {
      const secondType = chosenType === 'HANGING' ? 'POT' : 'HANGING';
      const secondY = secondType === 'HANGING' ? groundY - 110 : groundY - 10;
      const secondObs = this.obstaclesPool.find((o) => !o.active && o !== obstacle);
      if (secondObs) {
        this.time.delayedCall(450, () => {
          if (!this.isGameOver && !this.isPaused) {
            secondObs.spawn(this.scale.width + 120, secondY, secondType);
          }
        });
      }
    }
  }

  // ==========================================
  // COLLISIONS & OVERLAPS
  // ==========================================
  private handleCollectibleOverlap(collectible: Collectible): void {
    if (!collectible.active || this.isGameOver) return;

    const type = collectible.getType();
    const x = collectible.x;
    const y = collectible.y;

    collectible.deactivate();

    if (type === 'MODAK') {
      const mult = this.comboSystem.registerModakCollect();
      const pts = this.scoreSystem.addRegularModak(mult);
      AudioSystem.getInstance().playModakCollect();
      this.hud.showFloatingFeedback(x, y, `+${pts}`, '#FFC72C');
      this.emitParticleBurst(x, y, 'particle_gold', 8);
    } else if (type === 'JUMBO_MODAK') {
      const mult = this.comboSystem.registerModakCollect();
      const pts = this.scoreSystem.addJumboModak(mult);
      AudioSystem.getInstance().playJumboModakCollect();
      this.hud.showFloatingFeedback(x, y, `+${pts} JUMBO!`, '#FF7A00');
      this.emitParticleBurst(x, y, 'particle_gold', 16);
    } else if (type === 'DURVA') {
      this.scoreSystem.addDurva();
      this.shieldRemainingMs = GAME_CONFIG.SHIELD_DURATION_MS;
      this.mushak.activateShield();
      AudioSystem.getInstance().playDurvaShield();
      this.hud.showFloatingFeedback(x, y, 'DURVA SHIELD! 🛡️', '#88D982');
      this.emitParticleBurst(x, y, 'particle_leaf', 14);
    }
  }

  private handleObstacleOverlap(obstacle: Obstacle): void {
    if (!obstacle.active || this.isGameOver || this.mushak.getIsInvulnerable()) return;

    if (obstacle.getType() === 'HANGING') {
      if (this.mushak.getMushakState() === 'SLIDE') {
        return;
      }
    }

    if (this.mushak.isShieldActive()) {
      this.shieldRemainingMs = 0;
      this.mushak.deactivateShield();
      this.mushak.triggerHitInvulnerability();
      this.comboSystem.reset();
      obstacle.deactivate();
      AudioSystem.getInstance().playObstacleHit(true);
      this.hud.showFloatingFeedback(this.mushak.x, this.mushak.y - 50, 'SHIELD ABSORBED! 🛡️', '#88D982');
      this.cameras.main.shake(150, 0.008);
      this.emitParticleBurst(this.mushak.x, this.mushak.y, 'particle_dust', 10);
      return;
    }

    this.triggerGameOver();
  }

  private emitParticleBurst(x: number, y: number, texture: string, count: number): void {
    for (let i = 0; i < count; i++) {
      const p = this.add.sprite(x, y, texture);
      p.setDepth(50);
      const angle = Math.random() * Math.PI * 2;
      const speed = 60 + Math.random() * 120;
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed;

      this.tweens.add({
        targets: p,
        x: x + vx * 0.4,
        y: y + vy * 0.4,
        alpha: 0,
        scale: 0.2,
        duration: 450,
        ease: 'Cubic.easeOut',
        onComplete: () => p.destroy()
      });
    }
  }

  private triggerGameOver(): void {
    this.isGameOver = true;
    this.mushak.kill();
    this.cameras.main.shake(250, 0.015);
    AudioSystem.getInstance().playObstacleHit(false);
    AudioSystem.getInstance().playGameOver();
    AudioSystem.getInstance().stopBGM();

    this.time.delayedCall(750, () => {
      const stats = this.scoreSystem.getBreakdown();
      this.scene.start('GameOverScene', { stats });
    });
  }

  public togglePause(): void {
    if (this.isGameOver) return;
    this.isPaused = !this.isPaused;

    if (this.isPaused) {
      AudioSystem.getInstance().pauseBGM();
      this.scene.pause();
      this.scene.launch('PauseScene');
    }
  }

  public shutdown(): void {
    this.scale.off('resize', this.handleResize, this);
  }
}
