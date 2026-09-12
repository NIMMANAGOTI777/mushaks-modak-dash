import Phaser from 'phaser';
import { AssetGenerator } from '../../assets/assetGenerator';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  public preload(): void {
    // Preload the official visual asset images from the UI and UX suite
    this.load.image('ui_festive_street_bg', '/assets/ui/festive_street_bg.png');
    this.load.image('ui_mushak_logo', '/assets/ui/mushak_logo.png');
    this.load.image('ui_modak_icon', '/assets/ui/modak_icon.png');
    this.load.image('ui_durva_shield_icon', '/assets/ui/durva_shield_icon.png');
  }

  public create(): void {
    // Generate all vector textures into TextureManager
    AssetGenerator.generateAllTextures(this);
    AssetGenerator.createCleanMascotTexture(this);

    // Proceed to Preload Scene
    this.scene.start('PreloadScene');
  }
}
