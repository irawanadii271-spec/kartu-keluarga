import React, { useState } from 'react';
import {
  TranslationResult,
  TranslatorInfo,
  FamilyMember,
  VOCABULARY,
  SAMPLE_PRESETS,
  EMPTY_TRANSLATION_DATA,
  GENDER_OPTIONS,
  RELIGION_OPTIONS,
  MARITAL_STATUS_OPTIONS,
  EDUCATION_OPTIONS,
  RELATION_STATUS_OPTIONS,
  OCCUPATION_CATEGORIES,
} from '../types';
import { transliterateIndonesianToKatakana } from '../utils/katakanaHelper';
import {
  FileText,
  Users,
  Plus,
  Trash2,
  CheckCircle,
  AlertCircle,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Stamp,
  BookOpen,
  ArrowRight,
  RefreshCw,
  Languages,
  Upload,
  ShieldCheck,
  RotateCcw,
  FileUp,
  Layers,
  Check,
  Sparkles,
} from 'lucide-react';

interface InputModuleProps {
  data: TranslationResult;
  translator: TranslatorInfo;
  onUpdateData: (newData: TranslationResult) => void;
  onUpdateTranslator: (newTranslator: TranslatorInfo) => void;
  onJumpToPreview: () => void;
}

export const InputModule: React.FC<InputModuleProps> = ({
  data,
  translator,
  onUpdateData,
  onUpdateTranslator,
  onJumpToPreview,
}) => {
  const [activeTab, setActiveTab] = useState<'form' | 'presets' | 'translator' | 'vocabulary'>('form');
  const [expandedMemberIndex, setExpandedMemberIndex] = useState<number | null>(0);
  const [translatingKatakanaIdx, setTranslatingKatakanaIdx] = useState<number | null>(null);

  // Custom text mode toggles per member field: `${index}-education` or `${index}-occupation`
  const [customMode, setCustomMode] = useState<Record<string, boolean>>({});
  const toggleCustomMode = (fieldKey: string) => {
    setCustomMode((prev) => ({ ...prev, [fieldKey]: !prev[fieldKey] }));
  };

  // State for interactive vocabulary catalog quick-apply
  const [vocabTargetIdx, setVocabTargetIdx] = useState<number>(0);
  const [appliedFeedback, setAppliedFeedback] = useState<string | null>(null);

  const applyVocabToTarget = (field: keyof FamilyMember, val: string, label: string) => {
    if (data.members[vocabTargetIdx]) {
      const updated = [...data.members];
      updated[vocabTargetIdx] = { ...updated[vocabTargetIdx], [field]: val };
      onUpdateData({ ...data, members: updated });
      setAppliedFeedback(`Berhasil memilih: ${val} (${label}) untuk Anggota ${vocabTargetIdx + 1}`);
      setTimeout(() => setAppliedFeedback(null), 2500);
    }
  };

  // In-Memory stateless scanning states (never written to disk or storage)
  const [uploadFile, setUploadFile] = useState<{ name: string; base64: string; mimeType: string } | null>(null);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanError, setScanError] = useState<string | null>(null);

  // Convert name to Katakana (stateless)
  const handleAutoKatakana = async (index: number, name: string) => {
    if (!name.trim()) return;

    setTranslatingKatakanaIdx(index);
    try {
      const userApiKey = localStorage.getItem('kk_gemini_api_key') || '';
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (userApiKey) {
        headers['x-gemini-key'] = userApiKey;
      }

      const res = await fetch('/api/katakana-name', {
        method: 'POST',
        headers,
        body: JSON.stringify({ name }),
      });
      const json = await res.json();
      if (json.success && json.katakana) {
        updateMember(index, 'fullNameKatakana', json.katakana);
        return;
      }
    } catch {
      // Fallback to local phonetic transliterator
    } finally {
      setTranslatingKatakanaIdx(null);
    }

    const localKatakana = transliterateIndonesianToKatakana(name);
    updateMember(index, 'fullNameKatakana', localKatakana);
  };

  // Stateless In-Memory OCR Processor
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setScanError(null);
    const reader = new FileReader();
    reader.onload = () => {
      setUploadFile({
        name: file.name,
        base64: reader.result as string,
        mimeType: file.type || 'image/jpeg',
      });
    };
    reader.readAsDataURL(file);
  };

  const handleProcessScan = async () => {
    if (!uploadFile) return;
    setIsScanning(true);
    setScanError(null);

    try {
      const userApiKey = localStorage.getItem('kk_gemini_api_key') || '';
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (userApiKey) {
        headers['x-gemini-key'] = userApiKey;
      }

      const res = await fetch('/api/translate-kk', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          imageBase64: uploadFile.base64,
          mimeType: uploadFile.mimeType,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Gagal memproses gambar KK.');
      }

      // Immediately purge uploaded base64 buffer from RAM
      setUploadFile(null);

      // Apply translated result
      onUpdateData(json.data);
      setActiveTab('form');
    } catch (err: any) {
      setScanError(err.message || 'Terjadi kesalahan saat memproses gambar.');
    } finally {
      setIsScanning(false);
    }
  };

  const handleDiscardUpload = () => {
    setUploadFile(null);
    setScanError(null);
  };

  // Member management
  const updateMember = (index: number, field: keyof FamilyMember, val: any) => {
    const updated = [...data.members];
    updated[index] = { ...updated[index], [field]: val };
    onUpdateData({ ...data, members: updated });
  };

  const handleAddMember = () => {
    const newNo = data.members.length + 1;
    const newMember: FamilyMember = {
      no: newNo,
      fullNameOriginal: '',
      fullNameKatakana: '',
      nik: '',
      gender: '男',
      birthPlace: '',
      birthDate: '2000年01月01日',
      religion: 'イスラム教',
      education: '高校卒業',
      occupation: '会社員',
      maritalStatus: '未婚',
      relationStatus: '子',
      fatherName: data.headOfFamily || '',
      motherName: '',
      passportNumber: '-',
      stayPermitNumber: '-',
    };
    onUpdateData({ ...data, members: [...data.members, newMember] });
    setExpandedMemberIndex(data.members.length);
  };

  const handleDeleteMember = (index: number) => {
    if (data.members.length <= 1) {
      alert('Dokumen minimal harus memiliki 1 anggota keluarga.');
      return;
    }
    const filtered = data.members.filter((_, i) => i !== index);
    const renumbered = filtered.map((m, idx) => ({ ...m, no: idx + 1 }));
    onUpdateData({ ...data, members: renumbered });
    setExpandedMemberIndex(Math.max(0, index - 1));
  };

  const handleLoadPreset = (presetData: TranslationResult) => {
    onUpdateData(presetData);
    setActiveTab('form');
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full">
      {/* Tab Navigation */}
      <div className="flex border-b border-slate-200 bg-slate-50 text-xs sm:text-sm font-medium overflow-x-auto no-scrollbar scroll-smooth items-center px-1">
        <button
          type="button"
          onClick={() => setActiveTab('form')}
          className={`flex items-center gap-1.5 px-3 sm:px-4 py-3 border-b-2 font-semibold whitespace-nowrap shrink-0 transition-colors ${
            activeTab === 'form'
              ? 'border-blue-600 text-blue-600 bg-white'
              : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <FileText size={16} />
          <span>Formulir & Anggota ({data.members.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('presets')}
          className={`flex items-center gap-1.5 px-3 sm:px-4 py-3 border-b-2 font-semibold whitespace-nowrap shrink-0 transition-colors ${
            activeTab === 'presets'
              ? 'border-blue-600 text-blue-600 bg-white'
              : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <BookOpen size={16} />
          <span>Contoh Preset KK</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('translator')}
          className={`flex items-center gap-1.5 px-3 sm:px-4 py-3 border-b-2 font-semibold whitespace-nowrap shrink-0 transition-colors ${
            activeTab === 'translator'
              ? 'border-blue-600 text-blue-600 bg-white'
              : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Stamp size={16} />
          <span>Sertifikasi Penerjemah</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('vocabulary')}
          className={`flex items-center gap-1.5 px-3 sm:px-4 py-3 border-b-2 font-semibold whitespace-nowrap shrink-0 transition-colors ${
            activeTab === 'vocabulary'
              ? 'border-blue-600 text-blue-600 bg-white'
              : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Layers size={16} />
          <span className="flex items-center gap-1">
            <span>Daftar Pilihan Kosakata</span>
            <span className="px-1.5 py-0.2 bg-blue-100 text-blue-700 rounded-full text-[10px] font-bold">6 Kategori</span>
          </span>
        </button>
      </div>

      {/* Tab Body */}
      <div className="p-4 sm:p-5 overflow-y-auto max-h-[calc(100vh-210px)] flex-1">
        {/* ================= TAB 1: MANUAL FORM & CORRECTION ================= */}
        {activeTab === 'form' && (
          <div className="space-y-6">
            {/* Section A: Header & Identitas Dokumen */}
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b pb-1">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <FileText size={14} className="text-blue-600" />
                  <span>1. Identitas Dokumen KK (家族カード基本情報)</span>
                </h3>
                <button
                  type="button"
                  onClick={() => onUpdateData(EMPTY_TRANSLATION_DATA)}
                  className="text-[11px] font-semibold text-red-600 hover:text-red-700 flex items-center gap-1 transition-colors"
                  title="Kosongkan seluruh isian formulir ini"
                >
                  <RotateCcw size={12} />
                  <span>Kosongkan Form</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Nomor Kartu Keluarga (16 Digit)
                  </label>
                  <input
                    type="text"
                    maxLength={16}
                    value={data.familyCardNumber}
                    onChange={(e) => onUpdateData({ ...data, familyCardNumber: e.target.value })}
                    className="w-full text-xs font-mono px-2.5 py-1.5 border border-slate-300 rounded focus:ring-1 focus:ring-blue-500 focus:outline-none"
                    placeholder="3174052309120005"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Nama Kepala Keluarga (世帯主氏名)
                  </label>
                  <input
                    type="text"
                    value={data.headOfFamily}
                    onChange={(e) => onUpdateData({ ...data, headOfFamily: e.target.value })}
                    className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded focus:ring-1 focus:ring-blue-500 focus:outline-none"
                    placeholder="BUDI SANTOSO (ブディ・サントソ)"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Tanggal Diterbitkan (西暦YYYY年MM月DD日)
                  </label>
                  <input
                    type="text"
                    value={data.issuedDate}
                    onChange={(e) => onUpdateData({ ...data, issuedDate: e.target.value })}
                    className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded focus:ring-1 focus:ring-blue-500 focus:outline-none"
                    placeholder="西暦2021年05月18日"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Tempat Diterbitkan (発行地)
                  </label>
                  <input
                    type="text"
                    value={data.issuedPlace}
                    onChange={(e) => onUpdateData({ ...data, issuedPlace: e.target.value })}
                    className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded focus:ring-1 focus:ring-blue-500 focus:outline-none"
                    placeholder="南ジャカルタ市 (Kota Jakarta Selatan)"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Nama Pejabat Catatan Sipil (署名官)
                  </label>
                  <input
                    type="text"
                    value={data.signatoryOfficer || ''}
                    onChange={(e) => onUpdateData({ ...data, signatoryOfficer: e.target.value })}
                    className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded focus:ring-1 focus:ring-blue-500 focus:outline-none"
                    placeholder="Drs. H. ACHMAD FAUZI, M.Si (アフマド・ファウジ)"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Nomor Induk Pegawai (公務員番号 / NIP)
                  </label>
                  <input
                    type="text"
                    value={data.signatoryNip || ''}
                    onChange={(e) => onUpdateData({ ...data, signatoryNip: e.target.value })}
                    className="w-full text-xs font-mono px-2.5 py-1.5 border border-slate-300 rounded focus:ring-1 focus:ring-blue-500 focus:outline-none"
                    placeholder="19680512 199403 1 002"
                  />
                </div>
              </div>
            </div>

            {/* Section B: Alamat Kependudukan */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 border-b pb-1 flex items-center gap-1.5">
                <FileText size={14} className="text-blue-600" />
                <span>2. Alamat Lengkap Kependudukan (住所情報)</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Alamat Jalan / Dusun (通り・番地)
                  </label>
                  <input
                    type="text"
                    value={data.address.street}
                    onChange={(e) =>
                      onUpdateData({
                        ...data,
                        address: { ...data.address, street: e.target.value },
                      })
                    }
                    className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded focus:ring-1 focus:ring-blue-500 focus:outline-none"
                    placeholder="Jl. Melati Indah No. 42 (メラティ・インダ通り42番地)"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    RT / RW (隣組 / 地区)
                  </label>
                  <input
                    type="text"
                    value={data.address.rtRw}
                    onChange={(e) =>
                      onUpdateData({
                        ...data,
                        address: { ...data.address, rtRw: e.target.value },
                      })
                    }
                    className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded focus:ring-1 focus:ring-blue-500 focus:outline-none"
                    placeholder="004 / 007 (RT 004 / RW 007)"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Kelurahan / Desa (村 / 行政村)
                  </label>
                  <input
                    type="text"
                    value={data.address.subDistrict}
                    onChange={(e) =>
                      onUpdateData({
                        ...data,
                        address: { ...data.address, subDistrict: e.target.value },
                      })
                    }
                    className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded focus:ring-1 focus:ring-blue-500 focus:outline-none"
                    placeholder="Cilandak Barat村"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Kecamatan (郡 / 区)
                  </label>
                  <input
                    type="text"
                    value={data.address.district}
                    onChange={(e) =>
                      onUpdateData({
                        ...data,
                        address: { ...data.address, district: e.target.value },
                      })
                    }
                    className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded focus:ring-1 focus:ring-blue-500 focus:outline-none"
                    placeholder="Cilandak区"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Kabupaten / Kota (県 / 市)
                  </label>
                  <input
                    type="text"
                    value={data.address.regencyCity}
                    onChange={(e) =>
                      onUpdateData({
                        ...data,
                        address: { ...data.address, regencyCity: e.target.value },
                      })
                    }
                    className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded focus:ring-1 focus:ring-blue-500 focus:outline-none"
                    placeholder="南ジャカルタ市 / Kota Jakarta Selatan"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Provinsi (州)
                  </label>
                  <input
                    type="text"
                    value={data.address.province}
                    onChange={(e) =>
                      onUpdateData({
                        ...data,
                        address: { ...data.address, province: e.target.value },
                      })
                    }
                    className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded focus:ring-1 focus:ring-blue-500 focus:outline-none"
                    placeholder="ジャカルタ首都特別州 / DKI Jakarta州"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Kode Pos (郵便番号)
                  </label>
                  <input
                    type="text"
                    value={data.address.postalCode}
                    onChange={(e) =>
                      onUpdateData({
                        ...data,
                        address: { ...data.address, postalCode: e.target.value },
                      })
                    }
                    className="w-full text-xs font-mono px-2.5 py-1.5 border border-slate-300 rounded focus:ring-1 focus:ring-blue-500 focus:outline-none"
                    placeholder="12430"
                  />
                </div>
              </div>
            </div>

            {/* Section C: Anggota Keluarga */}
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b pb-1">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <Users size={14} className="text-blue-600" />
                  <span>3. Anggota Keluarga (家族構成員 - {data.members.length} Orang)</span>
                </h3>
                <button
                  type="button"
                  onClick={handleAddMember}
                  className="flex items-center gap-1 text-xs bg-blue-50 text-blue-700 hover:bg-blue-100 px-2.5 py-1 rounded font-semibold transition-colors"
                >
                  <Plus size={13} />
                  <span>Tambah Anggota</span>
                </button>
              </div>

              {/* Members List Accordion */}
              <div className="space-y-2">
                {data.members.map((member, index) => {
                  const isExpanded = expandedMemberIndex === index;
                  return (
                    <div
                      key={`member-card-${index}`}
                      className="border border-slate-200 rounded-lg overflow-hidden bg-slate-50/50"
                    >
                      {/* Member Header */}
                      <div
                        onClick={() => setExpandedMemberIndex(isExpanded ? null : index)}
                        className="px-3 py-2 bg-slate-100 hover:bg-slate-200/70 flex items-center justify-between cursor-pointer text-xs font-medium"
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-[10px]">
                            {member.no || index + 1}
                          </span>
                          <span className="font-bold text-slate-900">
                            {member.fullNameOriginal || `Anggota ${index + 1}`}
                          </span>
                          {member.fullNameKatakana && (
                            <span className="text-slate-500 font-sans">({member.fullNameKatakana})</span>
                          )}
                          <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-200 text-slate-700">
                            {member.relationStatus || 'Hubungan'}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteMember(index);
                            }}
                            className="text-slate-400 hover:text-red-600 p-1 rounded"
                            title="Hapus anggota"
                          >
                            <Trash2 size={14} />
                          </button>
                          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </div>
                      </div>

                      {/* Member Expanded Form */}
                      {isExpanded && (
                        <div className="p-3 bg-white space-y-3 text-xs border-t border-slate-200">
                          {/* Name + Katakana helper */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <div>
                              <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">
                                Nama Lengkap Asli (Huruf Kapital)
                              </label>
                              <div className="flex gap-1">
                                <input
                                  type="text"
                                  value={member.fullNameOriginal}
                                  onChange={(e) => updateMember(index, 'fullNameOriginal', e.target.value.toUpperCase())}
                                  className="w-full text-xs px-2 py-1.5 border border-slate-300 rounded focus:ring-1 focus:ring-blue-500 focus:outline-none uppercase"
                                  placeholder="BUDI SANTOSO"
                                />
                                <button
                                  type="button"
                                  onClick={() => handleAutoKatakana(index, member.fullNameOriginal)}
                                  disabled={translatingKatakanaIdx === index || !member.fullNameOriginal}
                                  className="shrink-0 px-2 py-1 bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200 rounded text-[10px] font-semibold flex items-center gap-1"
                                  title="Konversi otomatis nama ke Katakana standar Jepang"
                                >
                                  <Languages size={11} />
                                  <span>{translatingKatakanaIdx === index ? '...' : 'Katakana'}</span>
                                </button>
                              </div>
                            </div>

                            <div>
                              <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">
                                Nama Katakana (カタカナ)
                              </label>
                              <input
                                type="text"
                                value={member.fullNameKatakana}
                                onChange={(e) => updateMember(index, 'fullNameKatakana', e.target.value)}
                                className="w-full text-xs px-2 py-1.5 border border-slate-300 rounded focus:ring-1 focus:ring-blue-500 focus:outline-none"
                                placeholder="ブディ・サントソ"
                              />
                            </div>
                          </div>

                          {/* NIK & Gender */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <div>
                              <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">
                                NIK (16 Digit)
                              </label>
                              <input
                                type="text"
                                maxLength={16}
                                value={member.nik}
                                onChange={(e) => updateMember(index, 'nik', e.target.value)}
                                className="w-full text-xs font-mono px-2 py-1.5 border border-slate-300 rounded focus:ring-1 focus:ring-blue-500 focus:outline-none"
                                placeholder="3174051508820001"
                              />
                            </div>

                            <div>
                              <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">
                                Jenis Kelamin (性別) - Pilih Langsung:
                              </label>
                              <div className="flex gap-2">
                                <button
                                  type="button"
                                  onClick={() => updateMember(index, 'gender', '男')}
                                  className={`flex-1 py-1.5 px-2 rounded text-xs font-bold border transition-all flex items-center justify-center gap-1.5 ${
                                    member.gender === '男' || member.gender === '男性'
                                      ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                                      : 'bg-white text-slate-700 border-slate-300 hover:bg-blue-50'
                                  }`}
                                >
                                  <span>男</span>
                                  <span className="text-[10px] font-normal opacity-90">(男性 - Laki)</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => updateMember(index, 'gender', '女')}
                                  className={`flex-1 py-1.5 px-2 rounded text-xs font-bold border transition-all flex items-center justify-center gap-1.5 ${
                                    member.gender === '女' || member.gender === '女性'
                                      ? 'bg-rose-600 text-white border-rose-600 shadow-2xs'
                                      : 'bg-white text-slate-700 border-slate-300 hover:bg-rose-50'
                                  }`}
                                >
                                  <span>女</span>
                                  <span className="text-[10px] font-normal opacity-90">(女性 - Perempuan)</span>
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* Tempat & Tanggal Lahir */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <div>
                              <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">
                                Tempat Lahir (出生地)
                              </label>
                              <input
                                type="text"
                                value={member.birthPlace}
                                onChange={(e) => updateMember(index, 'birthPlace', e.target.value)}
                                className="w-full text-xs px-2 py-1.5 border border-slate-300 rounded focus:ring-1 focus:ring-blue-500 focus:outline-none"
                                placeholder="ジャカルタ (Jakarta)"
                              />
                            </div>

                            <div>
                              <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">
                                Tanggal Lahir (西暦YYYY年MM月DD日)
                              </label>
                              <input
                                type="text"
                                value={member.birthDate}
                                onChange={(e) => updateMember(index, 'birthDate', e.target.value)}
                                className="w-full text-xs px-2 py-1.5 border border-slate-300 rounded focus:ring-1 focus:ring-blue-500 focus:outline-none"
                                placeholder="西暦1985年10月12日"
                              />
                            </div>
                          </div>

                          {/* Hubungan Keluarga & Status Perkawinan (Dropdown Pilihan Cepat) */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <div>
                              <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">
                                Status Hubungan Keluarga (続柄) - Pilih:
                              </label>
                              <select
                                value={member.relationStatus}
                                onChange={(e) => updateMember(index, 'relationStatus', e.target.value)}
                                className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded focus:ring-1 focus:ring-blue-500 focus:outline-none bg-white font-medium"
                              >
                                <option value="">-- Pilih Hubungan Keluarga --</option>
                                {RELATION_STATUS_OPTIONS.map((item) => (
                                  <option key={item.idKey} value={item.jpVal}>
                                    {item.jpVal} — {item.idKey}
                                  </option>
                                ))}
                                {!RELATION_STATUS_OPTIONS.some((i) => i.jpVal === member.relationStatus) && member.relationStatus && (
                                  <option value={member.relationStatus}>{member.relationStatus} (Kustom)</option>
                                )}
                              </select>
                            </div>

                            <div>
                              <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">
                                Status Perkawinan (婚姻状況) - Pilih:
                              </label>
                              <select
                                value={member.maritalStatus}
                                onChange={(e) => updateMember(index, 'maritalStatus', e.target.value)}
                                className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded focus:ring-1 focus:ring-blue-500 focus:outline-none bg-white font-medium"
                              >
                                <option value="">-- Pilih Status Perkawinan --</option>
                                {MARITAL_STATUS_OPTIONS.map((item) => (
                                  <option key={item.idKey} value={item.jpVal}>
                                    {item.jpVal} — {item.idKey}
                                  </option>
                                ))}
                                {!MARITAL_STATUS_OPTIONS.some((i) => i.jpVal === member.maritalStatus) && member.maritalStatus && (
                                  <option value={member.maritalStatus}>{member.maritalStatus} (Kustom)</option>
                                )}
                              </select>
                            </div>
                          </div>

                          {/* Agama, Pendidikan, Pekerjaan (Pilihan Dropdown Terkategori) */}
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                            {/* Agama */}
                            <div>
                              <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">
                                Agama (宗教) - Pilih:
                              </label>
                              <select
                                value={member.religion}
                                onChange={(e) => updateMember(index, 'religion', e.target.value)}
                                className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded focus:ring-1 focus:ring-blue-500 focus:outline-none bg-white font-medium"
                              >
                                <option value="">-- Pilih Agama --</option>
                                {RELIGION_OPTIONS.map((item) => (
                                  <option key={item.idKey} value={item.jpVal}>
                                    {item.jpVal} — {item.idKey}
                                  </option>
                                ))}
                                {!RELIGION_OPTIONS.some((i) => i.jpVal === member.religion) && member.religion && (
                                  <option value={member.religion}>{member.religion} (Kustom)</option>
                                )}
                              </select>
                            </div>

                            {/* Pendidikan Terakhir */}
                            <div>
                              <div className="flex items-center justify-between mb-0.5">
                                <label className="block text-[11px] font-semibold text-slate-700">
                                  Pendidikan (学歴) - Pilih:
                                </label>
                                <button
                                  type="button"
                                  onClick={() => toggleCustomMode(`${index}-education`)}
                                  className="text-[10px] text-blue-600 hover:text-blue-800 underline transition-colors"
                                  title="Beralih ke mode input manual atau pilihan"
                                >
                                  {customMode[`${index}-education`] ? 'Pilih Daftar' : 'Ketik Manual'}
                                </button>
                              </div>
                              {customMode[`${index}-education`] ? (
                                <input
                                  type="text"
                                  value={member.education}
                                  onChange={(e) => updateMember(index, 'education', e.target.value)}
                                  className="w-full text-xs px-2 py-1.5 border border-blue-400 bg-blue-50/20 rounded focus:ring-1 focus:ring-blue-500 focus:outline-none"
                                  placeholder="Ketik kustom jenjang pendidikan..."
                                />
                              ) : (
                                <select
                                  value={member.education}
                                  onChange={(e) => updateMember(index, 'education', e.target.value)}
                                  className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded focus:ring-1 focus:ring-blue-500 focus:outline-none bg-white font-medium"
                                >
                                  <option value="">-- Pilih Pendidikan (10 Jenjang) --</option>
                                  {EDUCATION_OPTIONS.map((item) => (
                                    <option key={item.idKey} value={item.jpVal}>
                                      {item.jpVal} — {item.idKey}
                                    </option>
                                  ))}
                                  {!EDUCATION_OPTIONS.some((i) => i.jpVal === member.education) && member.education && (
                                    <option value={member.education}>{member.education} (Kustom)</option>
                                  )}
                                </select>
                              )}
                            </div>

                            {/* Jenis Pekerjaan */}
                            <div>
                              <div className="flex items-center justify-between mb-0.5">
                                <label className="block text-[11px] font-semibold text-slate-700">
                                  Pekerjaan (職業) - Pilih:
                                </label>
                                <button
                                  type="button"
                                  onClick={() => toggleCustomMode(`${index}-occupation`)}
                                  className="text-[10px] text-blue-600 hover:text-blue-800 underline transition-colors"
                                  title="Beralih ke mode input manual atau pilihan"
                                >
                                  {customMode[`${index}-occupation`] ? 'Pilih Daftar' : 'Ketik Manual'}
                                </button>
                              </div>
                              {customMode[`${index}-occupation`] ? (
                                <input
                                  type="text"
                                  value={member.occupation}
                                  onChange={(e) => updateMember(index, 'occupation', e.target.value)}
                                  className="w-full text-xs px-2 py-1.5 border border-blue-400 bg-blue-50/20 rounded focus:ring-1 focus:ring-blue-500 focus:outline-none"
                                  placeholder="Ketik kustom nama pekerjaan..."
                                />
                              ) : (
                                <select
                                  value={member.occupation}
                                  onChange={(e) => updateMember(index, 'occupation', e.target.value)}
                                  className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded focus:ring-1 focus:ring-blue-500 focus:outline-none bg-white font-medium"
                                >
                                  <option value="">-- Pilih Pekerjaan (24 Pilihan Resmi) --</option>
                                  {OCCUPATION_CATEGORIES.map((cat) => (
                                    <optgroup key={cat.categoryName} label={cat.categoryName}>
                                      {cat.items.map((item) => (
                                        <option key={item.idKey} value={item.jpVal}>
                                          {item.jpVal} — {item.idKey}
                                        </option>
                                      ))}
                                    </optgroup>
                                  ))}
                                  {!OCCUPATION_CATEGORIES.some((g) => g.items.some((i) => i.jpVal === member.occupation)) && member.occupation && (
                                    <option value={member.occupation}>{member.occupation} (Kustom)</option>
                                  )}
                                </select>
                              )}
                            </div>
                          </div>

                          {/* Dokumen Imigrasi (Paspor & Izin Tinggal) */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 border-t border-slate-100">
                            <div>
                              <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">
                                No. Paspor (パスポート番号)
                              </label>
                              <input
                                type="text"
                                value={member.passportNumber || ''}
                                onChange={(e) => updateMember(index, 'passportNumber', e.target.value)}
                                className="w-full text-xs font-mono px-2 py-1.5 border border-slate-300 rounded focus:ring-1 focus:ring-blue-500 focus:outline-none"
                                placeholder="A 1234567 atau -"
                              />
                            </div>

                            <div>
                              <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">
                                No. Dokumen Tinggal / KITAS (在留資格認定書番号)
                              </label>
                              <input
                                type="text"
                                value={member.stayPermitNumber || ''}
                                onChange={(e) => updateMember(index, 'stayPermitNumber', e.target.value)}
                                className="w-full text-xs font-mono px-2 py-1.5 border border-slate-300 rounded focus:ring-1 focus:ring-blue-500 focus:outline-none"
                                placeholder="2C11AA000000 atau -"
                              />
                            </div>
                          </div>

                          {/* Nama Ayah & Ibu */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 border-t border-slate-100">
                            <div>
                              <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">
                                Nama Ayah (父の氏名 - Latin & Katakana)
                              </label>
                              <input
                                type="text"
                                value={member.fatherName}
                                onChange={(e) => updateMember(index, 'fatherName', e.target.value)}
                                className="w-full text-xs px-2 py-1.5 border border-slate-300 rounded focus:ring-1 focus:ring-blue-500 focus:outline-none"
                                placeholder="SOEKARNO (スカルノ)"
                              />
                            </div>

                            <div>
                              <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">
                                Nama Ibu (母の氏名 - Latin & Katakana)
                              </label>
                              <input
                                type="text"
                                value={member.motherName}
                                onChange={(e) => updateMember(index, 'motherName', e.target.value)}
                                className="w-full text-xs px-2 py-1.5 border border-slate-300 rounded focus:ring-1 focus:ring-blue-500 focus:outline-none"
                                placeholder="SITI AMINAH (シティ・アミナ)"
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick Action: View Live Preview */}
            <div className="pt-2">
              <button
                type="button"
                onClick={onJumpToPreview}
                className="w-full py-2.5 px-4 bg-slate-900 hover:bg-black text-white font-semibold text-xs rounded-lg flex items-center justify-center gap-1.5 transition-colors"
              >
                <span>Lihat Hasil Terjemahan di Lembar Dokumen</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        )}



        {/* ================= TAB 3: OFFICIAL PRESETS ================= */}
        {activeTab === 'presets' && (
          <div className="space-y-4">
            <div className="text-xs text-slate-600">
              Pilih salah satu template contoh data Kartu Keluarga Indonesia untuk langsung menguji tampilan spreadsheet terjemahan dan ekspor PDF resmi:
            </div>

            <div className="space-y-3">
              {SAMPLE_PRESETS.map((preset) => (
                <div
                  key={preset.id}
                  className="p-3.5 border border-slate-200 rounded-lg hover:border-blue-400 hover:bg-blue-50/20 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white"
                >
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 flex items-center gap-2">
                      <span>{preset.title}</span>
                      <span className="px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px]">
                        {preset.data.members.length} Orang
                      </span>
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">{preset.description}</p>
                    <div className="text-[10px] font-mono text-slate-400 mt-1">
                      No. KK: {preset.data.familyCardNumber} | {preset.data.address.regencyCity}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleLoadPreset(preset.data)}
                    className="shrink-0 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold flex items-center justify-center gap-1 transition-colors"
                  >
                    <span>Gunakan Data Ini</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= TAB 4: TRANSLATOR & HANKO STAMP ================= */}
        {activeTab === 'translator' && (
          <div className="space-y-4">
            <div className="bg-amber-50/70 border border-amber-200 rounded-lg p-3 text-xs text-amber-900 flex items-start gap-2">
              <Stamp size={16} className="text-amber-700 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Keabsahan Dokumen untuk Imigrasi & Balai Kota</span>
                <p className="text-amber-800 mt-0.5 leading-relaxed">
                  Imigrasi Jepang (出入国在留管理庁) dan Ward Office (区役所/市役所) mewajibkan pernyataan penerjemah (翻訳証明書), tanggal penerjemahan, identitas penerjemah, dan stempel/tanda tangan resmi (署名捺印).
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Nama Penerjemah (Huruf Latin)
                </label>
                <input
                  type="text"
                  value={translator.name}
                  onChange={(e) => onUpdateTranslator({ ...translator, name: e.target.value })}
                  className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  placeholder="ADI IRAWAN, S.Hum"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Nama Katakana (カタカナ)
                </label>
                <input
                  type="text"
                  value={translator.katakanaName}
                  onChange={(e) => onUpdateTranslator({ ...translator, katakanaName: e.target.value })}
                  className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  placeholder="アディ・イラワン"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Organisasi / Lembaga Penerjemah
                </label>
                <input
                  type="text"
                  value={translator.organization}
                  onChange={(e) => onUpdateTranslator({ ...translator, organization: e.target.value })}
                  className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  placeholder="公認インドネシア語翻訳事務所 / HPI Member"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Nomor Sertifikasi / Lisensi
                </label>
                <input
                  type="text"
                  value={translator.certificationNumber}
                  onChange={(e) => onUpdateTranslator({ ...translator, certificationNumber: e.target.value })}
                  className="w-full text-xs font-mono px-2.5 py-1.5 border border-slate-300 rounded focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  placeholder="TR-JP/2026/089"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Tanggal Penerjemahan (西暦YYYY年MM月DD日)
                </label>
                <input
                  type="text"
                  value={translator.signatureDate}
                  onChange={(e) => onUpdateTranslator({ ...translator, signatureDate: e.target.value })}
                  className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  placeholder="西暦2026年10月29日"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Tulisan Pada Stempel Hanko (判子テキスト)
                </label>
                <input
                  type="text"
                  value={translator.stampText}
                  onChange={(e) => onUpdateTranslator({ ...translator, stampText: e.target.value })}
                  className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  placeholder="翻訳印"
                />
              </div>
            </div>

            {/* Toggle Hanko Stamp */}
            <div className="pt-2 flex items-center justify-between border-t border-slate-200">
              <label className="text-xs font-semibold text-slate-800 flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={translator.includeStamp}
                  onChange={(e) => onUpdateTranslator({ ...translator, includeStamp: e.target.checked })}
                  className="rounded text-red-600 focus:ring-red-500 w-4 h-4"
                />
                <span>Sertakan Stempel Hanko Resmi (印鑑 / 翻訳者之印)</span>
              </label>
            </div>
          </div>
        )}

        {/* ================= TAB 4: KATALOG KOSAKATA LENGKAP & PEMILIH CEPAT ================= */}
        {activeTab === 'vocabulary' && (
          <div className="space-y-6">
            {/* Top Toolbar for Applying to Selected Member */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-3 sm:p-4 shadow-2xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0">
                    <Layers size={18} />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                      Katalog Kosakata Resmi Terjemahan Jepang (戸籍謄本)
                    </h4>
                    <p className="text-[11px] text-slate-600">
                      Klik pada kartu kosakata mana pun untuk langsung menerapkannya ke anggota keluarga tanpa mengetik manual.
                    </p>
                  </div>
                </div>

                {/* Target member selector */}
                <div className="flex items-center gap-2 shrink-0 bg-white px-2.5 py-1.5 rounded-lg border border-blue-200">
                  <span className="text-[11px] font-semibold text-slate-700 whitespace-nowrap">
                    Terapkan Ke:
                  </span>
                  <select
                    value={vocabTargetIdx}
                    onChange={(e) => setVocabTargetIdx(parseInt(e.target.value, 10))}
                    className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-1 rounded border border-blue-200 focus:outline-none"
                  >
                    {data.members.map((m, idx) => (
                      <option key={`target-member-${idx}`} value={idx}>
                        No. {idx + 1}: {m.fullNameOriginal || `Anggota ${idx + 1}`} ({m.relationStatus || 'Hubungan'})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Feedback Alert Banner */}
              {appliedFeedback && (
                <div className="mt-3 bg-emerald-100 border border-emerald-300 text-emerald-900 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 animate-fadeIn">
                  <Check size={14} className="text-emerald-700" />
                  <span>{appliedFeedback}</span>
                </div>
              )}
            </div>

            {/* Kategori 1: Jenis Kelamin */}
            <div className="space-y-2">
              <div className="flex items-center justify-between border-b border-slate-200 pb-1">
                <h5 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-500" />
                  <span>1. Jenis Kelamin (性別) - 2 Pilihan</span>
                </h5>
                <span className="text-[10px] text-slate-500">Klik untuk menerapkan ke Anggota {vocabTargetIdx + 1}</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {GENDER_OPTIONS.map((item) => (
                  <button
                    key={item.idKey}
                    type="button"
                    onClick={() => applyVocabToTarget('gender', item.jpVal, item.idKey)}
                    className="p-2.5 bg-white hover:bg-blue-50/60 border border-slate-200 hover:border-blue-300 rounded-lg text-left transition-all group flex items-center justify-between shadow-2xs"
                  >
                    <div>
                      <span className="text-[10px] font-medium text-slate-500 uppercase">{item.idKey}</span>
                      <p className="text-sm font-bold text-slate-900 font-gothic group-hover:text-blue-600">
                        {item.fullJp} ({item.jpVal})
                      </p>
                    </div>
                    <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                      Pilih
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Kategori 2: Agama */}
            <div className="space-y-2">
              <div className="flex items-center justify-between border-b border-slate-200 pb-1">
                <h5 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>2. Agama (宗教) - 5 Pilihan</span>
                </h5>
                <span className="text-[10px] text-slate-500">Klik untuk menerapkan</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
                {RELIGION_OPTIONS.map((item) => (
                  <button
                    key={item.idKey}
                    type="button"
                    onClick={() => applyVocabToTarget('religion', item.jpVal, item.idKey)}
                    className="p-2.5 bg-white hover:bg-emerald-50/60 border border-slate-200 hover:border-emerald-300 rounded-lg text-left transition-all group shadow-2xs"
                  >
                    <span className="text-[10px] font-medium text-slate-500">{item.idKey}</span>
                    <p className="text-xs font-bold text-slate-900 font-gothic group-hover:text-emerald-700 mt-0.5">
                      {item.jpVal}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Kategori 3: Status Perkawinan */}
            <div className="space-y-2">
              <div className="flex items-center justify-between border-b border-slate-200 pb-1">
                <h5 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-purple-500" />
                  <span>3. Status Perkawinan (婚姻状況) - 4 Pilihan</span>
                </h5>
                <span className="text-[10px] text-slate-500">Klik untuk menerapkan</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {MARITAL_STATUS_OPTIONS.map((item) => (
                  <button
                    key={item.idKey}
                    type="button"
                    onClick={() => applyVocabToTarget('maritalStatus', item.jpVal, item.idKey)}
                    className="p-2.5 bg-white hover:bg-purple-50/60 border border-slate-200 hover:border-purple-300 rounded-lg text-left transition-all group shadow-2xs"
                  >
                    <span className="text-[10px] font-medium text-slate-500">{item.idKey}</span>
                    <p className="text-xs font-bold text-slate-900 font-gothic group-hover:text-purple-700 mt-0.5">
                      {item.jpVal}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Kategori 4: Pendidikan Terakhir */}
            <div className="space-y-2">
              <div className="flex items-center justify-between border-b border-slate-200 pb-1">
                <h5 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  <span>4. Pendidikan Terakhir (最終学歴) - 10 Jenjang</span>
                </h5>
                <span className="text-[10px] text-slate-500">Klik untuk menerapkan</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {EDUCATION_OPTIONS.map((item) => (
                  <button
                    key={item.idKey}
                    type="button"
                    onClick={() => applyVocabToTarget('education', item.jpVal, item.idKey)}
                    className="p-2.5 bg-white hover:bg-amber-50/60 border border-slate-200 hover:border-amber-300 rounded-lg text-left transition-all group flex items-center justify-between shadow-2xs"
                  >
                    <div>
                      <span className="text-[10px] text-slate-500 block">{item.idKey}</span>
                      <p className="text-xs font-bold text-slate-900 font-gothic group-hover:text-amber-800">
                        {item.jpVal}
                      </p>
                    </div>
                    <span className="text-[10px] text-slate-400 group-hover:text-amber-700 font-semibold">
                      Terapkan &rarr;
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Kategori 5: Status Hubungan Dalam Keluarga */}
            <div className="space-y-2">
              <div className="flex items-center justify-between border-b border-slate-200 pb-1">
                <h5 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-sky-500" />
                  <span>5. Status Hubungan Dalam Keluarga (続柄 / 家族関係) - 11 Pilihan</span>
                </h5>
                <span className="text-[10px] text-slate-500">Klik untuk menerapkan</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                {RELATION_STATUS_OPTIONS.map((item) => (
                  <button
                    key={item.idKey}
                    type="button"
                    onClick={() => applyVocabToTarget('relationStatus', item.jpVal, item.idKey)}
                    className="p-2.5 bg-white hover:bg-sky-50/60 border border-slate-200 hover:border-sky-300 rounded-lg text-left transition-all group flex items-center justify-between shadow-2xs"
                  >
                    <div>
                      <span className="text-[10px] text-slate-500 block">{item.idKey}</span>
                      <p className="text-xs font-bold text-slate-900 font-gothic group-hover:text-sky-700">
                        {item.jpVal}
                      </p>
                    </div>
                    <span className="text-[10px] text-slate-400 group-hover:text-sky-700 font-semibold">
                      &rarr;
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Kategori 6: Jenis Pekerjaan (24 Kosakata Terbagi 6 Sektor) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200 pb-1">
                <h5 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-indigo-500" />
                  <span>6. Jenis Pekerjaan (職業) - 24 Kosakata Terbagi 6 Sektor</span>
                </h5>
                <span className="text-[10px] text-slate-500">Klik untuk menerapkan</span>
              </div>

              <div className="space-y-3">
                {OCCUPATION_CATEGORIES.map((cat) => (
                  <div key={cat.categoryName} className="bg-slate-50 border border-slate-200 rounded-lg p-2.5">
                    <h6 className="text-[11px] font-bold text-slate-700 mb-2 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
                      <span>{cat.categoryName} ({cat.items.length})</span>
                    </h6>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                      {cat.items.map((item) => (
                        <button
                          key={item.idKey}
                          type="button"
                          onClick={() => applyVocabToTarget('occupation', item.jpVal, item.idKey)}
                          className="p-2 bg-white hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 rounded text-left transition-all group flex items-center justify-between shadow-2xs"
                        >
                          <div>
                            <span className="text-[10px] text-slate-500 block">{item.idKey}</span>
                            <p className="text-xs font-bold text-slate-900 font-gothic group-hover:text-indigo-700">
                              {item.jpVal}
                            </p>
                          </div>
                          <span className="text-[10px] text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                            Pilih
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom action button */}
            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setActiveTab('form')}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
              >
                <span>Kembali ke Formulir Pengisian</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
