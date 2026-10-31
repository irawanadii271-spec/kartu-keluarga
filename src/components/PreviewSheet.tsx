import React, { useState } from 'react';
import { TranslationResult, FamilyMember } from '../types';

interface PreviewSheetProps {
  data: TranslationResult;
  onUpdateData: (newData: TranslationResult) => void;
  showColumnIndices?: boolean;
}

// Clean any accidental Latin annotations in parentheses e.g. "(WNI)" or "(Kota)"
function toPureJapanese(val: string | undefined): string {
  if (!val) return '';
  const trimmed = String(val).trim();

  // If there's Japanese inside parentheses like "BUDI (ブディ)", extract the Japanese part
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
  showColumnIndices = true,
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

  // Helper renderer for inline editable cells (No SVGs to guarantee html2canvas compatibility)
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
        <div className="flex items-center gap-0.5 w-full min-w-[30px] no-print">
          <input
            type="text"
            className="w-full rounded px-1 py-0 text-[8pt] font-sans focus:outline-none"
            style={{
              backgroundColor: '#fffbeb',
              border: '1px solid #2563eb',
              color: '#000000',
            }}
            value={inlineEditValue}
            autoFocus
            onChange={(e) => setInlineEditValue(e.target.value)}
            onKeyDown={(e) => handleKeyDown(e, cellKey)}
            onBlur={() => handleSaveEdit(cellKey)}
          />
          <button
            type="button"
            className="px-1 py-0 text-[9pt] font-bold"
            style={{ color: '#047857' }}
            onClick={() => handleSaveEdit(cellKey)}
            title="Simpan"
          >
            ✓
          </button>
        </div>
      );
    }

    return (
      <div
        onClick={() => handleStartEdit(cellKey, strVal)}
        className={`cursor-pointer hover:bg-amber-100/40 w-full h-[25px] flex items-center justify-${align === 'left' ? 'start' : align === 'right' ? 'end' : 'center'} text-${align}`}
        style={{
          overflow: 'visible',
          height: '25px',
          minHeight: '25px',
          padding: '0 3px',
          boxSizing: 'border-box',
        }}
        title="クリックして直接編集"
      >
        <span
          style={{
            color: '#000000',
            overflow: 'visible',
            display: 'inline-flex',
            alignItems: 'center',
            lineHeight: 1,
            whiteSpace: 'nowrap',
          }}
        >
          {strVal || <span style={{ color: '#000000', fontFamily: 'sans-serif' }}>{placeholder}</span>}
        </span>
      </div>
    );
  };

  // 10 data rows exactly matching the official template in the reference screenshot
  const rows = Array.from({ length: 10 }, (_, index) => {
    return data.members[index] || null;
  });

  // Pure Japanese Head of family representation
  const headOfFamilyDisplay = toPureJapanese(data.headOfFamily);

  return (
    <div className="w-full flex justify-center print-area-wrapper overflow-x-auto p-1 sm:p-2">
      {/* Exact Official Sheet matching user reference screenshot (Screenshot_2026-10-30_105000_37d43159.png) */}
      <div
        id="kk-preview-sheet"
        className="document-outer-frame font-gothic mx-auto w-[1040px] max-w-[1040px] p-5 sm:p-6 min-h-[735px] relative"
        style={{
          boxSizing: 'border-box',
          fontSize: '8.5pt',
          color: '#000000',
          backgroundColor: '#ffffff',
          borderColor: '#000000',
          fontFamily: '"MS PGothic", "MS Gothic", "Yu Gothic", "YuGothic", "Meiryo", "BIZ UDPGothic", sans-serif',
          overflow: 'visible',
        }}
      >
        {/* ================= HEADER: 戸籍謄本 & 番号. ================= */}
        <div className="text-center pt-1 mb-4" style={{ color: '#000000' }}>
          <h1
            className="text-[22pt] font-bold font-gothic tracking-[0.25em] leading-none mb-2"
            style={{ color: '#000000' }}
          >
            戸籍謄本
          </h1>
          <div
            className="text-[9.5pt] font-bold flex items-center justify-center gap-2"
            style={{ color: '#000000' }}
          >
            <span className="tracking-widest">番号.</span>
            <span className="font-mono text-[10pt] tracking-wide inline-block min-w-[200px] text-left">
              {renderCell('familyCardNumber', data.familyCardNumber, 'left', '3174052309120005')}
            </span>
          </div>
        </div>

        {/* ================= METADATA SECTION: 2-COLUMN ================= */}
        <div
          className="grid grid-cols-2 gap-x-12 mb-3.5 text-[8.5pt] leading-tight px-1"
          style={{ color: '#000000' }}
        >
          {/* Kolom Kiri: 家長名, 住所, 隣組・民組番号, 村 */}
          <div className="space-y-1">
            <div className="flex items-center">
              <span className="w-28 font-medium shrink-0 tracking-wider" style={{ color: '#000000' }}>
                家長名
              </span>
              <span className="w-4 text-center font-bold" style={{ color: '#000000' }}>:</span>
              <div className="flex-1 font-medium text-left pl-1">
                {renderCell('headOfFamily', headOfFamilyDisplay, 'left')}
              </div>
            </div>

            <div className="flex items-center">
              <span className="w-28 font-medium shrink-0 tracking-wider" style={{ color: '#000000' }}>
                住所
              </span>
              <span className="w-4 text-center font-bold" style={{ color: '#000000' }}>:</span>
              <div className="flex-1 text-left pl-1">
                {renderCell('address.street', toPureJapanese(data.address.street), 'left')}
              </div>
            </div>

            <div className="flex items-center">
              <span className="w-28 font-medium shrink-0 tracking-tight" style={{ color: '#000000' }}>
                隣組・民組番号
              </span>
              <span className="w-4 text-center font-bold" style={{ color: '#000000' }}>:</span>
              <div className="flex-1 text-left pl-1 font-mono">
                {renderCell('address.rtRw', data.address.rtRw, 'left')}
              </div>
            </div>

            <div className="flex items-center">
              <span className="w-28 font-medium shrink-0 tracking-wider" style={{ color: '#000000' }}>
                村
              </span>
              <span className="w-4 text-center font-bold" style={{ color: '#000000' }}>:</span>
              <div className="flex-1 text-left pl-1">
                {renderCell('address.subDistrict', toPureJapanese(data.address.subDistrict), 'left')}
              </div>
            </div>
          </div>

          {/* Kolom Kanan: 郡, 市, 郵便番号, 州 */}
          <div className="space-y-1">
            <div className="flex items-center">
              <span className="w-24 font-medium shrink-0 tracking-wider" style={{ color: '#000000' }}>
                郡
              </span>
              <span className="w-4 text-center font-bold" style={{ color: '#000000' }}>:</span>
              <div className="flex-1 text-left pl-1">
                {renderCell('address.district', toPureJapanese(data.address.district), 'left')}
              </div>
            </div>

            <div className="flex items-center">
              <span className="w-24 font-medium shrink-0 tracking-wider" style={{ color: '#000000' }}>
                市
              </span>
              <span className="w-4 text-center font-bold" style={{ color: '#000000' }}>:</span>
              <div className="flex-1 text-left pl-1">
                {renderCell('address.regencyCity', toPureJapanese(data.address.regencyCity), 'left')}
              </div>
            </div>

            <div className="flex items-center">
              <span className="w-24 font-medium shrink-0 tracking-wider" style={{ color: '#000000' }}>
                郵便番号
              </span>
              <span className="w-4 text-center font-bold" style={{ color: '#000000' }}>:</span>
              <div className="flex-1 text-left pl-1 font-mono">
                {renderCell('address.postalCode', data.address.postalCode, 'left')}
              </div>
            </div>

            <div className="flex items-center">
              <span className="w-24 font-medium shrink-0 tracking-wider" style={{ color: '#000000' }}>
                州
              </span>
              <span className="w-4 text-center font-bold" style={{ color: '#000000' }}>:</span>
              <div className="flex-1 text-left pl-1">
                {renderCell('address.province', toPureJapanese(data.address.province), 'left')}
              </div>
            </div>
          </div>
        </div>

        {/* ================= TABEL 1 (ATAS: IDENTITAS ANGGOTA) ================= */}
        <div className="mb-2">
          <table className="kk-table">
            <thead>
              {/* Header Baris 1: Nama Kolom Resmi */}
              <tr>
                <th style={{ width: '3.5%' }} rowSpan={showColumnIndices ? 2 : 1}>番</th>
                <th style={{ width: '21%' }}>姓名</th>
                <th style={{ width: '14.5%' }}>人口登録番号</th>
                <th style={{ width: '5.5%' }}>性別</th>
                <th style={{ width: '11%' }}>出身地</th>
                <th style={{ width: '11%' }}>生年月日</th>
                <th style={{ width: '8.5%' }}>宗教</th>
                <th style={{ width: '12.5%' }}>学歴</th>
                <th style={{ width: '12.5%' }}>職業</th>
              </tr>
              {/* Header Baris 2: Nomor Indeks (1) s/d (8) */}
              {showColumnIndices && (
                <tr className="header-indices-row text-[8pt] font-normal" style={{ color: '#000000' }}>
                  <th>(1)</th>
                  <th>(2)</th>
                  <th>(3)</th>
                  <th>(4)</th>
                  <th>(5)</th>
                  <th>(6)</th>
                  <th>(7)</th>
                  <th>(8)</th>
                </tr>
              )}
            </thead>
            <tbody>
              {rows.map((member, index) => {
                const rowNo = index + 1;
                const japaneseName = member
                  ? toPureJapanese(member.fullNameKatakana || member.fullNameOriginal)
                  : '-';

                return (
                  <tr key={`t1-row-${rowNo}`} className="h-[25px]" style={{ height: '25px', overflow: 'visible' }}>
                    <td className="font-bold text-center font-mono" style={{ height: '25px', verticalAlign: 'middle', padding: '0 2px' }}>
                      <div className="w-full h-[25px] flex items-center justify-center font-mono font-bold">{rowNo}</div>
                    </td>
                    <td className="text-left px-1 font-medium">
                      {member ? renderCell(`members.${index}.fullNameKatakana`, japaneseName, 'left') : '-'}
                    </td>
                    <td className="font-mono text-center tracking-tight">
                      {member ? renderCell(`members.${index}.nik`, member.nik, 'center') : '-'}
                    </td>
                    <td className="text-center font-medium">
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

        {/* ================= TABEL 2 (BAWAH: STATUS, PASPOR & ORANG TUA) ================= */}
        <div className="mb-4">
          <table className="kk-table">
            <thead>
              {/* Header Baris 1: Kolom Utama & Pengelompokan */}
              <tr>
                <th style={{ width: '3.5%' }} rowSpan={showColumnIndices ? 3 : 2}>番</th>
                <th style={{ width: '10.5%' }} rowSpan={showColumnIndices ? 2 : 2}>現状</th>
                <th style={{ width: '12%' }} rowSpan={showColumnIndices ? 2 : 2}>家族関係</th>
                <th style={{ width: '10%' }} rowSpan={showColumnIndices ? 2 : 2}>国籍</th>
                <th style={{ width: '32%' }} colSpan={2}>入国文書</th>
                <th style={{ width: '32%' }} colSpan={2}>両親の名</th>
              </tr>
              {/* Header Baris 2: Sub-kolom 入国文書 & 両親の名 */}
              <tr>
                <th style={{ width: '16%' }}>パスポート番号</th>
                <th style={{ width: '16%' }}>在留資格認定書番号</th>
                <th style={{ width: '16%' }}>父</th>
                <th style={{ width: '16%' }}>母</th>
              </tr>
              {/* Header Baris 3: Nomor Indeks (9) s/d (15) */}
              {showColumnIndices && (
                <tr className="header-indices-row text-[8pt] font-normal" style={{ color: '#000000' }}>
                  <th>(9)</th>
                  <th>(10)</th>
                  <th>(11)</th>
                  <th>(12)</th>
                  <th>(13)</th>
                  <th>(14)</th>
                  <th>(15)</th>
                </tr>
              )}
            </thead>
            <tbody>
              {rows.map((member, index) => {
                const rowNo = index + 1;
                return (
                  <tr key={`t2-row-${rowNo}`} className="h-[25px]" style={{ height: '25px', overflow: 'visible' }}>
                    <td className="font-bold text-center font-mono" style={{ height: '25px', verticalAlign: 'middle', padding: '0 2px' }}>
                      <div className="w-full h-[25px] flex items-center justify-center font-mono font-bold">{rowNo}</div>
                    </td>
                    <td className="text-center font-medium">
                      {member ? renderCell(`members.${index}.maritalStatus`, toPureJapanese(member.maritalStatus), 'center') : '-'}
                    </td>
                    <td className="text-center font-medium">
                      {member ? renderCell(`members.${index}.relationStatus`, toPureJapanese(member.relationStatus), 'center') : '-'}
                    </td>
                    <td className="text-center" style={{ height: '25px', verticalAlign: 'middle', padding: '0 2px' }}>
                      <div className="w-full h-[25px] flex items-center justify-center">{member ? 'インドネシア' : '-'}</div>
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

        {/* ================= FOOTER SECTION ================= */}
        <div
          className="grid grid-cols-12 gap-3 text-[8.5pt] leading-tight items-start pt-1"
          style={{ color: '#000000' }}
        >
          {/* Kolom Kiri: 発行日 & 4 Lembar Resmi */}
          <div className="col-span-4 space-y-1">
            <div className="flex items-center">
              <span className="w-16 font-medium shrink-0 tracking-wider" style={{ color: '#000000' }}>
                発行日
              </span>
              <span className="w-3 text-center font-bold" style={{ color: '#000000' }}>:</span>
              <div className="pl-1 font-sans" style={{ color: '#000000' }}>
                {data.issuedDate ? (
                  renderCell('issuedDate', data.issuedDate, 'left')
                ) : (
                  <span>(Tahun)&nbsp;&nbsp;&nbsp;&nbsp;(Bulan)&nbsp;&nbsp;&nbsp;&nbsp;(Tanggal)</span>
                )}
              </div>
            </div>

            <div className="flex items-center">
              <span className="w-16 font-medium shrink-0 tracking-wide" style={{ color: '#000000' }}>
                第1枚目
              </span>
              <span className="w-3 text-center font-bold" style={{ color: '#000000' }}>:</span>
              <span className="pl-1 font-medium" style={{ color: '#000000' }}>家長用</span>
            </div>

            <div className="flex items-center">
              <span className="w-16 font-medium shrink-0 tracking-wide" style={{ color: '#000000' }}>
                第2枚目
              </span>
              <span className="w-3 text-center font-bold" style={{ color: '#000000' }}>:</span>
              <span className="pl-1 font-medium" style={{ color: '#000000' }}>隣組長用</span>
            </div>

            <div className="flex items-center">
              <span className="w-16 font-medium shrink-0 tracking-wide" style={{ color: '#000000' }}>
                第3枚目
              </span>
              <span className="w-3 text-center font-bold" style={{ color: '#000000' }}>:</span>
              <span className="pl-1 font-medium" style={{ color: '#000000' }}>村長用</span>
            </div>

            <div className="flex items-center">
              <span className="w-16 font-medium shrink-0 tracking-wide" style={{ color: '#000000' }}>
                第4枚目
              </span>
              <span className="w-3 text-center font-bold" style={{ color: '#000000' }}>:</span>
              <span className="pl-1 font-medium" style={{ color: '#000000' }}>郡長用</span>
            </div>
          </div>

          {/* Kolom Tengah: 家長, （署名）, Garis, 指印又は署名 */}
          <div className="col-span-4 text-center px-4 flex flex-col justify-between h-[100px]">
            <div>
              <div className="font-bold text-[9.5pt] tracking-wider" style={{ color: '#000000' }}>
                家長
              </div>
              <div className="text-[8pt] mt-1" style={{ color: '#000000' }}>（署名）</div>
            </div>
            <div>
              <div className="border-b w-48 mx-auto mb-1" style={{ borderColor: '#000000' }}></div>
              <div className="text-[8pt] tracking-wide" style={{ color: '#000000' }}>指印又は署名</div>
            </div>
          </div>

          {/* Kolom Kanan: 民事登録事務官, （署名）（公印）, Garis & NIP, 公務員番号 */}
          <div className="col-span-4 text-center px-4 flex flex-col justify-between h-[100px]">
            <div>
              <div className="font-bold text-[9.5pt] tracking-wider" style={{ color: '#000000' }}>
                民事登録事務官
              </div>
              <div className="text-[8pt] mt-1" style={{ color: '#000000' }}>（署名）（公印）</div>
            </div>
            <div>
              <div className="font-mono text-[8pt] h-4 flex items-center justify-center" style={{ color: '#000000' }}>
                {data.signatoryNip ? (
                  <span>{data.signatoryNip}</span>
                ) : (
                  <span className="opacity-0">-</span>
                )}
              </div>
              <div className="border-b w-48 mx-auto mb-1" style={{ borderColor: '#000000' }}></div>
              <div className="text-[8pt] tracking-wide" style={{ color: '#000000' }}>公務員番号</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
