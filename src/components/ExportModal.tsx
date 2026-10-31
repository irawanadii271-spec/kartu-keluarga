import React, { useState } from 'react';
import { generatePdfFromElement, triggerBrowserPrint } from '../utils/pdfGenerator';
import { TranslationResult } from '../types';
import {
  Download,
  X,
  AlertCircle,
  CheckCircle,
  FileCheck,
  Cloud,
  Printer,
  Sparkles,
} from 'lucide-react';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: TranslationResult;
  onOpenGoogleDrive?: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  data,
  onOpenGoogleDrive,
}) => {
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [exportProgress, setExportProgress] = useState<{ percent: number; text: string } | null>(null);
  const [exportError, setExportError] = useState<string | null>(null);
  const [selectedOrientation, setSelectedOrientation] = useState<'landscape' | 'portrait'>('landscape');

  if (!isOpen) return null;

  const handleDownloadDirectPdf = async () => {
    setIsExportingPdf(true);
    setExportError(null);
    setExportProgress({ percent: 15, text: 'Mempersiapkan dokumen 戸籍謄本...' });

    try {
      const cleanNoKk = data.familyCardNumber.replace(/[^0-9]/g, '') || 'KK';
      const fileName = `Koseki_Tohon_${cleanNoKk}.pdf`;

      await generatePdfFromElement('kk-preview-sheet', {
        orientation: selectedOrientation,
        fileName,
        onProgress: (percent, text) => {
          setExportProgress({ percent, text });
        },
      });

      setTimeout(() => {
        setIsExportingPdf(false);
        setExportProgress(null);
        onClose();
      }, 1000);
    } catch (err: any) {
      console.error('PDF export error:', err);
      setExportError(err?.message || 'Gagal membuat file PDF secara otomatis.');
      setIsExportingPdf(false);
    }
  };

  const handlePrintPdf = () => {
    setExportError(null);
    // Give browser small tick to update DOM before print dialog
    setTimeout(() => {
      triggerBrowserPrint();
    }, 150);
  };

  return (
    <div className="no-print fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[92vh] flex flex-col overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-50 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
              <Download size={18} />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900">
                Download & Cetak Dokumen 戸籍謄本
              </h3>
              <p className="text-[11px] text-slate-500">
                Ukuran Resmi A4 Landscape (297mm × 210mm)
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-200 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-4 sm:p-5 space-y-4 text-xs sm:text-sm overflow-y-auto flex-1">
          {/* Info Banner */}
          <div className="p-3 bg-emerald-50/80 rounded-xl border border-emerald-200/80 text-xs text-emerald-900 space-y-1">
            <div className="font-bold flex items-center gap-1.5 text-emerald-800">
              <CheckCircle size={14} className="shrink-0 text-emerald-600" />
              <span>Format Standar Resmi Jepang (出入国在留管理庁・市役所提出用)</span>
            </div>
            <p className="text-emerald-700 text-[11px] leading-relaxed">
              Dokumen diproses 100% di browser Anda (Zero-Data Retention). Anda dapat memilih unduh otomatis atau cetak/simpan PDF langsung.
            </p>
          </div>

          {/* Orientation Selector */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex flex-col gap-1.5">
            <span className="text-[11px] font-bold text-slate-700">
              Pilih Orientasi Kertas PDF:
            </span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => setSelectedOrientation('landscape')}
                className={`py-2 px-3 rounded-lg border font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                  selectedOrientation === 'landscape'
                    ? 'bg-blue-50 border-blue-600 text-blue-700 shadow-2xs'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <span>A4 Landscape (Resmi)</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedOrientation('portrait')}
                className={`py-2 px-3 rounded-lg border font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                  selectedOrientation === 'portrait'
                    ? 'bg-blue-50 border-blue-600 text-blue-700 shadow-2xs'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <span>A4 Portrait (Vertikal)</span>
              </button>
            </div>
            <p className="text-[10.5px] text-slate-500">
              {selectedOrientation === 'landscape'
                ? 'Standar format resmi Jepang A4横判 (297 × 210 mm) - 15 kolom proporsional.'
                : 'Format A4縦判 (210 × 297 mm) - tabel diskalakan pas ke dalam lembar vertikal.'}
            </p>
          </div>

          {/* Export Method 1: Direct File Download */}
          <div className="border border-blue-200 bg-blue-50/30 rounded-xl p-3.5 flex flex-col gap-2.5">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-start gap-2.5">
                <div className="w-8 h-8 bg-blue-100 text-blue-700 rounded-lg flex items-center justify-center shrink-0 mt-0.5 font-bold">
                  <FileCheck size={18} />
                </div>
                <div>
                  <div className="font-bold text-slate-900 text-xs sm:text-sm flex items-center gap-1.5">
                    <span>Metode 1: Unduh File PDF Otomatis</span>
                    <span className="px-1.5 py-0.2 bg-blue-100 text-blue-800 rounded text-[9.5px] font-semibold">
                      .pdf
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-600 mt-0.5">
                    Langsung disimpan ke memori penyimpanan perangkat Anda.
                  </div>
                </div>
              </div>
            </div>

            <button
              type="button"
              disabled={isExportingPdf}
              onClick={handleDownloadDirectPdf}
              className={`w-full py-2.5 px-4 font-bold rounded-lg text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-sm ${
                isExportingPdf
                  ? 'bg-blue-300 text-white cursor-wait'
                  : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20'
              }`}
            >
              <Download size={15} />
              <span>{isExportingPdf ? 'Sedang Membuat Berkas PDF...' : 'Unduh File PDF Sekarang'}</span>
            </button>
          </div>

          {/* Export Method 2: Browser Print / Save as PDF (Vector Quality & 100% Reliable) */}
          <div className="border border-slate-200 bg-slate-50/70 rounded-xl p-3.5 flex flex-col gap-2.5">
            <div className="flex items-start gap-2.5">
              <div className="w-8 h-8 bg-slate-200 text-slate-800 rounded-lg flex items-center justify-center shrink-0 mt-0.5 font-bold">
                <Printer size={18} />
              </div>
              <div className="flex-1">
                <div className="font-bold text-slate-900 text-xs sm:text-sm flex items-center gap-1.5 flex-wrap">
                  <span>Metode 2: Cetak / Simpan PDF (Dialog Browser)</span>
                  <span className="px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded text-[9.5px] font-semibold flex items-center gap-0.5">
                    <Sparkles size={9} />
                    Rekomendasi HP / iPhone / PC
                  </span>
                </div>
                <div className="text-[11px] text-slate-600 mt-0.5">
                  Buka dialog cetak bawaan browser lalu pilih <strong>"Simpan sebagai PDF" (Save as PDF)</strong>. Teks murni vektor tajam tanpa buram.
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handlePrintPdf}
              className="w-full py-2.5 px-4 font-bold rounded-lg text-xs sm:text-sm flex items-center justify-center gap-2 bg-slate-900 hover:bg-black text-white transition-all shadow-xs"
            >
              <Printer size={15} />
              <span>Buka Dialog Cetak / Simpan PDF</span>
            </button>
          </div>

          {/* Progress bar during direct download */}
          {exportProgress && (
            <div className="space-y-1.5 p-3 bg-blue-50 rounded-xl border border-blue-200">
              <div className="flex justify-between text-xs text-blue-900 font-semibold">
                <span>{exportProgress.text}</span>
                <span>{exportProgress.percent}%</span>
              </div>
              <div className="w-full bg-blue-200 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-blue-600 h-full transition-all duration-300"
                  style={{ width: `${exportProgress.percent}%` }}
                />
              </div>
            </div>
          )}

          {/* Error notice with instant fallback button */}
          {exportError && (
            <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800 space-y-2">
              <div className="flex items-start gap-2">
                <AlertCircle size={16} className="shrink-0 text-red-600 mt-0.5" />
                <div className="flex-1">
                  <div className="font-bold text-red-900">Kendala Unduh Otomatis</div>
                  <div className="text-[11px] text-red-700 mt-0.5">{exportError}</div>
                </div>
              </div>
              <button
                type="button"
                onClick={handlePrintPdf}
                className="w-full py-2 px-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-xs"
              >
                <Printer size={14} />
                <span>Klik Di Sini: Simpan Lewat Dialog Cetak Browser</span>
              </button>
            </div>
          )}

          {/* Google Drive Option */}
          {onOpenGoogleDrive && (
            <div className="pt-1">
              <button
                type="button"
                onClick={onOpenGoogleDrive}
                className="w-full py-2 px-3 font-semibold rounded-lg text-xs flex items-center justify-center gap-2 bg-white hover:bg-sky-50 border border-sky-300 text-sky-800 transition-colors shadow-2xs"
              >
                <Cloud size={14} className="text-sky-600" />
                <span>Simpan Dokumen Langsung ke Akun Google Drive</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
