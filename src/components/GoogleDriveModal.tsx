import React, { useState, useEffect } from 'react';
import {
  X,
  Cloud,
  Upload,
  Download,
  Trash2,
  RefreshCw,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Folder,
  FileText,
  Search,
  LogOut,
  Shield,
  FileCheck,
} from 'lucide-react';
import { User } from 'firebase/auth';
import {
  googleSignIn,
  logout,
  getAccessToken,
  initAuth,
} from '../services/googleAuth';
import {
  listDriveFiles,
  uploadFileToDrive,
  getOrCreateAppFolder,
  deleteDriveFile,
  downloadDriveFileBlob,
  DriveFileItem,
  APP_FOLDER_NAME,
} from '../services/googleDrive';
import { TranslationResult } from '../types';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface GoogleDriveModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentData: TranslationResult;
  onLoadDataFromDrive?: (data: TranslationResult) => void;
}

export const GoogleDriveModal: React.FC<GoogleDriveModalProps> = ({
  isOpen,
  onClose,
  currentData,
  onLoadDataFromDrive,
}) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isSigningIn, setIsSigningIn] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Drive state
  const [appFolderId, setAppFolderId] = useState<string | null>(null);
  const [files, setFiles] = useState<DriveFileItem[]>([]);
  const [isLoadingFiles, setIsLoadingFiles] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadSuccessMsg, setUploadSuccessMsg] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Confirmation dialog for file deletion (MANDATORY per Workspace Integration skill)
  const [fileToDelete, setFileToDelete] = useState<DriveFileItem | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // Initialize Auth state listener
  useEffect(() => {
    const unsubscribe = initAuth(
      (user, token) => {
        setCurrentUser(user);
        setAccessToken(token);
      },
      () => {
        setCurrentUser(null);
        setAccessToken(null);
      }
    );
    return () => unsubscribe();
  }, []);

  // Fetch files when user is authenticated & modal is open
  useEffect(() => {
    if (isOpen && accessToken) {
      loadDriveFiles(accessToken);
    }
  }, [isOpen, accessToken]);

  const handleSignIn = async () => {
    setIsSigningIn(true);
    setErrorMsg(null);
    try {
      const res = await googleSignIn();
      setCurrentUser(res.user);
      setAccessToken(res.accessToken);
      await loadDriveFiles(res.accessToken);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Gagal masuk dengan Google');
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await logout();
      setCurrentUser(null);
      setAccessToken(null);
      setFiles([]);
      setAppFolderId(null);
    } catch (err: any) {
      console.error(err);
    }
  };

  const loadDriveFiles = async (token: string) => {
    setIsLoadingFiles(true);
    setErrorMsg(null);
    try {
      const folderId = await getOrCreateAppFolder(token);
      setAppFolderId(folderId);
      const items = await listDriveFiles(token, folderId, searchQuery);
      setFiles(items);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Gagal memuat berkas Google Drive');
    } finally {
      setIsLoadingFiles(false);
    }
  };

  // Upload current PDF directly to Google Drive
  const handleUploadCurrentPdf = async () => {
    if (!accessToken) return;
    setIsUploading(true);
    setErrorMsg(null);
    setUploadSuccessMsg(null);

    try {
      const folderId = appFolderId || (await getOrCreateAppFolder(accessToken));
      setAppFolderId(folderId);

      // Render the official preview sheet to canvas for PDF
      const sheetElement = document.getElementById('kk-official-print-sheet');
      if (!sheetElement) {
        throw new Error('Elemen dokumen tidak ditemukan.');
      }

      const canvas = await html2canvas(sheetElement, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4',
      });

      pdf.addImage(imgData, 'JPEG', 0, 0, 297, 210);
      const pdfBlob = pdf.output('blob');

      const cleanName = (currentData.headOfFamily || 'Keluarga')
        .replace(/[^a-zA-Z0-9_\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/g, '_');
      const kkNumber = currentData.familyCardNumber ? `_${currentData.familyCardNumber.slice(-4)}` : '';
      const fileName = `戸籍謄本_${cleanName}${kkNumber}_${new Date().toISOString().slice(0, 10)}.pdf`;

      const uploadedItem = await uploadFileToDrive(
        accessToken,
        pdfBlob,
        fileName,
        'application/pdf',
        folderId
      );

      setUploadSuccessMsg(`Berhasil disimpan ke Google Drive: ${uploadedItem.name}`);
      await loadDriveFiles(accessToken);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Gagal menyimpan dokumen ke Google Drive.');
    } finally {
      setIsUploading(false);
    }
  };

  // Upload JSON backup data to Google Drive
  const handleUploadCurrentJson = async () => {
    if (!accessToken) return;
    setIsUploading(true);
    setErrorMsg(null);
    setUploadSuccessMsg(null);

    try {
      const folderId = appFolderId || (await getOrCreateAppFolder(accessToken));
      const jsonStr = JSON.stringify(currentData, null, 2);
      const jsonBlob = new Blob([jsonStr], { type: 'application/json' });

      const cleanName = (currentData.headOfFamily || 'Keluarga')
        .replace(/[^a-zA-Z0-9_\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/g, '_');
      const fileName = `Data_KK_${cleanName}_${new Date().toISOString().slice(0, 10)}.json`;

      const uploadedItem = await uploadFileToDrive(
        accessToken,
        jsonBlob,
        fileName,
        'application/json',
        folderId
      );

      setUploadSuccessMsg(`Data sesi berhasil dicadangkan ke Google Drive: ${uploadedItem.name}`);
      await loadDriveFiles(accessToken);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Gagal menyimpan cadangan data ke Google Drive.');
    } finally {
      setIsUploading(false);
    }
  };

  // Import JSON data from Google Drive
  const handleImportJsonFile = async (file: DriveFileItem) => {
    if (!accessToken || !onLoadDataFromDrive) return;
    try {
      const blob = await downloadDriveFileBlob(accessToken, file.id);
      const text = await blob.text();
      const parsedData: TranslationResult = JSON.parse(text);
      onLoadDataFromDrive(parsedData);
      setUploadSuccessMsg(`Data dari "${file.name}" berhasil dimuat ke formulir!`);
      setTimeout(() => setUploadSuccessMsg(null), 3000);
    } catch (err: any) {
      setErrorMsg(`Gagal memuat file: ${err.message}`);
    }
  };

  // Confirm delete handler (MANDATORY per Workspace Integration skill)
  const handleConfirmDelete = async () => {
    if (!accessToken || !fileToDelete) return;
    setIsDeleting(true);
    try {
      await deleteDriveFile(accessToken, fileToDelete.id);
      setFileToDelete(null);
      await loadDriveFiles(accessToken);
    } catch (err: any) {
      setErrorMsg(`Gagal menghapus berkas: ${err.message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[92vh] overflow-hidden flex flex-col border border-slate-300 animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Top Header */}
        <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold shadow-xs">
              <Cloud size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm sm:text-base text-slate-900 leading-tight">
                  Integrasi Google Drive
                </h3>
                <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded-full border border-blue-200">
                  Google Workspace
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Simpan, cadangkan, dan kelola dokumen terjemahan resmi langsung di Google Drive Anda
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-200 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1 bg-slate-50/60 text-xs">
          {/* Error Message */}
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 flex items-start gap-2 shadow-2xs">
              <AlertCircle size={16} className="text-red-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <span className="font-bold">Perhatian: </span>
                <span>{errorMsg}</span>
              </div>
              <button
                type="button"
                onClick={() => setErrorMsg(null)}
                className="text-red-400 hover:text-red-700"
              >
                <X size={14} />
              </button>
            </div>
          )}

          {/* Success Notification */}
          {uploadSuccessMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 flex items-start gap-2 shadow-2xs">
              <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
              <div className="flex-1 font-medium">{uploadSuccessMsg}</div>
              <button
                type="button"
                onClick={() => setUploadSuccessMsg(null)}
                className="text-emerald-400 hover:text-emerald-700"
              >
                <X size={14} />
              </button>
            </div>
          )}

          {/* User Authentication Status */}
          {!currentUser ? (
            <div className="bg-white border-2 border-slate-200 rounded-xl p-6 text-center space-y-4 shadow-xs">
              <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto shadow-2xs">
                <Cloud size={28} />
              </div>
              <div className="max-w-md mx-auto space-y-1.5">
                <h4 className="font-bold text-sm sm:text-base text-slate-900">
                  Hubungkan Google Drive Anda
                </h4>
                <p className="text-slate-600 text-xs leading-relaxed">
                  Masuk dengan akun Google Anda untuk menyimpan salinan dokumen terjemahan resmi (PDF A4) dan mencadangkan data secara aman dengan izin langsung dari Anda.
                </p>
              </div>

              {/* Official Google Sign-in Button */}
              <div className="pt-2 flex justify-center">
                <button
                  type="button"
                  onClick={handleSignIn}
                  disabled={isSigningIn}
                  className="inline-flex items-center justify-center gap-3 px-5 py-2.5 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg shadow-sm text-slate-700 font-medium text-xs sm:text-sm transition-all hover:border-slate-400 disabled:opacity-50 cursor-pointer"
                >
                  <svg className="w-5 h-5" viewBox="0 0 48 48">
                    <path
                      fill="#EA4335"
                      d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                    />
                    <path
                      fill="#4285F4"
                      d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                    />
                    <path
                      fill="#34A853"
                      d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                    />
                  </svg>
                  <span>{isSigningIn ? 'Menghubungkan...' : 'Sign in with Google'}</span>
                </button>
              </div>

              <div className="pt-2 flex items-center justify-center gap-1.5 text-[11px] text-slate-500">
                <Shield size={13} className="text-emerald-600" />
                <span>Token OAuth hanya disimpan di memori RAM aktif tanpa penyimpanan server</span>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Connected User Profile Card */}
              <div className="bg-white border border-slate-200 rounded-xl p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
                <div className="flex items-center gap-3">
                  {currentUser.photoURL ? (
                    <img
                      src={currentUser.photoURL}
                      alt={currentUser.displayName || 'Pengguna'}
                      className="w-10 h-10 rounded-full border border-slate-300"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-sm">
                      {currentUser.displayName ? currentUser.displayName[0] : 'U'}
                    </div>
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-xs sm:text-sm">
                        {currentUser.displayName || 'Akun Google'}
                      </span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                        Terhubung
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-500 block">
                      {currentUser.email}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => accessToken && loadDriveFiles(accessToken)}
                    disabled={isLoadingFiles}
                    className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors border border-slate-200"
                    title="Segarkan daftar berkas"
                  >
                    <RefreshCw size={14} className={isLoadingFiles ? 'animate-spin' : ''} />
                  </button>

                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-red-50 text-slate-700 hover:text-red-700 border border-slate-200 hover:border-red-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <LogOut size={13} />
                    <span>Keluar</span>
                  </button>
                </div>
              </div>

              {/* Action: Save Current Document to Google Drive */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4 shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Folder size={16} className="text-blue-600" />
                    <span className="font-bold text-slate-900 text-xs sm:text-sm">
                      Simpan Dokumen Aktif ke Folder: "{APP_FOLDER_NAME}"
                    </span>
                  </div>
                  <span className="text-[10px] text-blue-700 bg-blue-100 px-2 py-0.5 rounded font-mono">
                    Google Drive
                  </span>
                </div>

                <p className="text-slate-600 text-[11px]">
                  Simpan langsung dokumen terjemahan Kartu Keluarga (KK) ke PDF A4 Landscape atau simpan cadangan data (JSON) langsung ke Google Drive Anda.
                </p>

                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={handleUploadCurrentPdf}
                    disabled={isUploading}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center gap-2 shadow-xs transition-colors disabled:opacity-50"
                  >
                    <Upload size={14} />
                    <span>{isUploading ? 'Menyimpan ke Drive...' : 'Simpan PDF ke Google Drive'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleUploadCurrentJson}
                    disabled={isUploading}
                    className="px-3.5 py-2 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50"
                  >
                    <FileText size={14} className="text-slate-500" />
                    <span>Cadangkan Data (JSON)</span>
                  </button>
                </div>
              </div>

              {/* Drive File Explorer */}
              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
                <div className="p-3 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <div className="flex items-center gap-2">
                    <Folder size={15} className="text-amber-500" />
                    <span className="font-bold text-slate-800 text-xs">
                      Berkas di Google Drive ({files.length})
                    </span>
                  </div>

                  {/* Search inside Drive */}
                  <div className="relative w-full sm:w-60">
                    <Search size={13} className="absolute left-2.5 top-2.5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Cari nama berkas..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && accessToken) {
                          loadDriveFiles(accessToken);
                        }
                      }}
                      className="w-full pl-7 pr-3 py-1 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {isLoadingFiles ? (
                  <div className="py-12 text-center text-slate-500 space-y-2">
                    <RefreshCw size={20} className="animate-spin mx-auto text-blue-600" />
                    <p className="text-xs">Memuat berkas dari Google Drive...</p>
                  </div>
                ) : files.length === 0 ? (
                  <div className="py-12 text-center text-slate-400 space-y-1">
                    <Cloud size={24} className="mx-auto text-slate-300" />
                    <p className="text-xs font-medium text-slate-600">Belum ada dokumen di folder Google Drive ini</p>
                    <p className="text-[11px]">Klik "Simpan PDF ke Google Drive" di atas untuk menyimpan dokumen pertama Anda.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100 max-h-64 overflow-y-auto">
                    {files.map((file) => {
                      const isPdf = file.mimeType.includes('pdf');
                      const isJson = file.mimeType.includes('json');

                      return (
                        <div
                          key={file.id}
                          className="p-3 hover:bg-slate-50 flex items-center justify-between gap-3 transition-colors text-xs"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            {isPdf ? (
                              <FileCheck size={18} className="text-red-500 shrink-0" />
                            ) : (
                              <FileText size={18} className="text-blue-500 shrink-0" />
                            )}
                            <div className="min-w-0">
                              <span className="font-semibold text-slate-800 block truncate" title={file.name}>
                                {file.name}
                              </span>
                              <div className="flex items-center gap-2 text-[10px] text-slate-400">
                                <span>{file.size ? `${(parseInt(file.size, 10) / 1024).toFixed(1)} KB` : 'Folder'}</span>
                                {file.modifiedTime && (
                                  <span>&bull; {new Date(file.modifiedTime).toLocaleDateString()}</span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            {/* Import Button (if JSON) */}
                            {isJson && onLoadDataFromDrive && (
                              <button
                                type="button"
                                onClick={() => handleImportJsonFile(file)}
                                className="px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded text-[11px] font-semibold border border-blue-200 transition-colors"
                                title="Muat data ini ke formulir"
                              >
                                Muat
                              </button>
                            )}

                            {/* View in Drive */}
                            {file.webViewLink && (
                              <a
                                href={file.webViewLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded transition-colors"
                                title="Buka di Google Drive"
                              >
                                <ExternalLink size={14} />
                              </a>
                            )}

                            {/* Delete Button (Triggers Confirmation Dialog) */}
                            <button
                              type="button"
                              onClick={() => setFileToDelete(file)}
                              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                              title="Hapus berkas"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-2.5 border-t border-slate-200 bg-slate-50 flex items-center justify-between shrink-0 text-xs">
          <div className="flex items-center gap-2 text-[11px] text-slate-500">
            <Shield size={13} className="text-emerald-600" />
            <span>Terhubung ke Google Drive API v3 secara terenkripsi</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-900 hover:bg-black text-white font-semibold rounded-lg shadow-xs transition-colors"
          >
            Selesai
          </button>
        </div>
      </div>

      {/* ================= MANDATORY CONFIRMATION DIALOG FOR FILE DELETION ================= */}
      {fileToDelete && (
        <div className="fixed inset-0 z-60 bg-black/75 flex items-center justify-center p-3 animate-in fade-in">
          <div
            className="bg-white rounded-xl max-w-md w-full p-5 space-y-4 shadow-2xl border border-slate-200 animate-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 text-red-600">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <Trash2 size={20} />
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900">Konfirmasi Hapus Berkas</h4>
                <p className="text-slate-500 text-xs">Tindakan ini tidak dapat dibatalkan</p>
              </div>
            </div>

            <p className="text-xs text-slate-700 leading-relaxed">
              Apakah Anda yakin ingin menghapus berkas <strong>"{fileToDelete.name}"</strong> dari Google Drive Anda?
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setFileToDelete(null)}
                disabled={isDeleting}
                className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors disabled:opacity-50"
              >
                {isDeleting ? 'Menghapus...' : 'Ya, Hapus Berkas'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
