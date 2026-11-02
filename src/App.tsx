import React, { useState, useEffect, useRef } from 'react';
import { TranslationResult, TranslatorInfo, SAMPLE_PRESETS, EMPTY_TRANSLATION_DATA } from './types';
import { Navbar } from './components/Navbar';
import { InputModule } from './components/InputModule';
import { PreviewSheet } from './components/PreviewSheet';
import { ExportModal } from './components/ExportModal';
import { PrivacyModal } from './components/PrivacyModal';
import { GoogleDriveModal } from './components/GoogleDriveModal';
import {
  Download,
  CheckCircle2,
  ShieldCheck,
  AlertTriangle,
  Eye,
  SlidersHorizontal,
  Cloud,
  Maximize2,
  ZoomIn,
  Sparkles,
  Github,
  ExternalLink,
} from 'lucide-react';
import { GITHUB_REPO_URL, GITHUB_PROFILE_URL } from './types';

export default function App() {
  // In-Memory RAM only: initialized with realistic preset
  const [data, setData] = useState<TranslationResult>(SAMPLE_PRESETS[0].data);

  const [translator, setTranslator] = useState<TranslatorInfo>({
    name: 'アディ・イラワン',
    katakanaName: 'アディ・イラワン',
    organization: '公認インドネシア語翻訳事務所',
    certificationNumber: 'TR-JP/2026/089',
    contact: 'irawan.adii271@gmail.com',
    signatureDate: '2026年10月29日',
    includeStamp: true,
    stampText: '翻訳印',
  });

  const [viewMode, setViewMode] = useState<'split' | 'preview' | 'editor'>('split');
  const [showColumnIndices, setShowColumnIndices] = useState<boolean>(true);
  const [mobileZoomMode, setMobileZoomMode] = useState<'fit' | '100%'>('fit');
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState<boolean>(false);
  const [isGoogleDriveModalOpen, setIsGoogleDriveModalOpen] = useState<boolean>(false);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState<boolean>(false);

  // Measure container width for responsive scaling on mobile
  const previewContainerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState<number>(400);

  useEffect(() => {
    const updateWidth = () => {
      if (previewContainerRef.current) {
        setContainerWidth(previewContainerRef.current.clientWidth);
      } else {
        setContainerWidth(window.innerWidth);
      }
    };
    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, [viewMode]);

  // Hook lifecycle useEffect for beforeunload confirmation (Zero Data Retention)
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      const hasData =
        Boolean(data.familyCardNumber) ||
        Boolean(data.headOfFamily) ||
        data.members.some(
          (m) => Boolean(m.fullNameOriginal) || Boolean(m.nik)
        );

      if (hasData) {
        e.preventDefault();
        e.returnValue = 'Data sesi aktif Anda hanya tersimpan di RAM dan akan terhapus permanen.';
        return e.returnValue;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [data]);

  // Reset / Clear all data from In-Memory RAM
  const handleClearAllData = () => {
    setData(EMPTY_TRANSLATION_DATA);
    setIsResetConfirmOpen(false);
  };

  // Calculate dynamic fit scale for 1040px wide sheet
  // On mobile screens (~360px-430px), this scales the sheet down nicely to fit the full width
  const fitScale = Math.min(1, Math.max(0.26, (containerWidth - 20) / 1040));
  const isScaleApplicable = fitScale < 0.98;

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      {/* Top Navbar */}
      <Navbar
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onDownloadPdf={() => setIsExportModalOpen(true)}
        onOpenPrivacyModal={() => setIsPrivacyModalOpen(true)}
        onResetData={() => setIsResetConfirmOpen(true)}
        onOpenGoogleDriveModal={() => setIsGoogleDriveModalOpen(true)}
      />

      {/* Main Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-2.5 sm:p-5 pb-24 lg:pb-8">
        {/* Mobile View Toggle Bar (visible on smaller screens) */}
        <div className="lg:hidden mb-2.5 flex items-center justify-center bg-white p-1 rounded-xl border border-slate-200 text-xs no-print shadow-2xs">
          <button
            type="button"
            onClick={() => setViewMode('editor')}
            className={`flex-1 py-2.5 text-center rounded-lg font-semibold transition-colors flex items-center justify-center gap-1.5 ${
              viewMode === 'editor'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <SlidersHorizontal size={14} />
            <span>Formulir Data KK</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('preview')}
            className={`flex-1 py-2.5 text-center rounded-lg font-semibold transition-colors flex items-center justify-center gap-1.5 ${
              viewMode === 'preview'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Eye size={14} />
            <span>Lembar 戸籍謄本</span>
            <span className="w-4 h-4 rounded-full bg-blue-100 text-blue-700 text-[10px] flex items-center justify-center font-bold">
              {data.members.length}
            </span>
          </button>
        </div>

        {/* Privacy-First & Zero-Retention Notice Bar */}
        <div className="no-print mb-3 px-3 py-2 bg-emerald-50 border border-emerald-200/80 rounded-xl flex items-center justify-between gap-2 text-xs text-emerald-900 shadow-2xs">
          <div className="flex items-center gap-2 min-w-0">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            <span className="font-bold flex items-center gap-1 text-[11px] sm:text-xs shrink-0">
              <ShieldCheck size={14} className="text-emerald-700" />
              <span>Zero-Data:</span>
            </span>
            <span className="text-emerald-800 text-[11px] truncate hidden sm:inline">
              Data diproses di RAM &bull; Tanpa Database &bull; Auto-Cleanup saat tab ditutup
            </span>
            <span className="text-emerald-800 text-[11px] truncate sm:hidden">
              100% RAM Browser Aman
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setIsPrivacyModalOpen(true)}
              className="text-[11px] font-semibold text-emerald-700 hover:text-emerald-900 underline underline-offset-2 transition-colors"
            >
              Info
            </button>
            <span className="text-emerald-300">|</span>
            <button
              type="button"
              onClick={() => setIsResetConfirmOpen(true)}
              className="text-[11px] font-semibold text-red-600 hover:text-red-700 transition-colors"
            >
              Reset RAM
            </button>
          </div>
        </div>

        {/* Workspace Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Left Column: Form Input Module */}
          <div
            className={`no-print transition-all ${
              viewMode === 'split'
                ? 'lg:col-span-5'
                : viewMode === 'editor'
                ? 'lg:col-span-12 max-w-4xl mx-auto w-full'
                : 'hidden'
            }`}
          >
            <InputModule
              data={data}
              translator={translator}
              onUpdateData={setData}
              onUpdateTranslator={setTranslator}
              onJumpToPreview={() => setViewMode('preview')}
            />
          </div>

          {/* Right Column: Live Excel-Style Preview Sheet (Always kept mounted for instant PDF export) */}
          <div
            className={`preview-column-wrapper transition-all ${
              viewMode === 'split'
                ? 'lg:col-span-7'
                : viewMode === 'preview'
                ? 'lg:col-span-12'
                : 'fixed -left-[9999px] top-0 pointer-events-none opacity-0'
            }`}
          >
            {/* Preview Toolbar */}
            <div
              className={`no-print mb-2.5 bg-white p-2.5 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs shadow-2xs ${
                viewMode === 'editor' ? 'hidden' : ''
              }`}
            >
              <div className="flex items-center gap-2 text-slate-800 min-w-0">
                <span className="font-bold flex items-center gap-1 shrink-0">
                  <CheckCircle2 size={14} className="text-emerald-600" />
                  <span className="hidden sm:inline">公式書式プレビュー（全項目日本語）:</span>
                  <span className="sm:hidden">戸籍謄本 A4:</span>
                </span>
                <span className="text-slate-500 font-mono text-[11px] truncate">
                  {data.members.length} 名 &bull; No: {data.familyCardNumber || '-'}
                </span>
              </div>

              <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                {/* Mobile Fit vs 100% Zoom Toggle */}
                {isScaleApplicable && (
                  <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-[11px]">
                    <button
                      type="button"
                      onClick={() => setMobileZoomMode('fit')}
                      className={`flex items-center gap-1 px-2 py-1 rounded font-medium transition-colors ${
                        mobileZoomMode === 'fit'
                          ? 'bg-white text-slate-900 shadow-xs font-bold'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                      title="Pas di layar ponsel tanpa scroll horizontal"
                    >
                      <Maximize2 size={12} />
                      <span>Pas Layar</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setMobileZoomMode('100%')}
                      className={`flex items-center gap-1 px-2 py-1 rounded font-medium transition-colors ${
                        mobileZoomMode === '100%'
                          ? 'bg-white text-slate-900 shadow-xs font-bold'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                      title="Ukuran asli 100% (geser ke samping)"
                    >
                      <ZoomIn size={12} />
                      <span>100% Asli</span>
                    </button>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => setShowColumnIndices((prev) => !prev)}
                  className={`hidden sm:inline-flex px-2.5 py-1.5 rounded text-[11px] font-medium border transition-colors ${
                    showColumnIndices
                      ? 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-800'
                      : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-500'
                  }`}
                  title="Tampilkan / sembunyikan baris nomor indeks kolom (1) s/d (15)"
                >
                  Kolom (1)-(15): {showColumnIndices ? 'Aktif' : 'Nonaktif'}
                </button>

                <button
                  type="button"
                  onClick={() => setIsExportModalOpen(true)}
                  className="px-3 sm:px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 transition-colors shadow-xs"
                  title="Download dokumen PDF"
                >
                  <Download size={13} />
                  <span>Download PDF</span>
                </button>
              </div>
            </div>

            {/* Mobile Helper Hint when on phone */}
            {isScaleApplicable && viewMode !== 'editor' && (
              <div className="no-print lg:hidden mb-2 px-3 py-1.5 bg-blue-50 border border-blue-200/70 rounded-lg text-[11px] text-blue-800 flex items-center justify-between gap-2">
                <span>
                  {mobileZoomMode === 'fit'
                    ? '📱 Tampilan Pas Layar aktif (seluruh lembar terlihat).'
                    : '🔍 Ukuran 100% aktif (geser ke samping untuk detail).'}
                </span>
                <button
                  type="button"
                  onClick={() => setMobileZoomMode(mobileZoomMode === 'fit' ? '100%' : 'fit')}
                  className="font-bold underline shrink-0 text-blue-900"
                >
                  {mobileZoomMode === 'fit' ? 'Zoom 100%' : 'Pas Layar'}
                </button>
              </div>
            )}

            {/* The Live Document Paper - Exact Replica of Reference Image */}
            <div
              ref={previewContainerRef}
              className="bg-slate-200/70 p-1.5 sm:p-4 rounded-xl border border-slate-300 shadow-inner flex flex-col items-center overflow-hidden"
            >
              {mobileZoomMode === 'fit' && isScaleApplicable ? (
                <div
                  className="preview-scale-wrapper w-full flex justify-center transition-all duration-150 overflow-hidden"
                  style={{
                    height: `${Math.ceil(1020 * fitScale)}px`,
                  }}
                >
                  <div
                    style={{
                      transform: `scale(${fitScale})`,
                      transformOrigin: 'top center',
                      width: '1040px',
                      minWidth: '1040px',
                    }}
                  >
                    <PreviewSheet
                      data={data}
                      onUpdateData={setData}
                      showColumnIndices={showColumnIndices}
                    />
                  </div>
                </div>
              ) : (
                <div className="w-full overflow-x-auto touch-pan-x scroll-smooth pb-2 flex justify-center">
                  <PreviewSheet
                    data={data}
                    onUpdateData={setData}
                    showColumnIndices={showColumnIndices}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Ergonomic Thumb-Zone Mobile Bottom Navigation Bar (Fixed on phone screens) */}
      <nav className="no-print lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-3 py-1.5 safe-bottom shadow-lg">
        <div className="max-w-md mx-auto flex items-center justify-around gap-1">
          <button
            type="button"
            onClick={() => setViewMode('editor')}
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-lg transition-colors min-h-[46px] ${
              viewMode === 'editor'
                ? 'text-blue-600 font-bold bg-blue-50/70'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <SlidersHorizontal size={18} />
            <span className="text-[10px] mt-0.5">Form KK</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode('preview')}
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-lg transition-colors min-h-[46px] relative ${
              viewMode === 'preview'
                ? 'text-blue-600 font-bold bg-blue-50/70'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <div className="relative">
              <Eye size={18} />
              {data.members.length > 0 && (
                <span className="absolute -top-1 -right-2 bg-blue-600 text-white rounded-full text-[9px] w-3.5 h-3.5 flex items-center justify-center font-bold">
                  {data.members.length}
                </span>
              )}
            </div>
            <span className="text-[10px] mt-0.5">Dokumen 戸籍</span>
          </button>

          <button
            type="button"
            onClick={() => setIsGoogleDriveModalOpen(true)}
            className="flex flex-col items-center justify-center py-1 px-3 rounded-lg text-slate-600 hover:text-sky-700 transition-colors min-h-[46px]"
          >
            <Cloud size={18} className="text-sky-600" />
            <span className="text-[10px] mt-0.5">Drive</span>
          </button>

          <button
            type="button"
            onClick={() => setIsExportModalOpen(true)}
            className="flex flex-col items-center justify-center py-1 px-4 rounded-xl bg-blue-600 text-white font-bold transition-transform active:scale-95 shadow-sm shadow-blue-600/30 min-h-[46px]"
          >
            <Download size={18} />
            <span className="text-[10px] mt-0.5">Unduh PDF</span>
          </button>
        </div>
      </nav>

      {/* Footer Info (Hidden during Print) */}
      <footer className="no-print bg-white border-t border-slate-200 py-4 mb-16 lg:mb-0 text-xs text-slate-600">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 text-center sm:text-left">
            <div className="flex items-center gap-1.5 font-medium">
              <span className="font-bold text-slate-800">戸籍謄本 翻訳文</span>
              <span>&bull;</span>
              <span>Kartu Keluarga (KK) Standar Resmi Jepang</span>
            </div>
            <span className="hidden sm:inline text-slate-300">|</span>
            <span className="text-[11px] text-slate-400">
              A4横判・出入国在留管理庁・市区町村役所 提出用
            </span>
          </div>

          {/* GitHub Profile & Repository Direct Access */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-500 hidden sm:inline">
              Dikembangkan oleh <strong className="text-slate-700">Adi Irawan</strong>
            </span>
            <a
              href={GITHUB_REPO_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-all shadow-xs group"
              title="Kunjungi Repositori Codingan GitHub @irawanadii271-spec/kartu-keluarga"
            >
              <Github size={14} className="text-white group-hover:scale-110 transition-transform" />
              <span>GitHub: kartu-keluarga</span>
              <ExternalLink size={11} className="text-slate-400 group-hover:text-white" />
            </a>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        data={data}
        onOpenGoogleDrive={() => {
          setIsExportModalOpen(false);
          setIsGoogleDriveModalOpen(true);
        }}
      />

      <PrivacyModal
        isOpen={isPrivacyModalOpen}
        onClose={() => setIsPrivacyModalOpen(false)}
        onClearAllData={handleClearAllData}
      />

      <GoogleDriveModal
        isOpen={isGoogleDriveModalOpen}
        onClose={() => setIsGoogleDriveModalOpen(false)}
        currentData={data}
        onLoadDataFromDrive={(importedData) => setData(importedData)}
      />

      {/* Confirmation Modal for Resetting / Clearing RAM */}
      {isResetConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden p-5">
            <div className="flex items-center gap-3 text-red-600 mb-3">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                <AlertTriangle size={20} />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">
                  Konfirmasi Hapus Semua Data (RAM Reset)
                </h3>
                <p className="text-xs text-slate-500">
                  Tindakan ini tidak dapat dibatalkan
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 mb-5 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-200">
              Sesuai arsitektur <strong>Zero-Data Retention</strong>, seluruh data kependudukan (No. KK, nama anggota, NIK, alamat) hanya berada di memori RAM browser. Jika di-reset, seluruh isian akan kembali ke nilai kosong (<code>""</code> / <code>-</code>) seketika.
            </p>

            <div className="flex items-center justify-end gap-2 text-xs">
              <button
                type="button"
                onClick={() => setIsResetConfirmOpen(false)}
                className="px-3.5 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 font-medium transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleClearAllData}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold transition-colors shadow-xs"
              >
                Hapus Bersih Sekarang
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
