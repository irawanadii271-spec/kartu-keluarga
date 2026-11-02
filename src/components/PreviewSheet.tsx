import React, { useState } from 'react';
import { TranslationResult, FamilyMember, VOCABULARY } from '../types';

interface PreviewSheetProps {
  data: TranslationResult;
  onUpdateData: (newData: TranslationResult) => void;
  showColumnIndices?: boolean;
}

// Clean any accidental Latin annotations in parentheses and translate Indonesian terminology to Japanese
function translateToJapanese(val: string | undefined, category?: keyof typeof VOCABULARY): string {
  if (!val) return '';
  const trimmed = String(val).trim();

  // If there's Japanese inside parentheses like "BUDI (ブディ)", extract the Japanese part
  const matchJp = trimmed.match(/\(([\u30A0-\u30FF\u3040-\u309F\u4E00-\u9FAF・\s]+)\)/);
  if (matchJp && matchJp[1]) {
    return matchJp[1].trim();
  }

  // Look up in specified VOCABULARY category
  if (category && VOCABULARY[category]) {
    const dict = VOCABULARY[category] as Record<string, string>;
    for (const [k, v] of Object.entries(dict)) {
      if (k.toLowerCase() === trimmed.toLowerCase()) {
        return v;
      }
    }
  }

  // Search in all categories of VOCABULARY (e.g. relationStatus, maritalStatus, religion, education, occupation)
  for (const dict of Object.values(VOCABULARY)) {
    for (const [k, v] of Object.entries(dict as Record<string, string>)) {
      if (k.toLowerCase() === trimmed.toLowerCase()) {
        return String(v);
      }
    }
  }

  // Remove any remaining Latin parenthesized info like "(WNI)", "(Kelurahan)", "(Kota Jakarta)"
  return trimmed.replace(/\s*\([a-zA-Z\s.,/0-9-]+\)/g, '').trim();
}

