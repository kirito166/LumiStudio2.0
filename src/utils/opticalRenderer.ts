import type { AspectRatioType, FlareColorType, ProfileType, StudioSettings, HistogramData } from '../types/studio.ts';

export const RATIO_DIMENSIONS: Record<Exclude<AspectRatioType, 'orig'>, [number, number]> = {
  '3:2': [900, 600],
  '4:3': [800, 600],
  '1:1': [700, 700],
  '16:9': [960, 540],
  '9:16': [540, 960],
  '21:9': [1050, 450],
  '5:4': [750, 600],
};

export const RATIO_NAMES: Record<AspectRatioType, string> = {
  orig: '原圖比例',
  '3:2': '3:2 單眼',
  '4:3': '4:3 街拍',
  '1:1': '1:1 正方',
  '16:9': '16:9 寬幅',
  '9:16': '9:16 直幅',
  '21:9': '21:9 變形寬銀幕',
  '5:4': '5:4 大畫幅',
};

export const PROFILE_PRESETS: Record<ProfileType, {
  name: string;
  tag: string;
  settings: Partial<StudioSettings>;
}> = {
  vibrant: {
    name: '鮮明濃郁',
    tag: 'Vibrant Chroma',
    settings: { bright: 102, contrast: 125, sat: 135, temp: 8, hue: 0, blur: 0, vig: 45, grain: 12, flare: 70, flareColor: 'amber_gold' }
  },
  natural: {
    name: '經典柔和',
    tag: 'Soft Natural',
    settings: { bright: 104, contrast: 98, sat: 95, temp: 0, hue: 0, blur: 0, vig: 20, grain: 6, flare: 40, flareColor: 'warm' }
  },
  mono: {
    name: '高反差黑白',
    tag: 'High-Contrast B&W',
    settings: { bright: 100, contrast: 165, sat: 0, temp: 0, hue: 0, blur: 0, vig: 65, grain: 38, flare: 30, flareColor: 'ice' }
  },
  film: {
    name: '復古暖底片',
    tag: 'Vintage 80s Film',
    settings: { bright: 106, contrast: 110, sat: 115, temp: 42, hue: -4, blur: 0.5, vig: 55, grain: 45, flare: 80, flareColor: 'warm' }
  },
  cyber: {
    name: '冷調賽博夜景',
    tag: 'Cyber Nocturne',
    settings: { bright: 94, contrast: 135, sat: 145, temp: -58, hue: 12, blur: 0, vig: 70, grain: 18, flare: 85, flareColor: 'neon' }
  },
  golden: {
    name: '夕陽金光',
    tag: 'Golden Hour Flare',
    settings: { bright: 108, contrast: 115, sat: 140, temp: 65, hue: -8, blur: 0.2, vig: 50, grain: 15, flare: 90, flareColor: 'amber_gold' }
  },
  silver: {
    name: '銀鹽漂白',
    tag: 'Bleach Bypass Silver',
    settings: { bright: 98, contrast: 145, sat: 45, temp: -15, hue: 5, blur: 0, vig: 60, grain: 50, flare: 45, flareColor: 'ice' }
  }
};

export const DEFAULT_SETTINGS: StudioSettings = {
  ratio: '3:2',
  fitMode: 'cover',
  frameMode: 'dark',
  guideMode: 'thirds',
  zoom: 100,
  panX: 0,
  panY: 0,
  rotate: 0,
  flipH: false,
  bright: 102,
  contrast: 125,
  sat: 135,
  temp: 8,
  hue: 0,
  blur: 0,
  flare: 70,
  flareColor: 'amber_gold',
  anamorphic: false,
  vig: 45,
  grain: 12,
  grainSize: 1.5,
};

/**
 * Calculates canvas pixel dimensions according to the selected aspect ratio and source image dimensions.
 */
export function getCanvasDimensions(
  ratio: AspectRatioType,
  sourceW = 900,
  sourceH = 600,
  maxDimension = 900
): { width: number; height: number } {
  if (ratio === 'orig') {
    if (!sourceW || !sourceH) return { width: 900, height: 600 };
    const scale = Math.min(maxDimension / sourceW, maxDimension / sourceH);
    return {
      width: Math.max(200, Math.round(sourceW * scale)),
      height: Math.max(200, Math.round(sourceH * scale)),
    };
  }

  const [targetW, targetH] = RATIO_DIMENSIONS[ratio] || [900, 600];
  const scale = Math.min(maxDimension / targetW, maxDimension / targetH);
  return {
    width: Math.round(targetW * scale),
    height: Math.round(targetH * scale),
  };
}

/**
 * Calculates multi-element lens flare ghosts passing through the optical axis center.
 */
