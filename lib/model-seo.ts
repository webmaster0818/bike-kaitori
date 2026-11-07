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
  usedNow?: { min: number; max: number; count: number; checkedAt: string; note?: string }
  /** 確認日に出典を開いたら中古車の在庫が0台だった車種。あれば冒頭と description はこちらを出す */
  usedNone?: { checkedAt: string }
  /** 検索語に「販売台数」がある車種への答え。在庫台数を販売台数と誤認させない */
  sales?: { text: string; descText: string; sources: { label: string; url: string }[]; checkedAt: string }
  /** 新車についての答え（検索語に「新車」がある車種だけ） */
  newCar?: { text: string; descText: string; sources: { label: string; url: string }[]; checkedAt: string }
  /** 同じ語で表示を分け合う兄弟車種への導線（自社カニバリの役割分け）。主ページに一覧、もう一方に主ページへのリンク。価格は確認日に出典の在庫一覧で数えた車両価格 */
  family?: {
    text: string
    items: { label: string; href?: string; count: number; min: number; max: number }[]
    checkedAt: string
  }
}

export const MODEL_SEO: Record<string, ModelSeo> = {
  '10/19_1': {
    usedNow: { min: 376000, max: 2288000, count: 5, checkedAt: '2026-11-07', note: '価格は車両価格で、上限の2,288,000円は2026年式のRX（走行2km）です。他の4台は376,000円〜1,399,000円です' },
    family: {
      text: 'バイクブロスのカタログはグレードごとに分かれています。当ページは「スピードトリプル」の分類で、他の分類の中古車在庫は次のとおりです。',
      items: [
        { label: 'スピードトリプルR', href: '/model/triumph-19-2/', count: 3, min: 590000, max: 829800 },
        { label: 'スピードトリプルRS', count: 1, min: 1199900, max: 1199900 },
        { label: 'スピードトリプル1200RS', href: '/model/triumph-999-34/', count: 19, min: 1078000, max: 2145000 },
        { label: 'スピードトリプル1200RR', href: '/model/triumph-999-39/', count: 9, min: 1388000, max: 2322000 },
        { label: 'スピードトリプル1200RX', href: '/model/triumph-999-68/', count: 3, min: 2191100, max: 2401000 },
      ],
      checkedAt: '2026-11-07',
    },
  },
  '10/19_2': {
    usedNow: { min: 590000, max: 829800, count: 3, checkedAt: '2026-11-07', note: '価格は車両価格で、掲載3台は2014〜2016年式、走行8,211km〜46,000kmです。カタログの価格帯表示の下限は410,000円ですが、在庫一覧の3台にこの価格はありません' },
    family: {
      text: '当ページはスピードトリプルRの分類だけを扱います。グレードをまたいで比べる場合は次のページをご覧ください。',
      items: [{ label: 'スピードトリプル（グレード別の在庫一覧あり）', href: '/model/triumph-19-1/', count: 5, min: 376000, max: 2288000 }],
      checkedAt: '2026-11-07',
    },
  },
  '10/999_70': {
    usedNow: { min: 700000, max: 875000, count: 13, checkedAt: '2026-11-07', note: '価格は車両価格で、掲載13台は2026年式または2026年初度登録、走行4km〜3,665kmです。新車の実勢価格はカタログで846,000円〜869,900円（19台）です' },
  },
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
  '8/15_7': {
    name: 'スクランブラー デザートスレッド（Scrambler DESERT SLED）',
    titleSuffix: '中古車価格帯と流通台数',
    usedNow: { min: 821000, max: 1215500, count: 4, checkedAt: '2026-11-05', note: '価格は車両価格で、掲載4台の支払総額は938,000円〜1,281,500円、走行距離は4,077km〜21,420kmです' },
  },
  '7/999_27': {
    name: 'K1600 グランドアメリカ（K1600 Grand America）',
    titleSuffix: '中古車在庫と価格帯',
    usedNone: { checkedAt: '2026-11-05' },
  },
  '1/999_110': {
    usedNow: { min: 310000, max: 310000, count: 1, checkedAt: '2026-11-05', note: '価格は車両価格で、掲載1台の支払総額は380,000円、走行距離は78,731km、車検なしです' },
  },
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
