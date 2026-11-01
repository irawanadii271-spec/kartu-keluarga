/**
 * Data structures and types for Indonesian Family Card (Kartu Keluarga) to Japanese Translation (戸籍謄本)
 * Full Japanese Output Standard
 */

export const GITHUB_PROFILE_URL = 'https://github.com/irawanadii271-spec';
export const GITHUB_REPO_URL = 'https://github.com/irawanadii271-spec/kartu-keluarga';

export interface FamilyMember {
  no: number;
  fullNameOriginal: string;
  fullNameKatakana: string;
  nik: string;
  gender: '男' | '女' | string;
  birthPlace: string;
  birthDate: string; // YYYY年MM月DD日
  religion: string;
  education: string;
  occupation: string;
  maritalStatus: string;
  relationStatus: string;
  fatherName: string;
  motherName: string;
  passportNumber?: string;
  stayPermitNumber?: string;
}

export interface FamilyAddress {
  street: string;
  rtRw: string;
  subDistrict: string; // 村 / 行政村
  district: string;    // 郡 / 区
  regencyCity: string; // 市 / 県
  province: string;    // 州
  postalCode: string;  // 郵便番号
}

export interface TranslationResult {
  familyCardNumber: string;
  headOfFamily: string;
  address: FamilyAddress;
  members: FamilyMember[];
  issuedDate: string;
  issuedPlace: string;
  signatoryOfficer?: string;
  signatoryNip?: string;
}

export interface TranslatorInfo {
  name: string;
  katakanaName: string;
  organization: string;
  certificationNumber: string;
  contact: string;
  signatureDate: string;
  includeStamp: boolean;
  stampText: string;
}

export interface TranslationDictionary {
  relationStatus: Record<string, string>;
  maritalStatus: Record<string, string>;
  religion: Record<string, string>;
  gender: Record<string, string>;
  education: Record<string, string>;
  occupation: Record<string, string>;
}

export const VOCABULARY: TranslationDictionary = {
  relationStatus: {
    'Kepala Keluarga': '家長',
    'Suami': '夫',
    'Istri': '妻',
    'Anak': '子',
    'Menantu': '義理の子',
    'Cucu': '孫',
    'Orangtua': '両親',
    'Mertua': '義理の親',
    'Famili Lain': '他の家族',
    'Pembantu': '使用人',
    'Lainnya': 'その他',
  },
  maritalStatus: {
    'Belum Kawin': '未婚',
    'Kawin': '既婚',
    'Cerai Hidup': '離婚',
    'Cerai Mati': '死別',
  },
  religion: {
    'Islam': 'イスラム教',
    'Kristen': 'キリスト教',
    'Katolik': 'カトリック',
    'Hindu': 'ヒンドゥー教',
    'Buddha': '仏教',
  },
  gender: {
    'Laki': '男性',
    'Perempuan': '女性',
  },
  education: {
    'Tidak / Belum Sekolah': '学歴なし',
    'Belum Tamat SD': '小学校未卒',
    'Tamat SD / Sederajat': '小学校卒業',
    'SLTP / Sederajat': '中学校卒業',
    'SLTA / Sederajat': '高校卒業',
    'Diploma I / II': '短大',
    'Akademi / Diploma III / Sarjana Muda': '専門学校',
    'Diploma IV / Strata I': '大学',
    'Strata II': '大学院',
    'Strata III': '博士課程',
  },
  occupation: {
    'Belum / Tidak Bekerja': '未就労',
    'Mengurus Rumah Tangga': '家事',
    'Pensiunan': '定年',
    'Pegawai Negeri Sipil': '公務員',
    'TNI': '軍人',
    'Petani / Pekebun': '農家',
    'Peternak': '畜産',
    'Karyawan Swasta': '会社員',
    'Buruh Harian Lepas': 'アルバイト',
    'Buruh Tani / Perkebunan': '農民',
    'Pembantu Rumah Tangga': '家事手伝い',
    'Tukang Cukur': '理容師',
    'Tukang Listrik': '電気技師',
    'Tukang Batu': '石工',
    'Tukang Kayu': '大工',
    'Wartawan': '記者',
    'Ustadz / Mubaligh': '牧師',
    'Guru': '教師',
    'Sopir': '運転手',
    'Pedagang': '商人',
    'Perangkat Desa': '役人',
    'Kepala Desa': '村長',
    'Wiraswasta': '自営業',
    'Pelajar': '学生',
  },
};

