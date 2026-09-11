import Phaser from 'phaser';

export type CollectibleType = 'MODAK' | 'JUMBO_MODAK' | 'DURVA';

export class Collectible extends Phaser.Physics.Arcade.Sprite {
  private collectibleType: CollectibleType = 'MODAK';
  private bobOffset: number = 0;
  private baseY: number = 0;

  constructor(scene: Phaser.Scene, x: number, y: number, type: CollectibleType = 'MODAK') {
    const textureKey = type === 'MODAK' ? 'modak' : type === 'JUMBO_MODAK' ? 'jumbo_modak' : 'durva';
    super(scene, x, y, textureKey);

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.collectibleType = type;
    this.baseY = y;
    this.bobOffset = Math.random() * Math.PI * 2;

    this.setOrigin(0.5, 0.5);
    const body = this.body as Phaser.Physics.Arcade.Body;
    if (body) {
      body.setAllowGravity(false);
      body.setImmovable(true);
      if (type === 'JUMBO_MODAK') {
        body.setSize(54, 54);
      } else {
        body.setSize(40, 44);
      }
    }
  }

  public spawn(x: number, y: number, type: CollectibleType): void {
    this.collectibleType = type;
    const textureKey = type === 'MODAK' ? 'modak' : type === 'JUMBO_MODAK' ? 'jumbo_modak' : 'durva';
    this.setTexture(textureKey);
    this.setPosition(x, y);
    this.baseY = y;
    this.setActive(true);
    this.setVisible(true);
    this.setAlpha(1.0);
    this.setScale(1.0);

    const body = this.body as Phaser.Physics.Arcade.Body;
    if (body) {
      body.enable = true;
      if (type === 'JUMBO_MODAK') {
        body.setSize(54, 54);
      } else {
        body.setSize(40, 44);
      }
    }
  }

  public getType(): CollectibleType {
    return this.collectibleType;
  }

  public update(speed: number, delta: number): void {
    if (!this.active) return;

    // Move leftwards with current run speed
    this.x -= (speed * delta) / 1000;

    // Gentle hover bobbing
    this.bobOffset += delta * 0.005;
    this.y = this.baseY + Math.sin(this.bobOffset) * 6;

    // Deactivate when past left edge of screen
    if (this.x < -80) {
      this.deactivate();
    }
  }

  public deactivate(): void {
    this.setActive(false);
    this.setVisible(false);
    const body = this.body as Phaser.Physics.Arcade.Body;
    if (body) {
      body.enable = false;
    }
  }
}
