import React, { useState, useEffect } from 'react';
import { TranslationResult, TranslatorInfo, SAMPLE_PRESETS, EMPTY_TRANSLATION_DATA } from './types';
import { Navbar } from './components/Navbar';
import { InputModule } from './components/InputModule';
import { PreviewSheet } from './components/PreviewSheet';
import { ExportModal } from './components/ExportModal';
import { GuideModal } from './components/GuideModal';
import { PrivacyModal } from './components/PrivacyModal';
import { Download, CheckCircle2, ShieldCheck, AlertTriangle } from 'lucide-react';

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
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);
  const [isGuideModalOpen, setIsGuideModalOpen] = useState<boolean>(false);
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState<boolean>(false);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState<boolean>(false);

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

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      {/* Top Navbar */}
      <Navbar
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onDownloadPdf={() => setIsExportModalOpen(true)}
        onOpenGuideModal={() => setIsGuideModalOpen(true)}
        onOpenPrivacyModal={() => setIsPrivacyModalOpen(true)}
        onResetData={() => setIsResetConfirmOpen(true)}
      />

      {/* Main Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-5">
        {/* Mobile View Toggle Bar (visible on smaller screens) */}
        <div className="lg:hidden mb-3 flex items-center justify-center bg-white p-1 rounded-lg border border-slate-200 text-xs no-print">
          <button
            type="button"
            onClick={() => setViewMode('editor')}
            className={`flex-1 py-2 text-center rounded font-semibold transition-colors ${
              viewMode === 'editor'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Formulir Data KK
          </button>
          <button
            type="button"
            onClick={() => setViewMode('preview')}
            className={`flex-1 py-2 text-center rounded font-semibold transition-colors ${
              viewMode === 'preview'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Lembar 戸籍謄本 (Preview)
          </button>
        </div>

        {/* Privacy-First & Zero-Retention Notice Bar */}
        <div className="no-print mb-3 px-3.5 py-2 bg-emerald-50 border border-emerald-200/80 rounded-xl flex flex-wrap items-center justify-between gap-2 text-xs text-emerald-900 shadow-2xs">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            <span className="font-bold flex items-center gap-1">
              <ShieldCheck size={14} className="text-emerald-700" />
              <span>Zero-Data Retention:</span>
            </span>
            <span className="text-emerald-800 text-[11px] hidden sm:inline">
              Data hanya diproses di RAM browser Anda &bull; Tanpa Database &bull; Auto-Cleanup saat tab ditutup
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsPrivacyModalOpen(true)}
              className="text-[11px] font-semibold text-emerald-700 hover:text-emerald-900 underline underline-offset-2 transition-colors"
            >
              Pelajari Privasi
            </button>
            <span className="text-emerald-300">|</span>
            <button
              type="button"
              onClick={() => setIsResetConfirmOpen(true)}
              className="text-[11px] font-semibold text-red-600 hover:text-red-700 transition-colors"
            >
              Hapus RAM
            </button>
          </div>
        </div>

        {/* Workspace Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Left Column: Form Input Module */}
          {(viewMode === 'split' || viewMode === 'editor') && (
            <div
              className={`no-print transition-all ${
                viewMode === 'split' ? 'lg:col-span-5' : 'lg:col-span-12 max-w-4xl mx-auto w-full'
              }`}
            >
              <InputModule
                data={data}
                translator={translator}
                onUpdateData={setData}
                onUpdateTranslator={setTranslator}
                onJumpToPreview={() => setViewMode('preview')}
                onOpenGuideModal={() => setIsGuideModalOpen(true)}
              />
            </div>
          )}

          {/* Right Column: Live Excel-Style Preview Sheet (100% Pure Japanese Official Sheet) */}
          {(viewMode === 'split' || viewMode === 'preview') && (
            <div
              className={`transition-all ${
                viewMode === 'split' ? 'lg:col-span-7' : 'lg:col-span-12'
              }`}
            >
              {/* Preview Toolbar */}
              <div className="no-print mb-2.5 bg-white p-2.5 rounded-lg border border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2 text-slate-800">
                  <span className="font-bold flex items-center gap-1">
                    <CheckCircle2 size={14} className="text-emerald-600" />
                    <span>公式書式プレビュー（全項目日本語）:</span>
                  </span>
                  <span className="text-slate-500 font-mono text-[11px]">
                    {data.members.length} 名記載 | 番号: {data.familyCardNumber || '-'}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-slate-500 hidden sm:inline">
                    *セルをクリックして直接編集可能
                  </span>

                  <button
                    type="button"
                    onClick={() => setIsExportModalOpen(true)}
                    className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded text-xs flex items-center gap-1.5 transition-colors shadow-xs"
                    title="Download dokumen PDF"
                  >
                    <Download size={13} />
                    <span>Download PDF</span>
                  </button>
                </div>
              </div>

              {/* The Live Document Paper - Exact Replica of Reference Image */}
              <div className="bg-slate-200/70 p-2 sm:p-4 rounded-xl border border-slate-300 shadow-inner flex justify-center">
                <PreviewSheet
                  data={data}
                  onUpdateData={setData}
                />
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer Info (Hidden during Print) */}
      <footer className="no-print bg-white border-t border-slate-200 py-4 mt-8 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2 font-medium">
            <span className="font-bold text-slate-800">戸籍謄本 翻訳文</span>
            <span>&bull;</span>
            <span>インドネシア共和国 家族登録証明書 (Kartu Keluarga) 日本語公式様式</span>
          </div>
          <div className="text-[11px] text-slate-400">
            出入国在留管理庁（入管）・市区町村役所 提出用 A4横判
          </div>
        </div>
      </footer>

      {/* Modals */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        data={data}
      />

      <GuideModal
        isOpen={isGuideModalOpen}
        onClose={() => setIsGuideModalOpen(false)}
      />

      <PrivacyModal
        isOpen={isPrivacyModalOpen}
        onClose={() => setIsPrivacyModalOpen(false)}
        onClearAllData={handleClearAllData}
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
