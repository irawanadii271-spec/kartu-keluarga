import React from 'react';
import {
  Download,
  Eye,
  SlidersHorizontal,
  Columns,
  CheckCircle2,
  ShieldCheck,
  RotateCcw,
  Cloud,
} from 'lucide-react';

interface NavbarProps {
  viewMode: 'split' | 'preview' | 'editor';
  onViewModeChange: (mode: 'split' | 'preview' | 'editor') => void;
  onDownloadPdf: () => void;
  onOpenPrivacyModal: () => void;
  onResetData: () => void;
  onOpenGoogleDriveModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  viewMode,
  onViewModeChange,
  onDownloadPdf,
  onOpenPrivacyModal,
  onResetData,
  onOpenGoogleDriveModal,
}) => {
  return (
    <header className="no-print bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Brand & Subtitle */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-slate-900 to-slate-700 flex items-center justify-center text-white shadow-xs">
            <span className="font-serif font-black text-sm tracking-widest">戸籍</span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-slate-900 text-sm sm:text-base tracking-tight font-gothic">
                戸籍謄本 翻訳システム (KK Translator JP)
              </h1>
              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                <CheckCircle2 size={11} className="text-emerald-600" />
                全項目日本語表記 (Full Japanese)
              </span>
            </div>
            <p className="text-[11px] text-slate-500 hidden md:block">
              インドネシア共和国 家族登録証明書 (Kartu Keluarga) 公式A4横様式
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* View Mode Toggle */}
          <div className="hidden lg:flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
            <button
              type="button"
              onClick={() => onViewModeChange('split')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded font-medium transition-colors ${
                viewMode === 'split' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Tampilkan Form dan Lembar Preview berdampingan"
            >
              <Columns size={13} />
              <span>Split View</span>
            </button>

            <button
              type="button"
              onClick={() => onViewModeChange('preview')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded font-medium transition-colors ${
                viewMode === 'preview' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Fokus melihat lembar dokumen terjemahan"
            >
              <Eye size={13} />
              <span>Dokumen (戸籍謄本)</span>
            </button>

            <button
              type="button"
              onClick={() => onViewModeChange('editor')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded font-medium transition-colors ${
                viewMode === 'editor' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Fokus mengisi dan mengedit data"
            >
              <SlidersHorizontal size={13} />
              <span>Form Input</span>
            </button>
          </div>

          {/* Privacy & Zero-Retention Trigger */}
          <button
            type="button"
            onClick={onOpenPrivacyModal}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors"
            title="Arsitektur Zero-Data Retention & In-Memory RAM"
          >
            <ShieldCheck size={14} className="text-emerald-600" />
            <span className="hidden sm:inline">Zero-Data</span>
          </button>

          {/* Google Drive Trigger */}
          <button
            type="button"
            onClick={onOpenGoogleDriveModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-sky-800 bg-sky-50 hover:bg-sky-100 border border-sky-200 transition-colors shadow-2xs"
            title="Kelola & Simpan Dokumen ke Google Drive"
          >
            <Cloud size={14} className="text-sky-600" />
            <span className="hidden sm:inline">Google Drive</span>
          </button>

          {/* Reset All Data Button */}
          <button
            type="button"
            onClick={onResetData}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:text-red-700 hover:bg-red-50 border border-slate-200 hover:border-red-200 transition-colors"
            title="Reset & Bersihkan Seluruh Data dari Memori RAM"
          >
            <RotateCcw size={13} />
            <span className="hidden lg:inline">Reset Data</span>
          </button>

          {/* Download PDF Button */}
          <button
            type="button"
            onClick={onDownloadPdf}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-sm shadow-blue-600/20 transition-colors"
            title="Download dokumen PDF A4 Landscape"
          >
            <Download size={14} />
            <span>Download PDF</span>
          </button>
        </div>
      </div>
    </header>
  );
};