// Structured lists categorized exactly matching user's official spreadsheet
export const GENDER_OPTIONS = [
  { idKey: 'Laki', jpVal: '男', fullJp: '男性', display: '男性 / 男 (Laki)' },
  { idKey: 'Perempuan', jpVal: '女', fullJp: '女性', display: '女性 / 女 (Perempuan)' },
];

export const RELIGION_OPTIONS = [
  { idKey: 'Islam', jpVal: 'イスラム教' },
  { idKey: 'Kristen', jpVal: 'キリスト教' },
  { idKey: 'Katolik', jpVal: 'カトリック' },
  { idKey: 'Hindu', jpVal: 'ヒンドゥー教' },
  { idKey: 'Buddha', jpVal: '仏教' },
];

export const MARITAL_STATUS_OPTIONS = [
  { idKey: 'Belum Kawin', jpVal: '未婚' },
  { idKey: 'Kawin', jpVal: '既婚' },
  { idKey: 'Cerai Hidup', jpVal: '離婚' },
  { idKey: 'Cerai Mati', jpVal: '死別' },
];

export const EDUCATION_OPTIONS = [
  { idKey: 'Tidak / Belum Sekolah', jpVal: '学歴なし' },
  { idKey: 'Belum Tamat SD', jpVal: '小学校未卒' },
  { idKey: 'Tamat SD / Sederajat', jpVal: '小学校卒業' },
  { idKey: 'SLTP / Sederajat', jpVal: '中学校卒業' },
  { idKey: 'SLTA / Sederajat', jpVal: '高校卒業' },
  { idKey: 'Diploma I / II', jpVal: '短大' },
  { idKey: 'Akademi / Diploma III / Sarjana Muda', jpVal: '専門学校' },
  { idKey: 'Diploma IV / Strata I', jpVal: '大学' },
  { idKey: 'Strata II', jpVal: '大学院' },
  { idKey: 'Strata III', jpVal: '博士課程' },
];

export const RELATION_STATUS_OPTIONS = [
  { idKey: 'Kepala Keluarga', jpVal: '家長' },
  { idKey: 'Suami', jpVal: '夫' },
  { idKey: 'Istri', jpVal: '妻' },
  { idKey: 'Anak', jpVal: '子' },
  { idKey: 'Menantu', jpVal: '義理の子' },
  { idKey: 'Cucu', jpVal: '孫' },
  { idKey: 'Orangtua', jpVal: '両親' },
  { idKey: 'Mertua', jpVal: '義理の親' },
  { idKey: 'Famili Lain', jpVal: '他の家族' },
  { idKey: 'Pembantu', jpVal: '使用人' },
  { idKey: 'Lainnya', jpVal: 'その他' },
];

export interface OccupationGroup {
  categoryName: string;
  items: { idKey: string; jpVal: string }[];
}

