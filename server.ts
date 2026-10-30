import express, { Request, Response } from 'express';
import { GoogleGenAI, Type } from '@google/genai';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = parseInt(process.env.PORT || '3000', 10);

app.use(express.json({ limit: '35mb' }));

// Zero-Data Retention Architecture:
// 1. Strictly In-Memory: No database, no local disk caching, no persistent blob storage.
// 2. Stateless Execution: Image & text payloads are processed in volatile memory and immediately dereferenced.
// 3. Privacy-First: No PII (names, NIK, addresses) is ever logged to stdout or console.

function getGeminiClient(customApiKey?: string): GoogleGenAI {
  const effectiveKey = (customApiKey && customApiKey.trim()) || process.env.GEMINI_API_KEY || '';
  return new GoogleGenAI({
    apiKey: effectiveKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build-kk-translator',
      },
    },
  });
}

const TRANSLATION_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    familyCardNumber: {
      type: Type.STRING,
      description: 'Nomor Kartu Keluarga (16 digit)',
    },
    headOfFamily: {
      type: Type.STRING,
      description: 'Nama Kepala Keluarga (ORIGINAL LATIN + Katakana jika ada)',
    },
    address: {
      type: Type.OBJECT,
      properties: {
        street: { type: Type.STRING, description: 'Alamat jalan/dusun/lingkungan dengan padanan Jepang (misal: Jl. Mawar No. 12 / マワール通り12番地)' },
        rtRw: { type: Type.STRING, description: 'Format RT xxx / RW xxx (隣組 / 地区)' },
        subDistrict: { type: Type.STRING, description: 'Kelurahan/Desa padanan Jepang (村/行政村), e.g. Sukamaju村' },
        district: { type: Type.STRING, description: 'Kecamatan padanan Jepang (郡/区), e.g. Sukarame区' },
        regencyCity: { type: Type.STRING, description: 'Kabupaten/Kota padanan Jepang (県/市), e.g. Bandar Lampung市' },
        province: { type: Type.STRING, description: 'Provinsi padanan Jepang (州), e.g. Lampung州' },
        postalCode: { type: Type.STRING, description: 'Kode Pos (郵便番号)' },
      },
      required: ['street', 'rtRw', 'subDistrict', 'district', 'regencyCity', 'province', 'postalCode'],
    },
    members: {
      type: Type.ARRAY,
      description: 'Daftar seluruh anggota keluarga yang tercatat di KK',
      items: {
        type: Type.OBJECT,
        properties: {
          no: { type: Type.INTEGER, description: 'Nomor urut' },
          fullNameOriginal: { type: Type.STRING, description: 'Nama lengkap asli huruf Latin Kapital' },
          fullNameKatakana: { type: Type.STRING, description: 'Transliterasi Katakana resmi standar Jepang, e.g. ブディ・サントソ' },
          nik: { type: Type.STRING, description: 'Nomor Induk Kependudukan (16 digit)' },
          gender: { type: Type.STRING, description: '男 (Laki-laki) atau 女 (Perempuan)' },
          birthPlace: { type: Type.STRING, description: 'Tempat lahir transliterasi Jepang Romaji/Katakana' },
          birthDate: { type: Type.STRING, description: 'Format standar Jepang 西暦YYYY年MM月DD日 (atau YYYY-MM-DD)' },
          religion: { type: Type.STRING, description: 'Agama standar Jepang: イスラム教, キリスト教（プロテスタント）, キリスト教（カトリック）, ヒンドゥー教, 仏教, 儒教' },
          education: { type: Type.STRING, description: 'Pendidikan dalam bahasa Jepang, misal: 高等学校卒業 (Tamat SMA), 学士号取得 (S1), 中学校卒業 (SMP), etc.' },
          occupation: { type: Type.STRING, description: 'Pekerjaan dalam bahasa Jepang, misal: 会社員 (Karyawan Swasta), 公務員 (PNS), 自営業 (Wiraswasta), 学生 (Pelajar), 主婦 (Ibu RT), 無職 (Belum Bekerja)' },
          maritalStatus: { type: Type.STRING, description: 'Status perkawinan: 未婚 (Belum Kawin), 既婚（公証済） (Kawin Tercatat), 既婚 (Kawin), 離婚 (Cerai Hidup), 死別 (Cerai Mati)' },
          relationStatus: { type: Type.STRING, description: 'Hubungan keluarga: 本人 / 世帯主 (Kepala Keluarga), 妻 (Istri), 夫 (Suami), 子 / 長男 / 長女 (Anak), 父母 / 義父母 (Orang Tua/Mertua), その他の親族 (Famili Lain)' },
          fatherName: { type: Type.STRING, description: 'Nama Ayah dalam ejaan Latin dan Katakana' },
          motherName: { type: Type.STRING, description: 'Nama Ibu dalam ejaan Latin dan Katakana' },
        },
        required: [
          'no',
          'fullNameOriginal',
          'fullNameKatakana',
          'nik',
          'gender',
          'birthPlace',
          'birthDate',
          'religion',
          'education',
          'occupation',
          'maritalStatus',
          'relationStatus',
          'fatherName',
          'motherName'
        ],
      },
    },
    issuedDate: {
      type: Type.STRING,
      description: 'Tanggal diterbitkan dokumen KK, format 西暦YYYY年MM月DD日',
    },
    issuedPlace: {
      type: Type.STRING,
      description: 'Tempat/Kota diterbitkan KK',
    },
    signatoryOfficer: {
      type: Type.STRING,
      description: 'Nama Kepala Dinas Kependudukan dan Catatan Sipil yang menandatangani KK',
    },
  },
  required: ['familyCardNumber', 'headOfFamily', 'address', 'members', 'issuedDate', 'issuedPlace'],
};

