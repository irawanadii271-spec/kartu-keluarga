import React, { useState } from 'react';
import { TranslationResult, FamilyMember } from '../types';
import { Check, Edit2 } from 'lucide-react';

interface PreviewSheetProps {
  data: TranslationResult;
  onUpdateData: (newData: TranslationResult) => void;
}

// Clean any potential Indonesian annotations in brackets, e.g. "BUDI (ブディ)" -> "ブディ" or "Kota Surabaya" -> "スラバヤ市"
function toPureJapanese(val: string | undefined): string {
  if (!val) return '';
  const trimmed = String(val).trim();

  // If there's Japanese in parentheses like "BUDI SANTOSO (ブディ・サントソ)", extract the Japanese part
  const matchJp = trimmed.match(/\(([\u30A0-\u30FF\u3040-\u309F\u4E00-\u9FAF・\s]+)\)/);
  if (matchJp && matchJp[1]) {
    return matchJp[1].trim();
  }

  // Remove any remaining Latin parenthesized info like "(WNI)", "(Kelurahan)", "(Kota Jakarta)"
  return trimmed.replace(/\s*\([a-zA-Z\s.,/0-9-]+\)/g, '').trim();
}

export const PreviewSheet: React.FC<PreviewSheetProps> = ({
  data,
  onUpdateData,
}) => {
  const [editingCell, setEditingCell] = useState<string | null>(null);
  const [inlineEditValue, setInlineEditValue] = useState<string>('');

  const handleStartEdit = (cellKey: string, currentValue: string) => {
    setEditingCell(cellKey);
    setInlineEditValue(currentValue || '');
  };

  const handleSaveEdit = (cellKey: string) => {
    const parts = cellKey.split('.');
    if (parts[0] === 'members' && parts.length >= 3) {
      const memberIndex = parseInt(parts[1], 10);
      const field = parts[2] as keyof FamilyMember;
      const updatedMembers = [...data.members];
      if (updatedMembers[memberIndex]) {
        updatedMembers[memberIndex] = {
          ...updatedMembers[memberIndex],
          [field]: inlineEditValue,
        };
        onUpdateData({ ...data, members: updatedMembers });
      }
    } else if (parts[0] === 'address' && parts.length === 2) {
      const addrField = parts[1] as keyof typeof data.address;
      onUpdateData({
        ...data,
        address: {
          ...data.address,
          [addrField]: inlineEditValue,
        },
      });
    } else if (cellKey in data) {
      onUpdateData({
        ...data,
        [cellKey]: inlineEditValue,
      });
    }
    setEditingCell(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent, cellKey: string) => {
    if (e.key === 'Enter') {
      handleSaveEdit(cellKey);
    } else if (e.key === 'Escape') {
      setEditingCell(null);
    }
  };

  // Helper renderer for inline editable cells
  const renderCell = (
    cellKey: string,
    value: string | number | undefined,
    align: 'left' | 'center' | 'right' = 'center',
    placeholder = '-'
  ) => {
    const isEditing = editingCell === cellKey;
    const strVal = value !== undefined && value !== null && String(value).trim() !== '' ? String(value) : '';

    if (isEditing) {
      return (
        <div className="flex items-center gap-0.5 w-full min-w-[30px]">
          <input
            type="text"
            className="w-full bg-amber-50 border border-blue-600 rounded px-1 py-0 text-[8pt] font-sans text-black focus:outline-none"
            value={inlineEditValue}
            autoFocus
            onChange={(e) => setInlineEditValue(e.target.value)}
            onKeyDown={(e) => handleKeyDown(e, cellKey)}
            onBlur={() => handleSaveEdit(cellKey)}
          />
          <button
            type="button"
            className="text-emerald-700 hover:text-emerald-900 p-0.5"
            onClick={() => handleSaveEdit(cellKey)}
            title="Simpan"
          >
            <Check size={10} />
          </button>
        </div>
      );
    }

    return (
      <div
        onClick={() => handleStartEdit(cellKey, strVal)}
        className={`group cursor-pointer hover:bg-amber-100/50 transition-colors py-0.5 px-0.5 rounded flex items-center justify-${align === 'left' ? 'start' : align === 'right' ? 'end' : 'center'} w-full text-${align}`}
        title="クリックして直接編集"
      >
        <span className="truncate max-w-full">{strVal || <span className="text-gray-400 font-mono">{placeholder}</span>}</span>
        <Edit2
          size={8}
          className="text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity ml-0.5 shrink-0 no-print"
        />
      </div>
    );
  };

  // 10 data rows exactly matching the official template in the screenshot
  const rows = Array.from({ length: 10 }, (_, index) => {
    return data.members[index] || null;
  });

  // Pure Japanese Head of family representation
  const headOfFamilyDisplay = toPureJapanese(data.headOfFamily);

  return (
    <div className="w-full flex justify-center print-area-wrapper overflow-x-auto p-1 sm:p-2">
      {/* Exact A4 Landscape Official Sheet matching the user's reference screenshot */}
      <div
        id="kk-preview-sheet"
        className="document-outer-frame font-gothic text-black mx-auto w-[1040px] max-w-[1040px] p-5 sm:p-7 min-h-[695px] relative"
        style={{
          boxSizing: 'border-box',
          fontSize: '8.5pt',
          color: '#000000',
        }}
      >
        {/* Top Right 'K.' Marker */}
        <div className="absolute top-4 right-7 font-serif font-bold text-[10pt] text-black">
          K.
        </div>

        {/* ================= HEADER SECTION ================= */}
        <div className="text-center pt-1 mb-3">
          <h1 className="text-2xl font-bold font-gothic tracking-widest text-black leading-tight">
            戸籍謄本
          </h1>
          <div className="mt-1 text-[9pt] font-bold text-black flex items-center justify-center gap-2">
            <span>番号.</span>
            <span className="font-mono text-[9.5pt] tracking-wide inline-block min-w-[160px] text-left">
              {renderCell('familyCardNumber', data.familyCardNumber, 'left', '3174052309120005')}
            </span>
          </div>
        </div>

        {/* ================= INFO ATAS (GRID 2 KOLOM RAPI DENGAN TITIK DUA) ================= */}
        <div className="grid grid-cols-2 gap-x-12 mb-3 text-[8.5pt] leading-snug px-1">
          {/* Kolom Kiri */}
          <div className="space-y-0.5">
            <div className="flex items-center">
              <span className="w-28 font-medium text-black shrink-0 tracking-wider">
                家長名
              </span>
              <span className="w-3 text-center">:</span>
              <div className="flex-1 font-medium text-left pl-1">
                {renderCell('headOfFamily', headOfFamilyDisplay, 'left')}
              </div>
            </div>

            <div className="flex items-center">
              <span className="w-28 font-medium text-black shrink-0 tracking-wider">
                住所
              </span>
              <span className="w-3 text-center">:</span>
              <div className="flex-1 text-left pl-1">
                {renderCell('address.street', toPureJapanese(data.address.street), 'left')}
              </div>
            </div>

            <div className="flex items-center">
              <span className="w-28 font-medium text-black shrink-0">
                隣組・民組番号
              </span>
              <span className="w-3 text-center">:</span>
              <div className="flex-1 text-left pl-1 font-mono">
                {renderCell('address.rtRw', data.address.rtRw, 'left')}
              </div>
            </div>

            <div className="flex items-center">
              <span className="w-28 font-medium text-black shrink-0 tracking-wider">
                村
              </span>
              <span className="w-3 text-center">:</span>
              <div className="flex-1 text-left pl-1">
                {renderCell('address.subDistrict', toPureJapanese(data.address.subDistrict), 'left')}
              </div>
            </div>
          </div>

          {/* Kolom Kanan */}
          <div className="space-y-0.5">
            <div className="flex items-center">
              <span className="w-20 font-medium text-black shrink-0 tracking-wider">
                郡
              </span>
              <span className="w-3 text-center">:</span>
              <div className="flex-1 text-left pl-1">
                {renderCell('address.district', toPureJapanese(data.address.district), 'left')}
              </div>
            </div>

            <div className="flex items-center">
              <span className="w-20 font-medium text-black shrink-0 tracking-wider">
                市
              </span>
              <span className="w-3 text-center">:</span>
              <div className="flex-1 text-left pl-1">
                {renderCell('address.regencyCity', toPureJapanese(data.address.regencyCity), 'left')}
              </div>
            </div>

            <div className="flex items-center">
              <span className="w-20 font-medium text-black shrink-0 tracking-wider">
                郵便番号
              </span>
              <span className="w-3 text-center">:</span>
              <div className="flex-1 text-left pl-1 font-mono">
                {renderCell('address.postalCode', data.address.postalCode, 'left')}
              </div>
            </div>

            <div className="flex items-center">
              <span className="w-20 font-medium text-black shrink-0 tracking-wider">
                州
              </span>
              <span className="w-3 text-center">:</span>
              <div className="flex-1 text-left pl-1">
                {renderCell('address.province', toPureJapanese(data.address.province), 'left')}
              </div>
            </div>
          </div>
        </div>

        {/* ================= TABEL 1 (ATAS) ================= */}
        <div className="mb-1.5">
          <table className="kk-table">
            <thead>
              <tr>
                <th style={{ width: '3.5%' }}>番</th>
                <th style={{ width: '23.5%' }}>姓名</th>
                <th style={{ width: '13.5%' }}>人口登録番号</th>
                <th style={{ width: '5.5%' }}>性別</th>
                <th style={{ width: '11%' }}>出身地</th>
                <th style={{ width: '11%' }}>生年月日</th>
                <th style={{ width: '8%' }}>宗教</th>
                <th style={{ width: '12%' }}>学歴</th>
                <th style={{ width: '12%' }}>職業</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((member, index) => {
                const rowNo = index + 1;
                const japaneseName = member
                  ? toPureJapanese(member.fullNameKatakana || member.fullNameOriginal)
                  : '-';

                return (
                  <tr key={`t1-row-${rowNo}`} className="h-[20px]">
                    <td className="font-bold text-center font-mono">{rowNo}</td>
                    <td className="text-left px-1 font-medium">
                      {member ? renderCell(`members.${index}.fullNameKatakana`, japaneseName, 'left') : '-'}
                    </td>
                    <td className="font-mono text-center tracking-tighter">
                      {member ? renderCell(`members.${index}.nik`, member.nik, 'center') : '-'}
                    </td>
                    <td className="text-center font-bold">
                      {member ? renderCell(`members.${index}.gender`, member.gender, 'center') : '-'}
                    </td>
                    <td className="text-left px-1">
                      {member ? renderCell(`members.${index}.birthPlace`, toPureJapanese(member.birthPlace), 'left') : '-'}
                    </td>
                    <td className="text-center font-mono whitespace-nowrap">
                      {member ? renderCell(`members.${index}.birthDate`, member.birthDate, 'center') : '-'}
                    </td>
                    <td className="text-center">
                      {member ? renderCell(`members.${index}.religion`, toPureJapanese(member.religion), 'center') : '-'}
                    </td>
                    <td className="text-left text-[8pt] px-1">
                      {member ? renderCell(`members.${index}.education`, toPureJapanese(member.education), 'left') : '-'}
                    </td>
                    <td className="text-left text-[8pt] px-1">
                      {member ? renderCell(`members.${index}.occupation`, toPureJapanese(member.occupation), 'left') : '-'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* ================= TABEL 2 (BAWAH) ================= */}
        <div className="mb-3">
          <table className="kk-table">
            <thead>
              {/* Header Baris 1 */}
              <tr>
                <th style={{ width: '3.5%' }} rowSpan={2}>番</th>
                <th style={{ width: '10%' }} rowSpan={2}>現状</th>
                <th style={{ width: '13%' }} rowSpan={2}>家族関係</th>
                <th style={{ width: '9.5%' }} rowSpan={2}>国籍</th>
                <th style={{ width: '32%' }} colSpan={2}>入国文書</th>
                <th style={{ width: '32%' }} colSpan={2}>両親の名</th>
              </tr>
              {/* Header Baris 2 */}
              <tr>
                <th style={{ width: '16%' }}>パスポート番号</th>
                <th style={{ width: '16%' }}>在留資格認定書番号</th>
                <th style={{ width: '16%' }}>父</th>
                <th style={{ width: '16%' }}>母</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((member, index) => {
                const rowNo = index + 1;
                return (
                  <tr key={`t2-row-${rowNo}`} className="h-[20px]">
                    <td className="font-bold text-center font-mono">{rowNo}</td>
                    <td className="text-center font-medium">
                      {member ? renderCell(`members.${index}.maritalStatus`, toPureJapanese(member.maritalStatus), 'center') : '-'}
                    </td>
                    <td className="text-center font-medium text-black">
                      {member ? renderCell(`members.${index}.relationStatus`, toPureJapanese(member.relationStatus), 'center') : '-'}
                    </td>
                    <td className="text-center">
                      {member ? 'インドネシア' : '-'}
                    </td>
                    <td className="text-center font-mono">
                      {member ? renderCell(`members.${index}.passportNumber`, member.passportNumber || '-', 'center') : '-'}
                    </td>
                    <td className="text-center font-mono">
                      {member ? renderCell(`members.${index}.stayPermitNumber`, member.stayPermitNumber || '-', 'center') : '-'}
                    </td>
                    <td className="text-left text-[8pt] px-1">
                      {member ? renderCell(`members.${index}.fatherName`, toPureJapanese(member.fatherName), 'left') : '-'}
                    </td>
                    <td className="text-left text-[8pt] px-1">
                      {member ? renderCell(`members.${index}.motherName`, toPureJapanese(member.motherName), 'left') : '-'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* ================= FOOTER SECTION (PERSIS SESUAI SCREENSHOT - FULL JAPANESE) ================= */}
        <div className="grid grid-cols-12 gap-2 text-[8.5pt] leading-tight items-start pt-1">
          {/* Kolom Kiri: Tanggal Terbit & Daftar 4 Salinan Resmi */}
          <div className="col-span-4 space-y-0.5">
            <div className="flex items-center">
              <span className="w-14 font-medium text-black shrink-0">発行日</span>
              <span className="w-3 text-center">:</span>
              <div className="pl-1 text-black font-sans">
                {data.issuedDate ? (
                  renderCell('issuedDate', data.issuedDate, 'left')
                ) : (
                  <span>(Tahun)&nbsp;&nbsp;&nbsp;&nbsp;(Bulan)&nbsp;&nbsp;&nbsp;&nbsp;(Tanggal)</span>
                )}
              </div>
            </div>

            <div className="flex items-center">
              <span className="w-14 font-medium text-black shrink-0">第1枚目</span>
              <span className="w-3 text-center">:</span>
              <span className="pl-1 font-medium text-black">家長用</span>
            </div>

            <div className="flex items-center">
              <span className="w-14 font-medium text-black shrink-0">第2枚目</span>
              <span className="w-3 text-center">:</span>
              <span className="pl-1 font-medium text-black">隣組長用</span>
            </div>

            <div className="flex items-center">
              <span className="w-14 font-medium text-black shrink-0">第3枚目</span>
              <span className="w-3 text-center">:</span>
              <span className="pl-1 font-medium text-black">村長用</span>
            </div>

            <div className="flex items-center">
              <span className="w-14 font-medium text-black shrink-0">第4枚目</span>
              <span className="w-3 text-center">:</span>
              <span className="pl-1 font-medium text-black">郡長用</span>
            </div>
          </div>

          {/* Kolom Tengah: Tanda Tangan Kepala Keluarga */}
          <div className="col-span-4 text-center px-4 flex flex-col justify-between h-full pt-1">
            <div className="font-bold text-black text-[9pt]">家長</div>
            <div className="text-[8pt] text-black mt-2">（署名）</div>
            <div className="mt-6 border-b border-black w-44 mx-auto"></div>
            <div className="text-[8pt] text-black mt-0.5">指印又は署名</div>
          </div>

          {/* Kolom Kanan: 民事登録事務官, Tanda Tangan & NIP */}
          <div className="col-span-4 text-center px-2 flex flex-col justify-between h-full pt-1">
            <div className="font-bold text-black text-[9pt]">民事登録事務官</div>
            <div className="text-[8pt] text-black mt-2">（署名）（公印）</div>
            <div className="mt-6 flex items-center justify-center gap-1">
              <span className="text-[8pt] font-medium text-black shrink-0">公務員番号</span>
              <div className="border-b border-black w-40 inline-block text-left font-mono pl-1 text-[8pt]">
                {renderCell('signatoryNip', data.signatoryNip || '', 'left', '')}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
