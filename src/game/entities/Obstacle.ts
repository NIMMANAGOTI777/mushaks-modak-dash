import Phaser from 'phaser';

export type ObstacleType = 'FLOWER_CART' | 'CRATES' | 'BARRIER' | 'POT' | 'HANGING';

export class Obstacle extends Phaser.Physics.Arcade.Sprite {
  private obstacleType: ObstacleType = 'FLOWER_CART';

  constructor(scene: Phaser.Scene, x: number, y: number, type: ObstacleType = 'FLOWER_CART') {
    const textureKey = Obstacle.getTextureKey(type);
    super(scene, x, y, textureKey);

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.obstacleType = type;
    this.setupProperties(type);
  }

  public static getTextureKey(type: ObstacleType): string {
    switch (type) {
      case 'FLOWER_CART':
        return 'obstacle_flower_cart';
      case 'CRATES':
        return 'obstacle_crates';
      case 'BARRIER':
        return 'obstacle_barrier';
      case 'POT':
        return 'obstacle_pot';
      case 'HANGING':
        return 'obstacle_hanging';
    }
  }

  private setupProperties(type: ObstacleType): void {
    this.obstacleType = type;
    this.setTexture(Obstacle.getTextureKey(type));
    this.setOrigin(0.5, 0.9);

    const body = this.body as Phaser.Physics.Arcade.Body;
    if (!body) return;

    body.setAllowGravity(false);
    body.setImmovable(true);

    // Custom forgiving collision hitboxes per obstacle
    switch (type) {
      case 'FLOWER_CART':
        body.setSize(70, 50);
        body.setOffset(10, 20);
        break;
      case 'CRATES':
        body.setSize(52, 60);
        body.setOffset(8, 12);
        break;
      case 'BARRIER':
        body.setSize(64, 48);
        body.setOffset(8, 18);
        break;
      case 'POT':
        body.setSize(44, 48);
        body.setOffset(8, 14);
        break;
      case 'HANGING':
        // Hanging decoration hangs higher up; player must slide underneath
        this.setOrigin(0.5, 0.2);
        body.setSize(76, 36);
        body.setOffset(12, 10);
        break;
    }
  }

  public spawn(x: number, y: number, type: ObstacleType): void {
    this.setupProperties(type);
    this.setPosition(x, y);
    this.setActive(true);
    this.setVisible(true);

    const body = this.body as Phaser.Physics.Arcade.Body;
    if (body) {
      body.enable = true;
    }
  }

  public getType(): ObstacleType {
    return this.obstacleType;
  }

  public update(speed: number, delta: number): void {
    if (!this.active) return;

    this.x -= (speed * delta) / 1000;

    if (this.x < -120) {
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