const SYSTEM_INSTRUCTION = `Anda adalah Spesialis Dokumen Terjemahan Hukum Jepang-Indonesia dan Penerjemah Resmi untuk administrasi keimigrasian Jepang (出入国在留管理庁) dan Balai Kota Jepang (市役所/区役所).

PERATURAN UTAMA:
Seluruh hasil terjemahan HARUS 100% DALAM BAHASA JEPANG (Kanji & Katakana murni).
DILARANG KERAS menyertakan bahasa Indonesia atau penjelasan bahasa Indonesia dalam tanda kurung di dalam nilai JSON.

Aturan Terjemahan:
1. Nama Orang (fullNameKatakana, headOfFamily, fatherName, motherName):
   - Wajib transliterasi Katakana resmi standar Jepang yang akurat (contoh: "ブディ・サントソ", "スカルノ", "デウィ・レスタリ").
   - fullNameOriginal tetap menyimpan nama asli huruf Latin Kapital.
2. Wilayah Administratif:
   - Kabupaten/Kota: Gunakan padanan 市/県 (contoh: "南ジャカルタ市", "スラバヤ市", "バンドン市").
   - Provinsi: Gunakan 州 (contoh: "ジャカルタ首都特別州", "東ジャワ州", "西ジャワ州").
   - Kecamatan: Gunakan 区/郡 (contoh: "チランダック区").
   - Kelurahan/Desa: Gunakan 村/行政村 (contoh: "チランダック・バラット村").
   - Jalan: Gunakan 通り/番地 (contoh: "メラティ・インダ通り42番地").
3. Status Hubungan (relationStatus):
   - Wajib istilah kependudukan Jepang murni: 本人, 妻, 夫, 子, 長男, 長女, 父母, 義父母, その他の親族.
4. Status Perkawinan (maritalStatus):
   - Wajib istilah Jepang murni: 未婚, 既婚, 離婚, 死別.
5. Agama (religion):
   - イスラム教, キリスト教, カトリック, ヒンドゥー教, 仏教, 儒教.
6. Pendidikan (education):
   - 未就学, 初等教育修了, 中学校卒業, 高等学校卒業, 大学卒業, 大学院修士課程修了.
7. Pekerjaan (occupation):
   - 会社員, 公務員, 自営業, 学生, 主婦, 無職, 医師, 教員, 退職者.
8. Format Tanggal (birthDate, issuedDate):
   - Gunakan format kalender Masehi: YYYY年MM月DD日 (contoh: "1985年10月12日").
9. Jenis Kelamin (gender):
   - "男" atau "女".

Selalu kembalikan respon dalam format JSON sesuai schema yang ditentukan.`;

// API route for extracting and translating KK (Stateless, RAM-Only, Zero-Storage)
app.post('/api/translate-kk', async (req: Request, res: Response) => {
  try {
    const customKey = (req.headers['x-gemini-key'] as string) || (req.body.apiKey as string);
    const ai = getGeminiClient(customKey);

    const { imageBase64, mimeType, textInput } = req.body;

    if (!imageBase64 && !textInput) {
      return res.status(400).json({ error: 'Harap sediakan gambar scan KK atau teks dokumen KK.' });
    }

    const contents: any[] = [];

    if (imageBase64) {
      const cleanBase64 = imageBase64.replace(/^data:[^;]+;base64,/, '');
      contents.push({
        inlineData: {
          mimeType: mimeType || 'image/jpeg',
          data: cleanBase64,
        },
      });
      contents.push({
        text: 'Analisis gambar Kartu Keluarga (KK) ini dengan sangat teliti. Ekstrak seluruh nomor KK, alamat lengkap, dan SEMUA anggota keluarga dalam tabel. Terjemahkan nama ke Katakana dan istilah kependudukan ke bahasa Jepang resmi sesuai instruksi.',
      });
    } else {
      contents.push({
        text: `Terjemahkan dan ekstrak data Kartu Keluarga berikut ke standar kependudukan Jepang:\n\n${textInput}`,
      });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: { parts: contents },
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: 'application/json',
        responseSchema: TRANSLATION_SCHEMA,
      },
    });

    const rawResult = response.text || '{}';
    const parsedData = JSON.parse(rawResult);

    // Explicitly dereference contents from memory
    contents.length = 0;

    return res.json({ success: true, data: parsedData });
  } catch (error: any) {
    // Only log generic error message without PII data
    console.error('Stateless translation error:', error?.message || 'Unknown error');
    return res.status(500).json({
      success: false,
      error: error?.message || 'Terjadi kesalahan saat memproses terjemahan KK.',
    });
  }
});

// Helper API for fast Katakana name conversion
app.post('/api/katakana-name', async (req: Request, res: Response) => {
  try {
    const customKey = (req.headers['x-gemini-key'] as string) || (req.body.apiKey as string);
    const ai = getGeminiClient(customKey);

    const { name } = req.body;
    if (!name || typeof name !== 'string') {
      return res.status(400).json({ error: 'Nama wajib disertakan' });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `Ubah nama orang Indonesia "${name}" ke dalam penulisan Katakana resmi Jepang standar kedutaan/imigrasi. Berikan HANYA teks Katakana murni tanpa penjelasan atau tanda kutip.`,
      config: {
        responseMimeType: 'text/plain',
      },
    });

    const katakana = (response.text || '').trim();
    return res.json({ success: true, katakana });
  } catch (err: any) {
    console.error('Katakana translation error:', err?.message || 'Unknown error');
    return res.status(500).json({ success: false, error: err?.message || 'Gagal mengubah ke Katakana' });
  }
});

// Start server and handle Vite integration
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`KK Translator JP server is running on http://0.0.0.0:${port}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
