import React from 'react';

interface HankoSealProps {
  text?: string;
  size?: number;
}

export const HankoSeal: React.FC<HankoSealProps> = ({ text = '翻訳者印', size = 70 }) => {
  return (
    <div
      className="hanko-seal select-none flex flex-col items-center justify-center text-center font-bold"
      style={{
        width: `${size}px`,
        height: `${size}px`,
        fontSize: size > 60 ? '11px' : '9px',
        lineHeight: 1.15,
      }}
      title="印鑑 / 翻訳者証明印 (Hanko Resmi Penerjemah)"
    >
      <div className="text-[9px] tracking-widest font-serif opacity-90">公式</div>
      <div className="font-serif font-black tracking-normal leading-tight px-1">
        {text}
      </div>
      <div className="text-[8px] font-serif tracking-widest opacity-90">之印</div>
    </div>
  );
};
