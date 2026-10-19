import React from 'react';
import type {
  AspectRatioType,
  FitModeType,
  FrameModeType,
  ProfileType,
  FlareColorType,
  CompositionGuideType,
  StudioSettings,
} from '../types/studio.ts';
import { RATIO_NAMES, PROFILE_PRESETS } from '../utils/opticalRenderer.ts';
import { SAMPLE_PRESETS, SamplePhotoPreset } from '../utils/sampleImages.ts';
import {
  Crop,
  Sliders,
  Palette,
  Sun,
  Image as ImageIcon,
  Upload,
  RefreshCw,
  Copy,
  Download,
  FlipHorizontal,
  Grid,
} from 'lucide-react';

interface ControlPanelProps {
  settings: StudioSettings;
  updateSetting: <K extends keyof StudioSettings>(key: K, value: StudioSettings[K]) => void;
  activeProfile: ProfileType;
  setActiveProfile: (profile: ProfileType) => void;
  onApplyProfile: (profile: ProfileType) => void;
  activePresetId: string | null;
  onSelectSamplePreset: (preset: SamplePhotoPreset) => void;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onReset: () => void;
  onDownload: (scale: number, format: 'png' | 'jpeg') => void;
  onCopyToClipboard: () => void;
  hasUserImage: boolean;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  settings,
  updateSetting,
  activeProfile,
  setActiveProfile,
  onApplyProfile,
  activePresetId,
  onSelectSamplePreset,
  onFileUpload,
  onReset,
  onDownload,
  onCopyToClipboard,
  hasUserImage,
}) => {
  const ratios: AspectRatioType[] = ['orig', '3:2', '4:3', '1:1', '16:9', '9:16', '21:9', '5:4'];
  const profiles: ProfileType[] = ['vibrant', 'natural', 'mono', 'film', 'cyber', 'golden', 'silver'];

  return (
    <aside className="w-full bg-slate-900/90 border border-slate-800/80 rounded-2xl p-4 sm:p-5 flex flex-col gap-5 text-slate-200 backdrop-blur-md shadow-xl max-h-[88vh] overflow-y-auto">
      {/* Sample Image Plate Selector */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-sky-400 flex items-center gap-1.5">
            <ImageIcon className="w-3.5 h-3.5" />
            樣張或照片來源 (SOURCE PLATE)
          </span>
          {hasUserImage && (
            <span className="text-[10px] text-amber-400 font-mono">
              [自訂照片已載入]
            </span>
          )}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {SAMPLE_PRESETS.map((preset) => {
            const isSelected = activePresetId === preset.id && !hasUserImage;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => onSelectSamplePreset(preset)}
                className={`p-2 rounded-lg border text-left flex flex-col transition-all ${
                  isSelected
                    ? 'bg-sky-500/20 border-sky-400 text-sky-200 shadow-sm'
                    : 'bg-slate-950/70 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-800/50'
                }`}
              >
                <span className="text-xs font-semibold truncate">{preset.title}</span>
                <span className="text-[10px] text-slate-400 font-mono truncate">{preset.subtitle}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 1. Aspect Ratio & Composition */}
      <section id="section-ratio" className="flex flex-col gap-3 pt-2 border-t border-slate-800/70">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-sky-400 flex items-center gap-1.5">
            <Crop className="w-3.5 h-3.5" />
            1. 畫幅比例與構圖裁切 (ASPECT RATIO & CROP)
          </span>
          <span className="text-[11px] font-mono text-slate-400">
            {RATIO_NAMES[settings.ratio]}
          </span>
        </div>

        {/* Aspect Ratio Buttons */}
        <div className="grid grid-cols-4 gap-1.5" id="ratioBtns">
          {ratios.map((r) => {
            const isActive = settings.ratio === r;
            return (
              <button
                key={r}
                type="button"
                onClick={() => updateSetting('ratio', r)}
                className={`py-1.5 px-2 rounded-md text-xs font-medium border text-center transition-all ${
                  isActive
                    ? 'bg-sky-400 text-slate-950 border-sky-400 font-semibold shadow-sm'
                    : 'bg-slate-950/80 text-slate-300 border-slate-800 hover:border-slate-700 hover:text-white'
                }`}
              >
                {RATIO_NAMES[r]}
              </button>
            );
          })}
        </div>

        {/* Fit mode & Guide & Frame */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
          <div className="flex flex-col gap-1">
            <label className="text-[11px] text-slate-400">填充模式</label>
            <select
              value={settings.fitMode}
              onChange={(e) => updateSetting('fitMode', e.target.value as FitModeType)}
              className="bg-slate-950 border border-slate-800 rounded-md py-1.5 px-2 text-xs text-slate-200 focus:outline-none focus:border-sky-400 cursor-pointer"
            >
              <option value="cover">滿版裁切 (無留黑)</option>
              <option value="contain">完整顯示 (留底邊)</option>
              <option value="stretch">自訂拉伸</option>
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[11px] text-slate-400">構圖輔助格線</label>
            <select
              value={settings.guideMode}
              onChange={(e) => updateSetting('guideMode', e.target.value as CompositionGuideType)}
              className="bg-slate-950 border border-slate-800 rounded-md py-1.5 px-2 text-xs text-slate-200 focus:outline-none focus:border-sky-400 cursor-pointer"
            >
              <option value="none">關閉格線</option>
              <option value="thirds">三分構圖法則 (3×3)</option>
              <option value="golden">黃金分割比例</option>
              <option value="crosshair">中心十字準心</option>
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[11px] text-slate-400">極簡展覽相框</label>
            <select
              value={settings.frameMode}
              onChange={(e) => updateSetting('frameMode', e.target.value as FrameModeType)}
              className="bg-slate-950 border border-slate-800 rounded-md py-1.5 px-2 text-xs text-slate-200 focus:outline-none focus:border-sky-400 cursor-pointer"
            >
              <option value="none">關閉相框</option>
              <option value="dark">深色光學底框 (EXIF)</option>
              <option value="light">經典白邊展覽框</option>
              <option value="polaroid">經典拍立得邊框</option>
              <option value="film_strip">35mm 底片齒孔</option>
            </select>
          </div>
        </div>

        {/* Zoom & Pan Controls */}
        <div className="grid grid-cols-2 gap-3 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/60">
          <div className="flex flex-col gap-1">
            <div className="flex justify-between text-[11px] text-slate-400">
              <span>畫面縮放</span>
              <span className="font-mono text-sky-400">{settings.zoom}%</span>
            </div>
            <input
              type="range"
              min="100"
              max="250"
              value={settings.zoom}
              onChange={(e) => updateSetting('zoom', Number(e.target.value))}
              className="w-full accent-sky-400 h-1.5 bg-slate-800 rounded cursor-pointer"
            />
          </div>

          <div className="flex flex-col gap-1">
            <div className="flex justify-between text-[11px] text-slate-400">
              <span>水平/垂直平移</span>
              <span className="font-mono text-sky-400">{settings.panX}, {settings.panY}</span>
            </div>
            <div className="flex gap-2">
              <input
                type="range"
                min="-100"
                max="100"
                value={settings.panX}
                onChange={(e) => updateSetting('panX', Number(e.target.value))}
                title="水平平移"
                className="w-1/2 accent-sky-400 h-1.5 bg-slate-800 rounded cursor-pointer"
              />
              <input
                type="range"
                min="-100"
                max="100"
                value={settings.panY}
                onChange={(e) => updateSetting('panY', Number(e.target.value))}
                title="垂直平移"
                className="w-1/2 accent-sky-400 h-1.5 bg-slate-800 rounded cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Rotate & Flip */}
        <div className="flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 flex-1">
            <span className="text-[11px] text-slate-400 whitespace-nowrap">旋轉</span>
            <input
              type="range"
              min="-45"
              max="45"
              value={settings.rotate}
              onChange={(e) => updateSetting('rotate', Number(e.target.value))}
              className="w-full accent-sky-400 h-1.5 bg-slate-800 rounded cursor-pointer"
            />
            <span className="font-mono text-sky-400 text-[11px] w-8 text-right">{settings.rotate}°</span>
          </div>

          <button
            type="button"
            onClick={() => updateSetting('flipH', !settings.flipH)}
            className={`px-2.5 py-1 rounded text-[11px] border flex items-center gap-1 transition-all ${
              settings.flipH
                ? 'bg-sky-500/20 text-sky-300 border-sky-400'
                : 'bg-slate-950 text-slate-300 border-slate-800 hover:text-white'
            }`}
          >
            <FlipHorizontal className="w-3 h-3" />
            <span>水平翻轉</span>
          </button>
        </div>
      </section>

      {/* 2. Color Profiles */}
      <section id="section-profile" className="flex flex-col gap-2.5 pt-2 border-t border-slate-800/70">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-sky-400 flex items-center gap-1.5">
            <Palette className="w-3.5 h-3.5" />
            2. 色調風格預設 (COLOR PROFILES)
          </span>
          <span className="text-[11px] font-mono text-slate-400">
            {PROFILE_PRESETS[activeProfile].tag}
          </span>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5" id="profileBtns">
          {profiles.map((p) => {
            const isActive = activeProfile === p;
            return (
              <button
                key={p}
                type="button"
                onClick={() => onApplyProfile(p)}
                className={`py-1.5 px-2 rounded-md text-xs font-medium border text-center transition-all ${
                  isActive
                    ? 'bg-sky-400 text-slate-950 border-sky-400 font-semibold shadow-sm'
                    : 'bg-slate-950/80 text-slate-300 border-slate-800 hover:border-slate-700 hover:text-white'
                }`}
              >
                {PROFILE_PRESETS[p].name}
              </button>
            );
          })}
        </div>
      </section>

      {/* 3. Tone & Color */}
      <section id="section-tone" className="flex flex-col gap-3 pt-2 border-t border-slate-800/70">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-sky-400 flex items-center gap-1.5">
            <Sun className="w-3.5 h-3.5" />
            3. 曝光與色彩精調 (TONE & COLOR)
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          {/* Exposure */}
          <div className="flex flex-col gap-1">
            <div className="flex justify-between text-[11px] text-slate-400">
              <span>曝光亮度 (Exposure)</span>
              <span className="font-mono text-sky-400">{settings.bright}%</span>
            </div>
            <input
              type="range"
              min="50"
              max="150"
              value={settings.bright}
              onChange={(e) => updateSetting('bright', Number(e.target.value))}
              className="w-full accent-sky-400 h-1.5 bg-slate-800 rounded cursor-pointer"
            />
          </div>

          {/* Contrast */}
          <div className="flex flex-col gap-1">
            <div className="flex justify-between text-[11px] text-slate-400">
              <span>對比度 (Contrast)</span>
              <span className="font-mono text-sky-400">{settings.contrast}%</span>
            </div>
            <input
              type="range"
              min="50"
              max="200"
              value={settings.contrast}
              onChange={(e) => updateSetting('contrast', Number(e.target.value))}
              className="w-full accent-sky-400 h-1.5 bg-slate-800 rounded cursor-pointer"
            />
          </div>

          {/* Saturation */}
          <div className="flex flex-col gap-1">
            <div className="flex justify-between text-[11px] text-slate-400">
              <span>色彩飽和度 (Saturation)</span>
              <span className="font-mono text-sky-400">{settings.sat}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="200"
              value={settings.sat}
              onChange={(e) => updateSetting('sat', Number(e.target.value))}
              className="w-full accent-sky-400 h-1.5 bg-slate-800 rounded cursor-pointer"
            />
          </div>

          {/* Temperature */}
          <div className="flex flex-col gap-1">
            <div className="flex justify-between text-[11px] text-slate-400">
              <span>色溫冷暖 (Kelvin Temp)</span>
              <span className="font-mono text-sky-400">
                {settings.temp > 0 ? `+${settings.temp}` : settings.temp}
              </span>
            </div>
            <input
              type="range"
              min="-100"
              max="100"
              value={settings.temp}
              onChange={(e) => updateSetting('temp', Number(e.target.value))}
              className="w-full accent-sky-400 h-1.5 bg-slate-800 rounded cursor-pointer"
            />
          </div>

          {/* Hue */}
          <div className="flex flex-col gap-1">
            <div className="flex justify-between text-[11px] text-slate-400">
              <span>色相微調 (Hue Rotate)</span>
              <span className="font-mono text-sky-400">{settings.hue}°</span>
            </div>
            <input
              type="range"
              min="-45"
              max="45"
              value={settings.hue}
              onChange={(e) => updateSetting('hue', Number(e.target.value))}
              className="w-full accent-sky-400 h-1.5 bg-slate-800 rounded cursor-pointer"
            />
          </div>

          {/* Soft Blur / Mist */}
          <div className="flex flex-col gap-1">
            <div className="flex justify-between text-[11px] text-slate-400">
              <span>柔焦光暈朦朧 (Mist Blur)</span>
              <span className="font-mono text-sky-400">{settings.blur}px</span>
            </div>
            <input
              type="range"
              min="0"
              max="10"
              step="0.5"
              value={settings.blur}
              onChange={(e) => updateSetting('blur', Number(e.target.value))}
              className="w-full accent-sky-400 h-1.5 bg-slate-800 rounded cursor-pointer"
            />
          </div>
        </div>
      </section>

      {/* 4. Optics & Film Grain */}
      <section id="section-optics" className="flex flex-col gap-3 pt-2 border-t border-slate-800/70">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-sky-400 flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5" />
            4. 光學耀光與底片質感 (OPTICS & GRAIN)
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          {/* Lens Flare Intensity */}
          <div className="flex flex-col gap-1">
            <div className="flex justify-between text-[11px] text-slate-400">
              <span>鏡頭光暈強度 (Flare)</span>
              <span className="font-mono text-sky-400">{settings.flare}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={settings.flare}
              onChange={(e) => updateSetting('flare', Number(e.target.value))}
              className="w-full accent-sky-400 h-1.5 bg-slate-800 rounded cursor-pointer"
            />
          </div>

          {/* Flare Color Preset */}
          <div className="flex flex-col gap-1">
            <label className="text-[11px] text-slate-400">光暈色系選擇</label>
            <select
              value={settings.flareColor}
              onChange={(e) => updateSetting('flareColor', e.target.value as FlareColorType)}
              className="bg-slate-950 border border-slate-800 rounded-md py-1.5 px-2 text-xs text-slate-200 focus:outline-none focus:border-sky-400 cursor-pointer"
            >
              <option value="amber_gold">琥珀暖金 (Amber Gold)</option>
              <option value="warm">夕陽溫暖 (Warm Sunset)</option>
              <option value="ice">冰川光學藍 (Glacial Ice)</option>
              <option value="neon">賽博霓虹紫 (Cyber Neon)</option>
              <option value="emerald">青翡翠綠 (Vintage Emerald)</option>
            </select>
          </div>

          {/* Vignette */}
          <div className="flex flex-col gap-1">
            <div className="flex justify-between text-[11px] text-slate-400">
              <span>邊緣光學暗角 (Vignette)</span>
              <span className="font-mono text-sky-400">{settings.vig}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={settings.vig}
              onChange={(e) => updateSetting('vig', Number(e.target.value))}
              className="w-full accent-sky-400 h-1.5 bg-slate-800 rounded cursor-pointer"
            />
          </div>

          {/* Film Grain */}
          <div className="flex flex-col gap-1">
            <div className="flex justify-between text-[11px] text-slate-400">
              <span>底片銀鹽顆粒 (Grain)</span>
              <span className="font-mono text-sky-400">{settings.grain}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={settings.grain}
              onChange={(e) => updateSetting('grain', Number(e.target.value))}
              className="w-full accent-sky-400 h-1.5 bg-slate-800 rounded cursor-pointer"
            />
          </div>
        </div>

        {/* Anamorphic streak checkbox */}
        <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer bg-slate-950/40 p-2 rounded border border-slate-800/60">
          <input
            type="checkbox"
            checked={settings.anamorphic}
            onChange={(e) => updateSetting('anamorphic', e.target.checked)}
            className="rounded accent-sky-400 cursor-pointer"
          />
          <span>啟用變形寬銀幕水平光學條紋 (Anamorphic Horizontal Streak)</span>
        </label>
      </section>

      {/* Action Strip: Upload, Reset, Download */}
      <div className="flex flex-col gap-2.5 pt-3 border-t border-slate-800/70">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {/* File Upload */}
          <label className="py-2 px-3 bg-slate-950 hover:bg-slate-800/80 border border-slate-700/80 rounded-lg text-xs font-medium text-slate-200 cursor-pointer flex items-center justify-center gap-1.5 transition-all text-center">
            <Upload className="w-3.5 h-3.5 text-sky-400" />
            <span>上傳照片</span>
            <input
              type="file"
              accept="image/*"
              onChange={onFileUpload}
              className="hidden"
            />
          </label>

          {/* Reset button */}
          <button
            type="button"
            onClick={onReset}
            className="py-2 px-3 bg-slate-950 hover:bg-slate-800/80 border border-slate-700/80 rounded-lg text-xs font-medium text-slate-300 hover:text-white flex items-center justify-center gap-1.5 transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
            <span>重設參數</span>
          </button>

          {/* Copy to clipboard */}
          <button
            type="button"
            onClick={onCopyToClipboard}
            className="py-2 px-3 bg-slate-950 hover:bg-slate-800/80 border border-slate-700/80 rounded-lg text-xs font-medium text-slate-300 hover:text-white flex items-center justify-center gap-1.5 transition-all"
          >
            <Copy className="w-3.5 h-3.5 text-sky-400" />
            <span>複製畫布</span>
          </button>

          {/* Standard 1x Export */}
          <button
            type="button"
            onClick={() => onDownload(1, 'png')}
            className="py-2 px-3 bg-sky-400 hover:bg-sky-300 active:bg-sky-500 rounded-lg text-xs font-semibold text-slate-950 shadow-sm flex items-center justify-center gap-1.5 transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span>下載作品</span>
          </button>
        </div>

        {/* Master 2x HD Export options */}
        <div className="flex items-center justify-between text-[11px] text-slate-400 px-1 font-mono">
          <span>高畫質旗艦導出:</span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onDownload(2, 'png')}
              className="text-sky-400 hover:underline cursor-pointer"
            >
              2× 超清 PNG
            </button>
            <span>·</span>
            <button
              type="button"
              onClick={() => onDownload(2, 'jpeg')}
              className="text-sky-400 hover:underline cursor-pointer"
            >
              2× 高質 JPG
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
};
