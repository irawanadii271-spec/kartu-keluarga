import React, { useState, useMemo } from 'react';
import {
  X,
  Copy,
  Search,
  CheckCircle2,
  FileSpreadsheet,
  Layers,
  Sparkles,
  FileImage,
  BookOpen,
  Download,
  Info,
  Maximize2,
  Minimize2,
  Shield,
  Table as TableIcon,
  LayoutGrid,
  Check,
  Eye,
  FileText,
  HelpCircle,
} from 'lucide-react';

interface GuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface VocabEntry {
  id: string; // Bahasa Indonesia
  jp: string; // Kanji / Katakana Jepang
  romaji: string; // Pelafalan Romaji
}

export const GuideModal: React.FC<GuideModalProps> = ({ isOpen, onClose }) => {
  const [activeMainTab, setActiveMainTab] = useState<'vocab' | 'files' | 'rules'>('vocab');
  const [isMaximized, setIsMaximized] = useState<boolean>(false);
  const [copiedItem, setCopiedItem] = useState<{ jp: string; id: string } | null>(null);
  const [copiedAll, setCopiedAll] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showRomaji, setShowRomaji] = useState<boolean>(true);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  if (!isOpen) return null;

  // Single item copy handler
  const handleCopy = (jp: string, id: string) => {
    navigator.clipboard.writeText(jp);
    setCopiedItem({ jp, id });
    setTimeout(() => {
      setCopiedItem(null);
    }, 1800);
  };

  // 1. DATA KOSAKATA LENGKAP PERSIS SESUAI SCREENSHOT EXCEL ACUAN RESMI
  const genderList: VocabEntry[] = [
    { id: 'Laki', jp: '男性', romaji: 'Dansei' },
    { id: 'Perempuan', jp: '女性', romaji: 'Josei' },
  ];

  const religionList: VocabEntry[] = [
    { id: 'Islam', jp: 'イスラム教', romaji: 'Isuramukyō' },
    { id: 'Kristen', jp: 'キリスト教', romaji: 'Kirisutokyō' },
    { id: 'Katolik', jp: 'カトリック', romaji: 'Katorikku' },
    { id: 'Hindu', jp: 'ヒンドゥー教', romaji: 'Hindūkyō' },
    { id: 'Buddha', jp: '仏教', romaji: 'Bukkyō' },
  ];

  const maritalList: VocabEntry[] = [
    { id: 'Belum Kawin', jp: '未婚', romaji: 'Mikon' },
    { id: 'Kawin', jp: '既婚', romaji: 'Kikon' },
    { id: 'Cerai Hidup', jp: '離婚', romaji: 'Rikon' },
    { id: 'Cerai Mati', jp: '死別', romaji: 'Shibetsu' },
  ];

  const educationList: VocabEntry[] = [
    { id: 'Tidak / Belum Sekolah', jp: '学歴なし', romaji: 'Gakureki nashi' },
    { id: 'Belum Tamat SD', jp: '小学校未卒', romaji: 'Shōgakkō misotsu' },
    { id: 'Tamat SD / Sederajat', jp: '小学校卒業', romaji: 'Shōgakkō sotsugyō' },
    { id: 'SLTP / Sederajat', jp: '中学校卒業', romaji: 'Chūgakkō sotsugyō' },
    { id: 'SLTA / Sederajat', jp: '高校卒業', romaji: 'Kōkō sotsugyō' },
    { id: 'Diploma I / II', jp: '短大', romaji: 'Tandai' },
    { id: 'Akademi / Diploma III / Sarjana Muda', jp: '専門学校', romaji: 'Senmon gakkō' },
    { id: 'Diploma IV / Strata I', jp: '大学', romaji: 'Daigaku' },
    { id: 'Strata II', jp: '大学院', romaji: 'Daigakuin' },
    { id: 'Strata III', jp: '博士課程', romaji: 'Hakushi katei' },
  ];

  const relationList: VocabEntry[] = [
    { id: 'Kepala Keluarga', jp: '家長', romaji: 'Kachō' },
    { id: 'Suami', jp: '夫', romaji: 'Otto' },
    { id: 'Istri', jp: '妻', romaji: 'Tsuma' },
    { id: 'Anak', jp: '子', romaji: 'Ko' },
    { id: 'Menantu', jp: '義理の子', romaji: 'Giri no ko' },
    { id: 'Cucu', jp: '孫', romaji: 'Mago' },
    { id: 'Orangtua', jp: '両親', romaji: 'Ryōshin' },
    { id: 'Mertua', jp: '義理の親', romaji: 'Giri no oya' },
    { id: 'Famili Lain', jp: '他の家族', romaji: 'Hoka no kazoku' },
    { id: 'Pembantu', jp: '使用人', romaji: 'Shiyōnin' },
    { id: 'Lainnya', jp: 'その他', romaji: 'Sono hoka' },
  ];

  // Pekerjaan Kolom 1 (11 baris)
  const occCol1: VocabEntry[] = [
    { id: 'Belum / Tidak Bekerja', jp: '未就労', romaji: 'Mishūrō' },
    { id: 'Mengurus Rumah Tangga', jp: '家事', romaji: 'Kaji' },
    { id: 'Pensiunan', jp: '定年', romaji: 'Teinen' },
    { id: 'Pegawai Negeri Sipil', jp: '公務員', romaji: 'Kōmuin' },
    { id: 'TNI', jp: '軍人', romaji: 'Gunjin' },
    { id: 'Petani / Pekebun', jp: '農家', romaji: 'Nōka' },
    { id: 'Peternak', jp: '畜産', romaji: 'Chikusan' },
    { id: 'Karyawan Swasta', jp: '会社員', romaji: 'Kaishain' },
    { id: 'Buruh Harian Lepas', jp: 'アルバイト', romaji: 'Arubaito' },
    { id: 'Buruh Tani / Perkebunan', jp: '農民', romaji: 'Nōmin' },
    { id: 'Pembantu Rumah Tangga', jp: '家事手伝い', romaji: 'Kaji tetsudai' },
  ];

  // Pekerjaan Kolom 2 (12 baris)
  const occCol2: VocabEntry[] = [
    { id: 'Tukang Cukur', jp: '理容師', romaji: 'Riyōshi' },
    { id: 'Tukang Listrik', jp: '電気技師', romaji: 'Denki gishi' },
    { id: 'Tukang Batu', jp: '石工', romaji: 'Ishikō' },
    { id: 'Tukang Kayu', jp: '大工', romaji: 'Daiku' },
    { id: 'Wartawan', jp: '記者', romaji: 'Kisha' },
    { id: 'Ustadz / Mubaligh', jp: '牧師', romaji: 'Bokushi' },
    { id: 'Guru', jp: '教師', romaji: 'Kyōshi' },
    { id: 'Sopir', jp: '運転手', romaji: 'Untenshu' },
    { id: 'Pedagang', jp: '商人', romaji: 'Shōnin' },
    { id: 'Perangkat Desa', jp: '役人', romaji: 'Yakunin' },
    { id: 'Kepala Desa', jp: '村長', romaji: 'Sonchō' },
    { id: 'Wiraswasta', jp: '自営業', romaji: 'Jieigyō' },
  ];

  // Pelajar (Kolom Kanan)
  const studentEntry: VocabEntry = { id: 'Pelajar', jp: '学生', romaji: 'Gakusei' };

  // Tambahan Istilah Header Dokumen Resmi
  const adminList: VocabEntry[] = [
    { id: 'Kartu Keluarga', jp: '戸籍謄本', romaji: 'Koseki tōhon' },
    { id: 'No. KK', jp: '番号.', romaji: 'Bangō' },
    { id: 'Kepala Keluarga', jp: '家長名', romaji: 'Kachōmei' },
    { id: 'Alamat', jp: '住所', romaji: 'Jūsho' },
    { id: 'RT / RW', jp: '隣組・民組番号', romaji: 'Tonarigumi / Mingumi' },
    { id: 'Kelurahan / Desa', jp: '村', romaji: 'Mura / Chō' },
    { id: 'Kecamatan', jp: '郡', romaji: 'Gun' },
    { id: 'Kabupaten / Kota', jp: '市', romaji: 'Shi' },
    { id: 'Kode Pos', jp: '郵便番号', romaji: 'Yūbin bangō' },
    { id: 'Provinsi', jp: '州', romaji: 'Shū' },
    { id: 'Tanggal Terbit', jp: '発行日', romaji: 'Hakkōbi' },
    { id: 'Pejabat Pencatatan Sipil', jp: '民事登録事務官', romaji: 'Minji tōroku jimukan' },
    { id: 'Nomor Pegawai (NIP)', jp: '公務員番号', romaji: 'Kōmuin bangō' },
  ];

  // Flat list for global search and text export
  const allVocabEntries = useMemo(() => {
    return [
      ...genderList.map((e) => ({ ...e, category: 'Jenis Kelamin' })),
      ...religionList.map((e) => ({ ...e, category: 'Agama' })),
      ...maritalList.map((e) => ({ ...e, category: 'Status Perkawinan' })),
      ...educationList.map((e) => ({ ...e, category: 'Pendidikan' })),
      ...relationList.map((e) => ({ ...e, category: 'Hubungan Keluarga' })),
      ...occCol1.map((e) => ({ ...e, category: 'Jenis Pekerjaan' })),
      ...occCol2.map((e) => ({ ...e, category: 'Jenis Pekerjaan' })),
      { ...studentEntry, category: 'Jenis Pekerjaan' },
      ...adminList.map((e) => ({ ...e, category: 'Header Dokumen' })),
    ];
  }, []);

  // Filter search
  const filteredSearch = useMemo(() => {
    if (!searchQuery.trim()) return null;
    const q = searchQuery.toLowerCase().trim();
    return allVocabEntries.filter(
      (item) =>
        item.id.toLowerCase().includes(q) ||
        item.jp.toLowerCase().includes(q) ||
        item.romaji.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q)
    );
  }, [searchQuery, allVocabEntries]);

  // Copy entire vocabulary dictionary as formatted text
  const handleCopyAllVocab = () => {
    let output = "=== DAFTAR KOSAKATA RESMI KARTU KELUARGA KE JEPANG (戸籍謄本) ===\n\n";
    let currentCat = "";
    allVocabEntries.forEach((item) => {
      if (item.category !== currentCat) {
        currentCat = item.category;
        output += `\n[ ${currentCat} ]\n`;
      }
      output += `• ${item.id} -> ${item.jp} (${item.romaji})\n`;
    });
    navigator.clipboard.writeText(output);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  // Reference files list
  const referenceFiles = [
    {
      id: 'vocab-excel',
      title: 'File Lembar Kosakata Resmi (Excel Sheet)',
      description: 'Daftar padanan kosakata resmi bahasa Indonesia ke bahasa Jepang untuk administrasi kependudukan sesuai instruksi format asli.',
      path: '/assets/aistudio/Screenshot_2026-10-30_110239_ba93759a.png',
      badge: 'Kosakata Imigrasi',
      type: 'Tabel Standar Excel',
    },
    {
      id: 'kk-layout',
      title: 'File Format Resmi Kartu Keluarga Jepang (A4 Landscape)',
      description: 'Tata letak presisi 戸籍謄本 dengan 2 tabel kependudukan, margin 8-10mm, dan format 4 rangkap salinan resmi.',
      path: '/assets/aistudio/Screenshot_2026-10-30_105000_37d43159.png',
      badge: 'Format Cetak A4',
      type: 'Spesifikasi Dokumen',
    },
    {
      id: 'table-header',
      title: 'File Format Header & Kolom Tabel Bersih',
      description: 'Penataan kolom tabel 1 dan tabel 2 tanpa angka di dalam kurung sesuai standar keabsahan resmi pemerintah.',
      path: '/assets/aistudio/Screenshot_2026-10-30_112025_acf479de.png',
      badge: 'Struktur Tabel',
      type: 'Contoh Output',
    },
  ];

  // Helper renderer for a single Excel-like table block
  const renderExcelBlock = (
    title: string,
    items: VocabEntry[],
    headerBg: string,
    headerText: string,
    borderDark: string = 'border-slate-800'
  ) => {
    return (
      <div className={`border-2 ${borderDark} bg-white shadow-xs overflow-hidden`}>
        {/* Excel Header Cell */}
        <div
          className={`${headerBg} ${headerText} px-3 py-1.5 font-bold text-xs sm:text-sm border-b-2 ${borderDark} flex items-center justify-between font-sans`}
        >
          <span className="tracking-tight">{title}</span>
          <span className="text-[10px] font-mono opacity-80 font-normal">
            {items.length} item
          </span>
        </div>

        {/* Excel Cells */}
        <table className="w-full text-xs border-collapse">
          <tbody>
            {items.map((item, idx) => {
              const isCopied = copiedItem?.jp === item.jp && copiedItem?.id === item.id;
              return (
                <tr
                  key={`${title}-${idx}`}
                  onClick={() => handleCopy(item.jp, item.id)}
                  className={`border-b border-slate-300 transition-colors cursor-pointer group ${
                    idx % 2 === 1 ? 'bg-slate-50/60' : 'bg-white'
                  } hover:bg-amber-100/80`}
                  title="Klik untuk menyalin huruf Kanji ke clipboard"
                >
                  {/* Sel Kiri: Bahasa Indonesia */}
                  <td className="px-3 py-1.5 text-slate-800 font-medium border-r border-slate-300 w-1/2 align-middle select-none">
                    <span className="leading-snug">{item.id}</span>
                  </td>

                  {/* Sel Kanan: Bahasa Jepang (Kanji) */}
                  <td className="px-3 py-1.5 text-slate-950 font-bold font-gothic w-1/2 align-middle">
                    <div className="flex items-center justify-between gap-1.5">
                      <div>
                        <span className="text-sm tracking-wide group-hover:text-blue-900 transition-colors">
                          {item.jp}
                        </span>
                        {showRomaji && (
                          <span className="block text-[10px] text-slate-500 font-sans font-normal leading-none mt-0.5">
                            {item.romaji}
                          </span>
                        )}
                      </div>

                      {/* Tombol Salin Instan */}
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded font-mono font-normal transition-all shrink-0 ${
                          isCopied
                            ? 'bg-emerald-600 text-white font-bold'
                            : 'opacity-0 group-hover:opacity-100 bg-slate-200 text-slate-700 hover:bg-blue-600 hover:text-white'
                        }`}
                      >
                        {isCopied ? 'Tersalin ✓' : 'Salin'}
                      </span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4">
      <div
        className={`bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col border border-slate-300 animate-in fade-in zoom-in-95 duration-150 transition-all ${
          isMaximized ? 'w-[98vw] h-[96vh]' : 'max-w-6xl w-full max-h-[92vh]'
        }`}
      >
        {/* ================= MODAL TOP HEADER ================= */}
        <div className="px-5 py-3 border-b border-slate-200 flex items-center justify-between bg-slate-50 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold shadow-2xs">
              <BookOpen size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm sm:text-base text-slate-900 leading-tight font-sans">
                  Menu Bantuan & Daftar Kosakata Resmi (戸籍謄本 翻訳辞書)
                </h3>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                  Standar Resmi
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-sans">
                Tabel padanan kata kependudukan bahasa Indonesia ke bahasa Jepang siap salin (Copy & Paste)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Tombol Fullscreen / Perbesar */}
            <button
              type="button"
              onClick={() => setIsMaximized(!isMaximized)}
              className="p-1.5 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-200 transition-colors"
              title={isMaximized ? 'Perkecil Jendela' : 'Perbesar Jendela (Layar Penuh)'}
            >
              {isMaximized ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
            </button>

            {/* Tombol Tutup */}
            <button
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-200 transition-colors"
              title="Tutup Menu Bantuan"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* ================= TAB NAVIGATION ================= */}
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-100 px-5 pt-2 text-xs font-semibold gap-2 shrink-0 overflow-x-auto">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveMainTab('vocab')}
              className={`flex items-center gap-1.5 px-4 py-2 border-b-2 font-bold transition-colors whitespace-nowrap ${
                activeMainTab === 'vocab'
                  ? 'border-blue-600 text-blue-600 bg-white rounded-t-lg shadow-2xs'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileSpreadsheet size={15} />
              <span>Daftar Kosakata Spreadsheet ({allVocabEntries.length} Kata)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveMainTab('files')}
              className={`flex items-center gap-1.5 px-4 py-2 border-b-2 font-bold transition-colors whitespace-nowrap ${
                activeMainTab === 'files'
                  ? 'border-blue-600 text-blue-600 bg-white rounded-t-lg shadow-2xs'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileImage size={15} />
              <span>File & Berkas Acuan Asli ({referenceFiles.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveMainTab('rules')}
              className={`flex items-center gap-1.5 px-4 py-2 border-b-2 font-bold transition-colors whitespace-nowrap ${
                activeMainTab === 'rules'
                  ? 'border-blue-600 text-blue-600 bg-white rounded-t-lg shadow-2xs'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <Shield size={15} />
              <span>Standar Legalitas Imigrasi</span>
            </button>
          </div>

          {/* Quick Action Buttons on Top Bar */}
          {activeMainTab === 'vocab' && (
            <div className="hidden sm:flex items-center gap-2 pb-1 text-xs">
              <button
                type="button"
                onClick={() => setShowRomaji(!showRomaji)}
                className={`px-2.5 py-1 rounded border text-[11px] font-medium transition-colors ${
                  showRomaji
                    ? 'bg-blue-50 text-blue-700 border-blue-300'
                    : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'
                }`}
                title="Sembunyikan/Tampilkan cara baca Romaji"
              >
                {showRomaji ? 'Romaji: Aktif' : 'Romaji: Nonaktif'}
              </button>

              <button
                type="button"
                onClick={handleCopyAllVocab}
                className="px-2.5 py-1 rounded bg-slate-900 hover:bg-black text-white text-[11px] font-semibold flex items-center gap-1 shadow-2xs transition-colors"
                title="Salin seluruh kamus kosakata ke clipboard"
              >
                {copiedAll ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                <span>{copiedAll ? 'Semua Tersalin!' : 'Salin Semua'}</span>
              </button>
            </div>
          )}
        </div>

        {/* ================= TAB 1: DAFTAR KOSAKATA SPREADSHEET ================= */}
        {activeMainTab === 'vocab' && (
          <div className="flex flex-col flex-1 overflow-hidden">
            {/* Banner Merah Persis Excel Asli */}
            <div className="px-5 py-2.5 bg-[#FFFBEB] border-b border-amber-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-2.5">
                <span className="text-red-600 font-black text-xl animate-pulse leading-none select-none">
                  &rarr;
                </span>
                <span className="text-red-600 font-extrabold text-sm sm:text-base font-sans tracking-tight">
                  Kosakatanya silakan copypaste dari sini!!
                </span>
                <span className="hidden md:inline-block text-[11px] text-amber-900 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded-full font-medium">
                  Klik baris atau tombol Salin untuk mengambil kanji
                </span>
              </div>

              {/* Pencarian Kata Instan */}
              <div className="flex items-center gap-2">
                <div className="relative w-full sm:w-72">
                  <Search size={14} className="absolute left-2.5 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Cari kata Indonesia, Kanji, Romaji..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-8 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-2xs font-sans"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-700 p-0.5"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>

                {/* Tombol Lihat Berkas Asli */}
                <button
                  type="button"
                  onClick={() => setPreviewImage('/assets/aistudio/Screenshot_2026-10-30_110239_ba93759a.png')}
                  className="shrink-0 px-2.5 py-1.5 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
                  title="Lihat screenshot file acuan Excel yang diunggah"
                >
                  <Eye size={13} className="text-blue-600" />
                  <span className="hidden sm:inline">Gambar Asli</span>
                </button>
              </div>
            </div>

            {/* Toast Notifikasi Berhasil Salin */}
            {copiedItem && (
              <div className="px-5 py-2 bg-emerald-600 text-white text-xs font-medium flex items-center justify-between shrink-0 shadow-sm animate-in fade-in duration-100">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-white" />
                  <span>
                    Kanji berhasil disalin ke clipboard:{' '}
                    <strong className="font-gothic text-base bg-black/20 px-2 py-0.5 rounded font-bold ml-1 text-white">
                      {copiedItem.jp}
                    </strong>{' '}
                    <span className="ml-1 opacity-90">({copiedItem.id})</span>
                  </span>
                </div>
                <span className="text-[11px] font-mono bg-white/20 px-2 py-0.5 rounded">
                  Tersalin ✓
                </span>
              </div>
            )}

            {/* Scrollable Container Tampilan Excel */}
            <div className="p-4 sm:p-5 overflow-y-auto space-y-5 text-xs bg-slate-100/70 flex-1">
              {/* ================= HASIL PENCARIAN (JIKA ADA INPUT SEARCH) ================= */}
              {filteredSearch ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs text-slate-600 font-sans">
                    <span>
                      Ditemukan <strong>{filteredSearch.length}</strong> kosakata untuk pencarian "
                      <strong>{searchQuery}</strong>":
                    </span>
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="text-blue-600 hover:underline font-semibold"
                    >
                      Reset Pencarian
                    </button>
                  </div>

                  {filteredSearch.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-lg border-2 border-dashed border-slate-300">
                      <p className="text-slate-600 font-semibold text-sm font-sans">
                        Tidak ditemukan kosakata yang sesuai.
                      </p>
                      <p className="text-slate-400 text-xs mt-1 font-sans">
                        Coba kata kunci lain atau bersihkan kotak pencarian untuk melihat format tabel Excel asli.
                      </p>
                    </div>
                  ) : (
                    <div className="border-2 border-slate-800 rounded-lg overflow-hidden bg-white shadow-xs">
                      <table className="w-full text-xs border-collapse">
                        <thead>
                          <tr className="bg-slate-200 text-slate-800 font-bold border-b-2 border-slate-800">
                            <th className="px-3 py-2 text-left w-36 border-r border-slate-400">Kategori</th>
                            <th className="px-3 py-2 text-left w-1/3 border-r border-slate-400">Bahasa Indonesia</th>
                            <th className="px-3 py-2 text-left w-1/3 border-r border-slate-400">Terjemahan Jepang (Kanji)</th>
                            <th className="px-3 py-2 text-center w-24">Aksi</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredSearch.map((item, idx) => {
                            const isCopied = copiedItem?.jp === item.jp && copiedItem?.id === item.id;
                            return (
                              <tr
                                key={`search-res-${idx}`}
                                onClick={() => handleCopy(item.jp, item.id)}
                                className={`border-b border-slate-300 hover:bg-amber-100 cursor-pointer transition-colors group ${
                                  idx % 2 === 1 ? 'bg-slate-50/70' : 'bg-white'
                                }`}
                              >
                                <td className="px-3 py-2 text-slate-600 border-r border-slate-300 font-sans">
                                  <span className="px-2 py-0.5 rounded bg-slate-200 text-[10px] font-semibold text-slate-800">
                                    {item.category}
                                  </span>
                                </td>
                                <td className="px-3 py-2 font-medium text-slate-800 border-r border-slate-300 font-sans">
                                  {item.id}
                                </td>
                                <td className="px-3 py-2 font-bold font-gothic text-slate-950 border-r border-slate-300">
                                  <span className="text-sm tracking-wide">{item.jp}</span>
                                  {showRomaji && (
                                    <span className="block text-[10px] text-slate-500 font-sans font-normal mt-0.5">
                                      {item.romaji}
                                    </span>
                                  )}
                                </td>
                                <td className="px-3 py-2 text-center">
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleCopy(item.jp, item.id);
                                    }}
                                    className={`px-2.5 py-1 rounded text-[10px] font-mono font-medium transition-all ${
                                      isCopied
                                        ? 'bg-emerald-600 text-white font-bold'
                                        : 'bg-slate-200 text-slate-700 hover:bg-blue-600 hover:text-white'
                                    }`}
                                  >
                                    {isCopied ? 'Tersalin' : 'Salin'}
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              ) : (
                /* ================= TAMPILAN SPREADSHEET EXCEL ASLI (SANGAT RAPI) ================= */
                <div className="space-y-6">
                  {/* BARIS ATAS: 3 KOLOM SEJAJAR PERSIS FOTO EXCEL */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
                    {/* KOLOM 1: JENIS KELAMIN, AGAMA, STATUS PERKAWINAN */}
                    <div className="space-y-4">
                      {/* Jenis Kelamin: Kuning (#FEF08A) */}
                      {renderExcelBlock(
                        'Jenis Kelamin:',
                        genderList,
                        'bg-[#FEF08A]',
                        'text-amber-950'
                      )}

                      {/* Agama: Biru Langit (#BAE6FD) */}
                      {renderExcelBlock(
                        'Agama:',
                        religionList,
                        'bg-[#BAE6FD]',
                        'text-sky-950'
                      )}

                      {/* Status Perkawinan : Abu-abu (#E2E8F0) */}
                      {renderExcelBlock(
                        'Status Perkawinan :',
                        maritalList,
                        'bg-[#E2E8F0]',
                        'text-slate-900'
                      )}
                    </div>

                    {/* KOLOM 2: PENDIDIKAN (10 BARIS) - Hijau Muda (#BBF7D0) */}
                    <div>
                      {renderExcelBlock(
                        'Pendidikan:',
                        educationList,
                        'bg-[#BBF7D0]',
                        'text-emerald-950'
                      )}
                    </div>

                    {/* KOLOM 3: STATUS HUBUNGAN DALAM KELUARGA (11 BARIS) - Lavender (#C7D2FE) */}
                    <div>
                      {renderExcelBlock(
                        'Status Hubungan Dalam Keluarga :',
                        relationList,
                        'bg-[#C7D2FE]',
                        'text-indigo-950'
                      )}
                    </div>
                  </div>

                  {/* BARIS BAWAH: JENIS PEKERJAAN (PEACH #FED7AA) - 2 KOLOM SEJAJAR + PELAJAR */}
                  <div className="border-2 border-slate-800 bg-white shadow-xs overflow-hidden">
                    {/* Header Bar Pekerjaan */}
                    <div className="bg-[#FED7AA] text-orange-950 px-3 py-2 font-bold text-xs sm:text-sm border-b-2 border-slate-800 flex items-center justify-between font-sans">
                      <div className="flex items-center gap-2">
                        <span className="tracking-tight">Jenis Pekerjaan:</span>
                        <span className="text-[11px] font-normal text-orange-900 bg-orange-200/60 px-2 py-0.5 rounded">
                          (Daftar Pekerjaan Resmi)
                        </span>
                      </div>
                      <span className="text-[10px] font-mono opacity-80 font-normal">
                        24 item pekerjaan
                      </span>
                    </div>

                    {/* Konten Grid 2 Kolom Sejajar */}
                    <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x-2 divide-slate-800">
                      {/* Sub-Kolom 1 (11 baris) */}
                      <table className="w-full text-xs border-collapse">
                        <tbody>
                          {occCol1.map((item, idx) => {
                            const isCopied = copiedItem?.jp === item.jp && copiedItem?.id === item.id;
                            return (
                              <tr
                                key={`occ-col1-${idx}`}
                                onClick={() => handleCopy(item.jp, item.id)}
                                className={`border-b border-slate-300 transition-colors cursor-pointer group ${
                                  idx % 2 === 1 ? 'bg-slate-50/60' : 'bg-white'
                                } hover:bg-amber-100/80`}
                                title="Klik untuk menyalin"
                              >
                                <td className="px-3 py-1.5 text-slate-800 font-medium border-r border-slate-300 w-1/2 align-middle">
                                  {item.id}
                                </td>
                                <td className="px-3 py-1.5 text-slate-950 font-bold font-gothic w-1/2 align-middle">
                                  <div className="flex items-center justify-between gap-1">
                                    <div>
                                      <span className="text-sm tracking-wide">{item.jp}</span>
                                      {showRomaji && (
                                        <span className="block text-[10px] text-slate-500 font-sans font-normal leading-none mt-0.5">
                                          {item.romaji}
                                        </span>
                                      )}
                                    </div>
                                    <span
                                      className={`text-[10px] px-2 py-0.5 rounded font-mono font-normal transition-all shrink-0 ${
                                        isCopied
                                          ? 'bg-emerald-600 text-white font-bold'
                                          : 'opacity-0 group-hover:opacity-100 bg-slate-200 text-slate-700 hover:bg-blue-600 hover:text-white'
                                      }`}
                                    >
                                      {isCopied ? 'Tersalin' : 'Salin'}
                                    </span>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>

                      {/* Sub-Kolom 2 (12 baris) */}
                      <table className="w-full text-xs border-collapse">
                        <tbody>
                          {occCol2.map((item, idx) => {
                            const isCopied = copiedItem?.jp === item.jp && copiedItem?.id === item.id;
                            return (
                              <tr
                                key={`occ-col2-${idx}`}
                                onClick={() => handleCopy(item.jp, item.id)}
                                className={`border-b border-slate-300 transition-colors cursor-pointer group ${
                                  idx % 2 === 1 ? 'bg-slate-50/60' : 'bg-white'
                                } hover:bg-amber-100/80`}
                                title="Klik untuk menyalin"
                              >
                                <td className="px-3 py-1.5 text-slate-800 font-medium border-r border-slate-300 w-1/2 align-middle">
                                  {item.id}
                                </td>
                                <td className="px-3 py-1.5 text-slate-950 font-bold font-gothic w-1/2 align-middle">
                                  <div className="flex items-center justify-between gap-1">
                                    <div>
                                      <span className="text-sm tracking-wide">{item.jp}</span>
                                      {showRomaji && (
                                        <span className="block text-[10px] text-slate-500 font-sans font-normal leading-none mt-0.5">
                                          {item.romaji}
                                        </span>
                                      )}
                                    </div>
                                    <span
                                      className={`text-[10px] px-2 py-0.5 rounded font-mono font-normal transition-all shrink-0 ${
                                        isCopied
                                          ? 'bg-emerald-600 text-white font-bold'
                                          : 'opacity-0 group-hover:opacity-100 bg-slate-200 text-slate-700 hover:bg-blue-600 hover:text-white'
                                      }`}
                                    >
                                      {isCopied ? 'Tersalin' : 'Salin'}
                                    </span>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    {/* Kotak Khusus: Pelajar (sesuai posisi kolom kanan di gambar Excel) */}
                    <div className="border-t-2 border-slate-800 bg-[#FFF7ED] p-3 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="px-3 py-1 bg-[#FED7AA] text-orange-950 font-bold text-xs rounded border border-orange-400">
                          {studentEntry.id}
                        </span>
                        <span className="text-slate-400">&rarr;</span>
                        <span className="font-gothic font-bold text-base text-slate-950">
                          {studentEntry.jp}
                        </span>
                        {showRomaji && (
                          <span className="text-xs text-slate-500 font-sans">
                            ({studentEntry.romaji})
                          </span>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopy(studentEntry.jp, studentEntry.id)}
                        className={`px-3 py-1 rounded text-xs font-mono font-semibold transition-all ${
                          copiedItem?.jp === studentEntry.jp
                            ? 'bg-emerald-600 text-white'
                            : 'bg-white hover:bg-blue-600 hover:text-white border border-slate-300 text-slate-700'
                        }`}
                      >
                        {copiedItem?.jp === studentEntry.jp ? 'Tersalin ✓' : 'Salin Kanji'}
                      </button>
                    </div>
                  </div>

                  {/* ISTILAH HEADER & ADMINISTRASI RESMI KK (CYAN #99F6E4) */}
                  <div className="pt-2">
                    {renderExcelBlock(
                      'Istilah Header & Administrasi Resmi Dokumen (戸籍謄本 項目名):',
                      adminList,
                      'bg-[#99F6E4]',
                      'text-teal-950'
                    )}
                  </div>
                </div>
              )}

              {/* Panduan Penggunaan di Bagian Bawah */}
              <div className="p-3 bg-white border border-slate-300 rounded-lg text-slate-600 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-2xs font-sans">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-800 flex items-center gap-1">
                    <Sparkles size={14} className="text-amber-500" />
                    Cara Cepat Menerjemahkan:
                  </span>
                  <span>
                    Klik baris mana saja pada tabel di atas untuk menyalin Kanji, lalu tempelkan (Ctrl+V) langsung ke formulir dokumen.
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 font-mono">
                  Total kosakata: {allVocabEntries.length}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 2: BERKAS & GAMBAR ACUAN ASLI ================= */}
        {activeMainTab === 'files' && (
          <div className="p-4 sm:p-5 overflow-y-auto space-y-4 text-xs bg-slate-50/70 flex-1">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3.5 text-blue-900 flex items-start gap-2.5 shadow-2xs">
              <Info size={18} className="text-blue-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-sm">Berkas & Gambar Acuan Asli Resmi</span>
                <p className="text-blue-800 text-xs mt-0.5 leading-relaxed">
                  Semua berkas screenshot dan acuan yang Anda kirimkan tersimpan utuh dan dapat dilihat dalam resolusi tinggi atau diunduh kapan saja untuk keperluan perbandingan.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {referenceFiles.map((file) => (
                <div
                  key={file.id}
                  className="bg-white border-2 border-slate-300 rounded-xl overflow-hidden shadow-xs flex flex-col justify-between hover:border-blue-500 transition-all group"
                >
                  <div>
                    {/* Header Card */}
                    <div className="p-3 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                        {file.badge}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {file.type}
                      </span>
                    </div>

                    {/* Image Preview Thumbnail */}
                    <div
                      className="relative h-44 bg-slate-100 cursor-pointer overflow-hidden flex items-center justify-center p-2"
                      onClick={() => setPreviewImage(file.path)}
                      title="Klik untuk memperbesar gambar"
                    >
                      <img
                        src={file.path}
                        alt={file.title}
                        className="max-h-full max-w-full object-contain rounded transition-transform duration-200 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 text-white font-medium text-xs">
                        <Maximize2 size={16} />
                        <span>Klik untuk Perbesar</span>
                      </div>
                    </div>

                    {/* Card Content */}
                    <div className="p-3">
                      <h4 className="font-bold text-xs text-slate-900">{file.title}</h4>
                      <p className="text-[11px] text-slate-600 mt-1 leading-snug">
                        {file.description}
                      </p>
                    </div>
                  </div>

                  {/* Footer Actions */}
                  <div className="p-3 border-t border-slate-100 bg-slate-50 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => setPreviewImage(file.path)}
                      className="flex-1 py-1.5 px-2 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
                    >
                      <Maximize2 size={13} />
                      <span>Lihat Resolusi Penuh</span>
                    </button>
                    <a
                      href={file.path}
                      download
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-1.5 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors shadow-2xs"
                      title="Download file acuan"
                    >
                      <Download size={13} />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= TAB 3: REGULASI & STANDAR IMIGRASI ================= */}
        {activeMainTab === 'rules' && (
          <div className="p-4 sm:p-5 overflow-y-auto space-y-4 text-xs bg-slate-50/70 flex-1">
            <div className="bg-white border-2 border-slate-300 rounded-xl p-5 shadow-xs space-y-4">
              <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2 border-b pb-3">
                <Shield size={18} className="text-emerald-600" />
                Standar Hukum & Regulasi Terjemahan Kartu Keluarga Indonesia ke Jepang
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-slate-700">
                <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 space-y-1.5">
                  <h5 className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                    1. Ketentuan Bahasa & Format Resmi
                  </h5>
                  <p className="text-[11px] leading-relaxed text-slate-600">
                    Sesuai instruksi imigrasi Jepang (出入国在留管理庁), seluruh data kependudukan wajib diterjemahkan <strong>100% ke dalam bahasa Jepang</strong> (Katakana untuk nama asing, Kanji resmi untuk hubungan keluarga, pendidikan, dan pekerjaan). Tidak mencantumkan teks dwibahasa di dalam sel cetak.
                  </p>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 space-y-1.5">
                  <h5 className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                    2. Keabsahan 4 Lembar Salinan (四通発行)
                  </h5>
                  <p className="text-[11px] leading-relaxed text-slate-600">
                    Sesuai dengan sistem kependudukan Indonesia yang tercantum di bagian kiri bawah:
                    <br />• <strong>第1枚目 家長用</strong>: Salinan untuk Kepala Keluarga (Asli).
                    <br />• <strong>第2枚目 隣組長用</strong>: Arsip Ketua RT/RW.
                    <br />• <strong>第3枚目 村長用</strong>: Arsip Kantor Kelurahan/Desa.
                    <br />• <strong>第4枚目 郡長用</strong>: Arsip Kantor Kecamatan.
                  </p>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 space-y-1.5">
                  <h5 className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                    3. Sertifikasi & Stempel Penerjemah (翻訳証明書・署名捺印)
                  </h5>
                  <p className="text-[11px] leading-relaxed text-slate-600">
                    Setiap terjemahan yang diserahkan ke Balai Kota (役所) atau Imigrasi wajib dilengkapi <strong>Sertifikat Penerjemah</strong>, tanggal penerjemahan, identitas penerjemah, dan stempel merah (印鑑/Hanko 翻訳印). Dokumen ini sah dan diakui secara administratif.
                  </p>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 space-y-1.5">
                  <h5 className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                    4. Standar Ukuran Kertas & Margin Cetak
                  </h5>
                  <p className="text-[11px] leading-relaxed text-slate-600">
                    Ukuran kertas wajib <strong>A4 Landscape (横向き, 297mm x 210mm)</strong> dengan garis tabel tegas (border 1px hitam pekat) serta margin cetak 8mm–10mm sehingga seluruh 10 baris anggota keluarga muat sempurna dalam satu halaman tanpa terpotong.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= MODAL BOTTOM FOOTER ================= */}
        <div className="px-5 py-2.5 border-t border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 text-[11px] text-slate-500 font-sans">
            <span className="font-semibold text-slate-700">インドネシア共和国 家族登録証明書</span>
            <span>&bull;</span>
            <span>戸籍謄本 翻訳辞書</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-1.5 bg-slate-900 hover:bg-black text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
          >
            Tutup Panduan
          </button>
        </div>
      </div>

      {/* Lightbox Modal untuk Memperbesar Gambar Acuan */}
      {previewImage && (
        <div
          className="fixed inset-0 z-60 bg-black/85 flex items-center justify-center p-3 animate-in fade-in"
          onClick={() => setPreviewImage(null)}
        >
          <div
            className="relative max-w-5xl max-h-[92vh] bg-white rounded-xl overflow-hidden p-2 shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-3 py-2 border-b border-slate-200">
              <span className="text-xs font-bold text-slate-800 font-sans">
                Pratinjau Berkas Acuan Resolusi Tinggi
              </span>
              <button
                type="button"
                onClick={() => setPreviewImage(null)}
                className="p-1 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>
            <div className="overflow-auto p-2 max-h-[82vh] flex items-center justify-center bg-slate-100">
              <img
                src={previewImage}
                alt="Pratinjau File Acuan"
                className="max-w-full max-h-[78vh] object-contain rounded shadow-xs"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