// Backward-compatible alias
function toPureJapanese(val: string | undefined): string {
  return translateToJapanese(val);
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
    setInlineEditValue(currentValue && currentValue !== '-' ? currentValue : '');
  };

  const handleSaveEdit = (cellKey: string) => {
    const parts = cellKey.split('.');
    if (parts[0] === 'members' && parts.length >= 3) {
      const memberIndex = parseInt(parts[1], 10);
      const field = parts[2] as keyof FamilyMember;
      const updatedMembers = [...data.members];

      // Auto-pad members array up to memberIndex so any row (1..10) can be directly edited and saved
      while (updatedMembers.length <= memberIndex) {
        const nextNo = updatedMembers.length + 1;
        updatedMembers.push({
          no: nextNo,
          fullNameOriginal: '',
          fullNameKatakana: '',
          nik: '',
          gender: '男',
          birthPlace: '',
          birthDate: '',
          religion: 'イスラム教',
          education: '高校卒業',
          occupation: '会社員',
          maritalStatus: '未婚',
          relationStatus: '子',
          fatherName: '',
          motherName: '',
          passportNumber: '-',
          stayPermitNumber: '-',
          nationality: 'インドネシア',
        });
      }

      updatedMembers[memberIndex] = {
        ...updatedMembers[memberIndex],
        [field]: inlineEditValue,
      };
      onUpdateData({ ...data, members: updatedMembers });
    } else if (parts[0] === 'address' && parts.length === 2) {
      const addrField = parts[1] as keyof typeof data.address;
      onUpdateData({
        ...data,
        address: {
          ...data.address,
          [addrField]: inlineEditValue,
        },
      });
    } else {
      // Direct root fields: signatoryOfficer, signatoryNip, headOfFamily, familyCardNumber, issuedDate, issuedPlace
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
    placeholder = '-',
    customStyle?: {
      fontSize?: string;
      fontFamily?: string;
      fontWeight?: number | string;
      letterSpacing?: string;
      paddingLeft?: string;
      paddingRight?: string;
    }
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
              fontFamily: customStyle?.fontFamily || 'inherit',
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
        className="cursor-pointer hover:bg-amber-100/40 w-full"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: align === 'left' ? 'flex-start' : align === 'right' ? 'flex-end' : 'center',
          width: '100%',
          height: '100%',
          minHeight: '26px',
          textAlign: align,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          paddingLeft: customStyle?.paddingLeft || (align === 'left' ? '6px' : '2px'),
          paddingRight: customStyle?.paddingRight || (align === 'right' ? '6px' : '2px'),
          boxSizing: 'border-box',
        }}
        title="クリックして直接編集"
      >
        <span
          style={{
            color: '#000000',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: 'inline-block',
            lineHeight: '1.2',
            whiteSpace: 'nowrap',
            fontSize: customStyle?.fontSize || '8.2pt',
            fontFamily: customStyle?.fontFamily || 'inherit',
            fontWeight: customStyle?.fontWeight || 400,
            letterSpacing: customStyle?.letterSpacing || 'normal',
            maxWidth: '100%',
          }}
        >
          {strVal || (
            <span
              style={{
                color: '#000000',
                fontFamily: customStyle?.fontFamily || 'Arial, Calibri, sans-serif',
                fontWeight: 400,
              }}
            >
              {placeholder}
            </span>
          )}
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
        <div className="text-center pt-0 mb-3" style={{ color: '#000000' }}>
          <h1
            className="tracking-[0.25em] text-center mb-1"
            style={{
              color: '#000000',
              fontSize: '15.5pt',
              fontWeight: 700,
              lineHeight: 1.2,
              fontFamily: '"Yu Gothic", "Meiryo", "MS Gothic", "MS PGothic", "Noto Sans JP", sans-serif',
            }}
          >
            戸籍謄本
          </h1>
          <div
            className="flex items-center justify-center gap-1.5"
            style={{ color: '#000000', fontSize: '9pt' }}
          >
            <span style={{ fontWeight: 600, letterSpacing: '0.15em' }}>番号.</span>
            <span
              className="inline-block text-left"
              style={{
                fontFamily: 'Arial, Calibri, -apple-system, sans-serif',
                fontSize: '9.5pt',
                fontWeight: 500,
                minWidth: '180px',
              }}
            >
              {renderCell('familyCardNumber', data.familyCardNumber, 'left', '3174052309120005', {
                fontSize: '9.5pt',
                fontFamily: 'Arial, Calibri, -apple-system, sans-serif',
                fontWeight: 500,
                paddingLeft: '2px',
              })}
            </span>
          </div>
        </div>

        {/* ================= METADATA SECTION: 2-COLUMN ================= */}
        <div
          className="grid grid-cols-2 gap-x-12 mb-3 text-[8.5pt] leading-tight px-1"
          style={{ color: '#000000' }}
        >
          {/* Kolom Kiri: 家長名, 住所, 隣組・民組番号, 村 */}
          <div className="space-y-1">
            <div className="flex items-center">
              <span className="w-28 shrink-0 tracking-wider" style={{ color: '#000000', fontWeight: 600 }}>
                家長名
              </span>
              <span className="w-4 text-center font-bold" style={{ color: '#000000' }}>:</span>
              <div className="flex-1 text-left pl-1">
                {renderCell('headOfFamily', headOfFamilyDisplay, 'left', '-', { fontWeight: 400 })}
              </div>
            </div>

            <div className="flex items-center">
              <span className="w-28 shrink-0 tracking-wider" style={{ color: '#000000', fontWeight: 600 }}>
                住所
              </span>
              <span className="w-4 text-center font-bold" style={{ color: '#000000' }}>:</span>
              <div className="flex-1 text-left pl-1">
                {renderCell('address.street', toPureJapanese(data.address.street), 'left', '-', { fontWeight: 400 })}
              </div>
            </div>

            <div className="flex items-center">
              <span className="w-28 shrink-0 tracking-tight" style={{ color: '#000000', fontWeight: 600 }}>
                隣組・民組番号
              </span>
              <span className="w-4 text-center font-bold" style={{ color: '#000000' }}>:</span>
              <div className="flex-1 text-left pl-1">
                {renderCell('address.rtRw', data.address.rtRw, 'left', '-', {
                  fontFamily: 'Arial, Calibri, -apple-system, sans-serif',
                  fontWeight: 400,
                })}
              </div>
            </div>

            <div className="flex items-center">
              <span className="w-28 shrink-0 tracking-wider" style={{ color: '#000000', fontWeight: 600 }}>
                村
              </span>
              <span className="w-4 text-center font-bold" style={{ color: '#000000' }}>:</span>
              <div className="flex-1 text-left pl-1">
                {renderCell('address.subDistrict', toPureJapanese(data.address.subDistrict), 'left', '-', { fontWeight: 400 })}
              </div>
            </div>
          </div>

          {/* Kolom Kanan: 郡, 市, 郵便番号, 州 */}
          <div className="space-y-1">
            <div className="flex items-center">
              <span className="w-24 shrink-0 tracking-wider" style={{ color: '#000000', fontWeight: 600 }}>
                郡
              </span>
              <span className="w-4 text-center font-bold" style={{ color: '#000000' }}>:</span>
              <div className="flex-1 text-left pl-1">
                {renderCell('address.district', toPureJapanese(data.address.district), 'left', '-', { fontWeight: 400 })}
              </div>
            </div>

            <div className="flex items-center">
              <span className="w-24 shrink-0 tracking-wider" style={{ color: '#000000', fontWeight: 600 }}>
                市
              </span>
              <span className="w-4 text-center font-bold" style={{ color: '#000000' }}>:</span>
              <div className="flex-1 text-left pl-1">
                {renderCell('address.regencyCity', toPureJapanese(data.address.regencyCity), 'left', '-', { fontWeight: 400 })}
              </div>
            </div>

            <div className="flex items-center">
              <span className="w-24 shrink-0 tracking-wider" style={{ color: '#000000', fontWeight: 600 }}>
                郵便番号
              </span>
              <span className="w-4 text-center font-bold" style={{ color: '#000000' }}>:</span>
              <div className="flex-1 text-left pl-1">
                {renderCell('address.postalCode', data.address.postalCode, 'left', '-', {
                  fontFamily: 'Arial, Calibri, -apple-system, sans-serif',
                  fontWeight: 400,
                })}
              </div>
            </div>

            <div className="flex items-center">
              <span className="w-24 shrink-0 tracking-wider" style={{ color: '#000000', fontWeight: 600 }}>
                州
              </span>
              <span className="w-4 text-center font-bold" style={{ color: '#000000' }}>:</span>
              <div className="flex-1 text-left pl-1">
                {renderCell('address.province', toPureJapanese(data.address.province), 'left', '-', { fontWeight: 400 })}
              </div>
            </div>
          </div>
        </div>

        {/* ================= TABEL 1 (ATAS: IDENTITAS ANGGOTA) ================= */}
        <div className="mb-2">
          <table className="kk-table">
            <thead>
              {/* Header Baris 1: Nama Kolom Resmi (Bold 700, 8.5pt) */}
              <tr style={{ height: '26px' }}>
                <th style={{ width: '3.5%', fontSize: '8.5pt', fontWeight: 700 }} rowSpan={showColumnIndices ? 2 : 1}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: '26px' }}>番</div>
                </th>
                <th style={{ width: '21%', fontSize: '8.5pt', fontWeight: 700 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: '26px' }}>姓名</div>
                </th>
                <th style={{ width: '15%', fontSize: '8.5pt', fontWeight: 700 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: '26px' }}>人口登録番号</div>
                </th>
                <th style={{ width: '5.5%', fontSize: '8.5pt', fontWeight: 700 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: '26px' }}>性別</div>
                </th>
                <th style={{ width: '11%', fontSize: '8.5pt', fontWeight: 700 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: '26px' }}>出身地</div>
                </th>
                <th style={{ width: '11%', fontSize: '8.5pt', fontWeight: 700 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: '26px' }}>生年月日</div>
                </th>
                <th style={{ width: '8%', fontSize: '8.5pt', fontWeight: 700 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: '26px' }}>宗教</div>
                </th>
                <th style={{ width: '12.5%', fontSize: '8.5pt', fontWeight: 700 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: '26px' }}>学歴</div>
                </th>
                <th style={{ width: '12.5%', fontSize: '8.5pt', fontWeight: 700 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: '26px' }}>職業</div>
                </th>
              </tr>
              {/* Header Baris 2: Nomor Indeks (1) s/d (8) (Regular 400, 7.5pt) */}
              {showColumnIndices && (
                <tr className="header-indices-row font-normal" style={{ color: '#000000', height: '18px', fontWeight: 400 }}>
                  <th style={{ height: '18px', verticalAlign: 'middle', padding: '0 2px', fontSize: '7.5pt', fontWeight: 400 }}><div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>(1)</div></th>
                  <th style={{ height: '18px', verticalAlign: 'middle', padding: '0 2px', fontSize: '7.5pt', fontWeight: 400 }}><div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>(2)</div></th>
                  <th style={{ height: '18px', verticalAlign: 'middle', padding: '0 2px', fontSize: '7.5pt', fontWeight: 400 }}><div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>(3)</div></th>
                  <th style={{ height: '18px', verticalAlign: 'middle', padding: '0 2px', fontSize: '7.5pt', fontWeight: 400 }}><div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>(4)</div></th>
                  <th style={{ height: '18px', verticalAlign: 'middle', padding: '0 2px', fontSize: '7.5pt', fontWeight: 400 }}><div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>(5)</div></th>
                  <th style={{ height: '18px', verticalAlign: 'middle', padding: '0 2px', fontSize: '7.5pt', fontWeight: 400 }}><div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>(6)</div></th>
                  <th style={{ height: '18px', verticalAlign: 'middle', padding: '0 2px', fontSize: '7.5pt', fontWeight: 400 }}><div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>(7)</div></th>
                  <th style={{ height: '18px', verticalAlign: 'middle', padding: '0 2px', fontSize: '7.5pt', fontWeight: 400 }}><div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>(8)</div></th>
                </tr>
              )}
            </thead>
            <tbody>
              {rows.map((member, index) => {
                const rowNo = index + 1;
                const japaneseName = member
                  ? toPureJapanese(member.fullNameKatakana || member.fullNameOriginal)
                  : '-';

                // Adaptive font-size and spacing for long Indonesian names (3-4 words)
                const nameLength = japaneseName.length;
                const nameFontSize = nameLength > 18 ? '7.2pt' : nameLength > 14 ? '7.8pt' : '8.2pt';
                const nameLetterSpacing = nameLength > 18 ? '-0.03em' : nameLength > 14 ? '-0.015em' : 'normal';

                return (
                  <tr key={`t1-row-${rowNo}`} className="h-[26px]" style={{ height: '26px', overflow: 'visible' }}>
                    <td className="text-center" style={{ width: '3.5%', height: '26px', verticalAlign: 'middle', padding: '0 2px', fontWeight: 400 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: '26px' }}>
                        <span style={{ display: 'inline-block', lineHeight: '1.2', fontFamily: 'Arial, Calibri, -apple-system, sans-serif', fontSize: '8pt', fontWeight: 400 }}>{rowNo}</span>
                      </div>
                    </td>
                    <td className="text-left" style={{ width: '21%', height: '26px', verticalAlign: 'middle', fontWeight: 400 }}>
                      {member
                        ? renderCell(`members.${index}.fullNameKatakana`, japaneseName, 'left', '-', {
                            fontSize: nameFontSize,
                            letterSpacing: nameLetterSpacing,
                            fontWeight: 400,
                            paddingLeft: '5px',
                            paddingRight: '3px',
                          })
                        : renderCell(`members.${index}.fullNameKatakana`, '-', 'center', '-', { fontWeight: 400 })}
                    </td>
                    <td className="text-center" style={{ width: '15%', height: '26px', verticalAlign: 'middle', fontWeight: 400 }}>
                      {member
                        ? renderCell(`members.${index}.nik`, member.nik, 'center', '-', {
                            fontSize: '7.8pt',
                            fontFamily: 'Arial, Calibri, -apple-system, sans-serif',
                            fontWeight: 400,
                            paddingLeft: '3px',
                            paddingRight: '3px',
                          })
                        : renderCell(`members.${index}.nik`, '-', 'center', '-', { fontWeight: 400 })}
                    </td>
                    <td className="text-center" style={{ width: '5.5%', height: '26px', verticalAlign: 'middle', fontWeight: 400 }}>
                      {member
                        ? renderCell(`members.${index}.gender`, member.gender, 'center', '-', { fontSize: '8.2pt', fontWeight: 400 })
                        : renderCell(`members.${index}.gender`, '-', 'center', '-', { fontWeight: 400 })}
                    </td>
                    <td className="text-left" style={{ width: '11%', height: '26px', verticalAlign: 'middle', fontWeight: 400 }}>
                      {member
                        ? renderCell(`members.${index}.birthPlace`, toPureJapanese(member.birthPlace), 'left', '-', {
                            fontSize: '8.2pt',
                            fontWeight: 400,
                            paddingLeft: '4px',
                            paddingRight: '2px',
                          })
                        : renderCell(`members.${index}.birthPlace`, '-', 'center', '-', { fontWeight: 400 })}
                    </td>
                    <td className="text-center whitespace-nowrap" style={{ width: '11%', height: '26px', verticalAlign: 'middle', fontWeight: 400 }}>
                      {member
                        ? renderCell(`members.${index}.birthDate`, member.birthDate, 'center', '-', {
                            fontSize: '8pt',
                            fontFamily: 'Arial, Calibri, "Yu Gothic", sans-serif',
                            fontWeight: 400,
                          })
                        : renderCell(`members.${index}.birthDate`, '-', 'center', '-', { fontWeight: 400 })}
                    </td>
                    <td className="text-center" style={{ width: '8%', height: '26px', verticalAlign: 'middle', fontWeight: 400 }}>
                      {member
                        ? renderCell(`members.${index}.religion`, toPureJapanese(member.religion), 'center', '-', { fontSize: '8.2pt', fontWeight: 400 })
                        : renderCell(`members.${index}.religion`, '-', 'center', '-', { fontWeight: 400 })}
                    </td>
                    <td className="text-left" style={{ width: '12.5%', height: '26px', verticalAlign: 'middle', fontWeight: 400 }}>
                      {member
                        ? renderCell(`members.${index}.education`, toPureJapanese(member.education), 'left', '-', {
                            fontSize: '8pt',
                            fontWeight: 400,
                            paddingLeft: '4px',
                            paddingRight: '2px',
                          })
                        : renderCell(`members.${index}.education`, '-', 'center', '-', { fontWeight: 400 })}
                    </td>
                    <td className="text-left" style={{ width: '12.5%', height: '26px', verticalAlign: 'middle', fontWeight: 400 }}>
                      {member
                        ? renderCell(`members.${index}.occupation`, toPureJapanese(member.occupation), 'left', '-', {
                            fontSize: '8pt',
                            fontWeight: 400,
                            paddingLeft: '4px',
                            paddingRight: '2px',
                          })
                        : renderCell(`members.${index}.occupation`, '-', 'center', '-', { fontWeight: 400 })}
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
              {/* Header Baris 1: Kolom Utama & Pengelompokan (Bold 700, 8.5pt) */}
              <tr style={{ height: '26px' }}>
                <th style={{ width: '3.5%', fontSize: '8.5pt', fontWeight: 700 }} rowSpan={showColumnIndices ? 3 : 2}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: '26px' }}>番</div>
                </th>
                <th style={{ width: '10.5%', fontSize: '8.5pt', fontWeight: 700 }} rowSpan={showColumnIndices ? 2 : 2}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: '26px' }}>現状</div>
                </th>
                <th style={{ width: '12%', fontSize: '8.5pt', fontWeight: 700 }} rowSpan={showColumnIndices ? 2 : 2}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: '26px' }}>家族関係</div>
                </th>
                <th style={{ width: '10%', fontSize: '8.5pt', fontWeight: 700 }} rowSpan={showColumnIndices ? 2 : 2}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: '26px' }}>国籍</div>
                </th>
                <th style={{ width: '32%', fontSize: '8.5pt', fontWeight: 700 }} colSpan={2}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: '26px' }}>入国文書</div>
                </th>
                <th style={{ width: '32%', fontSize: '8.5pt', fontWeight: 700 }} colSpan={2}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: '26px' }}>両親の名</div>
                </th>
              </tr>
              {/* Header Baris 2: Sub-kolom 入国文書 & 両親の名 (Bold 700, 8.5pt) */}
              <tr style={{ height: '26px' }}>
                <th style={{ width: '16%', fontSize: '8.5pt', fontWeight: 700 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: '26px' }}>パスポート番号</div>
                </th>
                <th style={{ width: '16%', fontSize: '8.5pt', fontWeight: 700 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: '26px' }}>在留資格認定書番号</div>
                </th>
                <th style={{ width: '16%', fontSize: '8.5pt', fontWeight: 700 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: '26px' }}>父</div>
                </th>
                <th style={{ width: '16%', fontSize: '8.5pt', fontWeight: 700 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: '26px' }}>母</div>
                </th>
              </tr>
              {/* Header Baris 3: Nomor Indeks (9) s/d (15) (Regular 400, 7.5pt) */}
              {showColumnIndices && (
                <tr className="header-indices-row font-normal" style={{ color: '#000000', height: '18px', fontWeight: 400 }}>
                  <th style={{ height: '18px', verticalAlign: 'middle', padding: '0 2px', fontSize: '7.5pt', fontWeight: 400 }}><div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>(9)</div></th>
                  <th style={{ height: '18px', verticalAlign: 'middle', padding: '0 2px', fontSize: '7.5pt', fontWeight: 400 }}><div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>(10)</div></th>
                  <th style={{ height: '18px', verticalAlign: 'middle', padding: '0 2px', fontSize: '7.5pt', fontWeight: 400 }}><div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>(11)</div></th>
                  <th style={{ height: '18px', verticalAlign: 'middle', padding: '0 2px', fontSize: '7.5pt', fontWeight: 400 }}><div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>(12)</div></th>
                  <th style={{ height: '18px', verticalAlign: 'middle', padding: '0 2px', fontSize: '7.5pt', fontWeight: 400 }}><div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>(13)</div></th>
                  <th style={{ height: '18px', verticalAlign: 'middle', padding: '0 2px', fontSize: '7.5pt', fontWeight: 400 }}><div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>(14)</div></th>
                  <th style={{ height: '18px', verticalAlign: 'middle', padding: '0 2px', fontSize: '7.5pt', fontWeight: 400 }}><div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>(15)</div></th>
                </tr>
              )}
            </thead>
            <tbody>
              {rows.map((member, index) => {
                const rowNo = index + 1;
                return (
                  <tr key={`t2-row-${rowNo}`} className="h-[26px]" style={{ height: '26px', overflow: 'visible' }}>
                    <td className="text-center" style={{ width: '3.5%', height: '26px', verticalAlign: 'middle', padding: '0 2px', fontWeight: 400 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: '26px' }}>
                        <span style={{ display: 'inline-block', lineHeight: '1.2', fontFamily: 'Arial, Calibri, -apple-system, sans-serif', fontSize: '8pt', fontWeight: 400 }}>{rowNo}</span>
                      </div>
                    </td>
                    <td className="text-center" style={{ width: '10.5%', height: '26px', verticalAlign: 'middle', fontWeight: 400 }}>
                      {renderCell(
                        `members.${index}.maritalStatus`,
                        member ? translateToJapanese(member.maritalStatus, 'maritalStatus') : '',
                        'center',
                        '-',
                        { fontSize: '8.2pt', fontWeight: 400 }
                      )}
                    </td>
                    <td className="text-center" style={{ width: '12%', height: '26px', verticalAlign: 'middle', fontWeight: 400 }}>
                      {renderCell(
                        `members.${index}.relationStatus`,
                        member ? translateToJapanese(member.relationStatus, 'relationStatus') : '',
                        'center',
                        '-',
                        { fontSize: '8.2pt', fontWeight: 400 }
                      )}
                    </td>
                    <td className="text-center" style={{ width: '10%', height: '26px', verticalAlign: 'middle', padding: '0 2px', fontWeight: 400 }}>
                      {renderCell(
                        `members.${index}.nationality`,
                        member ? (member.nationality || 'インドネシア') : '',
                        'center',
                        '-',
                        { fontSize: '8.2pt', fontWeight: 400 }
                      )}
                    </td>
                    <td className="text-center" style={{ width: '16%', height: '26px', verticalAlign: 'middle', fontWeight: 400 }}>
                      {renderCell(
                        `members.${index}.passportNumber`,
                        member ? (member.passportNumber && member.passportNumber !== '-' ? member.passportNumber : '') : '',
                        'center',
                        '-',
                        {
                          fontSize: '8pt',
                          fontFamily: 'Arial, Calibri, -apple-system, sans-serif',
                          fontWeight: 400,
                        }
                      )}
                    </td>
                    <td className="text-center" style={{ width: '16%', height: '26px', verticalAlign: 'middle', fontWeight: 400 }}>
                      {renderCell(
                        `members.${index}.stayPermitNumber`,
                        member ? (member.stayPermitNumber && member.stayPermitNumber !== '-' ? member.stayPermitNumber : '') : '',
                        'center',
                        '-',
                        {
                          fontSize: '8pt',
                          fontFamily: 'Arial, Calibri, -apple-system, sans-serif',
                          fontWeight: 400,
                        }
                      )}
                    </td>
                    <td className="text-left" style={{ width: '16%', height: '26px', verticalAlign: 'middle', fontWeight: 400 }}>
                      {renderCell(
                        `members.${index}.fatherName`,
                        member ? translateToJapanese(member.fatherName) : '',
                        'left',
                        '-',
                        {
                          fontSize: '8.2pt',
                          fontWeight: 400,
                          paddingLeft: '5px',
                          paddingRight: '2px',
                        }
                      )}
                    </td>
                    <td className="text-left" style={{ width: '16%', height: '26px', verticalAlign: 'middle', fontWeight: 400 }}>
                      {renderCell(
                        `members.${index}.motherName`,
                        member ? translateToJapanese(member.motherName) : '',
                        'left',
                        '-',
                        {
                          fontSize: '8.2pt',
                          fontWeight: 400,
                          paddingLeft: '5px',
                          paddingRight: '2px',
                        }
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* ================= FOOTER SECTION ================= */}
        <div
          className="grid grid-cols-12 gap-3 text-[8pt] leading-tight items-start pt-2"
          style={{ color: '#000000', fontSize: '8pt' }}
        >
          {/* Kolom Kiri: 発行日 & 4 Lembar Resmi */}
          <div className="col-span-4 space-y-1">
            <div className="flex items-center">
              <span className="w-16 shrink-0 tracking-wider" style={{ color: '#000000', fontWeight: 600 }}>
                発行日
              </span>
              <span className="w-3 text-center font-bold" style={{ color: '#000000' }}>:</span>
              <div className="pl-1 flex-1" style={{ color: '#000000', fontFamily: 'Arial, Calibri, "Yu Gothic", sans-serif', fontWeight: 400 }}>
                {renderCell('issuedDate', data.issuedDate, 'left', '-', {
                  fontSize: '8pt',
                  fontFamily: 'Arial, Calibri, "Yu Gothic", sans-serif',
                  fontWeight: 400,
                })}
              </div>
            </div>

            <div className="flex items-center">
              <span className="w-16 shrink-0 tracking-wide" style={{ color: '#000000', fontWeight: 600 }}>
                第1枚目
              </span>
              <span className="w-3 text-center font-bold" style={{ color: '#000000' }}>:</span>
              <span className="pl-1" style={{ color: '#000000', fontWeight: 400 }}>家長用</span>
            </div>

            <div className="flex items-center">
              <span className="w-16 shrink-0 tracking-wide" style={{ color: '#000000', fontWeight: 600 }}>
                第2枚目
              </span>
              <span className="w-3 text-center font-bold" style={{ color: '#000000' }}>:</span>
              <span className="pl-1" style={{ color: '#000000', fontWeight: 400 }}>隣組長用</span>
            </div>

            <div className="flex items-center">
              <span className="w-16 shrink-0 tracking-wide" style={{ color: '#000000', fontWeight: 600 }}>
                第3枚目
              </span>
              <span className="w-3 text-center font-bold" style={{ color: '#000000' }}>:</span>
              <span className="pl-1" style={{ color: '#000000', fontWeight: 400 }}>村長用</span>
            </div>

            <div className="flex items-center">
              <span className="w-16 shrink-0 tracking-wide" style={{ color: '#000000', fontWeight: 600 }}>
                第4枚目
              </span>
              <span className="w-3 text-center font-bold" style={{ color: '#000000' }}>:</span>
              <span className="pl-1" style={{ color: '#000000', fontWeight: 400 }}>郡長用</span>
            </div>
          </div>

          {/* Kolom Tengah: 家長, （署名）, Nama Kepala Keluarga, Garis, 指印又は署名 */}
          <div className="col-span-4 text-center px-2 flex flex-col justify-between min-h-[110px]">
            <div>
              <div className="tracking-wider" style={{ color: '#000000', fontSize: '9pt', fontWeight: 700 }}>
                家長
              </div>
              <div className="mt-0.5" style={{ color: '#000000', fontSize: '7.5pt', fontWeight: 400 }}>（署名）</div>
            </div>
            <div>
              <div className="text-center font-bold pb-1" style={{ color: '#000000', fontSize: '8pt', minHeight: '18px' }}>
                {renderCell('headOfFamily', headOfFamilyDisplay, 'center', '-', {
                  fontSize: '8pt',
                  fontWeight: 700,
                })}
              </div>
              <div style={{ borderBottom: '1px solid #000000', width: '180px', margin: '0 auto 4px auto', height: '0px' }}></div>
              <div className="tracking-wide text-center" style={{ color: '#000000', fontSize: '7.8pt', fontWeight: 400, minHeight: '14px', lineHeight: '1.2' }}>
                指印又は署名
              </div>
            </div>
          </div>

          {/* Kolom Kanan: 民事登録事務官, （署名）（公印）, Nama Pejabat (signatoryOfficer), Garis, NIP (signatoryNip) & 公務員番号 */}
          <div className="col-span-4 text-center px-2 flex flex-col justify-between min-h-[110px]">
            <div>
              <div className="tracking-wider" style={{ color: '#000000', fontSize: '9pt', fontWeight: 700 }}>
                民事登録事務官
              </div>
              <div className="mt-0.5" style={{ color: '#000000', fontSize: '7.5pt', fontWeight: 400 }}>（署名）（公印）</div>
            </div>
            <div>
              <div className="text-center font-bold pb-1" style={{ color: '#000000', fontSize: '8pt', minHeight: '18px' }}>
                {renderCell('signatoryOfficer', data.signatoryOfficer, 'center', '-', {
                  fontSize: '8pt',
                  fontWeight: 700,
                })}
              </div>
              <div style={{ borderBottom: '1px solid #000000', width: '180px', margin: '0 auto 4px auto', height: '0px' }}></div>
              <div className="text-center tracking-wider pb-0.5" style={{ color: '#000000', fontFamily: 'Arial, Calibri, -apple-system, sans-serif', fontSize: '7.8pt', fontWeight: 400, minHeight: '14px', lineHeight: '1.2' }}>
                {renderCell('signatoryNip', data.signatoryNip, 'center', '-', {
                  fontSize: '7.8pt',
                  fontFamily: 'Arial, Calibri, -apple-system, sans-serif',
                  fontWeight: 400,
                })}
              </div>
              <div className="tracking-wide text-center" style={{ color: '#000000', fontSize: '7.8pt', fontWeight: 400 }}>
                公務員番号
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
