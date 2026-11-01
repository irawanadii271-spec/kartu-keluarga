import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  X,
  Lock,
  HardDriveDownload,
  Trash2,
  Key,
  CheckCircle,
  AlertTriangle,
  Eye,
  EyeOff,
  Github,
  ExternalLink,
} from 'lucide-react';
import { GITHUB_REPO_URL } from '../types';

interface PrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onClearAllData: () => void;
}

export const PrivacyModal: React.FC<PrivacyModalProps> = ({
  isOpen,
  onClose,
  onClearAllData,
}) => {
  const [geminiApiKey, setGeminiApiKey] = useState<string>('');
  const [showApiKey, setShowApiKey] = useState<boolean>(false);
  const [savedNotification, setSavedNotification] = useState<boolean>(false);

  useEffect(() => {
    // Only API key is permitted in localStorage (never NIK, names, or document content)
    const storedKey = localStorage.getItem('kk_gemini_api_key') || '';
    setGeminiApiKey(storedKey);
  }, [isOpen]);

  const handleSaveApiKey = () => {
    if (geminiApiKey.trim()) {
      localStorage.setItem('kk_gemini_api_key', geminiApiKey.trim());
    } else {
      localStorage.removeItem('kk_gemini_api_key');
    }
    setSavedNotification(true);
    setTimeout(() => setSavedNotification(false), 2500);
  };

  const handleRemoveApiKey = () => {
    localStorage.removeItem('kk_gemini_api_key');
    setGeminiApiKey('');
    setSavedNotification(true);
    setTimeout(() => setSavedNotification(false), 2500);
  };

  if (!isOpen) return null;

  return (
    <div className="no-print fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-emerald-800 to-teal-900 text-white p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-emerald-300">
              <ShieldCheck size={22} />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold">
                Jaminan Privasi & Zero-Data Retention
              </h2>
              <p className="text-xs text-emerald-200">
                Arsitektur Tanpa Database, Tanpa Penyimpanan Server (In-Memory Processing)
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs text-slate-700 flex-1">
          {/* Principles Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3 bg-emerald-50/60 border border-emerald-200 rounded-xl space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-emerald-900 text-xs">
                <Lock size={15} className="text-emerald-700" />
                <span>Zero Database</span>
              </div>
              <p className="text-[11px] text-emerald-800 leading-relaxed">
                Aplikasi ini <strong>tidak memiliki database apa pun</strong> (tanpa MySQL, Postgres, MongoDB, Firebase, Supabase). Seluruh data input Anda tidak pernah disimpan ke disk server.
              </p>
            </div>

            <div className="p-3 bg-blue-50/60 border border-blue-200 rounded-xl space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-blue-900 text-xs">
                <ShieldCheck size={15} className="text-blue-700" />
                <span>In-Memory RAM Browser</span>
              </div>
              <p className="text-[11px] text-blue-800 leading-relaxed">
                Data NIK, nama keluarga, dan alamat hanya tersimpan di <strong>RAM browser (React State)</strong>. Kami tidak menyimpan data sensitif ke LocalStorage atau Cookie.
              </p>
            </div>

            <div className="p-3 bg-amber-50/60 border border-amber-200 rounded-xl space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-amber-900 text-xs">
                <Trash2 size={15} className="text-amber-700" />
                <span>Auto-Cleanup & Reset</span>
              </div>
              <p className="text-[11px] text-amber-800 leading-relaxed">
                Saat tab browser ditutup atau direfresh, seluruh data kependudukan langsung <strong>terhapus otomatis secara permanen</strong> dari memori perangkat Anda.
              </p>
            </div>

            <div className="p-3 bg-purple-50/60 border border-purple-200 rounded-xl space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-purple-900 text-xs">
                <HardDriveDownload size={15} className="text-purple-700" />
                <span>Client-Side PDF Engine</span>
              </div>
              <p className="text-[11px] text-purple-800 leading-relaxed">
                Pembuatan file PDF berlangsung <strong>100% di browser Anda</strong> tanpa transit atau diproses ulang oleh server luar.
              </p>
            </div>
          </div>

          {/* Optional Gemini API Key Section */}
          <div className="mt-4 pt-4 border-t border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5 font-bold text-slate-800">
                <Key size={14} className="text-amber-600" />
                <span>Kunci API Gemini Pribadi (Opsional)</span>
              </div>
              <span className="text-[10px] text-slate-500 font-mono">
                Tersimpan di LocalStorage lokal Anda
              </span>
            </div>
            <p className="text-[11px] text-slate-600 mb-2 leading-relaxed">
              Jika Anda ingin menggunakan kuota API sendiri untuk konversi nama Katakana secara mandiri, Anda dapat memasukkan Google Gemini API Key Anda.
            </p>
            <div className="flex gap-2 items-center">
              <div className="relative flex-1">
                <input
                  type={showApiKey ? 'text' : 'password'}
                  value={geminiApiKey}
                  onChange={(e) => setGeminiApiKey(e.target.value)}
                  placeholder="AIzaSy..."
                  className="w-full text-xs font-mono px-3 py-2 pr-9 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showApiKey ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
              <button
                type="button"
                onClick={handleSaveApiKey}
                className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold text-xs whitespace-nowrap transition-colors"
              >
                Simpan Kunci
              </button>
              {geminiApiKey && (
                <button
                  type="button"
                  onClick={handleRemoveApiKey}
                  className="px-2.5 py-2 text-slate-500 hover:text-red-600 border border-slate-200 hover:border-red-200 rounded-lg text-xs transition-colors"
                  title="Hapus API Key"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>

            {savedNotification && (
              <div className="mt-2 text-xs text-emerald-700 flex items-center gap-1 font-medium">
                <CheckCircle size={13} />
                <span>Pengaturan API Key berhasil diperbarui di browser lokal.</span>
              </div>
            )}
          </div>

          {/* Open Source & GitHub Repository Transparency */}
          <div className="p-3 bg-slate-900 text-white rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0 text-white">
                <Github size={18} />
              </div>
              <div>
                <div className="font-bold text-xs flex items-center gap-1.5">
                  <span>Source Code Terbuka di GitHub</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30">
                    Open Source
                  </span>
                </div>
                <div className="text-[11px] text-slate-300 mt-0.5">
                  Seluruh arsitektur kode dan generator PDF dapat diaudit secara transparan di repositori <strong>irawanadii271-spec/kartu-keluarga</strong>.
                </div>
              </div>
            </div>
            <a
              href={GITHUB_REPO_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-900 font-bold rounded-lg text-xs transition-colors shrink-0 shadow-2xs"
            >
              <Github size={13} />
              <span>Buka GitHub</span>
              <ExternalLink size={11} className="text-slate-500" />
            </a>
          </div>

          {/* Quick Purge Action in Modal */}
          <div className="mt-3 p-3 bg-red-50/70 border border-red-200 rounded-xl flex items-center justify-between gap-3">
            <div>
              <div className="font-bold text-red-900 text-xs flex items-center gap-1">
                <AlertTriangle size={13} className="text-red-600" />
                <span>Bersihkan Memori RAM Seketika</span>
              </div>
              <div className="text-[11px] text-red-700">
                Kosongkan seluruh data Kartu Keluarga aktif di formulir dan dokumen saat ini.
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                onClearAllData();
                onClose();
              }}
              className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold shrink-0 transition-colors shadow-xs"
            >
              Hapus Data Sesi
            </button>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 border-t border-slate-200 p-3 sm:p-4 flex items-center justify-between">
          <div className="text-[11px] text-slate-500 flex items-center gap-1">
            <CheckCircle size={13} className="text-emerald-600" />
            <span>Mematuhi Standar Privacy-First & Zero Data Retention</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg font-semibold text-xs transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
