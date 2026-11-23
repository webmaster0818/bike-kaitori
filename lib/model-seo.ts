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
    /** 表の見出し（省略時は「グレード別」）。別車種への導線のときに使う */
    heading?: string
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
  // 「スピードマスター865 中古」の主ページ＝旧型（21_1）。現行 1200cc（999_1）は役割を分けて主ページへ導線（2026-11-11）
  '10/21_1': {
    name: 'スピードマスター865（Speedmaster 865cc）',
    titleSuffix: '中古車価格帯と流通台数',
    usedNow: { min: 248000, max: 799700, count: 2, checkedAt: '2026-11-11', note: '価格は車両価格で、865cc の年式（2005〜2015年式）の2台＝2007年式 248,000円（支払総額 328,000円・22,202km）・2011年式 799,700円（支払総額 913,000円・10,886km）です。カタログの価格帯表示は248,000円〜1,188,000円（3台）ですが、1,188,000円の1台は2021年式で、この車種の年式（2003〜2015年式）の範囲外のため除いています。バイクブロスのカタログでは2003年発売、2005年から865cc（2003・2004年式は790cc）です' },
    family: {
      heading: '別の車種',
      text: '2018年モデルから販売されている水冷 1200cc の「ボンネビル スピードマスター」は、カタログ上の後継にあたる別の車種で、別ページで扱っています。',
      items: [{ label: 'ボンネビル スピードマスター（1200cc・2018年モデル〜）', href: '/model/triumph-999-1/', count: 9, min: 1251000, max: 1899000 }],
      checkedAt: '2026-11-11',
    },
  },
  '10/999_1': {
    usedNow: { min: 1251000, max: 1899000, count: 9, checkedAt: '2026-11-11', note: '価格は車両価格で、掲載9台は初度登録2018〜2026年、走行72km〜12,864km、支払総額は1,352,000円〜2,041,300円です。新車の実勢価格はカタログで1,938,600円〜2,265,000円（8台）です' },
    family: {
      heading: '旧型（865cc）',
      text: '当ページは2018年モデルからの 1200cc「ボンネビル スピードマスター」を扱います。2003〜2015年式の旧型 Speedmaster（2005年式から865cc）は別の車種で、次のページで扱っています。',
      items: [{ label: 'スピードマスター865（旧型）', href: '/model/triumph-21-1/', count: 2, min: 248000, max: 799700 }],
      checkedAt: '2026-11-11',
    },
  },
  '10/999_70': {
    usedNow: { min: 700000, max: 875000, count: 13, checkedAt: '2026-11-07', note: '価格は車両価格で、掲載13台は2026年式または2026年初度登録、走行4km〜3,665kmです。新車の実勢価格はカタログで846,000円〜869,900円（19台）です' },
  },
  '5/999_63': {
    name: 'FLTC ツアーグライドクラシック',
    titleSuffix: '中古車価格と新車の有無',
    usedNow: { min: 1770000, max: 2288000, count: 2, checkedAt: '2026-11-14', note: '価格は車両価格で、2台は1988年式のサイドカー付き（走行30,552km・支払総額2,076,000円）と1987年初度登録の5速 エボリューション（支払総額2,480,000円）です' },
    newCar: {
      text: 'ハーレーダビッドソン公式サイト（日本）の現行モデル一覧に掲載がなく、バイクブロスの新車の販売車両も0台です。バイクブロスのカタログに掲載されている年式は1981〜1991年式です。',
      descText: '新車は公式の現行モデル一覧に掲載がなく、バイクブロスの販売車両も0台です（2026-11-14確認）。',
      sources: [
        { label: 'ハーレーダビッドソン公式 現行モデル一覧', url: 'https://www.harley-davidson.com/jp/ja/motorcycles/index.html' },
        { label: 'バイクブロス 新車ページ', url: 'https://www.bikebros.co.jp/catalog/5/999_63/new-bike/' },
      ],
      checkedAt: '2026-11-14',
    },
  },
  '5/1_25': { name: 'CVO FLSTSE3 ソフテイルコンバーチブル', titleSuffix: '中古車価格帯と流通台数' },
  '1/196_3': {
    name: 'NC700S・NC700S DCT',
    titleSuffix: '中古車価格帯と流通台数',
    usedNow: { min: 368000, max: 558000, count: 9, checkedAt: '2026-11-14', note: '車両名に「DCT」とあるのは1台（2013年式・558,000円・支払総額685,200円・走行14,861km）で、残り8台（368,000円〜460,000円）は車両名・車両詳細に「DCT」の記載がありません' },
    newCar: {
      text: '発売当時のメーカー希望小売価格（消費税5%込み）は、NC700S Dual Clutch Transmission＜ABS＞が701,400円（2012年6月14日発売）、NC700S が598,500円・NC700S＜ABS＞が647,850円（2012年4月17日発表）です。バイクブロスのカタログに新車の価格・販売車両の掲載はありません',
      descText: 'DCT＜ABS＞の発売当時のメーカー希望小売価格は701,400円です（Honda 2012年6月7日発表）。',
      sources: [
        { label: 'Honda ニュースリリース 2012年6月7日（DCT＜ABS＞）', url: 'https://global.honda/jp/news/2012/2120607-nc700s.html' },
        { label: 'Honda ニュースリリース 2012年4月17日（NC700S）', url: 'https://global.honda/jp/news/2012/2120417-nc700s.html' },
      ],
      checkedAt: '2026-11-14',
    },
  },
  '8/7_3': {
    name: '750 PASO（750パゾ・750パソ）',
    titleSuffix: '中古車価格帯と流通台数',
    usedNow: { min: 769900, max: 1320000, count: 2, checkedAt: '2026-11-14', note: '価格は車両価格で、2台は1987年式（初度登録1995年・走行24,032km・支払総額1,470,000円）と年式不明（初度登録1987年・走行18,004km・支払総額939,900円）です' },
  },
  '4/80_2': {
    name: 'ZEPHYR550（ゼファー550）',
    titleSuffix: '中古車価格帯と流通台数',
    usedNow: { min: 597000, max: 1500000, count: 12, checkedAt: '2026-11-14', note: '価格は車両価格で、支払総額は600,000円〜1,600,000円です。年式の記載がある5台は1990〜1995年式で、2台は「走行距離疑義車」の表示があります' },
    newCar: {
      text: 'カワサキ公式サイト（日本）のモデル一覧に掲載がなく、バイクブロスの新車の販売車両も0台です。',
      descText: '新車は公式のモデル一覧に掲載がなく、バイクブロスの販売車両も0台です（2026-11-14確認）。',
      sources: [
        { label: 'カワサキ公式サイト（日本）', url: 'https://www.kawasaki-motors.com/ja-jp/' },
        { label: 'バイクブロス 新車ページ', url: 'https://www.bikebros.co.jp/catalog/4/80_2/new-bike/' },
      ],
      checkedAt: '2026-11-14',
    },
  },
  '14/999_20': {
    name: 'ツーリズモベローチェ800 LUSSO SCS',
    titleSuffix: '中古車価格帯と流通台数',
    usedNow: { min: 1580000, max: 1750000, count: 2, checkedAt: '2026-11-14', note: '価格は車両価格で、2台は2020年式（走行3,800km・支払総額1,800,000円）と年式不明・初度登録2025年（走行930km・支払総額1,599,800円）です。新車の実勢価格はカタログで3,450,000円（2台）です' },
  },
  '1/156_7': { name: 'フォルツァS（FORZA S）', titleSuffix: '中古車価格帯と流通台数', usedNow: { min: 219000, max: 440000, count: 3, checkedAt: '2026-11-04' } },
  '8/15_4': { name: 'スクランブラークラシック（Scrambler Classic）', titleSuffix: '中古車価格帯と流通台数', usedNow: { min: 568000, max: 658000, count: 2, checkedAt: '2026-11-04' } },
  '1/128_4': {
    name: 'マイティDAX ST90（MIGHTY DAX・マイティダックス）',
    titleSuffix: '中古車価格帯と流通台数',
    usedNow: { min: 438000, max: 1430000, count: 3, checkedAt: '2026-11-10', note: '価格は車両価格で、掲載3台は438,000円・565,000円・1,430,000円（1972年式のフルレストア車）、支払総額は458,000円〜1,452,000円です' },
  },
  '5/2_10': {
    name: 'FLD スイッチバック（Dyna Switchback）',
    titleSuffix: '中古車価格帯と流通台数',
    usedNow: { min: 980000, max: 1430000, count: 11, checkedAt: '2026-11-10', note: '価格は車両価格で、年式の記載がある10台は2012〜2016年式、支払総額は1,046,000円〜1,480,000円です' },
  },
  '8/15_1': {
    name: 'スクランブラー アイコン（Scrambler Icon）',
    titleSuffix: '中古車価格帯と流通台数',
    usedNow: { min: 498000, max: 1330000, count: 27, checkedAt: '2026-11-10', note: '価格は車両価格で、支払総額は552,200円〜1,470,000円です。新車の実勢価格はカタログで1,380,000円（2台）です' },
  },
  '41/999_10': {
    usedNow: { min: 258000, max: 398000, count: 3, checkedAt: '2026-11-10', note: '価格は車両価格で、支払総額は338,900円〜471,000円です' },
  },
  '1/44_2': {
    name: 'NSR50（Nチビ）',
    titleSuffix: '中古車価格帯と流通台数',
    usedNow: { min: 448000, max: 1430000, count: 17, checkedAt: '2026-11-10', note: '価格は車両価格で、支払総額は458,000円〜1,450,000円です' },
  },
  '8/15_7': {
    name: 'スクランブラー デザートスレッド（Scrambler DESERT SLED）',
    titleSuffix: '中古車価格帯と流通台数',
    usedNow: { min: 821000, max: 1215500, count: 4, checkedAt: '2026-11-16', note: '価格は車両価格で、掲載4台の支払総額は938,000円〜1,281,500円、走行距離は4,077km〜21,420kmです' },
    family: {
      heading: '年式別',
      text: '在庫一覧の4台をモデル年式で分けた車両価格です。',
      items: [
        { label: '2018年式', count: 3, min: 821000, max: 1030000 },
        { label: '2021年式', count: 1, min: 1215500, max: 1215500 },
      ],
      checkedAt: '2026-11-16',
    },
  },
  '7/999_27': {
    name: 'K1600 グランドアメリカ（K1600 Grand America）',
    titleSuffix: '中古車在庫と価格帯',
    usedNone: { checkedAt: '2026-11-16' },
  },
  // 「crf250x 中古」8@21.1（9/13〜11/13）。title・h1 は車名を含むため据え置き（2026-11-16）
  '1/13_12': {
    usedNow: { min: 658000, max: 898000, count: 2, checkedAt: '2026-11-16', note: '価格は車両価格で、2台とも2004年式の逆輸入車（どちらも「走行距離疑義車」の表示あり）、支払総額は693,000円〜998,000円です' },
    newCar: {
      text: '国内仕様の CRF250X は、Honda が2010年11月9日に受注期間限定で発売したエンデューロレース専用車で、公道を走行できず、登録してナンバープレートを取得することもできません。発売時のメーカー希望小売価格は699,300円（消費税5%込み・販売計画は国内年間100台）です。バイクブロスのカタログに新車の価格・販売車両の掲載はありません',
      descText: '国内仕様は2010年発売のレース専用車（公道走行不可）です。',
      sources: [{ label: 'Honda ニュースリリース 2010年10月4日', url: 'https://global.honda/jp/news/2010/2101004-crf250x.html' }],
      checkedAt: '2026-11-16',
    },
  },
  // 落ちたページ（10/14 の1クリック→0）。「nsr80 中古」6@22.2（9/13〜11/13）。title・h1 は車名を含むため据え置き（2026-11-16）
  '1/44_5': {
    usedNow: { min: 1260000, max: 1870000, count: 5, checkedAt: '2026-11-16', note: '価格は車両価格で、支払総額は1,290,000円〜1,881,000円、走行距離は411km〜6,765kmです。モデル年式の記載がある4台は1988年式2台・1989年式1台・1997年式1台、残り1台は年式不明（初度登録1999年）です' },
    newCar: {
      text: '発売当時の価格は、1987年11月25日発売の初代が全国標準現金価格249,000円、1989年型がメーカー希望小売価格250,000円（消費税を含まず）、1999年型（レプソルホンダカラー）が同299,000円（消費税を含まず）です。バイクブロスのカタログに新車の価格・販売車両の掲載はありません',
      descText: '発売当時の価格は249,000円〜299,000円（税抜）です。',
      sources: [
        { label: 'Honda ニュースリリース 1987年11月24日', url: 'https://global.honda/jp/news/1987/2871124.html' },
        { label: '同 1989年5月22日', url: 'https://global.honda/jp/news/1989/2890522.html' },
        { label: '同 1999年1月20日', url: 'https://global.honda/jp/news/1999/2990120.html' },
      ],
      checkedAt: '2026-11-16',
    },
  },
  '1/999_110': {
    usedNow: { min: 310000, max: 310000, count: 1, checkedAt: '2026-11-05', note: '価格は車両価格で、掲載1台の支払総額は380,000円、走行距離は78,731km、車検なしです' },
  },
  '2/999_90': {
    usedNow: { min: 278100, max: 509000, count: 73, checkedAt: '2026-11-14', note: '在庫一覧の件数表示は72件です' },
    sales: {
      text: 'ヤマハ発動機のニュースリリース（2026年5月13日発表・発売日 2026年6月30日）と製品ページに車種別の販売台数の記載はなく、公表値は見当たりません。全国軽自動車協会連合会の統計はメーカー別・都道府県別で、車種別の表はありません。当ページの台数はバイクブロスに掲載中の在庫台数で、販売台数ではありません。',
      descText: '車種別の販売台数の公表値は見当たりません（2026-11-14確認）。',
      sources: [
        { label: 'ヤマハ発動機 ニュースリリース', url: 'https://global.yamaha-motor.com/jp/news/2026/0513/xsr155.html' },
        { label: 'ヤマハ発動機 XSR155 製品ページ', url: 'https://www.yamaha-motor.co.jp/mc/lineup/xsr155/' },
        { label: '全国軽自動車協会連合会 二輪車の統計', url: 'https://www.zenkeijikyo.or.jp/statistics/2ken' },
      ],
      checkedAt: '2026-11-14',
    },
  },
  '4/999_128': {
    usedNow: { min: 478000, max: 648000, count: 66, checkedAt: '2026-11-14', note: '価格は車両価格で、支払総額は543,100円〜738,000円、走行距離は1km〜7,496kmです' },
    family: {
      heading: '初度登録年別',
      text: '在庫一覧の66台を初度登録年で分けた車両価格です。',
      items: [
        { label: '2024年', count: 5, min: 517000, max: 588000 },
        { label: '2025年', count: 30, min: 478000, max: 648000 },
        { label: '2026年', count: 21, min: 488000, max: 624800 },
        { label: '初度登録の記載なし・年式不明', count: 10, min: 539900, max: 609900 },
      ],
      checkedAt: '2026-11-14',
    },
    newCar: {
      text: 'カワサキ公式の製品ページでは、2026年モデル W230 のメーカー希望小売価格は665,500円です。新車の実勢価格はバイクブロスのカタログで545,000円〜798,000円（224台）です',
      descText: '2026年モデルのメーカー希望小売価格は665,500円です（2026-11-14確認）。',
      sources: [
        { label: 'カワサキ W230 製品ページ', url: 'https://www.kawasaki-motors.com/ja-jp/motorcycle/w/retro-classic/w230' },
        { label: 'バイクブロス カタログ', url: 'https://www.bikebros.co.jp/catalog/4/999_128/' },
      ],
      checkedAt: '2026-11-14',
    },
    sales: {
      text: 'カワサキの製品ページに車種別の販売台数の記載はなく、公表値は見当たりません。全国軽自動車協会連合会の統計はメーカー別・都道府県別で、車種別の表はありません。当ページの台数はバイクブロスに掲載中の在庫台数で、販売台数ではありません。',
      descText: '車種別の販売台数の公表値は見当たりません（2026-11-14確認）。',
      sources: [
        { label: 'カワサキ W230 製品ページ', url: 'https://www.kawasaki-motors.com/ja-jp/motorcycle/w/retro-classic/w230' },
        { label: '全国軽自動車協会連合会 二輪車の統計', url: 'https://www.zenkeijikyo.or.jp/statistics/2ken' },
      ],
      checkedAt: '2026-11-14',
    },
  },
  '4/999_115': {
    usedNow: { min: 598000, max: 1280000, count: 88, checkedAt: '2026-11-14', note: '価格は車両価格で、支払総額は724,400円〜1,369,000円、走行距離は45km〜29,914kmです' },
    family: {
      heading: '初度登録年別',
      text: '在庫一覧の88台を初度登録年で分けた車両価格です。',
      items: [
        { label: '2022年', count: 24, min: 688000, max: 1280000 },
        { label: '2023年', count: 27, min: 598000, max: 998000 },
        { label: '2024年', count: 23, min: 748000, max: 999900 },
        { label: '2025年', count: 5, min: 717000, max: 1045000 },
        { label: '2026年', count: 9, min: 792000, max: 1038000 },
      ],
      checkedAt: '2026-11-14',
    },
    newCar: {
      text: 'カワサキ公式の製品ページでは、メーカー希望小売価格は2026年モデル・2027年モデルの Z650RS が1,089,000円、2027年モデルの Z650RS Black Ball Edition が1,111,000円です（いずれもカワサキプラザ専用モデル）。新車の実勢価格はバイクブロスのカタログで1,056,000円〜1,111,000円（81台）です',
      descText: 'メーカー希望小売価格は1,089,000円です（2026-11-14確認）。',
      sources: [
        { label: 'カワサキ Z650RS 製品ページ', url: 'https://www.kawasaki-motors.com/ja-jp/motorcycle/z/retro-sport/z650rs' },
        { label: 'バイクブロス カタログ', url: 'https://www.bikebros.co.jp/catalog/4/999_115/' },
      ],
      checkedAt: '2026-11-14',
    },
    sales: {
      text: 'カワサキの製品ページに車種別の販売台数の記載はなく、公表値は見当たりません。全国軽自動車協会連合会の統計はメーカー別・都道府県別で、車種別の表はありません。当ページの台数はバイクブロスに掲載中の在庫台数で、販売台数ではありません。',
      descText: '車種別の販売台数の公表値は見当たりません（2026-11-14確認）。',
      sources: [
        { label: 'カワサキ Z650RS 製品ページ', url: 'https://www.kawasaki-motors.com/ja-jp/motorcycle/z/retro-sport/z650rs' },
        { label: '全国軽自動車協会連合会 二輪車の統計', url: 'https://www.zenkeijikyo.or.jp/statistics/2ken' },
      ],
      checkedAt: '2026-11-14',
    },
  },
  // 「バルカン900カスタム 中古」2@19.5（10/21〜11/18）・9/15〜「中古」11@24.0・「新車」10@31.2。title・h1 は車名「バルカン900カスタム」を含むため据え置き（2026-11-21）
  '4/87_7': {
    usedNow: { min: 650000, max: 715000, count: 2, checkedAt: '2026-11-21', note: '価格は車両価格で、2台は2007年式（走行5,440km・支払総額750,000円）と年式不明・初度登録2009年（走行15,884km・支払総額757,000円）です' },
    newCar: {
      text: 'カワサキの国内向け公式サイトの主要諸元（保存版）では、メーカー希望小売価格（消費税5%・リサイクル費用込み）は2007年2月の発売時が840,000円、2008年12月・2010年10月時点が870,000円です。現在のカワサキ公式サイト（日本）のモデル一覧には掲載がなく（VULCAN の現行モデルは VULCAN S のみ）、バイクブロスの新車の販売車両も0台です',
      descText: '新車のメーカー希望小売価格は840,000円〜870,000円（税5%込み）で、現行の公式モデル一覧に掲載はありません。',
      sources: [
        { label: 'カワサキ公式 VULCAN 900 Custom 主要諸元（2007年2月の保存版）', url: 'https://web.archive.org/web/20070216043906/http://www.kawasaki-motors.com:80/model/vulcan900custom/spec.jsp' },
        { label: '同（2008年12月の保存版）', url: 'https://web.archive.org/web/20081204093351/http://www.kawasaki-motors.com:80/model/vulcan900custom/spec.jsp' },
        { label: '川崎重工業 ニュースリリース 2007年1月12日（英語）', url: 'https://global.kawasaki.com/en/corp/newsroom/news/detail/ba_c3070112_3.html' },
        { label: 'バイクブロス 新車ページ', url: 'https://www.bikebros.co.jp/catalog/4/87_7/new-bike/' },
      ],
      checkedAt: '2026-11-21',
    },
  },
  // 「nc700x タイプld dct 中古」18@22.6・「nc700x 中古」14@21.4・「nc700x dct 中古」11@21.5・「…新車」15@37.3（9/15〜11/19）。title・h1 は車名「NC700X/DCT/Type LD」を含むため据え置き。在庫一覧リンクは 10/20 追加済み（2026-11-23）
  '1/196_1': {
    usedNow: { min: 250000, max: 572000, count: 10, checkedAt: '2026-11-23', note: '価格は車両価格で、支払総額は290,000円〜683,100円、掲載10台は2012・2013年式（年式不明1台は初度登録2013年）です。バイクブロスの在庫の分類では、タイプLD DCT が2台（2013年式・走行18,788km・555,000円／年式不明・初度登録2013年・走行13,681km・572,000円）で、標準の DCT（タイプLD でないもの）は0台です' },
    family: {
      heading: 'タイプ別',
      text: 'バイクブロスの在庫一覧は NC700X・タイプLD・DCT・タイプLD DCT の4つに分かれています。在庫のある分類の台数と車両価格は次のとおりです（DCT の分類は0台）。',
      items: [
        { label: 'NC700X（DCT・タイプLD 以外）', count: 7, min: 250000, max: 550000 },
        { label: 'NC700X タイプLD', count: 1, min: 396000, max: 396000 },
        { label: 'NC700X タイプLD DCT', count: 2, min: 555000, max: 572000 },
      ],
      checkedAt: '2026-11-23',
    },
    newCar: {
      text: '発売当時のメーカー希望小売価格（消費税5%込み）は、NC700X Dual Clutch Transmission＜ABS＞と NC700X TypeLD Dual Clutch Transmission＜ABS＞がともに752,850円（2012年6月14日発売・TypeLD は受注生産車）、NC700X TypeLD が649,950円・TypeLD＜ABS＞が699,300円、2012年2月24日発売の NC700X が649,950円・NC700X＜ABS＞が699,300円です。現在の Honda 公式のバイク製品ラインアップに NC700X の掲載はなく（後継の NC750X は掲載あり）、バイクブロスの新車の販売車両も0台です',
      descText: 'タイプLD DCT の発売当時のメーカー希望小売価格は752,850円（税5%込み）で、新車は現在販売されていません。',
      sources: [
        { label: 'Honda ニュースリリース 2012年6月7日（DCT・TypeLD 追加）', url: 'https://global.honda/jp/news/2012/2120607-nc700x.html' },
        { label: 'Honda ニュースリリース 2012年2月17日（NC700X）', url: 'https://global.honda/jp/news/2012/2120217-nc700x.html' },
        { label: 'Honda バイク製品ラインアップ', url: 'https://www.honda.co.jp/motor-lineup/' },
        { label: 'バイクブロス 新車ページ', url: 'https://www.bikebros.co.jp/catalog/1/196_1/new-bike/' },
      ],
      checkedAt: '2026-11-23',
    },
  },
  // 落ちたページ（10/13 の2クリック→0）。URL 検査は Submitted and indexed・最終クロール 9/18（2026-11-14）
  '11/999_23': {
    usedNow: { min: 777000, max: 979000, count: 6, checkedAt: '2026-11-14', note: '価格は車両価格で、支払総額は845,000円〜1,110,000円、年式の記載がある4台は2020〜2021年式、走行距離は2,223km〜13,200kmです' },
    newCar: {
      text: '発売時のメーカー希望小売価格（消費税10%込み）は、RS 660 が1,397,000円（2020年12月8日発表）、特別仕様車 RS 660 エクストリーマが1,815,000円（2023年5月30日発表）です。現行の価格はアプリリア公式サイトを確認できていません。新車の実勢価格はバイクブロスのカタログで1,320,000円〜1,815,000円（10台）です',
      descText: '発売時のメーカー希望小売価格は1,397,000円（税込）です（2020年12月8日発表）。',
      sources: [
        { label: 'ピアッジオ グループ ジャパン ニュースリリース PGJPR20-026', url: 'https://www.piaggio.co.jp/2020PR/PGJPR20-026.pdf' },
        { label: '同 PGJPR23-022（エクストリーマ）', url: 'https://www.piaggio.co.jp/2023PR/PGJPR23-022.pdf' },
      ],
      checkedAt: '2026-11-14',
    },
  },
}