export const OCCUPATION_CATEGORIES: OccupationGroup[] = [
  {
    categoryName: '1. Umum, Pendidikan & Pelajar',
    items: [
      { idKey: 'Belum / Tidak Bekerja', jpVal: '未就労' },
      { idKey: 'Pelajar', jpVal: '学生' },
      { idKey: 'Mengurus Rumah Tangga', jpVal: '家事' },
      { idKey: 'Pensiunan', jpVal: '定年' },
    ],
  },
  {
    categoryName: '2. Karyawan Swasta, Usaha & Media',
    items: [
      { idKey: 'Karyawan Swasta', jpVal: '会社員' },
      { idKey: 'Wiraswasta', jpVal: '自営業' },
      { idKey: 'Pedagang', jpVal: '商人' },
      { idKey: 'Buruh Harian Lepas', jpVal: 'アルバイト' },
      { idKey: 'Wartawan', jpVal: '記者' },
    ],
  },
  {
    categoryName: '3. Tenaga Pengajar & Pemuka Agama',
    items: [
      { idKey: 'Guru', jpVal: '教師' },
      { idKey: 'Ustadz / Mubaligh', jpVal: '牧師' },
    ],
  },
  {
    categoryName: '4. Pegawai Pemerintahan, Militer & Desa',
    items: [
      { idKey: 'Pegawai Negeri Sipil', jpVal: '公務員' },
      { idKey: 'TNI', jpVal: '軍人' },
      { idKey: 'Perangkat Desa', jpVal: '役人' },
      { idKey: 'Kepala Desa', jpVal: '村長' },
    ],
  },
  {
    categoryName: '5. Sektor Pertanian & Peternakan',
    items: [
      { idKey: 'Petani / Pekebun', jpVal: '農家' },
      { idKey: 'Buruh Tani / Perkebunan', jpVal: '農民' },
      { idKey: 'Peternak', jpVal: '畜産' },
    ],
  },
  {
    categoryName: '6. Keterampilan Teknik & Jasa Pelayanan',
    items: [
      { idKey: 'Sopir', jpVal: '運転手' },
      { idKey: 'Tukang Cukur', jpVal: '理容師' },
      { idKey: 'Tukang Listrik', jpVal: '電気技師' },
      { idKey: 'Tukang Kayu', jpVal: '大工' },
      { idKey: 'Tukang Batu', jpVal: '石工' },
      { idKey: 'Pembantu Rumah Tangga', jpVal: '家事手伝い' },
    ],
  },
];

export const EMPTY_TRANSLATION_DATA: TranslationResult = {
  familyCardNumber: '',
  headOfFamily: '',
  address: {
    street: '',
    rtRw: '',
    subDistrict: '',
    district: '',
    regencyCity: '',
    province: '',
    postalCode: '',
  },
  members: [
    {
      no: 1,
      fullNameOriginal: '',
      fullNameKatakana: '',
      nik: '',
      gender: '男',
      birthPlace: '',
      birthDate: '',
      religion: 'イスラム教',
      education: '高等学校卒業',
      occupation: '会社員',
      maritalStatus: '未婚',
      relationStatus: '家長',
      fatherName: '',
      motherName: '',
      passportNumber: '-',
      stayPermitNumber: '-',
    },
  ],
  issuedDate: '',
  issuedPlace: '',
  signatoryOfficer: '',
  signatoryNip: '',
};

