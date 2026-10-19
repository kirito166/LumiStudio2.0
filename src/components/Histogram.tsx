import React, { useMemo } from 'react';
import type { StudioSettings } from '../types/studio.ts';

interface HistogramProps {
  settings: StudioSettings;
}

export const Histogram: React.FC<HistogramProps> = ({ settings }) => {
  // Approximate RGB and luminance distributions based on studio tone curves
  const curves = useMemo(() => {
    const bins = 40;
    const rCurve: number[] = [];
    const gCurve: number[] = [];
    const bCurve: number[] = [];
    const lumCurve: number[] = [];

    const brightFactor = (settings.bright - 100) / 100; // -0.5 to +0.5
    const contrastFactor = settings.contrast / 100; // 0.5 to 2.0
    const tempShift = settings.temp / 100; // -1 to 1 (warm = red high, cold = blue high)
    const sat = settings.sat / 100;

    for (let i = 0; i < bins; i++) {
      const x = i / (bins - 1); // 0 to 1
      // Base photographic bell curve (midtones centered around 0.45)
      const center = 0.45 + brightFactor * 0.28;
      const sigma = 0.22 / Math.sqrt(contrastFactor);
      const baseGaussian = Math.exp(-Math.pow(x - center, 2) / (2 * Math.pow(sigma, 2)));

      // Color temperature divergence
      const redVal = Math.min(1, Math.max(0.05, baseGaussian * (1 + tempShift * 0.35 * sat)));
      const blueVal = Math.min(1, Math.max(0.05, baseGaussian * (1 - tempShift * 0.35 * sat)));
      const greenVal = Math.min(1, Math.max(0.05, baseGaussian * (1 + Math.abs(tempShift) * 0.05)));
      const lumVal = 0.299 * redVal + 0.587 * greenVal + 0.114 * blueVal;

      rCurve.push(redVal);
      gCurve.push(greenVal);
      bCurve.push(blueVal);
      lumCurve.push(lumVal);
    }

    return { rCurve, gCurve, bCurve, lumCurve };
  }, [settings.bright, settings.contrast, settings.temp, settings.sat]);

  // Convert curve to SVG path
  const makePath = (curve: number[]) => {
    return curve
      .map((val, idx) => {
        const x = (idx / (curve.length - 1)) * 100;
        const y = 32 - val * 28;
        return `${idx === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
      })
      .join(' ');
  };

  return (
    <div className="w-full bg-slate-900/80 border border-slate-800/80 rounded-xl p-3 flex flex-col gap-1.5">
      <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
        <span className="flex items-center gap-1.5 font-semibold text-slate-300">
          <span className="w-1.5 h-1.5 rounded-full bg-sky-400"></span>
          RGB 色階直方圖 (HISTOGRAM)
        </span>
        <div className="flex items-center gap-2 text-[10px]">
          <span className="text-red-400">R</span>
          <span className="text-emerald-400">G</span>
          <span className="text-sky-400">B</span>
          <span className="text-slate-300">LUM</span>
        </div>
      </div>

      <div className="relative h-12 w-full bg-slate-950/90 rounded border border-slate-800/60 overflow-hidden flex items-end">
        <svg viewBox="0 0 100 32" preserveAspectRatio="none" className="w-full h-full opacity-85">
          {/* Grid lines */}
          <line x1="25" y1="0" x2="25" y2="32" stroke="rgba(255,255,255,0.06)" strokeWidth="0.5" />
          <line x1="50" y1="0" x2="50" y2="32" stroke="rgba(255,255,255,0.08)" strokeWidth="0.5" />
          <line x1="75" y1="0" x2="75" y2="32" stroke="rgba(255,255,255,0.06)" strokeWidth="0.5" />

          {/* Curves */}
          <path d={makePath(curves.rCurve)} fill="none" stroke="#f87171" strokeWidth="1.2" opacity="0.6" />
          <path d={makePath(curves.gCurve)} fill="none" stroke="#4ade80" strokeWidth="1.2" opacity="0.6" />
          <path d={makePath(curves.bCurve)} fill="none" stroke="#38bdf8" strokeWidth="1.2" opacity="0.6" />
          <path d={makePath(curves.lumCurve)} fill="none" stroke="#f8fafc" strokeWidth="1.5" opacity="0.9" />
        </svg>

        {/* Shadow / Highlight clipping warnings */}
        <div className="absolute left-1 bottom-1 text-[9px] font-mono text-slate-500">
          暗部 0
        </div>
        <div className="absolute right-1 bottom-1 text-[9px] font-mono text-slate-500">
          亮部 255
        </div>
      </div>

      {/* Optical EXIF stats strip */}
      <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pt-0.5 border-t border-slate-800/50">
        <span>EXP: {settings.bright > 100 ? `+${(settings.bright - 100) / 50} EV` : `${(settings.bright - 100) / 50} EV`}</span>
        <span>CONTRAST: {settings.contrast}%</span>
        <span>TEMP: {settings.temp > 0 ? `+${settings.temp}K` : `${settings.temp}K`}</span>
      </div>
    </div>
  );
};
