import type { AspectRatioType } from '../types/studio.ts';

export interface SamplePhotoPreset {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  defaultRatio: AspectRatioType;
  renderToCanvas: (ctx: CanvasRenderingContext2D, width: number, height: number) => void;
}

export const SAMPLE_PRESETS: SamplePhotoPreset[] = [
  {
    id: 'twilight_skyline',
    title: '夜幕天際線',
    subtitle: 'Metropolitan Blue Hour',
    category: 'Architecture',
    defaultRatio: '16:9',
    renderToCanvas: (ctx, w, h) => {
      // Twilight sky gradient
      const skyGrad = ctx.createLinearGradient(0, 0, 0, h * 0.75);
      skyGrad.addColorStop(0, '#020617');
      skyGrad.addColorStop(0.3, '#0b192c');
      skyGrad.addColorStop(0.65, '#1e3e62');
      skyGrad.addColorStop(0.85, '#e06b38');
      skyGrad.addColorStop(1, '#ff9e58');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, w, h);

      // Water body reflection gradient
      const waterGrad = ctx.createLinearGradient(0, h * 0.72, 0, h);
      waterGrad.addColorStop(0, '#0a1727');
      waterGrad.addColorStop(0.4, '#060d17');
      waterGrad.addColorStop(1, '#020617');
      ctx.fillStyle = waterGrad;
      ctx.fillRect(0, h * 0.72, w, h * 0.28);

      // Distant mountain ridge
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.moveTo(0, h * 0.72);
      ctx.lineTo(w * 0.2, h * 0.68);
      ctx.lineTo(w * 0.45, h * 0.71);
      ctx.lineTo(w * 0.7, h * 0.67);
      ctx.lineTo(w, h * 0.72);
      ctx.lineTo(w, h * 0.75);
      ctx.lineTo(0, h * 0.75);
      ctx.fill();

      // Skyscraper clusters
      const buildings = [
        { x: 0.05, w: 0.07, h: 0.38, lights: 14 },
        { x: 0.13, w: 0.09, h: 0.52, lights: 24 },
        { x: 0.23, w: 0.06, h: 0.42, lights: 16 },
        { x: 0.30, w: 0.12, h: 0.62, lights: 32, antenna: true },
        { x: 0.43, w: 0.08, h: 0.48, lights: 20 },
        { x: 0.52, w: 0.14, h: 0.58, lights: 30, spire: true },
        { x: 0.67, w: 0.07, h: 0.45, lights: 18 },
        { x: 0.75, w: 0.10, h: 0.50, lights: 22 },
        { x: 0.86, w: 0.08, h: 0.36, lights: 12 },
      ];

      for (const b of buildings) {
        const bx = b.x * w;
        const bw = b.w * w;
        const bh = b.h * h;
        const by = h * 0.72 - bh;

        // Building silhouette
        ctx.fillStyle = '#040914';
        ctx.fillRect(bx, by, bw, bh);

        // Architectural edge highlight
        ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
        ctx.fillRect(bx, by, 1.5, bh);

        // Antenna or spire
        if (b.antenna) {
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(bx + bw / 2, by);
          ctx.lineTo(bx + bw / 2, by - 35);
          ctx.stroke();

          // Red beacon on top
          ctx.fillStyle = '#ef4444';
          ctx.beginPath();
          ctx.arc(bx + bw / 2, by - 35, 2.5, 0, Math.PI * 2);
          ctx.fill();
        }

        // Office window arrays
        for (let r = 0; r < b.lights; r++) {
          for (let c = 0; c < 3; c++) {
            if ((r * 7 + c * 3) % 4 !== 0) {
              const wx = bx + 5 + c * ((bw - 10) / 3);
              const wy = by + 12 + r * ((bh - 20) / b.lights);
              const isWarm = (r + c) % 2 === 0;
              ctx.fillStyle = isWarm ? 'rgba(254, 243, 199, 0.75)' : 'rgba(56, 189, 248, 0.55)';
              ctx.fillRect(wx, wy, Math.max(2, bw / 10), Math.max(2, bh / b.lights * 0.5));
            }
          }
        }

        // Water reflection streaks
        const refGrad = ctx.createLinearGradient(bx, h * 0.72, bx, h);
        refGrad.addColorStop(0, 'rgba(251, 191, 36, 0.35)');
        refGrad.addColorStop(0.5, 'rgba(56, 189, 248, 0.15)');
        refGrad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = refGrad;
        ctx.fillRect(bx + bw * 0.2, h * 0.72, bw * 0.6, h * 0.22);
      }
    }
  },
  {
    id: 'golden_portrait',
    title: '黃金時刻人像',
    subtitle: 'Golden Hour Silhouette',
    category: 'Portrait',
    defaultRatio: '3:2',
    renderToCanvas: (ctx, w, h) => {
      // Warm backlight gradient
      const bg = ctx.createRadialGradient(w * 0.65, h * 0.38, 10, w * 0.65, h * 0.38, w * 0.85);
      bg.addColorStop(0, '#fffbeb');
      bg.addColorStop(0.2, '#fde68a');
      bg.addColorStop(0.5, '#f59e0b');
      bg.addColorStop(0.8, '#b45309');
      bg.addColorStop(1, '#451a03');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);

      // Dreamy lens bokeh balls in background
      const bokehs = [
        { x: 0.2, y: 0.3, r: 45, o: 0.18 },
        { x: 0.35, y: 0.2, r: 70, o: 0.22 },
        { x: 0.5, y: 0.5, r: 90, o: 0.25 },
        { x: 0.8, y: 0.25, r: 60, o: 0.15 },
        { x: 0.7, y: 0.65, r: 80, o: 0.18 },
        { x: 0.15, y: 0.6, r: 50, o: 0.12 },
      ];
      for (const b of bokehs) {
        ctx.fillStyle = `rgba(254, 240, 138, ${b.o})`;
        ctx.beginPath();
        ctx.arc(b.x * w, b.y * h, b.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = `rgba(255, 255, 255, ${b.o * 0.8})`;
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      // Elegant profile silhouette
      ctx.save();
      ctx.fillStyle = '#1e1106';
      
      // Shoulders and torso
      ctx.beginPath();
      ctx.moveTo(w * 0.15, h);
      ctx.bezierCurveTo(w * 0.2, h * 0.65, w * 0.32, h * 0.58, w * 0.42, h * 0.52);
      ctx.bezierCurveTo(w * 0.44, h * 0.45, w * 0.43, h * 0.35, w * 0.45, h * 0.25);
      // Head and face profile
      ctx.bezierCurveTo(w * 0.46, h * 0.12, w * 0.58, h * 0.12, w * 0.59, h * 0.24);
      // Nose and lips
      ctx.lineTo(w * 0.63, h * 0.28);
      ctx.lineTo(w * 0.61, h * 0.31);
      ctx.lineTo(w * 0.62, h * 0.34);
      ctx.lineTo(w * 0.59, h * 0.37);
      // Chin and neck
      ctx.bezierCurveTo(w * 0.57, h * 0.42, w * 0.55, h * 0.48, w * 0.56, h * 0.54);
      ctx.bezierCurveTo(w * 0.68, h * 0.6, w * 0.8, h * 0.75, w * 0.85, h);
      ctx.closePath();
      ctx.fill();

      // Golden rim light along silhouette contour
      ctx.strokeStyle = 'rgba(255, 251, 235, 0.75)';
      ctx.lineWidth = 3.5;
      ctx.stroke();
      ctx.restore();
    }
  },
  {
    id: 'cyber_night',
    title: '賽博夜雨街頭',
    subtitle: 'Cyberpunk Rain Alley',
    category: 'Street Noir',
    defaultRatio: '4:3',
    renderToCanvas: (ctx, w, h) => {
      // Dark moody alley background
      ctx.fillStyle = '#05070e';
      ctx.fillRect(0, 0, w, h);

      // Perspective street grid
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.15)';
      ctx.lineWidth = 1;
      const vpX = w * 0.5;
      const vpY = h * 0.42;

      for (let i = 0; i <= w; i += w / 8) {
        ctx.beginPath();
        ctx.moveTo(vpX, vpY);
        ctx.lineTo(i, h);
        ctx.stroke();
      }

      // Neon signboards (Vertical Japanese neon typography)
      const signs = [
        { x: 0.12, y: 0.18, w: 34, h: 140, color: '#ec4899', text: '光影', glow: 'rgba(236,72,153,0.5)' },
        { x: 0.22, y: 0.24, w: 28, h: 95, color: '#06b6d4', text: '暗房', glow: 'rgba(6,182,212,0.5)' },
        { x: 0.82, y: 0.15, w: 38, h: 160, color: '#f59e0b', text: '東京', glow: 'rgba(245,158,11,0.5)' },
        { x: 0.72, y: 0.26, w: 30, h: 110, color: '#8b5cf6', text: '純喫茶', glow: 'rgba(139,92,246,0.5)' },
      ];

      for (const s of signs) {
        const sx = s.x * w;
        const sy = s.y * h;

        // Sign background box
        ctx.fillStyle = '#090d16';
        ctx.fillRect(sx, sy, s.w, s.h);
        ctx.strokeStyle = s.color;
        ctx.lineWidth = 2;
        ctx.strokeRect(sx, sy, s.w, s.h);

        // Sign text
        ctx.fillStyle = s.color;
        ctx.font = '700 16px "Plus Jakarta Sans", sans-serif';
        ctx.textAlign = 'center';
        for (let c = 0; c < s.text.length; c++) {
          ctx.fillText(s.text[c], sx + s.w / 2, sy + 32 + c * 26);
        }

        // Wet pavement neon puddle reflections
        const refY = h * 0.78 + (s.y * 0.15 * h);
        const refGrad = ctx.createRadialGradient(sx + s.w / 2, refY, 5, sx + s.w / 2, refY, 60);
        refGrad.addColorStop(0, s.glow);
        refGrad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = refGrad;
        ctx.beginPath();
        ctx.ellipse(sx + s.w / 2, refY, 55, 12, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.textAlign = 'left';

      // Atmospheric rain streaks
      ctx.strokeStyle = 'rgba(203, 213, 225, 0.28)';
      ctx.lineWidth = 1;
      for (let r = 0; r < 90; r++) {
        const rx = (r * 37) % w;
        const ry = (r * 29) % h;
        ctx.beginPath();
        ctx.moveTo(rx, ry);
        ctx.lineTo(rx - 8, ry + 22);
        ctx.stroke();
      }
    }
  },
  {
    id: 'minimal_nature',
    title: '極簡晨霧山巒',
    subtitle: 'Zen Mountain Mist',
    category: 'Landscape',
    defaultRatio: '1:1',
    renderToCanvas: (ctx, w, h) => {
      // Soft foggy dawn sky
      const skyGrad = ctx.createLinearGradient(0, 0, 0, h);
      skyGrad.addColorStop(0, '#f1f5f9');
      skyGrad.addColorStop(0.4, '#e2e8f0');
      skyGrad.addColorStop(0.7, '#cbd5e1');
      skyGrad.addColorStop(1, '#94a3b8');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, w, h);

      // Pale morning sun disc
      ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.beginPath();
      ctx.arc(w * 0.72, h * 0.25, 42, 0, Math.PI * 2);
      ctx.fill();

      // Mountain layers from distant to near
      const layers = [
        { color: '#94a3b8', peak: 0.48, freq: 0.003 },
        { color: '#64748b', peak: 0.58, freq: 0.004 },
        { color: '#334155', peak: 0.70, freq: 0.006 },
        { color: '#0f172a', peak: 0.82, freq: 0.008 },
      ];

      for (const layer of layers) {
        ctx.fillStyle = layer.color;
        ctx.beginPath();
        ctx.moveTo(0, h);
        ctx.lineTo(0, h * layer.peak);

        for (let x = 0; x <= w; x += 15) {
          const y = h * layer.peak + Math.sin(x * layer.freq) * 45 + Math.cos(x * layer.freq * 2.3) * 25;
          ctx.lineTo(x, y);
        }

        ctx.lineTo(w, h);
        ctx.closePath();
        ctx.fill();

        // Mist blanket between layers
        const mistGrad = ctx.createLinearGradient(0, h * (layer.peak - 0.05), 0, h * (layer.peak + 0.1));
        mistGrad.addColorStop(0, 'rgba(255, 255, 255, 0)');
        mistGrad.addColorStop(0.5, 'rgba(241, 245, 249, 0.45)');
        mistGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = mistGrad;
        ctx.fillRect(0, h * (layer.peak - 0.05), w, h * 0.15);
      }

      // Solitary foreground pine tree on nearest ridge
      const treeX = w * 0.22;
      const treeY = h * 0.80;
      ctx.fillStyle = '#090d16';

      // Trunk
      ctx.fillRect(treeX - 2.5, treeY, 5, 45);

      // Pine foliage tiers
      for (let t = 0; t < 5; t++) {
        const tierY = treeY - t * 14;
        const tierW = 32 - t * 5;
        ctx.beginPath();
        ctx.moveTo(treeX, tierY - 14);
        ctx.lineTo(treeX - tierW, tierY + 4);
        ctx.lineTo(treeX + tierW, tierY + 4);
        ctx.closePath();
        ctx.fill();
      }
    }
  }
];
