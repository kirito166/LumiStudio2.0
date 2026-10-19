import React from 'react';
import { Camera, Download, RotateCcw, Eye, Sparkles } from 'lucide-react';

interface HeaderProps {
  onReset: () => void;
  onExport: () => void;
  onToggleCompare: () => void;
  isComparing: boolean;
  flareLocked: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onReset,
  onExport,
  onToggleCompare,
  isComparing,
  flareLocked,
}) => {
  return (
    <header className="w-full max-w-7xl mx-auto flex items-center justify-between gap-8 px-4 sm:px-6 py-3.5 border-b border-slate-800/80 bg-slate-950/70 backdrop-blur-md sticky top-0 z-40">
      {/* Zone 1: Single text element wordmark */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400">
          <Camera className="w-4 h-4" />
        </div>
        <div className="flex flex-col">
          <span className="text-base sm:text-lg font-bold tracking-tight text-white whitespace-nowrap">
            LumiStudio Pro
          </span>
          <span className="text-[10px] text-slate-400 font-mono tracking-wider -mt-1 hidden sm:inline">
            OPTICAL DARKROOM LAB
          </span>
        </div>
      </div>

      {/* Zone 2: 4 clean single-line nav links / status anchors */}
      <nav className="hidden lg:flex items-center gap-6 text-xs font-medium text-slate-400">
        <a href="#section-ratio" className="hover:text-sky-400 transition-colors whitespace-nowrap">
          畫幅裁切
        </a>
        <a href="#section-profile" className="hover:text-sky-400 transition-colors whitespace-nowrap">
          色調預設
        </a>
        <a href="#section-tone" className="hover:text-sky-400 transition-colors whitespace-nowrap">
          曝光色彩
        </a>
        <a href="#section-optics" className="hover:text-sky-400 transition-colors whitespace-nowrap">
          光學耀斑
        </a>
      </nav>

      {/* Zone 3: Actions */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        <button
          type="button"
          onClick={onToggleCompare}
          title="按住或點擊切換對比原始圖"
          className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all flex items-center gap-1.5 whitespace-nowrap ${
            isComparing
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-sm'
              : 'bg-slate-900 text-slate-300 border-slate-800 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Eye className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">{isComparing ? '顯示原圖中' : '原圖對比'}</span>
        </button>

        <button
          type="button"
          onClick={onReset}
          title="重設全部參數"
          className="p-1.5 sm:px-3 sm:py-1.5 text-xs font-medium text-slate-400 hover:text-slate-200 bg-slate-900 border border-slate-800 hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">重設</span>
        </button>

        <button
          type="button"
          onClick={onExport}
          className="px-3.5 py-1.5 text-xs font-semibold text-slate-950 bg-sky-400 hover:bg-sky-300 active:bg-sky-500 rounded-lg shadow-sm shadow-sky-500/20 transition-all flex items-center gap-1.5 whitespace-nowrap"
        >
          <Download className="w-3.5 h-3.5" />
          <span>下載作品</span>
        </button>
      </div>
    </header>
  );
};
