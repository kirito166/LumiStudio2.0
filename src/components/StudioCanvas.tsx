import React, { useRef, useEffect, useCallback, useState } from 'react';
import type { StudioSettings, FlarePosition } from '../types/studio.ts';
import {
  getCanvasDimensions,
  drawProceduralDarkroomScene,
  drawCompositionGuides,
  renderOpticalFlare,
  renderFrame,
} from '../utils/opticalRenderer.ts';
import type { SamplePhotoPreset } from '../utils/sampleImages.ts';
import { Lock, Unlock, Move, Maximize2, Crosshair, Sparkles } from 'lucide-react';

interface StudioCanvasProps {
  settings: StudioSettings;
  userImage: HTMLImageElement | null;
  activePreset: SamplePhotoPreset | null;
  flarePos: FlarePosition;
  setFlarePos: (pos: FlarePosition) => void;
  flareLocked: boolean;
  setFlareLocked: (locked: boolean | ((prev: boolean) => boolean)) => void;
  isComparing: boolean;
  onUpdatePan: (panX: number, panY: number) => void;
  onUpdateZoom: (zoom: number) => void;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
}

export const StudioCanvas: React.FC<StudioCanvasProps> = ({
  settings,
  userImage,
  activePreset,
  flarePos,
  setFlarePos,
  flareLocked,
  setFlareLocked,
  isComparing,
  onUpdatePan,
  onUpdateZoom,
  canvasRef,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0, initPanX: 0, initPanY: 0 });
  const [isHovered, setIsHovered] = useState(false);

  // Compute canvas pixel dimensions
  const sourceWidth = userImage ? userImage.width : 900;
  const sourceHeight = userImage ? userImage.height : 600;
  const { width: canvasWidth, height: canvasHeight } = getCanvasDimensions(
    settings.ratio,
    sourceWidth,
    sourceHeight,
    900
  );

  // Core Render Cycle
  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (canvas.width !== canvasWidth || canvas.height !== canvasHeight) {
      canvas.width = canvasWidth;
      canvas.height = canvasHeight;
    }

    const w = canvasWidth;
    const h = canvasHeight;

    ctx.clearRect(0, 0, w, h);

    if (isComparing) {
      // In comparison mode: render clean unedited source with no filters/flares
      ctx.save();
      if (userImage) {
        ctx.drawImage(userImage, 0, 0, w, h);
      } else if (activePreset) {
        activePreset.renderToCanvas(ctx, w, h);
      } else {
        drawProceduralDarkroomScene(ctx, w, h, 1, 0, 0);
      }
      ctx.restore();

      // Comparison watermark banner
      ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
      ctx.fillRect(16, 16, 110, 26);
      ctx.fillStyle = '#f8fafc';
      ctx.font = '600 11px "Plus Jakarta Sans", "Noto Sans CJK TC", "WenQuanYi Zen Hei", sans-serif';
      ctx.fillText('ORIGINAL (原圖)', 26, 33);
      return;
    }

    // Normal mode: Apply Tone & Color filters
    const { bright, contrast, sat, temp, hue, blur, zoom, panX, panY, rotate, flipH, fitMode } = settings;

    ctx.save();
    // 1. Base filter
    ctx.filter = `brightness(${bright}%) contrast(${contrast}%) saturate(${sat}%) hue-rotate(${hue}deg) blur(${blur * 0.4}px)`;

    // Transform for pan / zoom / rotation / flip
    const panXPx = (panX / 100) * (w * 0.5);
    const panYPx = (panY / 100) * (h * 0.5);
    const zoomFactor = zoom / 100;

    // Render source (user image or preset or procedural)
    if (userImage) {
      const imgRatio = userImage.width / userImage.height;
      const canRatio = w / h;
      let drawW: number;
      let drawH: number;

      if ((fitMode === 'cover' && imgRatio > canRatio) || (fitMode === 'contain' && imgRatio < canRatio)) {
        drawH = h * zoomFactor;
        drawW = drawH * imgRatio;
      } else if (fitMode === 'stretch') {
        drawW = w * zoomFactor;
        drawH = h * zoomFactor;
      } else {
        drawW = w * zoomFactor;
        drawH = drawW / imgRatio;
      }

      const dx = (w - drawW) / 2 + panXPx;
      const dy = (h - drawH) / 2 + panYPx;

      ctx.save();
      if (flipH || rotate !== 0) {
        ctx.translate(w / 2, h / 2);
        if (flipH) ctx.scale(-1, 1);
        if (rotate !== 0) ctx.rotate((rotate * Math.PI) / 180);
        ctx.translate(-w / 2, -h / 2);
      }
      ctx.drawImage(userImage, dx, dy, drawW, drawH);
      ctx.restore();
    } else if (activePreset) {
      // Offscreen canvas for preset transforms
      const offCanvas = document.createElement('canvas');
      offCanvas.width = w;
      offCanvas.height = h;
      const offCtx = offCanvas.getContext('2d');
      if (offCtx) {
        activePreset.renderToCanvas(offCtx, w, h);
        const dx = (w - w * zoomFactor) / 2 + panXPx;
        const dy = (h - h * zoomFactor) / 2 + panYPx;
        ctx.save();
        if (flipH || rotate !== 0) {
          ctx.translate(w / 2, h / 2);
          if (flipH) ctx.scale(-1, 1);
          if (rotate !== 0) ctx.rotate((rotate * Math.PI) / 180);
          ctx.translate(-w / 2, -h / 2);
        }
        ctx.drawImage(offCanvas, dx, dy, w * zoomFactor, h * zoomFactor);
        ctx.restore();
      }
    } else {
      drawProceduralDarkroomScene(ctx, w, h, zoomFactor, panXPx, panYPx);
    }

    ctx.filter = 'none';
    ctx.restore();

    // 2. Color Temperature Tint overlay
    if (temp !== 0) {
      ctx.save();
      ctx.globalCompositeOperation = 'soft-light';
      ctx.fillStyle =
        temp > 0
          ? `rgba(255, 145, 45, ${temp / 150})`
          : `rgba(45, 150, 255, ${Math.abs(temp) / 150})`;
      ctx.fillRect(0, 0, w, h);
      ctx.restore();
    }

    // 3. Optical Vignette
    if (settings.vig > 0) {
      ctx.save();
      const radius = Math.max(w, h) * 0.65;
      const vigGrad = ctx.createRadialGradient(
        w / 2, h / 2, radius * 0.22,
        w / 2, h / 2, radius
      );
      vigGrad.addColorStop(0, 'rgba(0,0,0,0)');
      vigGrad.addColorStop(1, `rgba(0,0,0,${(settings.vig / 100) * 0.88})`);
      ctx.fillStyle = vigGrad;
      ctx.fillRect(0, 0, w, h);
      ctx.restore();
    }

    // 4. Optical Flare & Lens Glare (Screen blend)
    renderOpticalFlare(
      ctx,
      w,
      h,
      flarePos,
      settings.flare,
      settings.flareColor,
      settings.anamorphic
    );

    // 5. Procedural Silver-Halide Film Grain
    if (settings.grain > 0) {
      ctx.save();
      const grainFactor = settings.grain / 100;
      const count = Math.min(25000, Math.round(w * h * 0.015 * grainFactor));
      ctx.fillStyle = `rgba(255, 255, 255, ${grainFactor * 0.16})`;
      const pSize = settings.grainSize;

      for (let i = 0; i < count; i++) {
        const gx = Math.random() * w;
        const gy = Math.random() * h;
        ctx.fillRect(gx, gy, pSize, pSize);
      }
      ctx.restore();
    }

    // 6. Composition Guides
    drawCompositionGuides(ctx, w, h, settings.guideMode);

    // 7. Darkroom Exhibition Frame
    renderFrame(ctx, w, h, settings, flarePos);
  }, [
    canvasWidth,
    canvasHeight,
    settings,
    userImage,
    activePreset,
    flarePos,
    isComparing,
    canvasRef,
  ]);

  // Re-render when dependencies change
  useEffect(() => {
    let animId: number;
    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [render]);

  // Mouse move handler for flare
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Handle pan dragging if alt key or middle click or dragging mode
    if (isDraggingRef.current) {
      const deltaX = e.clientX - dragStartRef.current.x;
      const deltaY = e.clientY - dragStartRef.current.y;
      const newPanX = Math.max(-100, Math.min(100, dragStartRef.current.initPanX + (deltaX / canvas.clientWidth) * 200));
      const newPanY = Math.max(-100, Math.min(100, dragStartRef.current.initPanY + (deltaY / canvas.clientHeight) * 200));
      onUpdatePan(Math.round(newPanX), Math.round(newPanY));
      return;
    }

    // Follow optical flare if unlocked
    if (!flareLocked) {
      const rect = canvas.getBoundingClientRect();
      const clientX = e.clientX - rect.left;
      const clientY = e.clientY - rect.top;
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;

      setFlarePos({
        x: Math.round(clientX * scaleX),
        y: Math.round(clientY * scaleY),
      });
    }
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    // If Space or Alt or Shift or right click, initiate pan dragging
    if (e.shiftKey || e.altKey || e.button === 1) {
      isDraggingRef.current = true;
      dragStartRef.current = {
        x: e.clientX,
        y: e.clientY,
        initPanX: settings.panX,
        initPanY: settings.panY,
      };
    }
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isDraggingRef.current) return;
    // Click locks / unlocks the optical flare position
    setFlareLocked((prev) => !prev);
  };

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const zoomDelta = e.deltaY > 0 ? -10 : 10;
    const newZoom = Math.max(100, Math.min(250, settings.zoom + zoomDelta));
    onUpdateZoom(newZoom);
  };

  return (
    <div
      ref={containerRef}
      className="w-full flex flex-col items-center justify-center p-4 sm:p-6 bg-slate-900/60 border border-slate-800/80 rounded-2xl relative shadow-2xl overflow-hidden min-h-[500px]"
    >
      {/* Canvas Wrapper */}
      <div
        className="relative max-w-full flex items-center justify-center overflow-hidden rounded-lg group"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => {
          setIsHovered(false);
          isDraggingRef.current = false;
        }}
      >
        <canvas
          ref={canvasRef}
          onMouseMove={handleMouseMove}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onClick={handleCanvasClick}
          onWheel={handleWheel}
          className="max-w-full max-h-[520px] object-contain cursor-crosshair rounded-md shadow-2xl transition-all duration-150 select-none border border-slate-800/60"
          style={{ background: '#05070e' }}
          aria-label="暗房畫布：點擊鎖定光暈，移動滑鼠調整光影位置"
        />

        {/* Flare Reticle Indicator when hovered */}
        {isHovered && !isComparing && settings.flare > 0 && (
          <div
            className="pointer-events-none absolute w-8 h-8 -translate-x-1/2 -translate-y-1/2 rounded-full border border-sky-400/50 flex items-center justify-center transition-transform"
            style={{
              left: `${(flarePos.x / canvasWidth) * 100}%`,
              top: `${(flarePos.y / canvasHeight) * 100}%`,
            }}
          >
            <div className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-ping" />
          </div>
        )}
      </div>

      {/* Interactive Bottom Darkroom Bar */}
      <div className="w-full max-w-2xl flex flex-wrap items-center justify-between gap-3 mt-4 px-2 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setFlareLocked((l) => !l)}
            className={`px-2.5 py-1 rounded-md text-[11px] font-medium border flex items-center gap-1.5 transition-all ${
              flareLocked
                ? 'bg-amber-500/15 text-amber-300 border-amber-500/40'
                : 'bg-sky-500/15 text-sky-300 border-sky-500/40'
            }`}
          >
            {flareLocked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
            <span>{flareLocked ? '光暈已鎖定 (點擊解鎖)' : '光暈跟隨中 (點擊鎖定)'}</span>
          </button>

          <span className="text-[11px] font-mono text-slate-500 hidden sm:inline">
            座標: ({flarePos.x}, {flarePos.y})
          </span>
        </div>

        <div className="flex items-center gap-4 text-[11px] font-mono text-slate-400">
          <span className="flex items-center gap-1">
            <Maximize2 className="w-3 h-3 text-slate-500" />
            {canvasWidth} × {canvasHeight}px
          </span>
          <span className="text-slate-600">·</span>
          <span>縮放: {settings.zoom}%</span>
        </div>
      </div>
    </div>
  );
};
