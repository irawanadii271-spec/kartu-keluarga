/**
 * Romanization to Katakana conversion utility for Indonesian names
 */

const SYLLABLE_MAP: Record<string, string> = {
  // Vowels
  a: 'ア', i: 'イ', u: 'ウ', e: 'エ', o: 'オ',
  // K
  ka: 'カ', ki: 'キ', ku: 'ク', ke: 'ケ', ko: 'コ',
  // S
  sa: 'サ', si: 'シ', su: 'ス', se: 'セ', so: 'ソ',
  sya: 'シャ', syu: 'シュ', syo: 'ショ',
  // T
  ta: 'タ', ti: 'ティ', tu: 'トゥ', te: 'テ', to: 'ト',
  // N
  na: 'ナ', ni: 'ニ', nu: 'ヌ', ne: 'ネ', no: 'ノ',
  // H
  ha: 'ハ', hi: 'ヒ', hu: 'フ', he: 'ヘ', ho: 'ホ',
  // M
  ma: 'マ', mi: 'ミ', mu: 'ム', me: 'メ', mo: 'モ',
  // Y
  ya: 'ヤ', yu: 'ユ', yo: 'ヨ',
  // R / L (mapped to Japanese R)
  ra: 'ラ', ri: 'リ', ru: 'ル', re: 'レ', ro: 'ロ',
  la: 'ラ', li: 'リ', lu: 'ル', le: 'レ', lo: 'ロ',
  // W
  wa: 'ワ', wi: 'ウィ', wu: 'ウ', we: 'ウェ', wo: 'ウォ',
  // G
  ga: 'ガ', gi: 'ギ', gu: 'グ', ge: 'ゲ', go: 'ゴ',
  // Z / J
  za: 'ザ', zi: 'ジ', zu: 'ズ', ze: 'ゼ', zo: 'ゾ',
  ja: 'ジャ', ji: 'ジ', ju: 'ジュ', je: 'ジェ', jo: 'ジョ',
  // D
  da: 'ダ', di: 'ディ', du: 'ドゥ', de: 'デ', do: 'ド',
  // B
  ba: 'バ', bi: 'ビ', bu: 'ブ', be: 'ベ', bo: 'ボ',
  // P
  pa: 'パ', pi: 'ピ', pu: 'プ', pe: 'ペ', po: 'ポ',
  // F / V
  fa: 'ファ', fi: 'フィ', fu: 'フ', fe: 'フェ', fo: 'フォ',
  va: 'ヴァ', vi: 'ヴィ', vu: 'ヴ', ve: 'ヴェ', vo: 'ヴォ',
  // C (Ch)
  ca: 'チャ', ci: 'チ', cu: 'チュ', ce: 'チェ', co: 'チョ',
  // KH / GH
  kha: 'ハ', khi: 'ヒ', khu: 'フ', khe: 'ヘ', kho: 'ホ',
  // NG
  nga: 'ンガ', ngi: 'ンギ', ngu: 'ング', nge: 'ンゲ', ngo: 'ンゴ',
  // NY
  nya: 'ニャ', nyi: 'ニィ', nyu: 'ニュ', nye: 'ニェ', nyo: 'ニョ',
};

/**
 * Transliterates Indonesian names to Katakana
 */
export function transliterateIndonesianToKatakana(input: string): string {
  if (!input) return '';

  const words = input.trim().split(/\s+/);
  const convertedWords = words.map((word) => {
    let lower = word.toLowerCase();
    let result = '';
    let i = 0;

    while (i < lower.length) {
      // Check 3-letter combos (sya, syu, nya, nga, kha, etc.)
      const three = lower.slice(i, i + 3);
      if (SYLLABLE_MAP[three]) {
        result += SYLLABLE_MAP[three];
        i += 3;
        continue;
      }

      // Check 2-letter combos (ka, ki, sa, etc.)
      const two = lower.slice(i, i + 2);
      if (SYLLABLE_MAP[two]) {
        result += SYLLABLE_MAP[two];
        i += 2;
        continue;
      }

      // Special consonant endings
      const char = lower[i];
      if (char === 'n' && (i === lower.length - 1 || !'aeiou'.includes(lower[i + 1]))) {
        result += 'ン';
        i += 1;
        continue;
      }

      // Check single vowel
      if (SYLLABLE_MAP[char]) {
        result += SYLLABLE_MAP[char];
        i += 1;
        continue;
      }

      // Consonant without vowel: attach minimal Katakana sound
      switch (char) {
        case 'k': result += 'ク'; break;
        case 's': result += 'ス'; break;
        case 't': result += 'ト'; break;
        case 'p': result += 'プ'; break;
        case 'b': result += 'ブ'; break;
        case 'd': result += 'ド'; break;
        case 'm': result += 'ム'; break;
        case 'r': result += 'ル'; break;
        case 'l': result += 'ル'; break;
        case 'g': result += 'グ'; break;
        case 'h': result += 'ホ'; break;
        case 'y': result += 'イ'; break;
        default: result += char.toUpperCase();
      }
      i += 1;
    }

    return result;
  });

  return convertedWords.join('・');
}