export function calculateGhostPositions(
  flareX: number,
  flareY: number,
  canvasW: number,
  canvasH: number,
  count = 5
): Array<{ x: number; y: number; size: number; opacity: number }> {
  const centerX = canvasW / 2;
  const centerY = canvasH / 2;
  const dx = centerX - flareX;
  const dy = centerY - flareY;
  const maxDim = Math.max(canvasW, canvasH);

  const ghosts: Array<{ x: number; y: number; size: number; opacity: number }> = [];
  // factors along the optical vector
  const steps = [0.4, 0.7, 1.0, 1.35, 1.8];

  for (let i = 0; i < Math.min(count, steps.length); i++) {
    const factor = steps[i];
    ghosts.push({
      x: flareX + dx * factor,
      y: flareY + dy * factor,
      size: (maxDim * 0.08) * (1 + (i % 2) * 0.5),
      opacity: 0.25 / (1 + i * 0.3),
    });
  }

  return ghosts;
}

/**
 * Optical flare color palette definitions
 */
export function getFlareColors(type: FlareColorType): { core: string; halo: string; ring: string; streak: string } {
  switch (type) {
    case 'warm':
      return {
        core: '255, 252, 240',
        halo: '255, 175, 95',
        ring: '255, 110, 50',
        streak: '255, 200, 120',
      };
    case 'amber_gold':
      return {
        core: '255, 248, 220',
        halo: '245, 158, 11',
        ring: '217, 119, 6',
        streak: '251, 191, 36',
      };
    case 'ice':
      return {
        core: '240, 252, 255',
        halo: '56, 189, 248',
        ring: '99, 102, 241',
        streak: '125, 211, 252',
      };
    case 'neon':
      return {
        core: '255, 242, 255',
        halo: '236, 72, 153',
        ring: '168, 85, 247',
        streak: '244, 114, 182',
      };
    case 'emerald':
      return {
        core: '240, 255, 244',
        halo: '52, 211, 153',
        ring: '16, 185, 129',
        streak: '110, 231, 183',
      };
  }
}

/**
 * Procedural default scene when no image is loaded
 */
export function drawProceduralDarkroomScene(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  zoom: number,
  panX: number,
  panY: number
) {
  // Deep twilight architectural backdrop
  const grad = ctx.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0, '#060d1f');
  grad.addColorStop(0.35, '#0e2442');
  grad.addColorStop(0.7, '#1b3858');
  grad.addColorStop(1, '#080f1a');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  // Distant stars / optical specks
  ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
  for (let s = 0; s < 45; s++) {
    const sx = ((s * 137.5) % w);
    const sy = ((s * 93.7) % (h * 0.55));
    const size = (s % 3 === 0) ? 1.5 : 1;
    ctx.fillRect(sx, sy, size, size);
  }

  ctx.save();
  ctx.translate(w / 2 + panX, h / 2 + panY);
  ctx.scale(zoom, zoom);

  // Architectural silhouette lines (Bauhaus/Modernist style)
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.16)';
  ctx.lineWidth = 1.5;
  for (let i = -360; i <= 360; i += 45) {
    const bHeight = 160 + ((Math.abs(i) * 31) % 180);
    ctx.strokeRect(i, -20, 36, bHeight);
    
    // Window grid highlights
    ctx.fillStyle = (i % 90 === 0) ? 'rgba(56, 189, 248, 0.25)' : 'rgba(255, 235, 180, 0.12)';
    ctx.fillRect(i + 4, 10, 28, 30);
    ctx.fillRect(i + 4, 60, 28, 40);
  }

  // Optical Horizon Line
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.45)';
  ctx.beginPath();
  ctx.moveTo(-w, 140);
  ctx.lineTo(w, 140);
  ctx.stroke();

  // Focal circular lens iris diagram
  ctx.beginPath();
  ctx.arc(0, 0, 95, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.55)';
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(0, 0, 140, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(245, 158, 11, 0.35)';
  ctx.setLineDash([4, 6]);
  ctx.stroke();
  ctx.setLineDash([]);

  // Cross center mark
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
  ctx.beginPath();
  ctx.moveTo(-15, 0); ctx.lineTo(15, 0);
  ctx.moveTo(0, -15); ctx.lineTo(0, 15);
  ctx.stroke();

  ctx.restore();
}

/**
 * Draws the active composition guide overlays (Rule of Thirds, Golden Spiral, Crosshair)
 */
