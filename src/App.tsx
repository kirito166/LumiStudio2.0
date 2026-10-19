import React, { useState, useRef, useEffect, useCallback } from 'react';
import type { StudioSettings, FlarePosition, ProfileType } from './types/studio.ts';
import { DEFAULT_SETTINGS, PROFILE_PRESETS, getCanvasDimensions } from './utils/opticalRenderer.ts';
import { SAMPLE_PRESETS, SamplePhotoPreset } from './utils/sampleImages.ts';
import { Header } from './components/Header.tsx';
import { StudioCanvas } from './components/StudioCanvas.tsx';
import { Histogram } from './components/Histogram.tsx';
import { ControlPanel } from './components/ControlPanel.tsx';
import { Info, Sparkles, CheckCircle2 } from 'lucide-react';

export default function App() {
  const [settings, setSettings] = useState<StudioSettings>(DEFAULT_SETTINGS);
  const [activeProfile, setActiveProfile] = useState<ProfileType>('vibrant');
  const [activePreset, setActivePreset] = useState<SamplePhotoPreset | null>(SAMPLE_PRESETS[0]);
  const [userImage, setUserImage] = useState<HTMLImageElement | null>(null);
  const [flarePos, setFlarePos] = useState<FlarePosition>({ x: 675, y: 170 });
  const [flareLocked, setFlareLocked] = useState<boolean>(false);
  const [isComparing, setIsComparing] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Show auto-dismiss toast notification
  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 2500);
  }, []);

  // Update a single setting
  const updateSetting = useCallback(
    <K extends keyof StudioSettings>(key: K, value: StudioSettings[K]) => {
      setSettings((prev) => {
        const next = { ...prev, [key]: value };
        // If changing ratio, recalculate flare position to relative optical spot
        if (key === 'ratio') {
          const srcW = userImage ? userImage.width : 900;
          const srcH = userImage ? userImage.height : 600;
          const { width, height } = getCanvasDimensions(value as StudioSettings['ratio'], srcW, srcH, 900);
          setFlarePos({ x: Math.round(width * 0.75), y: Math.round(height * 0.28) });
        }
        return next;
      });
    },
    [userImage]
  );

  // Apply a profile preset
  const handleApplyProfile = useCallback((profile: ProfileType) => {
    setActiveProfile(profile);
    const p = PROFILE_PRESETS[profile];
    setSettings((prev) => ({
      ...prev,
      ...p.settings,
    }));
    showToast(`已套用風格預設: ${p.name} (${p.tag})`);
  }, [showToast]);

  // Handle switching sample preset
  const handleSelectSamplePreset = useCallback((preset: SamplePhotoPreset) => {
    setUserImage(null);
    setActivePreset(preset);
    setSettings((prev) => ({
      ...prev,
      ratio: preset.defaultRatio,
    }));
    const { width, height } = getCanvasDimensions(preset.defaultRatio, 900, 600, 900);
    setFlarePos({ x: Math.round(width * 0.72), y: Math.round(height * 0.25) });
    showToast(`已切換樣張: ${preset.title}`);
  }, [showToast]);

  // Handle image file upload
  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        setUserImage(img);
        setActivePreset(null);
        setSettings((prev) => ({
          ...prev,
          ratio: 'orig',
          zoom: 100,
          panX: 0,
          panY: 0,
        }));
        const { width, height } = getCanvasDimensions('orig', img.width, img.height, 900);
        setFlarePos({ x: Math.round(width * 0.75), y: Math.round(height * 0.28) });
        showToast('照片上傳成功！已切換至原圖比例');
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  }, [showToast]);

  // Drag and drop image file onto viewport
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        setUserImage(img);
        setActivePreset(null);
        setSettings((prev) => ({
          ...prev,
          ratio: 'orig',
          zoom: 100,
          panX: 0,
          panY: 0,
        }));
        const { width, height } = getCanvasDimensions('orig', img.width, img.height, 900);
        setFlarePos({ x: Math.round(width * 0.75), y: Math.round(height * 0.28) });
        showToast('拖放照片上傳成功！');
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  }, [showToast]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  // Reset all parameters
  const handleReset = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
    setActiveProfile('vibrant');
    setFlareLocked(false);
    if (activePreset) {
      setSettings((prev) => ({ ...prev, ratio: activePreset.defaultRatio }));
    }
    showToast('參數已重設為預設暗房設定');
  }, [activePreset, showToast]);

  // Download high-resolution artwork
  const handleDownload = useCallback((scale = 1, format: 'png' | 'jpeg' = 'png') => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let targetCanvas = canvas;
    if (scale > 1) {
      // Create offscreen scaled canvas
      const scaledCanvas = document.createElement('canvas');
      scaledCanvas.width = canvas.width * scale;
      scaledCanvas.height = canvas.height * scale;
      const sCtx = scaledCanvas.getContext('2d');
      if (sCtx) {
        sCtx.imageSmoothingEnabled = true;
        sCtx.imageSmoothingQuality = 'high';
        sCtx.drawImage(canvas, 0, 0, scaledCanvas.width, scaledCanvas.height);
        targetCanvas = scaledCanvas;
      }
    }

    const mime = format === 'jpeg' ? 'image/jpeg' : 'image/png';
    const ext = format === 'jpeg' ? 'jpg' : 'png';
    const dataUrl = targetCanvas.toDataURL(mime, 0.95);

    const link = document.createElement('a');
    link.download = `LumiStudio_${settings.ratio}_${Date.now()}.${ext}`;
    link.href = dataUrl;
    link.click();
    showToast(`作品已下載 (${targetCanvas.width}×${targetCanvas.height}px ${ext.toUpperCase()})`);
  }, [settings.ratio, showToast]);

  // Copy canvas image to clipboard
  const handleCopyToClipboard = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/png': blob })
        ]);
        showToast('畫布作品已複製到剪貼簿！');
      }, 'image/png');
    } catch {
      showToast('無法直接複製到剪貼簿，請使用下載作品功能');
    }
  }, [showToast]);

  // Keyboard shortcuts: Space for compare, L for lock
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLSelectElement) return;

      if (e.code === 'Space' && !e.repeat) {
        e.preventDefault();
        setIsComparing(true);
      } else if (e.code === 'KeyL') {
        setFlareLocked((prev) => !prev);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        setIsComparing(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-sky-500 selection:text-white"
    >
      {/* Top Bar Header */}
      <Header
        onReset={handleReset}
        onExport={() => handleDownload(1, 'png')}
        onToggleCompare={() => setIsComparing((prev) => !prev)}
        isComparing={isComparing}
        flareLocked={flareLocked}
      />

      {/* Main Workspace Layout */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Interactive Canvas & Live Waveform (7 cols on lg) */}
        <section className="lg:col-span-7 flex flex-col gap-4">
          <StudioCanvas
            settings={settings}
            userImage={userImage}
            activePreset={activePreset}
            flarePos={flarePos}
            setFlarePos={setFlarePos}
            flareLocked={flareLocked}
            setFlareLocked={setFlareLocked}
            isComparing={isComparing}
            onUpdatePan={(px, py) => {
              setSettings((prev) => ({ ...prev, panX: px, panY: py }));
            }}
            onUpdateZoom={(zm) => {
              setSettings((prev) => ({ ...prev, zoom: zm }));
            }}
            canvasRef={canvasRef}
          />

          {/* Optical Waveform & RGB Histogram */}
          <Histogram settings={settings} />

          {/* Quick Shortcuts & Instruction Footer */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400 bg-slate-900/40 p-3 rounded-xl border border-slate-800/60">
            <div className="flex items-center gap-2">
              <Info className="w-3.5 h-3.5 text-sky-400" />
              <span>
                💡 <strong>互動指引：</strong>移動滑鼠調整光學耀斑｜<strong>點擊畫布</strong>鎖定位置｜按住 <strong>空白鍵</strong> 對比原圖
              </span>
            </div>
            <div className="text-[11px] font-mono text-slate-400">
              支援拖放外部相片至任意位置
            </div>
          </div>
        </section>

        {/* Right Column: Darkroom Control Panel (5 cols on lg) */}
        <section className="lg:col-span-5">
          <ControlPanel
            settings={settings}
            updateSetting={updateSetting}
            activeProfile={activeProfile}
            setActiveProfile={setActiveProfile}
            onApplyProfile={handleApplyProfile}
            activePresetId={activePreset?.id || null}
            onSelectSamplePreset={handleSelectSamplePreset}
            onFileUpload={handleFileUpload}
            onReset={handleReset}
            onDownload={handleDownload}
            onCopyToClipboard={handleCopyToClipboard}
            hasUserImage={!!userImage}
          />
        </section>
      </main>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 bg-slate-900 text-sky-300 border border-sky-500/40 px-4 py-2.5 rounded-xl shadow-2xl text-xs font-medium flex items-center gap-2 z-50 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <CheckCircle2 className="w-4 h-4 text-sky-400" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
