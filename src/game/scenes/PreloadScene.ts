import Phaser from 'phaser';

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super({ key: 'PreloadScene' });
  }

  public create(): void {
    const { width, height } = this.scale;

    // 1. Festive Street Background with Vignette Overlay
    if (this.textures.exists('ui_festive_street_bg')) {
      const bg = this.add.image(width / 2, height / 2, 'ui_festive_street_bg');
      bg.setDisplaySize(width, height);
    } else {
      this.add.image(width / 2, height / 2, 'bg_sky').setDisplaySize(width, height);
    }

    const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x1a0a05, 0.72);

    // 2. Top Header Bar (Phaser 3.80 WebGL Runner)
    const topBar = this.add.container(0, 0);
    const badgeText = this.add.text(32, 24, '● Phaser 3.80 WebGL Runner', {
      fontFamily: '"Plus Jakarta Sans", sans-serif',
      fontSize: '12px',
      color: '#88D982',
      fontStyle: '600'
    });
    const resText = this.add.text(width - 32, 24, '1080 x 1920 (Scaled 16:9)', {
      fontFamily: '"Plus Jakarta Sans", sans-serif',
      fontSize: '12px',
      color: '#FFC72C',
      fontStyle: '700'
    }).setOrigin(1, 0);
    topBar.add([badgeText, resText]);

    // 3. Center Halo & Emblem
    const centerContainer = this.add.container(width / 2, height * 0.42);

    // Golden ambient blur halo
    const glowCircle = this.add.circle(0, 0, 75, 0xffc72c, 0.22);
    this.tweens.add({
      targets: glowCircle,
      scale: { from: 0.9, to: 1.15 },
      alpha: { from: 0.2, to: 0.35 },
      duration: 1200,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    const emblemBg = this.add.circle(0, 0, 60, 0x39251d, 0.95);
    emblemBg.setStrokeStyle(3, 0xffc72c);

    // Animated Mushak Runner Sprite in Center
    const loaderMushak = this.add.sprite(0, 4, 'mushak_run_0').setScale(1.3);
    if (!this.anims.exists('preload_mushak_run')) {
      this.anims.create({
        key: 'preload_mushak_run',
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
    loaderMushak.play('preload_mushak_run');

    // Title & Studio Subtitle
    const title = this.add.text(0, 84, "MUSHAK'S MODAK DASH", {
      fontFamily: '"Epilogue", sans-serif',
      fontSize: '34px',
      color: '#FFC72C',
      fontStyle: '900',
      stroke: '#120907',
      strokeThickness: 5
    }).setOrigin(0.5);

    const subtitle = this.add.text(0, 118, 'BAPPA BYTES ARCADE STUDIO', {
      fontFamily: '"Epilogue", sans-serif',
      fontSize: '13px',
      color: '#FFB68B',
      fontStyle: '700',
      letterSpacing: 2
    }).setOrigin(0.5);

    centerContainer.add([glowCircle, emblemBg, loaderMushak, title, subtitle]);

    // 4. Loading Progress Bar & Status (Screen 01)
    const barWidth = 380;
    const barHeight = 14;
    const barX = width / 2 - barWidth / 2;
    const barY = height * 0.78;

    // Status label row
    const statusText = this.add.text(barX, barY - 18, '🥟 Boiling Mawa & Saffron...', {
      fontFamily: '"Plus Jakarta Sans", sans-serif',
      fontSize: '13px',
      color: '#FFC72C',
      fontStyle: '600'
    });

    const percentText = this.add.text(barX + barWidth, barY - 18, '0%', {
      fontFamily: '"Epilogue", sans-serif',
      fontSize: '13px',
      color: '#FFC72C',
      fontStyle: '800'
    }).setOrigin(1, 0);

    const barBg = this.add.rectangle(barX, barY, barWidth, barHeight, 0x291710, 0.95);
    barBg.setOrigin(0, 0.5);
    barBg.setStrokeStyle(2, 0x584235);

    const barFill = this.add.rectangle(barX + 2, barY, 0, barHeight - 4, 0xff7a00);
    barFill.setOrigin(0, 0.5);

    const tipText = this.add.text(width / 2, barY + 26, 'Touch anywhere or press SPACE to dash once loaded', {
      fontFamily: '"Plus Jakarta Sans", sans-serif',
      fontSize: '12px',
      color: '#E0C0AF'
    }).setOrigin(0.5);

    // Smooth Progress Tween
    this.tweens.add({
      targets: barFill,
      width: barWidth - 4,
      duration: 1300,
      ease: 'Sine.easeInOut',
      onUpdate: (tween) => {
        const pct = Math.floor(tween.progress * 100);
        percentText.setText(`${pct}%`);
        if (pct > 60) {
          statusText.setText('✨ Offering Prasad to Lord Ganesha...');
        }
      },
      onComplete: () => {
        percentText.setText('100%');
        statusText.setText('🎉 Ready to Dash!');
        const urlParams = new URLSearchParams(window.location.search);
        const targetScene = urlParams.get('scene') || 'MainMenuScene';
        this.time.delayedCall(300, () => {
          if (targetScene === 'GameOverScene') {
            this.scene.start('GameOverScene', {
              stats: {
                score: 3450,
                distance: 480,
                regularModaks: 24,
                jumboModaks: 4,
                durvaCollected: 2,
                maxCombo: 3,
                playTimeSeconds: 45
              }
            });
          } else {
            this.scene.start(targetScene);
          }
        });
      }
    });
  }
}