export function drawCompositionGuides(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  guideMode: StudioSettings['guideMode']
) {
  if (guideMode === 'none') return;

  ctx.save();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
  ctx.lineWidth = 1;
  ctx.setLineDash([4, 4]);

  if (guideMode === 'thirds') {
    // 3x3 grid
    ctx.beginPath();
    ctx.moveTo(w / 3, 0); ctx.lineTo(w / 3, h);
    ctx.moveTo((w * 2) / 3, 0); ctx.lineTo((w * 2) / 3, h);
    ctx.moveTo(0, h / 3); ctx.lineTo(w, h / 3);
    ctx.moveTo(0, (h * 2) / 3); ctx.lineTo(w, (h * 2) / 3);
    ctx.stroke();

    // Golden points highlight dots
    ctx.fillStyle = 'rgba(56, 189, 248, 0.85)';
    const points = [
      [w / 3, h / 3],
      [(w * 2) / 3, h / 3],
      [w / 3, (h * 2) / 3],
      [(w * 2) / 3, (h * 2) / 3],
    ];
    for (const [px, py] of points) {
      ctx.beginPath();
      ctx.arc(px, py, 3.5, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (guideMode === 'golden') {
    // Golden ratio division (0.618)
    const phi = 0.6180339887;
    ctx.beginPath();
    ctx.moveTo(w * (1 - phi), 0); ctx.lineTo(w * (1 - phi), h);
    ctx.moveTo(w * phi, 0); ctx.lineTo(w * phi, h);
    ctx.moveTo(0, h * (1 - phi)); ctx.lineTo(w, h * (1 - phi));
    ctx.moveTo(0, h * phi); ctx.lineTo(w, h * phi);
    ctx.stroke();
  } else if (guideMode === 'crosshair') {
    // Center reticle
    ctx.beginPath();
    ctx.moveTo(w / 2, 0); ctx.lineTo(w / 2, h);
    ctx.moveTo(0, h / 2); ctx.lineTo(w, h / 2);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(w / 2, h / 2, 30, 0, Math.PI * 2);
    ctx.stroke();
  }

  ctx.restore();
}

/**
 * Renders the optical flare, halo and anamorphic streaks
 */
export function renderOpticalFlare(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  flarePos: { x: number; y: number },
  flareIntensity: number,
  flareColor: FlareColorType,
  anamorphic: boolean
) {
  if (flareIntensity <= 0) return;

  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  const colors = getFlareColors(flareColor);
  const intensity = flareIntensity / 100;

  const maxDimension = Math.max(w, h);
  const rCore = maxDimension * 0.45;

  // 1. Core bloom gradient
  const coreGrad = ctx.createRadialGradient(
    flarePos.x, flarePos.y, 2,
    flarePos.x, flarePos.y, rCore
  );
  coreGrad.addColorStop(0, `rgba(${colors.core}, ${0.95 * intensity})`);
  coreGrad.addColorStop(0.2, `rgba(${colors.halo}, ${0.65 * intensity})`);
  coreGrad.addColorStop(0.5, `rgba(${colors.ring}, ${0.25 * intensity})`);
  coreGrad.addColorStop(1, 'rgba(0,0,0,0)');

  ctx.fillStyle = coreGrad;
  ctx.fillRect(0, 0, w, h);

  // 2. Chromatic aberration halo ring
  ctx.beginPath();
  const ringRadius = maxDimension * 0.18;
  ctx.arc(flarePos.x, flarePos.y, ringRadius, 0, Math.PI * 2);
  ctx.strokeStyle = `rgba(${colors.ring}, ${0.4 * intensity})`;
  ctx.lineWidth = 3;
  ctx.stroke();

  // 3. Multi-element secondary ghost flares along optical vector
  const ghosts = calculateGhostPositions(flarePos.x, flarePos.y, w, h, 4);
  ghosts.forEach((ghost, idx) => {
    const ghostGrad = ctx.createRadialGradient(
      ghost.x, ghost.y, 2,
      ghost.x, ghost.y, ghost.size
    );
    const color = idx % 2 === 0 ? colors.ring : colors.halo;
    ghostGrad.addColorStop(0, `rgba(${color}, ${ghost.opacity * intensity * 1.5})`);
    ghostGrad.addColorStop(0.6, `rgba(${color}, ${ghost.opacity * 0.4 * intensity})`);
    ghostGrad.addColorStop(1, 'rgba(0,0,0,0)');

    ctx.fillStyle = ghostGrad;
    ctx.beginPath();
    ctx.arc(ghost.x, ghost.y, ghost.size, 0, Math.PI * 2);
    ctx.fill();
  });

  // 4. Anamorphic horizontal streak
  if (anamorphic) {
    const streakGrad = ctx.createLinearGradient(0, flarePos.y, w, flarePos.y);
    streakGrad.addColorStop(0, 'rgba(0,0,0,0)');
    streakGrad.addColorStop(Math.max(0, (flarePos.x / w) - 0.25), `rgba(${colors.streak}, ${0.1 * intensity})`);
    streakGrad.addColorStop(flarePos.x / w, `rgba(${colors.core}, ${0.9 * intensity})`);
    streakGrad.addColorStop(Math.min(1, (flarePos.x / w) + 0.25), `rgba(${colors.streak}, ${0.1 * intensity})`);
    streakGrad.addColorStop(1, 'rgba(0,0,0,0)');

    ctx.fillStyle = streakGrad;
    ctx.fillRect(0, flarePos.y - 1.5, w, 3);

    // Subtle wider diffusion bar
    ctx.fillStyle = `rgba(${colors.halo}, ${0.12 * intensity})`;
    ctx.fillRect(0, flarePos.y - 6, w, 12);
  }

  ctx.restore();
}

/**
 * Renders darkroom frame styles (Dark optical bottom bar, classic white mat, polaroid)
 */
export function renderFrame(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  settings: StudioSettings,
  flarePos: { x: number; y: number }
) {
  const { frameMode, ratio, contrast, sat, flare, bright, vig } = settings;
  if (frameMode === 'none') return;

  if (frameMode === 'dark') {
    const barH = Math.max(38, Math.round(h * 0.088));
    ctx.fillStyle = '#070b13';
    ctx.fillRect(0, h - barH, w, barH);

    // Hairline divider
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, h - barH, w, 1);

    ctx.fillStyle = '#f8fafc';
    ctx.font = `600 ${Math.max(11, Math.round(barH * 0.34))}px "Plus Jakarta Sans", "Noto Sans CJK TC", "WenQuanYi Zen Hei", sans-serif`;
    ctx.fillText('LUMISTUDIO OPTICAL LAB', 18, h - barH * 0.4);

    ctx.fillStyle = '#94a3b8';
    ctx.font = `400 ${Math.max(10, Math.round(barH * 0.28))}px "JetBrains Mono", monospace`;
    const ratioText = RATIO_NAMES[ratio] || ratio.toUpperCase();
    const info = `${ratioText} | EXP:${bright}% C:${contrast}% S:${sat}% FLARE:${Math.round(flare)}% VIG:${Math.round(vig)}%`;
    const tw = ctx.measureText(info).width;
    ctx.fillText(info, Math.max(18, w - tw - 18), h - barH * 0.4);
  } else if (frameMode === 'light') {
    const barH = Math.max(42, Math.round(h * 0.1));
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, h - barH, w, barH);

    // Hairline top border
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(0, h - barH, w, 1);

    ctx.fillStyle = '#0f172a';
    ctx.font = `700 ${Math.max(12, Math.round(barH * 0.34))}px "Plus Jakarta Sans", sans-serif`;
    ctx.fillText('EXHIBITION PRINT // DARKROOM MASTER', 18, h - barH * 0.42);

    ctx.fillStyle = '#475569';
    ctx.font = `500 ${Math.max(10, Math.round(barH * 0.28))}px "JetBrains Mono", monospace`;
    const info = `RATIO: ${ratio.toUpperCase()} · ISO 400 · f/2.8 · OPTICAL FLARE POS: (${Math.round(flarePos.x)}, ${Math.round(flarePos.y)})`;
    const tw = ctx.measureText(info).width;
    ctx.fillText(info, Math.max(18, w - tw - 18), h - barH * 0.42);
  } else if (frameMode === 'polaroid') {
    // Polaroid border with generous bottom chin
    const border = Math.round(w * 0.035);
    const bottomBorder = Math.round(h * 0.16);
    
    ctx.fillStyle = '#fdfdfb';
    // Top, Left, Right
    ctx.fillRect(0, 0, w, border);
    ctx.fillRect(0, 0, border, h);
    ctx.fillRect(w - border, 0, border, h);
    // Bottom
    ctx.fillRect(0, h - bottomBorder, w, bottomBorder);

    // Handwritten-style bottom note
    ctx.fillStyle = '#334155';
    ctx.font = `500 ${Math.max(12, Math.round(bottomBorder * 0.26))}px "JetBrains Mono", monospace`;
    ctx.fillText('LumiStudio · Instant Film Analog No. 402', border + 10, h - bottomBorder * 0.45);
  } else if (frameMode === 'film_strip') {
    // 35mm film strip sprockets on top and bottom
    const barH = Math.max(28, Math.round(h * 0.075));
    ctx.fillStyle = '#05070c';
    ctx.fillRect(0, 0, w, barH);
    ctx.fillRect(0, h - barH, w, barH);

    // Sprocket holes
    ctx.fillStyle = '#e2e8f0';
    const holeW = Math.round(barH * 0.4);
    const holeH = Math.round(barH * 0.5);
    const step = holeW * 2.2;

    for (let x = 12; x < w - holeW; x += step) {
      ctx.fillRect(x, (barH - holeH) / 2, holeW, holeH);
      ctx.fillRect(x, h - barH + (barH - holeH) / 2, holeW, holeH);
    }
  }
}
