// 車種ページのうち、検索語に合わせて title / h1 / 冒頭を個別に変える車種だけを書く台帳。
// ⚠️ 全車種の title テンプレートは変えない（1,537本を一括で動かさない）。ここに無い車種は従来どおり。
// ⚠️ キーは「maker_id/model_id」。model_id はメーカーをまたいで重複する（例 999_63＝ハーレー FLTC と BMW R18 B）。
// ⚠️ 新車の記述は、確認日に公式・出典を開いて確かめたものだけを書く。
export type ModelSeo = {
  /** title・h1・description で使う車種名（出典の「英字名 カナ名」の重複を除いたもの） */
  name?: string
  /** title の「車種名の」に続く部分（name と両方あるときだけ title・h1 を切り替える） */
  titleSuffix?: string
  /** 確認日に出典を開いて確かめた中古車の価格帯・台数。あれば冒頭と description はこちらを出す（本文の掲載データはスナップショットのまま） */
  usedNow?: { min: number; max: number; count: number; checkedAt: string }
  /** 検索語に「販売台数」がある車種への答え。在庫台数を販売台数と誤認させない */
  sales?: { text: string; descText: string; sources: { label: string; url: string }[]; checkedAt: string }
  /** 新車についての答え（検索語に「新車」がある車種だけ） */
  newCar?: { text: string; descText: string; sources: { label: string; url: string }[]; checkedAt: string }
}

export const MODEL_SEO: Record<string, ModelSeo> = {
  '5/999_63': {
    name: 'FLTC ツアーグライドクラシック',
    titleSuffix: '中古車価格と新車の有無',
    newCar: {
      text: 'ハーレーダビッドソン公式サイト（日本）の現行モデル一覧に掲載がなく、バイクブロスの新車の販売車両も0台です。バイクブロスのカタログに掲載されている年式は1981〜1991年式です。',
      descText: '新車は公式の現行モデル一覧に掲載がなく、バイクブロスの販売車両も0台です（2026-11-04確認）。',
      sources: [
        { label: 'ハーレーダビッドソン公式 現行モデル一覧', url: 'https://www.harley-davidson.com/jp/ja/motorcycles/index.html' },
        { label: 'バイクブロス 新車ページ', url: 'https://www.bikebros.co.jp/catalog/5/999_63/new-bike/' },
      ],
      checkedAt: '2026-11-04',
    },
  },
  '5/1_25': { name: 'CVO FLSTSE3 ソフテイルコンバーチブル', titleSuffix: '中古車価格帯と流通台数' },
  '1/196_3': { name: 'NC700S・NC700S DCT', titleSuffix: '中古車価格帯と流通台数' },
  '8/7_3': { name: '750 PASO（750パゾ・750パソ）', titleSuffix: '中古車価格帯と流通台数' },
  '4/80_2': { name: 'ZEPHYR550（ゼファー550）', titleSuffix: '中古車価格帯と流通台数', usedNow: { min: 597000, max: 1500000, count: 12, checkedAt: '2026-11-04' } },
  '14/999_20': { name: 'ツーリズモベローチェ800 LUSSO SCS', titleSuffix: '中古車価格帯と流通台数', usedNow: { min: 2000000, max: 2080000, count: 2, checkedAt: '2026-11-04' } },
  '1/156_7': { name: 'フォルツァS（FORZA S）', titleSuffix: '中古車価格帯と流通台数', usedNow: { min: 219000, max: 440000, count: 3, checkedAt: '2026-11-04' } },
  '8/15_4': { name: 'スクランブラークラシック（Scrambler Classic）', titleSuffix: '中古車価格帯と流通台数', usedNow: { min: 568000, max: 658000, count: 2, checkedAt: '2026-11-04' } },
  '2/999_90': {
    usedNow: { min: 299800, max: 539000, count: 68, checkedAt: '2026-11-04' },
    sales: {
      text: 'ヤマハ発動機のニュースリリース（2026年5月13日発表・発売日 2026年6月30日）と製品ページに車種別の販売台数の記載はなく、公表値は見当たりません。全国軽自動車協会連合会の統計はメーカー別・都道府県別で、車種別の表はありません。当ページの台数はバイクブロスに掲載中の在庫台数で、販売台数ではありません。',
      descText: '車種別の販売台数の公表値は見当たりません（2026-11-04確認）。',
      sources: [
        { label: 'ヤマハ発動機 ニュースリリース', url: 'https://global.yamaha-motor.com/jp/news/2026/0513/xsr155.html' },
        { label: 'ヤマハ発動機 XSR155 製品ページ', url: 'https://www.yamaha-motor.co.jp/mc/lineup/xsr155/' },
        { label: '全国軽自動車協会連合会 二輪車の統計', url: 'https://www.zenkeijikyo.or.jp/statistics/2ken' },
      ],
      checkedAt: '2026-11-04',
    },
  },
  '4/999_128': {
    usedNow: { min: 478000, max: 643500, count: 66, checkedAt: '2026-11-04' },
    sales: {
      text: 'カワサキの製品ページに車種別の販売台数の記載はなく、公表値は見当たりません。全国軽自動車協会連合会の統計はメーカー別・都道府県別で、車種別の表はありません。当ページの台数はバイクブロスに掲載中の在庫台数で、販売台数ではありません。',
      descText: '車種別の販売台数の公表値は見当たりません（2026-11-04確認）。',
      sources: [
        { label: 'カワサキ W230 製品ページ', url: 'https://www.kawasaki-motors.com/ja-jp/motorcycle/w/retro-classic/w230' },
        { label: '全国軽自動車協会連合会 二輪車の統計', url: 'https://www.zenkeijikyo.or.jp/statistics/2ken' },
      ],
      checkedAt: '2026-11-04',
    },
  },
  '4/999_115': {
    usedNow: { min: 598000, max: 1280000, count: 84, checkedAt: '2026-11-04' },
    sales: {
      text: 'カワサキの製品ページに車種別の販売台数の記載はなく、公表値は見当たりません。全国軽自動車協会連合会の統計はメーカー別・都道府県別で、車種別の表はありません。当ページの台数はバイクブロスに掲載中の在庫台数で、販売台数ではありません。',
      descText: '車種別の販売台数の公表値は見当たりません（2026-11-04確認）。',
      sources: [
        { label: 'カワサキ Z650RS 製品ページ', url: 'https://www.kawasaki-motors.com/ja-jp/motorcycle/z/retro-sport/z650rs' },
        { label: '全国軽自動車協会連合会 二輪車の統計', url: 'https://www.zenkeijikyo.or.jp/statistics/2ken' },
      ],
      checkedAt: '2026-11-04',
    },
  },
}
