import Phaser from 'phaser';
import { GAME_CONFIG } from '../config/gameConfig';

/**
 * Generates all game textures procedurally using HTML5 Canvas 2D
 * precisely matching the approved "UI and UX" Master Design System (DESIGN.md).
 */
export class AssetGenerator {
  public static generateAllTextures(scene: Phaser.Scene): void {
    this.createMushakSprites(scene);
    this.createCollectibleSprites(scene);
    this.createObstacleSprites(scene);
    this.createEnvironmentTextures(scene);
    this.createUITextures(scene);
    this.createVFXTextures(scene);
  }

  // ==========================================
  // 1. MUSHAK SPRITES
  // ==========================================
  private static createMushakSprites(scene: Phaser.Scene): void {
    // 1.1 Mushak Idle
    this.drawCanvasTexture(scene, 'mushak_idle', 100, 90, (ctx) => {
      this.drawMushakBody(ctx, 50, 50, 0, 0, 'idle');
    });

    // 1.2 Mushak Run Animation (4 frames)
    for (let f = 0; f < 4; f++) {
      this.drawCanvasTexture(scene, `mushak_run_${f}`, 100, 90, (ctx) => {
        const legOffset = Math.sin((f / 4) * Math.PI * 2) * 8;
        const bobOffset = Math.abs(Math.sin((f / 4) * Math.PI * 2)) * 4;
        this.drawMushakBody(ctx, 50, 50 - bobOffset, legOffset, f, 'run');
      });
    }

    // 1.3 Mushak Jump
    this.drawCanvasTexture(scene, 'mushak_jump', 100, 90, (ctx) => {
      this.drawMushakBody(ctx, 50, 45, 0, 0, 'jump');
    });

    // 1.4 Mushak Slide / Duck
    this.drawCanvasTexture(scene, 'mushak_slide', 110, 55, (ctx) => {
      this.drawMushakBody(ctx, 55, 38, 0, 0, 'slide');
    });
  }

