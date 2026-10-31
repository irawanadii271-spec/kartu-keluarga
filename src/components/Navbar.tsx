import React, { useState, useRef, useEffect } from 'react';
import {
  Download,
  Eye,
  SlidersHorizontal,
  Columns,
  CheckCircle2,
  ShieldCheck,
  RotateCcw,
  Cloud,
  MoreVertical,
  X,
  FileSpreadsheet,
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close mobile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMobileMenuOpen(false);
      }
    };
    if (isMobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMobileMenuOpen]);

  return (
    <header className="no-print bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-2 sm:gap-4">
        {/* Brand & Subtitle */}
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-slate-900 to-slate-700 flex items-center justify-center text-white shadow-xs shrink-0">
            <span className="font-serif font-black text-xs sm:text-sm tracking-widest">戸籍</span>
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <h1 className="font-bold text-slate-900 text-xs sm:text-base tracking-tight font-gothic truncate">
                <span>戸籍謄本 翻訳</span>
                <span className="hidden sm:inline"> (KK Translator JP)</span>
              </h1>
              <span className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                <CheckCircle2 size={11} className="text-emerald-600" />
                全項目日本語 (Full JP)
              </span>
            </div>
            <p className="text-[10px] sm:text-[11px] text-slate-500 truncate">
              <span className="sm:hidden text-emerald-700 font-medium">A4横・公式様式</span>
              <span className="hidden sm:inline">インドネシア共和国 家族登録証明書 (Kartu Keluarga) 公式A4横様式</span>
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          {/* Desktop View Mode Toggle */}
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

          {/* Privacy & Zero-Retention Trigger (Desktop) */}
          <button
            type="button"
            onClick={onOpenPrivacyModal}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors"
            title="Arsitektur Zero-Data Retention & In-Memory RAM"
          >
            <ShieldCheck size={14} className="text-emerald-600" />
            <span>Zero-Data</span>
          </button>

          {/* Google Drive Trigger (Desktop) */}
          <button
            type="button"
            onClick={onOpenGoogleDriveModal}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-sky-800 bg-sky-50 hover:bg-sky-100 border border-sky-200 transition-colors shadow-2xs"
            title="Kelola & Simpan Dokumen ke Google Drive"
          >
            <Cloud size={14} className="text-sky-600" />
            <span>Google Drive</span>
          </button>

          {/* Reset All Data Button (Desktop) */}
          <button
            type="button"
            onClick={onResetData}
            className="hidden md:flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:text-red-700 hover:bg-red-50 border border-slate-200 hover:border-red-200 transition-colors"
            title="Reset & Bersihkan Seluruh Data dari Memori RAM"
          >
            <RotateCcw size={13} />
            <span>Reset Data</span>
          </button>

          {/* Download PDF Primary Action */}
          <button
            type="button"
            onClick={onDownloadPdf}
            className="flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 sm:py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-sm shadow-blue-600/20 transition-colors"
            title="Download dokumen PDF A4 Landscape"
          >
            <Download size={14} />
            <span>Unduh PDF</span>
          </button>

          {/* Mobile "More" Menu Toggle (< sm) */}
          <div className="relative sm:hidden" ref={menuRef}>
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen((prev) => !prev)}
              aria-label="Menu Opsi Lainnya"
              className={`p-2 rounded-lg border transition-colors ${
                isMobileMenuOpen
                  ? 'bg-slate-200 border-slate-400 text-slate-900'
                  : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
              }`}
            >
              {isMobileMenuOpen ? <X size={17} /> : <MoreVertical size={17} />}
            </button>

            {/* Mobile Dropdown Menu Popover */}
            {isMobileMenuOpen && (
              <div className="absolute right-0 top-full mt-1.5 w-60 bg-white rounded-xl shadow-xl border border-slate-200 p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2.5 py-1">
                  Menu & Integrasi
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onOpenGoogleDriveModal();
                  }}
                  className="w-full flex items-center gap-2.5 px-2.5 py-2.5 rounded-lg text-xs font-medium text-slate-700 hover:bg-sky-50 hover:text-sky-800 transition-colors text-left"
                >
                  <div className="w-6 h-6 rounded-md bg-sky-100 text-sky-600 flex items-center justify-center shrink-0">
                    <Cloud size={14} />
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900">Google Drive</div>
                    <div className="text-[10px] text-slate-500">Simpan / Buka dari Drive</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onOpenPrivacyModal();
                  }}
                  className="w-full flex items-center gap-2.5 px-2.5 py-2.5 rounded-lg text-xs font-medium text-slate-700 hover:bg-emerald-50 hover:text-emerald-800 transition-colors text-left"
                >
                  <div className="w-6 h-6 rounded-md bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                    <ShieldCheck size={14} />
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900">Zero-Data Retention</div>
                    <div className="text-[10px] text-slate-500">100% RAM Browser Aman</div>
                  </div>
                </button>

                <div className="my-1 border-t border-slate-100" />

                <button
                  type="button"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onResetData();
                  }}
                  className="w-full flex items-center gap-2.5 px-2.5 py-2.5 rounded-lg text-xs font-medium text-red-600 hover:bg-red-50 transition-colors text-left"
                >
                  <div className="w-6 h-6 rounded-md bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                    <RotateCcw size={14} />
                  </div>
                  <div>
                    <div className="font-semibold">Reset Semua Data</div>
                    <div className="text-[10px] text-red-500">Bersihkan formulir di RAM</div>
                  </div>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