export const SAMPLE_PRESETS: { id: string; title: string; description: string; data: TranslationResult }[] = [
  {
    id: 'standard-family',
    title: '家族4名（標準世帯 - ジャカルタ）',
    description: '世帯主、妻、長男、長女の4名家族。全て日本語（カタカナ・漢字）表記。',
    data: {
      familyCardNumber: '3174052309120005',
      headOfFamily: 'ブディ・サントソ',
      address: {
        street: 'メラティ・インダ通り42番地',
        rtRw: '004 / 007',
        subDistrict: 'チランダック・バラット村',
        district: 'チランダック区',
        regencyCity: '南ジャカルタ市',
        province: 'ジャカルタ首都特別州',
        postalCode: '12430',
      },
      members: [
        {
          no: 1,
          fullNameOriginal: 'BUDI SANTOSO',
          fullNameKatakana: 'ブディ・サントソ',
          nik: '3174051508820001',
          gender: '男',
          birthPlace: 'ジャカルタ',
          birthDate: '1982年08月15日',
          religion: 'イスラム教',
          education: '大学卒業',
          occupation: '会社員',
          maritalStatus: '既婚',
          relationStatus: '本人',
          fatherName: 'スカルノ',
          motherName: 'シティ・アミナ',
          passportNumber: '-',
          stayPermitNumber: '-',
        },
        {
          no: 2,
          fullNameOriginal: 'DEWI LESTARI',
          fullNameKatakana: 'デウィ・レスタリ',
          nik: '3174055210850003',
          gender: '女',
          birthPlace: 'バンドン',
          birthDate: '1985年10月12日',
          religion: 'イスラム教',
          education: '大学卒業',
          occupation: '教員',
          maritalStatus: '既婚',
          relationStatus: '妻',
          fatherName: 'アフマド・スディルマン',
          motherName: 'ラトナ・ジュウィタ',
          passportNumber: '-',
          stayPermitNumber: '-',
        },
        {
          no: 3,
          fullNameOriginal: 'MUHAMMAD RIZKY PRATAMA',
          fullNameKatakana: 'ムハマド・リズキー・プラタマ',
          nik: '3174051004120002',
          gender: '男',
          birthPlace: 'ジャカルタ',
          birthDate: '2012年04月10日',
          religion: 'イスラム教',
          education: '中学校卒業',
          occupation: '学生',
          maritalStatus: '未婚',
          relationStatus: '子',
          fatherName: 'ブディ・サントソ',
          motherName: 'デウィ・レスタリ',
          passportNumber: '-',
          stayPermitNumber: '-',
        },
        {
          no: 4,
          fullNameOriginal: 'AULIA RAHMA SALSABILA',
          fullNameKatakana: 'アウリア・ラフマ・サルサビラ',
          nik: '3174056009160004',
          gender: '女',
          birthPlace: 'ジャカルタ',
          birthDate: '2016年09月20日',
          religion: 'イスラム教',
          education: '初等教育修了',
          occupation: '学生',
          maritalStatus: '未婚',
          relationStatus: '子',
          fatherName: 'ブディ・サントソ',
          motherName: 'デウィ・レスタリ',
          passportNumber: '-',
          stayPermitNumber: '-',
        },
      ],
      issuedDate: '2021年05月18日',
      issuedPlace: '南ジャカルタ市',
      signatoryOfficer: 'アフマド・ファウジ',
      signatoryNip: '19680512 199403 1 002',
    },
  },
  {
    id: 'young-couple',
    title: '夫婦2名（新婚世帯 - スラバヤ）',
    description: '夫（世帯主）と妻の2名家族。東ジャワ州スラバヤ市。',
    data: {
      familyCardNumber: '3578011204210008',
      headOfFamily: 'アンディ・クルニアワン',
      address: {
        street: 'ダルモ・ペルマイ通り8番地',
        rtRw: '002 / 005',
        subDistrict: 'プラダ・カリケンダル村',
        district: 'ドゥク・パキス区',
        regencyCity: 'スラバヤ市',
        province: '東ジャワ州',
        postalCode: '60225',
      },
      members: [
        {
          no: 1,
          fullNameOriginal: 'ANDI KURNIAWAN',
          fullNameKatakana: 'アンディ・クルニアワン',
          nik: '3578012403940001',
          gender: '男',
          birthPlace: 'スラバヤ',
          birthDate: '1994年03月24日',
          religion: 'イスラム教',
          education: '大学卒業',
          occupation: '会社員',
          maritalStatus: '既婚',
          relationStatus: '本人',
          fatherName: 'バンバン・ヘルマント',
          motherName: 'スリ・ワヒュニ',
          passportNumber: '-',
          stayPermitNumber: '-',
        },
        {
          no: 2,
          fullNameOriginal: 'CITRA ANGGRAINI',
          fullNameKatakana: 'チトラ・アングライニ',
          nik: '3578015507960002',
          gender: '女',
          birthPlace: 'マラン',
          birthDate: '1996年07月15日',
          religion: 'イスラム教',
          education: '大学卒業',
          occupation: '看護師',
          maritalStatus: '既婚',
          relationStatus: '妻',
          fatherName: 'ハルトノ',
          motherName: 'エンダン・スルヤニ',
          passportNumber: '-',
          stayPermitNumber: '-',
        },
      ],
      issuedDate: '2023年02月10日',
      issuedPlace: 'スラバヤ市',
      signatoryOfficer: 'アグス・イマン・ソンハジ',
      signatoryNip: '19700315 199602 1 003',
    },
  },
  {
    id: 'multigen-family',
    title: '3世代家族（親同居 - バンドン）',
    description: '世帯主、妻、子、および母（未亡人）の同居家族。',
    data: {
      familyCardNumber: '3273100511180012',
      headOfFamily: 'ヘンドラ・ウィジャヤ',
      address: {
        street: 'セティアブディ通り108番地',
        rtRw: '001 / 003',
        subDistrict: 'ヘガルマナ村',
        district: 'チダダップ区',
        regencyCity: 'バンドン市',
        province: '西ジャワ州',
        postalCode: '40141',
      },
      members: [
        {
          no: 1,
          fullNameOriginal: 'HENDRA WIJAYA',
          fullNameKatakana: 'ヘンドラ・ウィジャヤ',
          nik: '3273101402800001',
          gender: '男',
          birthPlace: 'バンドン',
          birthDate: '1980年02月14日',
          religion: 'キリスト教',
          education: '大学卒業',
          occupation: '自営業',
          maritalStatus: '既婚',
          relationStatus: '本人',
          fatherName: 'タン・シウ・リオン',
          motherName: 'リー・メイ・ファ',
          passportNumber: '-',
          stayPermitNumber: '-',
        },
        {
          no: 2,
          fullNameOriginal: 'MARIA CHRISTINA',
          fullNameKatakana: 'マリア・クリスティナ',
          nik: '3273105006840003',
          gender: '女',
          birthPlace: 'メダン',
          birthDate: '1984年06月10日',
          religion: 'キリスト教',
          education: '大学卒業',
          occupation: '主婦',
          maritalStatus: '既婚',
          relationStatus: '妻',
          fatherName: 'ヨハネス・シアハーン',
          motherName: 'エステル・マルパウン',
          passportNumber: '-',
          stayPermitNumber: '-',
        },
        {
          no: 3,
          fullNameOriginal: 'KEVIN WIJAYA',
          fullNameKatakana: 'ケヴィン・ウィジャヤ',
          nik: '3273101511140002',
          gender: '男',
          birthPlace: 'バンドン',
          birthDate: '2014年11月15日',
          religion: 'キリスト教',
          education: '初等教育修了',
          occupation: '学生',
          maritalStatus: '未婚',
          relationStatus: '子',
          fatherName: 'ヘンドラ・ウィジャヤ',
          motherName: 'マリア・クリスティナ',
          passportNumber: '-',
          stayPermitNumber: '-',
        },
        {
          no: 4,
          fullNameOriginal: 'LIE MEI HWA',
          fullNameKatakana: 'リー・メイ・ファ',
          nik: '3273104501520001',
          gender: '女',
          birthPlace: 'スマラン',
          birthDate: '1952年01月05日',
          religion: 'キリスト教',
          education: '高等学校卒業',
          occupation: '退職者',
          maritalStatus: '死別',
          relationStatus: '母',
          fatherName: 'リー・コク・チン',
          motherName: 'オング・スイ・ニオ',
          passportNumber: '-',
          stayPermitNumber: '-',
        },
      ],
      issuedDate: '2020年08月25日',
      issuedPlace: 'バンドン市',
      signatoryOfficer: 'タタン・ムフタール',
      signatoryNip: '19650420 199101 1 001',
    },
  },
];