  private static drawMushakBody(
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    legOffset: number,
    frame: number,
    state: 'idle' | 'run' | 'jump' | 'slide'
  ): void {
    ctx.save();
    ctx.translate(cx, cy);

    const isSlide = state === 'slide';
    const isJump = state === 'jump';

    // Tail (curled cute mouse tail)
    ctx.beginPath();
    ctx.strokeStyle = '#E0A0A0';
    ctx.lineWidth = 3.5;
    ctx.lineCap = 'round';
    if (isSlide) {
      ctx.moveTo(-35, 5);
      ctx.quadraticCurveTo(-50, -5, -45, -15);
    } else {
      const tailSway = Math.sin(frame * 1.5) * 5;
      ctx.moveTo(-28, 5);
      ctx.quadraticCurveTo(-45, -5 + tailSway, -38, -25 + tailSway);
    }
    ctx.stroke();

    // Back Foot/Leg
    ctx.fillStyle = '#FEDBCF';
    if (isSlide) {
      ctx.beginPath();
      ctx.ellipse(-20, 10, 10, 4, -0.2, 0, Math.PI * 2);
      ctx.fill();
    } else if (isJump) {
      ctx.beginPath();
      ctx.ellipse(-15, 12, 6, 12, 0.4, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.beginPath();
      ctx.ellipse(-12 - legOffset * 0.5, 18, 9, 6, 0.1, 0, Math.PI * 2);
      ctx.fill();
    }

    // Body (Warm slate/charcoal mouse)
    ctx.beginPath();
    ctx.fillStyle = '#5A463F';
    if (isSlide) {
      ctx.ellipse(-5, 0, 32, 14, 0.05, 0, Math.PI * 2);
    } else {
      ctx.ellipse(-5, 2, 22, 18, 0.1, 0, Math.PI * 2);
    }
    ctx.fill();

    // Royal Yellow/Gold Festive Dhoti / Scarf
    ctx.beginPath();
    ctx.fillStyle = '#FFC72C';
    if (isSlide) {
      ctx.ellipse(-8, 3, 18, 10, 0, 0, Math.PI * 2);
    } else {
      ctx.ellipse(-8, 6, 16, 12, 0.1, 0, Math.PI * 2);
    }
    ctx.fill();
    ctx.strokeStyle = '#E0AC00';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Golden Scarf Tails Fluttering behind
    ctx.beginPath();
    ctx.fillStyle = '#FF7A00';
    if (isSlide) {
      ctx.moveTo(-22, -2);
      ctx.lineTo(-40, -10);
      ctx.lineTo(-35, -4);
      ctx.lineTo(-42, 2);
      ctx.closePath();
    } else {
      const flutter = Math.sin(frame * 2) * 4;
      ctx.moveTo(-18, 0);
      ctx.lineTo(-36, -8 + flutter);
      ctx.lineTo(-30, -2 + flutter);
      ctx.lineTo(-38, 6 + flutter);
      ctx.closePath();
    }
    ctx.fill();

    // Front Leg / Foot
    ctx.fillStyle = '#FEDBCF';
    if (isSlide) {
      ctx.beginPath();
      ctx.ellipse(15, 8, 12, 4, 0.1, 0, Math.PI * 2);
      ctx.fill();
    } else if (isJump) {
      ctx.beginPath();
      ctx.ellipse(12, 10, 7, 10, -0.3, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.beginPath();
      ctx.ellipse(8 + legOffset, 19, 10, 6, -0.1, 0, Math.PI * 2);
      ctx.fill();
    }

    // Head
    ctx.beginPath();
    ctx.fillStyle = '#6E574E';
    const headX = isSlide ? 18 : 12;
    const headY = isSlide ? -4 : -8;
    ctx.ellipse(headX, headY, 16, 14, 0.15, 0, Math.PI * 2);
    ctx.fill();

    // Snout
    ctx.beginPath();
    ctx.fillStyle = '#836A5F';
    ctx.ellipse(headX + 12, headY + 3, 9, 6, 0.2, 0, Math.PI * 2);
    ctx.fill();

    // Pink Nose
    ctx.beginPath();
    ctx.fillStyle = '#FFB4AB';
    ctx.arc(headX + 20, headY + 3, 3.5, 0, Math.PI * 2);
    ctx.fill();

    // Whiskers
    ctx.strokeStyle = '#FFF8E7';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(headX + 16, headY + 2);
    ctx.lineTo(headX + 28, headY - 1);
    ctx.moveTo(headX + 16, headY + 4);
    ctx.lineTo(headX + 28, headY + 7);
    ctx.stroke();

    // Big Cute Eye
    ctx.beginPath();
    ctx.fillStyle = '#120907';
    ctx.ellipse(headX + 5, headY - 2, 4, 5.5, 0.1, 0, Math.PI * 2);
    ctx.fill();

    // Eye Highlight (Sparkle)
    ctx.beginPath();
    ctx.fillStyle = '#FFFFFF';
    ctx.arc(headX + 6.5, headY - 4, 1.8, 0, Math.PI * 2);
    ctx.arc(headX + 4.5, headY - 1, 1, 0, Math.PI * 2);
    ctx.fill();

    // Ears
    // Left/Far Ear
    ctx.beginPath();
    ctx.fillStyle = '#5A463F';
    ctx.arc(headX - 6, headY - 15, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.fillStyle = '#FEDBCF';
    ctx.arc(headX - 6, headY - 15, 6, 0, Math.PI * 2);
    ctx.fill();

    // Right/Near Ear
    ctx.beginPath();
    ctx.fillStyle = '#6E574E';
    ctx.arc(headX + 2, headY - 14, 11, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.fillStyle = '#FEDBCF';
    ctx.arc(headX + 2, headY - 14, 7, 0, Math.PI * 2);
    ctx.fill();

    // Sacred Tilak & Chandan on Forehead
    ctx.beginPath();
    ctx.fillStyle = '#D32F2F';
    ctx.ellipse(headX + 8, headY - 8, 1.5, 3.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.fillStyle = '#FFC72C';
    ctx.arc(headX + 8, headY - 5, 1.2, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  // ==========================================
  // 2. COLLECTIBLES & POWER-UPS
  // ==========================================
  private static createCollectibleSprites(scene: Phaser.Scene): void {
    // 2.1 Regular Modak (White/Ivory Steamed)
    this.drawCanvasTexture(scene, 'modak', 54, 58, (ctx) => {
      ctx.translate(27, 30);
      this.drawSingleModak(ctx, '#FFF8E7', '#F5E6CC', '#D4BA96', '#FF7A00', 1.0);
    });

    // 2.2 Jumbo Modak (Golden/Saffron Shimmering)
    this.drawCanvasTexture(scene, 'jumbo_modak', 70, 74, (ctx) => {
      ctx.translate(35, 38);
      const glow = ctx.createRadialGradient(0, 0, 10, 0, 0, 34);
      glow.addColorStop(0, 'rgba(255, 199, 44, 0.85)');
      glow.addColorStop(0.6, 'rgba(255, 122, 0, 0.45)');
      glow.addColorStop(1, 'rgba(255, 81, 0, 0)');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(0, 0, 34, 0, Math.PI * 2);
      ctx.fill();

      this.drawSingleModak(ctx, '#FFE082', '#FFC72C', '#E0AC00', '#D32F2F', 1.35);

      ctx.fillStyle = '#FFFFFF';
      this.drawStar(ctx, -14, -14, 4, 5, 2);
      this.drawStar(ctx, 16, -10, 4, 4, 1.5);
    });

    // 2.3 Durva Grass (Sacred green blades)
    this.drawCanvasTexture(scene, 'durva', 56, 64, (ctx) => {
      ctx.translate(28, 42);

      ctx.strokeStyle = '#2E7D32';
      ctx.fillStyle = '#88D982';
      ctx.lineWidth = 2;

      // Center blade
      ctx.beginPath();
      ctx.moveTo(0, 10);
      ctx.quadraticCurveTo(-2, -20, 0, -36);
      ctx.quadraticCurveTo(4, -20, 0, 10);
      ctx.fill();
      ctx.stroke();

      // Left blade
      ctx.fillStyle = '#62B260';
      ctx.beginPath();
      ctx.moveTo(-2, 10);
      ctx.quadraticCurveTo(-16, -15, -18, -28);
      ctx.quadraticCurveTo(-10, -12, -2, 10);
      ctx.fill();
      ctx.stroke();

      // Far Left blade
      ctx.beginPath();
      ctx.moveTo(-3, 10);
      ctx.quadraticCurveTo(-24, -5, -22, -18);
      ctx.quadraticCurveTo(-14, -4, -3, 10);
      ctx.fill();
      ctx.stroke();

      // Right blade
      ctx.fillStyle = '#A3F69C';
      ctx.beginPath();
      ctx.moveTo(2, 10);
      ctx.quadraticCurveTo(16, -15, 18, -30);
      ctx.quadraticCurveTo(10, -12, 2, 10);
      ctx.fill();
      ctx.stroke();

      // Far Right blade
      ctx.beginPath();
      ctx.moveTo(3, 10);
      ctx.quadraticCurveTo(24, -5, 22, -20);
      ctx.quadraticCurveTo(14, -4, 3, 10);
      ctx.fill();
      ctx.stroke();

      // Sacred Red Moli Thread Tie
      ctx.fillStyle = '#D32F2F';
      ctx.fillRect(-8, -2, 16, 8);
      ctx.fillStyle = '#FFC72C';
      ctx.fillRect(-8, 1, 16, 2);
    });

    // 2.4 Shield Aura Visual (Active Durva Shield)
    this.drawCanvasTexture(scene, 'shield_aura', 120, 120, (ctx) => {
      ctx.translate(60, 60);

      const grad = ctx.createRadialGradient(0, 0, 36, 0, 0, 58);
      grad.addColorStop(0, 'rgba(136, 217, 130, 0.15)');
      grad.addColorStop(0.7, 'rgba(98, 178, 96, 0.45)');
      grad.addColorStop(0.9, 'rgba(163, 246, 156, 0.85)');
      grad.addColorStop(1, 'rgba(46, 125, 50, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(0, 0, 58, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#88D982';
      ctx.lineWidth = 3;
      ctx.setLineDash([8, 6]);
      ctx.beginPath();
      ctx.arc(0, 0, 50, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = '#62B260';
      for (let a = 0; a < 4; a++) {
        const angle = (a * Math.PI) / 2;
        const lx = Math.cos(angle) * 50;
        const ly = Math.sin(angle) * 50;
        ctx.beginPath();
        ctx.arc(lx, ly, 4, 0, Math.PI * 2);
        ctx.fill();
      }
    });
  }

  private static drawSingleModak(
    ctx: CanvasRenderingContext2D,
    topColor: string,
    midColor: string,
    shadeColor: string,
    tilakColor: string,
    scale: number
  ): void {
    ctx.save();
    ctx.scale(scale, scale);

    ctx.beginPath();
    ctx.moveTo(0, -18);
    ctx.bezierCurveTo(12, -10, 18, 5, 15, 14);
    ctx.bezierCurveTo(12, 19, -12, 19, -15, 14);
    ctx.bezierCurveTo(-18, 5, -12, -10, 0, -18);
    ctx.closePath();

    const bodyGrad = ctx.createRadialGradient(-3, 0, 3, 0, 5, 18);
    bodyGrad.addColorStop(0, topColor);
    bodyGrad.addColorStop(0.6, midColor);
    bodyGrad.addColorStop(1, shadeColor);
    ctx.fillStyle = bodyGrad;
    ctx.fill();

    ctx.strokeStyle = shadeColor;
    ctx.lineWidth = 1.2;
    ctx.lineCap = 'round';

    ctx.beginPath();
    ctx.moveTo(0, -17);
    ctx.quadraticCurveTo(-7, 0, -8, 16);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, -17);
    ctx.quadraticCurveTo(-13, 3, -13, 13);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, -17);
    ctx.quadraticCurveTo(7, 0, 8, 16);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, -17);
    ctx.quadraticCurveTo(13, 3, 13, 13);
    ctx.stroke();

    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(-2, -14, 2, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = tilakColor;
    ctx.beginPath();
    ctx.ellipse(0, -8, 1.2, 2.5, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  // ==========================================
  // 3. OBSTACLES
  // ==========================================
  private static createObstacleSprites(scene: Phaser.Scene): void {
    // 3.1 Flower Cart
    this.drawCanvasTexture(scene, 'obstacle_flower_cart', 90, 75, (ctx) => {
      ctx.translate(45, 45);

      ctx.fillStyle = '#4A2912';
      ctx.fillRect(-35, -5, 70, 20);
      ctx.strokeStyle = '#291710';
      ctx.lineWidth = 2;
      ctx.strokeRect(-35, -5, 70, 20);

      for (let x = -25; x <= 25; x += 12) {
        ctx.beginPath();
        ctx.moveTo(x, -5);
        ctx.lineTo(x, 15);
        ctx.stroke();
      }

      const drawWheel = (wx: number, wy: number) => {
        ctx.fillStyle = '#291710';
        ctx.beginPath();
        ctx.arc(wx, wy, 12, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#FFC72C';
        ctx.beginPath();
        ctx.arc(wx, wy, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#120907';
        ctx.lineWidth = 1.5;
        for (let a = 0; a < 6; a++) {
          const ang = (a * Math.PI) / 3;
          ctx.beginPath();
          ctx.moveTo(wx, wy);
          ctx.lineTo(wx + Math.cos(ang) * 11, wy + Math.sin(ang) * 11);
          ctx.stroke();
        }
      };
      drawWheel(-22, 18);
      drawWheel(22, 18);

      ctx.strokeStyle = '#291710';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(-35, 2);
      ctx.lineTo(-44, -2);
      ctx.stroke();

      const flowers = [
        { x: -26, y: -8, color: '#FF7A00' },
        { x: -16, y: -14, color: '#FFC72C' },
        { x: -6, y: -20, color: '#FF5100' },
        { x: 6, y: -22, color: '#FFE082' },
        { x: 18, y: -15, color: '#FF7A00' },
        { x: 26, y: -8, color: '#FF5100' },
        { x: -10, y: -8, color: '#FFC72C' },
        { x: 4, y: -10, color: '#FF7A00' },
        { x: 12, y: -6, color: '#FFE082' }
      ];
      flowers.forEach((f) => {
        ctx.fillStyle = f.color;
        ctx.beginPath();
        ctx.arc(f.x, f.y, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#FFF8E7';
        ctx.beginPath();
        ctx.arc(f.x, f.y, 3, 0, Math.PI * 2);
        ctx.fill();
      });
    });

    // 3.2 Stacked Wooden Crates
    this.drawCanvasTexture(scene, 'obstacle_crates', 70, 75, (ctx) => {
      ctx.translate(35, 45);

      const drawCrate = (cx: number, cy: number, w: number, h: number) => {
        ctx.fillStyle = '#4A2912';
        ctx.fillRect(cx - w / 2, cy - h / 2, w, h);
        ctx.strokeStyle = '#291710';
        ctx.lineWidth = 2;
        ctx.strokeRect(cx - w / 2, cy - h / 2, w, h);

        ctx.beginPath();
        ctx.moveTo(cx - w / 2, cy - h / 2);
        ctx.lineTo(cx + w / 2, cy + h / 2);
        ctx.moveTo(cx + w / 2, cy - h / 2);
        ctx.lineTo(cx - w / 2, cy + h / 2);
        ctx.stroke();

        ctx.fillStyle = '#1A0A05';
        const corners = [
          [-w / 2 + 3, -h / 2 + 3],
          [w / 2 - 3, -h / 2 + 3],
          [-w / 2 + 3, h / 2 - 3],
          [w / 2 - 3, h / 2 - 3]
        ];
        corners.forEach(([kx, ky]) => {
          ctx.beginPath();
          ctx.arc(cx + kx, cy + ky, 1.5, 0, Math.PI * 2);
          ctx.fill();
        });
      };

      drawCrate(0, 10, 56, 32);
      drawCrate(-6, -20, 42, 28);
    });

    // 3.3 Barrier
    this.drawCanvasTexture(scene, 'obstacle_barrier', 80, 70, (ctx) => {
      ctx.translate(40, 40);

      ctx.strokeStyle = '#39251D';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(-25, 25);
      ctx.lineTo(-25, -15);
      ctx.moveTo(25, 25);
      ctx.lineTo(25, -15);
      ctx.stroke();

      ctx.fillStyle = '#1A0A05';
      ctx.fillRect(-32, 22, 14, 6);
      ctx.fillRect(18, 22, 14, 6);

      ctx.save();
      ctx.fillStyle = '#D32F2F';
      ctx.fillRect(-35, -15, 70, 24);
      ctx.strokeStyle = '#93000A';
      ctx.lineWidth = 2;
      ctx.strokeRect(-35, -15, 70, 24);

      ctx.fillStyle = '#FFF8E7';
      for (let sx = -30; sx <= 30; sx += 18) {
        ctx.beginPath();
        ctx.moveTo(sx, -15);
        ctx.lineTo(sx + 8, -15);
        ctx.lineTo(sx - 2, 9);
        ctx.lineTo(sx - 10, 9);
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();

      ctx.strokeStyle = '#FF7A00';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-35, -15);
      ctx.quadraticCurveTo(0, -6, 35, -15);
      ctx.stroke();
    });

    // 3.4 Decorative Pot (Terracotta Matka)
    this.drawCanvasTexture(scene, 'obstacle_pot', 60, 65, (ctx) => {
      ctx.translate(30, 36);

      ctx.beginPath();
      ctx.fillStyle = '#8B2500';
      ctx.ellipse(0, 4, 20, 20, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#4A1400';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = '#6D1C00';
      ctx.fillRect(-12, -18, 24, 8);
      ctx.strokeStyle = '#4A1400';
      ctx.strokeRect(-12, -18, 24, 8);

      ctx.beginPath();
      ctx.ellipse(0, -18, 14, 4, 0, 0, Math.PI * 2);
      ctx.fillStyle = '#8B2500';
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#FFF8E7';
      ctx.fillRect(-18, -2, 36, 6);
      ctx.fillStyle = '#FFC72C';
      for (let px = -14; px <= 14; px += 7) {
        ctx.beginPath();
        ctx.arc(px, 1, 2, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.strokeStyle = '#FFC72C';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, 6);
      ctx.lineTo(0, 16);
      ctx.moveTo(-5, 11);
      ctx.lineTo(5, 11);
      ctx.stroke();
    });

    // 3.5 Hanging Decoration (Toran)
    this.drawCanvasTexture(scene, 'obstacle_hanging', 100, 70, (ctx) => {
      ctx.translate(50, 20);

      ctx.strokeStyle = '#E0C0AF';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(-48, -10);
      ctx.quadraticCurveTo(0, 0, 48, -10);
      ctx.stroke();

      const leaves = [-35, -20, -5, 10, 25, 40];
      leaves.forEach((lx) => {
        ctx.fillStyle = '#2E7D32';
        ctx.beginPath();
        ctx.moveTo(lx, -6);
        ctx.quadraticCurveTo(lx + 4, 8, lx + 2, 22);
        ctx.quadraticCurveTo(lx - 4, 8, lx, -6);
        ctx.fill();
      });

      const garlands = [-30, -12, 6, 24];
      garlands.forEach((gx, idx) => {
        const garlandLen = 28 + (idx % 2) * 10;
        for (let gy = 0; gy < garlandLen; gy += 7) {
          ctx.fillStyle = gy % 14 === 0 ? '#FF7A00' : '#FFC72C';
          ctx.beginPath();
          ctx.arc(gx, gy, 4, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.fillStyle = '#FFE082';
        ctx.beginPath();
        ctx.arc(gx, garlandLen, 3, 0, Math.PI * 2);
        ctx.fill();
      });
    });
  }

  // ==========================================
  // 4. ENVIRONMENT & BACKGROUND
  // ==========================================
  private static createEnvironmentTextures(scene: Phaser.Scene): void {
    // 4.1 Sky & Sunset Golden Hour Gradient (960 x 540)
    this.drawCanvasTexture(scene, 'bg_sky', 960, 540, (ctx) => {
      const grad = ctx.createLinearGradient(0, 0, 0, 400);
      grad.addColorStop(0, '#120907');
      grad.addColorStop(0.35, '#200F08');
      grad.addColorStop(0.7, '#4A200B');
      grad.addColorStop(1, '#FF7A00');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 960, 540);

      const sunGrad = ctx.createRadialGradient(480, 280, 20, 480, 280, 260);
      sunGrad.addColorStop(0, 'rgba(255, 224, 130, 0.7)');
      sunGrad.addColorStop(0.5, 'rgba(255, 122, 0, 0.3)');
      sunGrad.addColorStop(1, 'rgba(255, 81, 0, 0)');
      ctx.fillStyle = sunGrad;
      ctx.fillRect(0, 0, 960, 540);

      ctx.fillStyle = 'rgba(255, 235, 180, 0.8)';
      for (let i = 0; i < 35; i++) {
        const sx = (i * 73 + 20) % 960;
        const sy = (i * 37 + 15) % 240;
        const sr = (i % 3) + 1;
        ctx.beginPath();
        ctx.arc(sx, sy, sr, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    // 4.2 Distant Pandals & Ganesha Idol Silhouettes Layer
    this.drawCanvasTexture(scene, 'bg_pandals', 960, 300, (ctx) => {
      for (let p = 0; p < 3; p++) {
        const px = p * 340 + 40;

        ctx.fillStyle = 'rgba(46, 27, 20, 0.92)';
        ctx.beginPath();
        ctx.moveTo(px, 240);
        ctx.lineTo(px, 120);
        ctx.quadraticCurveTo(px + 75, 40, px + 150, 120);
        ctx.lineTo(px + 150, 240);
        ctx.closePath();
        ctx.fill();

        const innerGlow = ctx.createRadialGradient(px + 75, 140, 10, px + 75, 140, 70);
        innerGlow.addColorStop(0, 'rgba(255, 199, 44, 0.9)');
        innerGlow.addColorStop(0.7, 'rgba(255, 122, 0, 0.5)');
        innerGlow.addColorStop(1, 'rgba(139, 37, 0, 0)');
        ctx.fillStyle = innerGlow;
        ctx.beginPath();
        ctx.arc(px + 75, 140, 70, 0, Math.PI * 2);
        ctx.fill();

        // Ganesha Idol Silhouette
        ctx.fillStyle = 'rgba(26, 10, 5, 0.95)';
        ctx.beginPath();
        ctx.moveTo(px + 75, 80);
        ctx.lineTo(px + 68, 100);
        ctx.lineTo(px + 82, 100);
        ctx.closePath();
        ctx.fill();

        ctx.beginPath();
        ctx.arc(px + 75, 110, 12, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(px + 60, 110, 8, 11, -0.2, 0, Math.PI * 2);
        ctx.ellipse(px + 90, 110, 8, 11, 0.2, 0, Math.PI * 2);
        ctx.fill();

        ctx.lineWidth = 4;
        ctx.strokeStyle = 'rgba(26, 10, 5, 0.95)';
        ctx.beginPath();
        ctx.moveTo(px + 75, 112);
        ctx.quadraticCurveTo(px + 78, 128, px + 68, 130);
        ctx.stroke();

        ctx.beginPath();
        ctx.ellipse(px + 75, 146, 24, 18, 0, 0, Math.PI * 2);
        ctx.fill();

        // Light strings
        ctx.strokeStyle = '#FFC72C';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(px, 120);
        ctx.quadraticCurveTo(px + 75, 140, px + 150, 120);
        ctx.stroke();

        for (let d = 0; d <= 8; d++) {
          const dx = px + d * 18 + 3;
          const dy = 120 + Math.sin((d / 8) * Math.PI) * 14;
          ctx.fillStyle = '#FFE082';
          ctx.beginPath();
          ctx.arc(dx, dy, 3, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.fillStyle = '#2E7D32';
        ctx.beginPath();
        ctx.ellipse(px - 10, 180, 8, 35, -0.2, 0, Math.PI * 2);
        ctx.ellipse(px + 160, 180, 8, 35, 0.2, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    // 4.3 Ground Street with Rangoli Patterns
    this.drawCanvasTexture(scene, 'ground_street', 960, 140, (ctx) => {
      const streetGrad = ctx.createLinearGradient(0, 0, 0, 140);
      streetGrad.addColorStop(0, '#39251D');
      streetGrad.addColorStop(0.3, '#291710');
      streetGrad.addColorStop(1, '#1A0A05');
      ctx.fillStyle = streetGrad;
      ctx.fillRect(0, 0, 960, 140);

      ctx.fillStyle = '#FFC72C';
      ctx.fillRect(0, 0, 960, 4);

      for (let r = 0; r < 3; r++) {
        const rx = r * 320 + 160;
        const ry = 70;

        ctx.save();
        ctx.translate(rx, ry);
        ctx.scale(1.0, 0.45);

        ctx.fillStyle = '#E91E63';
        for (let p = 0; p < 12; p++) {
          const ang = (p * Math.PI) / 6;
          ctx.beginPath();
          ctx.arc(Math.cos(ang) * 44, Math.sin(ang) * 44, 12, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.fillStyle = '#00BCD4';
        for (let p = 0; p < 12; p++) {
          const ang = (p * Math.PI) / 6 + Math.PI / 12;
          ctx.beginPath();
          ctx.arc(Math.cos(ang) * 32, Math.sin(ang) * 32, 9, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.fillStyle = '#FFC72C';
        ctx.beginPath();
        ctx.arc(0, 0, 24, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#FF7A00';
        ctx.beginPath();
        ctx.arc(0, 0, 15, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#FFF8E7';
        ctx.beginPath();
        ctx.arc(0, 0, 6, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      }
    });
  }

  // ==========================================
  // 5. UI ASSETS & 3D PHYSICAL ARCADE BUTTONS
  // ==========================================
  private static createUITextures(scene: Phaser.Scene): void {
    // 5.1 Primary 3D Saffron Button (PLAY / CLAIM)
    this.drawCanvasTexture(scene, 'btn_primary_3d', 220, 58, (ctx) => {
      // Bottom Bevel Depth
      ctx.fillStyle = '#8B2500';
      ctx.beginPath();
      ctx.roundRect(4, 8, 212, 46, 12);
      ctx.fill();

      // Top Face Gradient
      const faceGrad = ctx.createLinearGradient(0, 0, 0, 50);
      faceGrad.addColorStop(0, '#FF7A00');
      faceGrad.addColorStop(1, '#FF5100');
      ctx.fillStyle = faceGrad;
      ctx.beginPath();
      ctx.roundRect(4, 2, 212, 46, 12);
      ctx.fill();

      // Specular Highlight
      ctx.strokeStyle = '#FFE082';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
      ctx.fillRect(16, 4, 188, 2);
    });

    // 5.2 Secondary Dark Temple Button (HOW TO / RANKS / SETTINGS)
    this.drawCanvasTexture(scene, 'btn_secondary_3d', 180, 50, (ctx) => {
      ctx.fillStyle = '#120907';
      ctx.beginPath();
      ctx.roundRect(3, 6, 174, 40, 10);
      ctx.fill();

      const faceGrad = ctx.createLinearGradient(0, 0, 0, 44);
      faceGrad.addColorStop(0, '#39251D');
      faceGrad.addColorStop(1, '#23120B');
      ctx.fillStyle = faceGrad;
      ctx.beginPath();
      ctx.roundRect(3, 2, 174, 40, 10);
      ctx.fill();

      ctx.strokeStyle = '#FFC72C';
      ctx.lineWidth = 2;
      ctx.stroke();
    });

    // 5.3 Tertiary Durva Green Button
    this.drawCanvasTexture(scene, 'btn_tertiary_3d', 180, 50, (ctx) => {
      ctx.fillStyle = '#1B4D20';
      ctx.beginPath();
      ctx.roundRect(3, 6, 174, 40, 10);
      ctx.fill();

      const faceGrad = ctx.createLinearGradient(0, 0, 0, 44);
      faceGrad.addColorStop(0, '#4CAF50');
      faceGrad.addColorStop(1, '#2E7D32');
      ctx.fillStyle = faceGrad;
      ctx.beginPath();
      ctx.roundRect(3, 2, 174, 40, 10);
      ctx.fill();

      ctx.strokeStyle = '#88D982';
      ctx.lineWidth = 2;
      ctx.stroke();
    });

    // 5.4 Pause Button (Rounded Squircle)
    this.drawCanvasTexture(scene, 'btn_pause_ui', 48, 48, (ctx) => {
      ctx.fillStyle = '#1A0A05';
      ctx.beginPath();
      ctx.roundRect(2, 2, 44, 44, 12);
      ctx.fill();
      ctx.strokeStyle = '#FFC72C';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = '#FFC72C';
      ctx.fillRect(15, 14, 5, 20);
      ctx.fillRect(28, 14, 5, 20);
    });

    // 5.5 Combo Badges matching DESIGN.md Starburst & Capsule
    this.drawCanvasTexture(scene, 'badge_combo_2', 88, 36, (ctx) => {
      const grad = ctx.createLinearGradient(0, 0, 88, 36);
      grad.addColorStop(0, '#FF7A00');
      grad.addColorStop(1, '#FF5100');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.roundRect(2, 2, 84, 32, 16);
      ctx.fill();
      ctx.strokeStyle = '#FFE082';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = '#FFF8E7';
      ctx.font = '900 16px "Epilogue", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('x2 COMBO', 44, 23);
    });

    this.drawCanvasTexture(scene, 'badge_combo_3', 96, 36, (ctx) => {
      const grad = ctx.createLinearGradient(0, 0, 96, 36);
      grad.addColorStop(0, '#D32F2F');
      grad.addColorStop(1, '#FF5100');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.roundRect(2, 2, 92, 32, 16);
      ctx.fill();
      ctx.strokeStyle = '#FFC72C';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      ctx.fillStyle = '#FFE082';
      ctx.font = '900 16px "Epilogue", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('x3 COMBO! 🔥', 48, 23);
    });

    // 5.6 Mobile Touch D-Pad Buttons (Left, Right, Jump, Slide)
    const drawMobilePad = (key: string, iconDraw: (ctx: CanvasRenderingContext2D) => void) => {
      this.drawCanvasTexture(scene, key, 60, 60, (ctx) => {
        ctx.fillStyle = 'rgba(26, 10, 5, 0.85)';
        ctx.beginPath();
        ctx.roundRect(3, 3, 54, 54, 16);
        ctx.fill();
        ctx.strokeStyle = 'rgba(255, 199, 44, 0.5)';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.translate(30, 30);
        ctx.fillStyle = '#FFC72C';
        iconDraw(ctx);
      });
    };

    drawMobilePad('dpad_left', (ctx) => {
      ctx.beginPath();
      ctx.moveTo(-10, 0);
      ctx.lineTo(8, -12);
      ctx.lineTo(8, 12);
      ctx.closePath();
      ctx.fill();
    });

    drawMobilePad('dpad_right', (ctx) => {
      ctx.beginPath();
      ctx.moveTo(10, 0);
      ctx.lineTo(-8, -12);
      ctx.lineTo(-8, 12);
      ctx.closePath();
      ctx.fill();
    });

    drawMobilePad('dpad_up', (ctx) => {
      ctx.beginPath();
      ctx.moveTo(0, -10);
      ctx.lineTo(-12, 8);
      ctx.lineTo(12, 8);
      ctx.closePath();
      ctx.fill();
    });

    drawMobilePad('dpad_down', (ctx) => {
      ctx.beginPath();
      ctx.moveTo(0, 10);
      ctx.lineTo(-12, -8);
      ctx.lineTo(12, -8);
      ctx.closePath();
      ctx.fill();
    });
  }

  // ==========================================
  // 6. VFX PARTICLES
  // ==========================================
  private static createVFXTextures(scene: Phaser.Scene): void {
    this.drawCanvasTexture(scene, 'particle_gold', 24, 24, (ctx) => {
      ctx.translate(12, 12);
      ctx.fillStyle = '#FFC72C';
      this.drawStar(ctx, 0, 0, 4, 10, 4);
    });

    this.drawCanvasTexture(scene, 'particle_leaf', 20, 20, (ctx) => {
      ctx.translate(10, 10);
      ctx.fillStyle = '#88D982';
      ctx.beginPath();
      ctx.ellipse(0, 0, 4, 9, 0.3, 0, Math.PI * 2);
      ctx.fill();
    });

    this.drawCanvasTexture(scene, 'particle_dust', 20, 20, (ctx) => {
      ctx.translate(10, 10);
      ctx.fillStyle = 'rgba(254, 219, 207, 0.7)';
      ctx.beginPath();
      ctx.arc(0, 0, 8, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  // ==========================================
  // UTILITIES
  // ==========================================
  private static drawCanvasTexture(
    scene: Phaser.Scene,
    key: string,
    width: number,
    height: number,
    drawFn: (ctx: CanvasRenderingContext2D) => void
  ): void {
    if (scene.textures.exists(key)) {
      scene.textures.remove(key);
    }
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      drawFn(ctx);
      scene.textures.addCanvas(key, canvas);
    }
  }

  private static drawStar(
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    spikes: number,
    outerRadius: number,
    innerRadius: number
  ): void {
    let rot = (Math.PI / 2) * 3;
    let x = cx;
    let y = cy;
    const step = Math.PI / spikes;

    ctx.beginPath();
    ctx.moveTo(cx, cy - outerRadius);
    for (let i = 0; i < spikes; i++) {
      x = cx + Math.cos(rot) * outerRadius;
      y = cy + Math.sin(rot) * outerRadius;
      ctx.lineTo(x, y);
      rot += step;

      x = cx + Math.cos(rot) * innerRadius;
      y = cy + Math.sin(rot) * innerRadius;
      ctx.lineTo(x, y);
      rot += step;
    }
    ctx.lineTo(cx, cy - outerRadius);
    ctx.closePath();
    ctx.fill();
  }
}
