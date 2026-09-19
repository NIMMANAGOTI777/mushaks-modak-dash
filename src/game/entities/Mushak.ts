import Phaser from 'phaser';
import { GAME_CONFIG } from '../../config/gameConfig';
import { AudioSystem } from '../systems/AudioSystem';

export type MushakState = 'RUN' | 'JUMP' | 'SLIDE' | 'DEAD';

export class Mushak extends Phaser.Physics.Arcade.Sprite {
  private currentLaneIndex: number = 1; // 0 = Left, 1 = Center, 2 = Right
  private targetX: number = 0;
  private mushakState: MushakState = 'RUN';
  private slideTimer?: Phaser.Time.TimerEvent;
  private hasShield: boolean = false;
  private shieldSprite?: Phaser.GameObjects.Sprite;
  private isInvulnerable: boolean = false;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'mushak_run_0');
    scene.add.existing(this);
    scene.physics.add.existing(this);

    const isMobile = GAME_CONFIG.isMobilePortrait(scene.scale.width, scene.scale.height);
    this.setScale(isMobile ? 1.22 : 1.0);

    this.targetX = x;
    this.setOrigin(0.5, 0.85);
    this.setCollideWorldBounds(true);
    this.setGravityY(GAME_CONFIG.GRAVITY);

    this.setupRunHitbox();

    // Shield Aura GameObject
    this.shieldSprite = scene.add.sprite(this.x, this.y - 20, 'shield_aura');
    this.shieldSprite.setScale(isMobile ? 1.22 : 1.0);
    this.shieldSprite.setVisible(false);
    this.shieldSprite.setDepth(this.depth + 1);

    this.setupAnimations();
    this.playRunAnimation();
  }

  private setupAnimations(): void {
    if (!this.scene.anims.exists('mushak_run_anim')) {
      this.scene.anims.create({
        key: 'mushak_run_anim',
        frames: [
          { key: 'mushak_run_0' },
          { key: 'mushak_run_1' },
          { key: 'mushak_run_2' },
          { key: 'mushak_run_3' }
        ],
        frameRate: 10,
        repeat: -1
      });
    }
  }

  private setupRunHitbox(): void {
    const isMobile = GAME_CONFIG.isMobilePortrait(this.scene.scale.width, this.scene.scale.height);
    const body = this.body as Phaser.Physics.Arcade.Body;
    if (body) {
      if (isMobile) {
        body.setSize(48, 62);
        body.setOffset(26, 20);
      } else {
        body.setSize(44, 58);
        body.setOffset(28, 22);
      }
    }
  }

  private setupSlideHitbox(): void {
    const isMobile = GAME_CONFIG.isMobilePortrait(this.scene.scale.width, this.scene.scale.height);
    const body = this.body as Phaser.Physics.Arcade.Body;
    if (body) {
      if (isMobile) {
        body.setSize(58, 32);
        body.setOffset(22, 26);
      } else {
        body.setSize(54, 28);
        body.setOffset(24, 26);
      }
    }
  }

  public moveLeft(): void {
    if (this.mushakState === 'DEAD') return;
    if (this.currentLaneIndex > 0) {
      this.currentLaneIndex -= 1;
      const lanes = GAME_CONFIG.getLaneXPositions(this.scene.scale.width, this.scene.scale.height);
      this.targetX = lanes[this.currentLaneIndex];
      AudioSystem.getInstance().playSlide();
    }
  }

  public moveRight(): void {
    if (this.mushakState === 'DEAD') return;
    const lanes = GAME_CONFIG.getLaneXPositions(this.scene.scale.width, this.scene.scale.height);
    if (this.currentLaneIndex < lanes.length - 1) {
      this.currentLaneIndex += 1;
      this.targetX = lanes[this.currentLaneIndex];
      AudioSystem.getInstance().playSlide();
    }
  }

  public jump(): void {
    if (this.mushakState === 'DEAD') return;
    const body = this.body as Phaser.Physics.Arcade.Body;
    const groundY = GAME_CONFIG.getGroundY(this.scene.scale.height, this.scene.scale.width);
    if (body.blocked.down || body.touching.down || this.y >= groundY - 5) {
      if (this.slideTimer) {
        this.slideTimer.remove();
        this.slideTimer = undefined;
      }
      this.setupRunHitbox();
      this.mushakState = 'JUMP';
      this.setTexture('mushak_jump');
      this.stop();
      this.setVelocityY(GAME_CONFIG.JUMP_FORCE);
      AudioSystem.getInstance().playJump();
    }
  }

  public slide(): void {
    if (this.mushakState === 'DEAD') return;
    const body = this.body as Phaser.Physics.Arcade.Body;
    const groundY = GAME_CONFIG.getGroundY(this.scene.scale.height);

    if (!body.blocked.down && !body.touching.down && this.y < groundY - 10) {
      this.setVelocityY(750);
    }

    if (this.mushakState === 'SLIDE') return;

    this.mushakState = 'SLIDE';
    this.setTexture('mushak_slide');
    this.stop();
    this.setupSlideHitbox();
    AudioSystem.getInstance().playSlide();

    if (this.slideTimer) {
      this.slideTimer.remove();
    }

    this.slideTimer = this.scene.time.delayedCall(GAME_CONFIG.SLIDE_DURATION, () => {
      if (this.mushakState === 'SLIDE') {
        this.mushakState = 'RUN';
        this.setupRunHitbox();
        this.playRunAnimation();
      }
    });
  }

  public playRunAnimation(): void {
    if (this.mushakState === 'DEAD') return;
    this.play('mushak_run_anim', true);
  }

  public activateShield(): void {
    this.hasShield = true;
    if (this.shieldSprite) {
      this.shieldSprite.setVisible(true);
    }
  }

  public deactivateShield(): void {
    this.hasShield = false;
    if (this.shieldSprite) {
      this.shieldSprite.setVisible(false);
    }
  }

  public isShieldActive(): boolean {
    return this.hasShield;
  }

  public triggerHitInvulnerability(): void {
    this.isInvulnerable = true;
    this.scene.tweens.add({
      targets: this,
      alpha: 0.3,
      duration: 120,
      yoyo: true,
      repeat: 4,
      onComplete: () => {
        this.setAlpha(1.0);
        this.isInvulnerable = false;
      }
    });
  }

  public getIsInvulnerable(): boolean {
    return this.isInvulnerable;
  }

  public kill(): void {
    this.mushakState = 'DEAD';
    this.deactivateShield();
    this.stop();
    this.setTexture('mushak_idle');
    this.setVelocity(0, 0);
    const body = this.body as Phaser.Physics.Arcade.Body;
    if (body) {
      body.setAllowGravity(false);
    }
  }

  public getMushakState(): MushakState {
    return this.mushakState;
  }

  public update(): void {
    const body = this.body as Phaser.Physics.Arcade.Body;
    const groundY = GAME_CONFIG.getGroundY(this.scene.scale.height, this.scene.scale.width);

    // Keep targetX synced on window resize
    const lanes = GAME_CONFIG.getLaneXPositions(this.scene.scale.width, this.scene.scale.height);
    this.targetX = lanes[this.currentLaneIndex];

    if (Math.abs(this.x - this.targetX) > 2) {
      this.x = Phaser.Math.Linear(this.x, this.targetX, 0.22);
    } else {
      this.x = this.targetX;
    }

    // Land detection
    if (this.mushakState === 'JUMP') {
      if ((body.blocked.down || body.touching.down || this.y >= groundY - 5) && body.velocity.y >= 0) {
        this.mushakState = 'RUN';
        this.setupRunHitbox();
        this.playRunAnimation();
      }
    }

    // Sync Shield position
    if (this.shieldSprite && this.shieldSprite.visible) {
      this.shieldSprite.setPosition(this.x, this.y - 24);
      this.shieldSprite.angle += 2;
    }
  }

  public destroy(fromScene?: boolean): void {
    if (this.slideTimer) {
      this.slideTimer.remove();
    }
    if (this.shieldSprite) {
      this.shieldSprite.destroy();
    }
    super.destroy(fromScene);
  }
}
