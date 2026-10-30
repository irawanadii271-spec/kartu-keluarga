import React, { useState } from 'react';
import { generatePdfFromElement } from '../utils/pdfGenerator';
import { TranslationResult } from '../types';
import {
  Download,
  X,
  AlertCircle,
  CheckCircle,
  FileCheck,
  Cloud,
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

  if (!isOpen) return null;

  const handleDownloadPdf = async () => {
    setIsExportingPdf(true);
    setExportError(null);
    setExportProgress({ percent: 15, text: 'Mempersiapkan dokumen 戸籍謄本...' });

    try {
      const cleanNoKk = data.familyCardNumber.replace(/[^0-9]/g, '') || 'KK';
      const fileName = `Koseki_Tohon_${cleanNoKk}.pdf`;

      await generatePdfFromElement('kk-preview-sheet', {
        orientation: 'landscape',
        fileName,
        onProgress: (percent, text) => {
          setExportProgress({ percent, text });
        },
      });

      setTimeout(() => {
        setIsExportingPdf(false);
        setExportProgress(null);
        onClose();
      }, 1200);
    } catch (err: any) {
      console.error('PDF export error:', err);
      setExportError(err?.message || 'Gagal membuat file PDF.');
      setIsExportingPdf(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <Download size={18} className="text-blue-600" />
            <h3 className="font-bold text-sm text-slate-900">
              Download Dokumen 戸籍謄本 (PDF A4)
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-5 space-y-4 text-xs sm:text-sm">
          <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-700 space-y-1.5">
            <div className="font-bold text-black flex items-center gap-1.5">
              <CheckCircle size={14} className="text-emerald-600 shrink-0" />
              <span>Format Dokumen Sesuai Contoh Foto (Full Bahasa Jepang)</span>
            </div>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              Dokumen akan didownload langsung dalam ukuran pas A4 Landscape (297mm x 210mm) tanpa terpotong halaman.
            </p>
            <div className="pt-1 text-[11px] text-emerald-800 flex items-center gap-1 font-medium">
              <span>🔒 Pemrosesan 100% Client-Side: File PDF dibuat langsung di RAM browser tanpa transit ke server.</span>
            </div>
          </div>

          {/* Download Action Card */}
          <div className="border border-blue-200 bg-blue-50/40 rounded-xl p-4 flex flex-col gap-3">
            <div className="flex items-start gap-2.5">
              <div className="w-9 h-9 bg-blue-100 text-blue-700 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                <FileCheck size={20} />
              </div>
              <div>
                <div className="font-bold text-slate-900 text-sm">
                  Unduh File PDF Resmi (.pdf)
                </div>
                <div className="text-[11px] text-slate-600 mt-0.5">
                  Resolusi tinggi 300 DPI, font Jepang tajam, siap simpan di perangkat.
                </div>
              </div>
            </div>

            <button
              type="button"
              disabled={isExportingPdf}
              onClick={handleDownloadPdf}
              className={`w-full py-2.5 px-4 font-bold rounded-lg text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-sm ${
                isExportingPdf
                  ? 'bg-blue-300 text-white cursor-wait'
                  : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20'
              }`}
            >
              <Download size={16} />
              <span>{isExportingPdf ? 'Sedang Membuat Dokumen PDF...' : 'Download Dokumen PDF Sekarang'}</span>
            </button>

            {onOpenGoogleDrive && (
              <button
                type="button"
                onClick={onOpenGoogleDrive}
                className="w-full py-2.5 px-4 font-semibold rounded-lg text-xs sm:text-sm flex items-center justify-center gap-2 bg-white hover:bg-sky-50 border border-sky-300 text-sky-800 transition-colors shadow-2xs"
              >
                <Cloud size={16} className="text-sky-600" />
                <span>Simpan Langsung ke Google Drive</span>
              </button>
            )}
          </div>

          {/* Progress bar */}
          {exportProgress && (
            <div className="space-y-1.5 p-3 bg-slate-100 rounded-lg border border-slate-200">
              <div className="flex justify-between text-xs text-slate-700 font-semibold">
                <span>{exportProgress.text}</span>
                <span>{exportProgress.percent}%</span>
              </div>
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-blue-600 h-full transition-all duration-300"
                  style={{ width: `${exportProgress.percent}%` }}
                />
              </div>
            </div>
          )}

          {exportError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-center gap-2">
              <AlertCircle size={15} className="shrink-0" />
              <span>{exportError}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
