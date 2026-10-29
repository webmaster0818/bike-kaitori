// 収集済みスナップショットの読み込みと、サイト全体で使う派生値。
//
// ■ 数値の扱い（STRATEGY.md の「絶対に守る」を実装で担保する）
//   ・ここで扱うのは **中古の流通価格**であって買取価格ではない。買取価格は公表されていない。
//   ・全レコードが source_url と fetched_at を持つ。画面には必ず両方を出す。
//   ・流通データが取れなかった車種はそもそも models に入っていない（収集側の品質ゲート）。
import fs from 'node:fs'
import path from 'node:path'

export type Model = {
  model_id: string
  maker: string
  maker_id: string
  name: string
  source_url: string
  fetched_at: string
  used_count: number
  used_price_min: number
  used_price_max: number
  new_price_min?: number
  new_price_max?: number
  new_count?: number
  category?: string
  category_rank?: number
  review_score?: number
  review_count?: number
  owner_count?: number
  displacement_cc?: number
  class_label?: string
  /** 出典サイトの中古車在庫一覧（カタログの「〇〇の中古車を見る」リンク先） */
  listing_url?: string
}

type Snapshot = {
  generated_at: string
  source: string
  source_url: string
  models: Model[]
}

const MAKER_EN: Record<string, string> = {
  ホンダ: 'honda', ヤマハ: 'yamaha', スズキ: 'suzuki', カワサキ: 'kawasaki',
  ハーレーダビッドソン: 'harley-davidson', ビーエムダブリュー: 'bmw', ドゥカティ: 'ducati',
  トライアンフ: 'triumph', ケーティーエム: 'ktm', MVアグスタ: 'mv-agusta',
  モトグッツィ: 'moto-guzzi', アプリリア: 'aprilia', ハスクバーナ: 'husqvarna',
  ピアジオ: 'piaggio', ベスパ: 'vespa', インディアン: 'indian',
  ヴィクトリー: 'victory', キムコ: 'kymco', ビューエル: 'buell',
}

function latestSnapshotPath(): string {
  const dir = path.join(process.cwd(), 'data', 'stock')
  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.json')).sort()
  if (!files.length) throw new Error('data/stock にスナップショットがありません')
  return path.join(dir, files[files.length - 1])
}

let cache: Snapshot | null = null
export function snapshot(): Snapshot {
  if (!cache) cache = JSON.parse(fs.readFileSync(latestSnapshotPath(), 'utf-8'))
  return cache!
}

export function allModels(): Model[] {
  return snapshot().models
}

/**
 * 中古車在庫一覧の URL。スナップショットに listing_url があればそれを、
 * 無ければ data/listing-urls.json（出典カタログから目視で写した分）を使う。どちらも無ければ出さない。
 * ⚠️ カタログID（例 87_18）と在庫検索ID（例 1040313）は別体系で、計算では作れない。推測で組み立てないこと。
 */
let listingCache: Record<string, string> | null = null
export function listingUrl(m: Model): string | undefined {
  if (m.listing_url) return m.listing_url
  if (!listingCache) {
    const f = path.join(process.cwd(), 'data', 'listing-urls.json')
    listingCache = fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf-8')).urls ?? {} : {}
  }
  // model_id はメーカーをまたいで重複する（例 999_63＝ハーレー FLTC と BMW R18 B）ので、maker_id と組で引く
  return listingCache![`${m.maker_id}/${m.model_id}`]
}

export function makerSlug(maker: string): string {
  return MAKER_EN[maker] ?? maker.toLowerCase()
}

/** URLは /model/{メーカー英名}-{カタログID}/ 。IDのアンダースコアはハイフンにする。 */
export function modelSlug(m: Model): string {
  return `${makerSlug(m.maker)}-${m.model_id.replace('_', '-')}`
}

export function findBySlug(slug: string): Model | undefined {
  return allModels().find((m) => modelSlug(m) === slug)
}

/** 排気量クラス。バイクブロスの表記をそのままURL化すると全角が入るので対応表を持つ。 */
export const CLASSES: { slug: string; label: string; match: string }[] = [
  { slug: '50cc', label: '50cc以下（原付一種）', match: '50cc以下' },
  { slug: '125cc', label: '51〜125cc（原付二種）', match: '51～125cc' },
  { slug: '250cc', label: '126〜250cc', match: '126～250cc' },
  { slug: '400cc', label: '251〜400cc', match: '251～400cc' },
  { slug: '750cc', label: '401〜750cc', match: '401～750cc' },
  { slug: 'over750cc', label: '751〜1000cc', match: '751～1000cc' },
  { slug: 'over1000cc', label: '1001cc以上', match: '1001cc以上' },
]

export function classOf(m: Model) {
  return CLASSES.find((c) => c.label === m.class_label || c.match === m.class_label)
}

export const yen = (n: number) => `${n.toLocaleString()}円`

/** 価格帯の広さ（最大÷最小）。大きいほど状態で値が振れる＝複数社で査定を取る価値が高い。 */
export function spread(m: Model): number {
  return m.used_price_max / m.used_price_min
}

/**
 * 「強気に出られるか、早めに売るべきか」の判定。
 * 買取価格が公表されていない以上、断定はしない。**流通台数という観測事実からの示唆**として出す。
 * しきい値は同クラス内の相対位置で決める（絶対台数だと排気量クラスの規模差をそのまま拾ってしまう）。
 */
export type Stance = { key: 'scarce' | 'normal' | 'saturated'; label: string; lead: string }

export function stance(m: Model, peers: Model[]): Stance {
  const counts = peers.map((p) => p.used_count).sort((a, b) => a - b)
  const q = (r: number) => counts[Math.min(counts.length - 1, Math.floor(counts.length * r))]
  if (m.used_count <= q(0.33)) {
    return {
      key: 'scarce',
      label: '流通量が少ない車種',
      lead: '買い手から見ると代替となる車両を見つけにくいため、売却を急ぐ必要性は比較的小さいと考えられます。',
    }
  }
  if (m.used_count >= q(0.85)) {
    return {
      key: 'saturated',
      label: '流通量が多い車種',
      lead: '在庫が多い分、取引条件は買い手に有利になりやすいため、売却を決めている場合は早めに判断することも選択肢となります。',
    }
  }
  return {
    key: 'normal',
    label: '流通量が平均的な車種',
    lead: '流通台数からは売り手・買い手のどちらが有利とも判断できないため、年式・走行距離・状態などの個体差が査定結果を大きく左右します。',
  }
}

export const SITE = {
  name: 'バイク買取ナビ',
  // ⚠️ ドメインはMediaXAI側で取得中。確定したらここだけ差し替える（canonical・sitemapが追随する）。
  origin: 'https://biker-sell.com',
  description:
    '中古バイクの流通台数と価格帯を車種ごとに公開しています。買取価格は各社が公表していないため、当サイトでは断定を控え、出典を明記した実データのみを掲載しています。',
}

/**
 * 排気量の表示（2026-10-21 追加）。
 * 出典カタログの車種トップの「排気量」は1つの年式の諸元だけなので、年式で排気量が違う車種で
 * その値を全年式の値のように出さないよう、data/displacement-years.json（scripts/collect-displacement-years.py）
 * で年式ページごとに確認した値を使って年式を明記する。
 *   ・全年式を確認でき、全て同じ値           → 「669cc」（従来どおり）
 *   ・年式で値が違う（年式ページで確認できた分） → 「1584cc（2007〜2011年式。2002〜2006年式は 1449cc）」
 *   ・年式ページで確認できない年式がある／下記の除外 → 「1690cc（2017年式の値）」のように年式だけ明記
 * ・差が3%未満の値（124/124.8・248/249・1689/1690 など）は表記の丸め違いとして同じ値に扱う
 *   （例 PCX: Honda 公式は 124cm³、出典は年式により 124 と 124.8 が混在）。
 * ・ハーレーダビッドソンは年式別の値を出さず年式の明記だけにする。出典の年式ページでは 2012〜2016年式の
 *   Dyna/Softail が 1584cc（ツインカム96）だが、2012年からツインカム103（1690cc）とする資料があり
 *   （FXDF・FLS 等）、公式で確認できないため（2026-10-21）。
 * ⚠️ 年式ページで読めなかった値は推測で埋めない。
 */
type DispYears = {
  top_cc: number | null
  top_year: number | null
  variants: { id: string; year: number | null; cc: number | null }[]
}
let dispCache: Record<string, DispYears> | null = null
const YEAR_ONLY_MAKERS = new Set(['5']) // ハーレーダビッドソン（上記）
const SAME_RATIO = 0.03

/** 差が3%未満の値を1つにまとめる。戻り値は 値→まとまりの表示（「1689〜1690cc」など） */
function clusterCc(ccs: number[]): Map<number, string> {
  const u = [...new Set(ccs)].sort((a, b) => a - b)
  const out = new Map<number, string>()
  let cur: number[] = []
  const flush = () => {
    const label = cur.length === 1 ? `${cur[0]}cc` : `${cur[0]}〜${cur[cur.length - 1]}cc`
    for (const c of cur) out.set(c, label)
  }
  for (const c of u) {
    if (cur.length && (c - cur[0]) / cur[0] >= SAME_RATIO) { flush(); cur = [] }
    cur.push(c)
  }
  if (cur.length) flush()
  return out
}

/**
 * まとまりごとに、出典に載っている年式を「2008〜2011」のようにまとめる。
 * 区間は出典の年式一覧で連続しているもの（間の年が出典に無い場合もある）。
 * 同じ年式に排気量の違う仕様がある場合、その年式は両方に入る（overlap=true）。
 */
function groupByCc(vs: { year: number; key: string }[]): { groups: Map<string, string>; overlap: boolean } {
  const years = [...new Set(vs.map((v) => v.year))].sort((a, b) => a - b)
  const byKey = new Map<string, Set<number>>()
  for (const v of vs) byKey.set(v.key, (byKey.get(v.key) ?? new Set()).add(v.year))
  const overlap = years.some((y) => [...byKey.values()].filter((s) => s.has(y)).length > 1)
  const groups = new Map<string, string>()
  for (const [key, set] of byKey) {
    const parts: string[] = []
    for (let i = 0; i < years.length; i++) {
      if (!set.has(years[i])) continue
      let j = i
      while (j + 1 < years.length && set.has(years[j + 1])) j++
      parts.push(i === j ? `${years[i]}` : `${years[i]}〜${years[j]}`)
      i = j
    }
    groups.set(key, parts.join('・'))
  }
  return { groups, overlap }
}

/**
 * メーカー公式の諸元と出典の値が食い違う車種（公式ページを開いて確認したものだけ）。
 * キーは maker_id/model_id。ここにある車種は公式の値と確認元を出す。
 * ・1/999_147・999_185・999_164 Rebel 1100 / S Edition / 1100T：出典の 2025年式は 1084cc だが、
 *   Honda 公式（https://www.honda.co.jp/Rebel1100/ 主要諸元・2025年3月現在・8BL-SC87、3タイプ共通）は 1,082cm³。
 *   出典の 2021〜2024年式も 1082cc（2026-10-22 確認）
 */
const OFFICIAL_CC: Record<string, { cc: number | null; label: string }> = {
  '1/999_147': { cc: 1082, label: 'Honda 公式の主要諸元。2026-10-22 確認' },
  '1/999_185': { cc: 1082, label: 'Honda 公式の主要諸元。2026-10-22 確認' },
  '1/999_164': { cc: 1082, label: 'Honda 公式の主要諸元。2026-10-22 確認' },
  // ヤマハ公式 機能・装備ページ「排気量320cm3のMT-03」「排気量320cm3のYZF-R3」（2026-10-23 確認）。
  // https://www.yamaha-motor.co.jp/mc/lineup/mt-25/feature.html ・ /mc/lineup/yzf-r25/feature.html
  // 主要諸元の表（spec.html）は諸元データ JSON が 503 で読めなかった。出典カタログは 2025年式以降 321cc
  '2/43_8': { cc: 320, label: 'ヤマハ公式の製品ページ。2026-10-23 確認' },
  '2/106_12': { cc: 320, label: 'ヤマハ公式の製品ページ。2026-10-23 確認' },
  // カワサキ公式 2027年モデルの主要諸元「総排気量 1,098cm³」（2026-10-24 確認・5車種とも同じ）。出典カタログは 1098.9cc
  // https://www.kawasaki-motors.com/ja-jp/motorcycle/z/supernaked/z1100/2027-z1100 ・ /2027-z1100-se
  // /ja-jp/motorcycle/ninja/sport/ninja-1100sx/2027-ninja-1100sx ・ /2027-ninja-1100sx-se
  // /ja-jp/motorcycle/versys/adventure-touring/versys-1100/2027-versys-1100-se
  '4/73_10': { cc: 1098, label: 'カワサキ公式の主要諸元。2026-10-24 確認' },
  '4/999_141': { cc: 1098, label: 'カワサキ公式の主要諸元。2026-10-24 確認' },
  '4/999_135': { cc: 1098, label: 'カワサキ公式の主要諸元。2026-10-24 確認' },
  '4/999_136': { cc: 1098, label: 'カワサキ公式の主要諸元。2026-10-24 確認' },
  '4/999_134': { cc: 1098, label: 'カワサキ公式の主要諸元。2026-10-24 確認' },
  // スズキ公式ニュースリリース 2026/1/22「新型GSX-8T、新型GSX-8TTを日本で発売」本文「775cm3 のコンパクトなエンジン」（2026-10-25 確認）
  // https://www.suzuki.co.jp/release/b/2026/0122/pdf/0122.pdf 。製品サイト www1.suzuki.co.jp の諸元ページは 10/24・10/25 とも 503。
  // 出典カタログは 775.8cc（年式ページに 776.0cc もあり）
  // 2026-10-27: 製品サイトの主要諸元（型式 8BL-EM1AA「総排気量 775cm3」）も読めたので確認元を差し替え
  // https://www1.suzuki.co.jp/motor/lineup/gsx800ttrqbm6/?page=style
  '3/999_113': { cc: 775, label: 'スズキ公式の主要諸元。2026-10-27 確認' },
  // Honda 公式 製品ページの主要諸元（2026-10-26 確認）。出典カタログは小数第1位まで（PCX 2021年式以降 124.8cc・CB1000F 999.8cc）
  // https://www.honda.co.jp/PCX/ 「PCX 8BJ-JK05 総排気量 124」（2025年1月現在）
  // https://www.honda.co.jp/CB1000F/ 「CB1000F／CB1000F SE 8BL-SC94 総排気量 999」（2025年10月現在）
  '1/192_1': { cc: 124, label: 'Honda 公式の主要諸元。2026-10-26 確認' },
  '1/999_187': { cc: 999, label: 'Honda 公式の主要諸元。2026-10-26 確認' },
  // ヤマハ公式 製品ページ「価格・仕様」の主要諸元（各ページが読む諸元データ JSON。2026-10-27 確認）。出典カタログは 124.8cc / 124.7cc
  // /mc/lineup/fazzio/spec.html（spec_compare_db_20260309.json Fazzio-2026 8BJ-SEL6J「124cm3」）
  // /mc/lineup/mt-125/spec.html（spec_compare_db_20231012.json MT-125-2023 8BJ-RE45J「124cm3」）
  // /mc/lineup/xsr125/spec.html（spec_compare_db_20250319.json XSR125-2025 8BJ-RE46J「124cm3」）
  // /mc/lineup/yzf-r125/spec.html（spec_compare_db_20230921.json YZF-R125-2023 8BJ-RE45J「124cm3」）
  '2/999_121': { cc: 124, label: 'ヤマハ公式の主要諸元。2026-10-27 確認' },
  '2/999_13': { cc: 124, label: 'ヤマハ公式の主要諸元。2026-10-27 確認' },
  '2/999_107': { cc: 124, label: 'ヤマハ公式の主要諸元。2026-10-27 確認' },
  '2/106_8': { cc: 124, label: 'ヤマハ公式の主要諸元。2026-10-27 確認' },
  // ヤマハ公式 製品ページ「価格・仕様」の主要諸元（2026-10-29 確認）。出典カタログは 124.6cc / 124.7cc
  // /mc/lineup/cygnus-x/spec.html（spec_compare_db_20260422.json CYGNUS-X-2026 8BJ-SEM5J「124cm³」。出典の 2020年式以前は 124cc）
  // /mc/lineup/cygnus-gryphus/spec.html（spec_compare_db_20250410.json CYGNUS-GRYPHUS-2025 8BJ-SEJ4J「124cm3」）
  // /mc/lineup/wr125r/spec.html（spec_compare_db_20251218.json WR125R-2026 8BJ-DE14J「124cm3」。出典の 2009〜2014年式は海外仕様）
  '2/123_2': { cc: 124, label: 'ヤマハ公式の主要諸元。2026-10-29 確認' },
  '2/999_104': { cc: 124, label: 'ヤマハ公式の主要諸元。2026-10-29 確認' },
  '2/80_3': { cc: 124, label: 'ヤマハ公式の主要諸元。2026-10-29 確認' },
  // E-Vino は電動。出典カタログの「0.58」は排気量ではない。ヤマハ公式の主要諸元（/mc/lineup/e-vino/spec.html・
  // spec_compare_db_20220824.json E-Vino-2022 ZAD-SY11J）は排気量「-」、原動機は交流同期電動機（2026-10-29 確認）
  '2/187_1': { cc: null, label: '電動モデル。ヤマハ公式の主要諸元では排気量「-」。2026-10-29 確認' },
}

export function displacementText(m: Model): string | undefined {
  if (!m.displacement_cc) return undefined
  const official = OFFICIAL_CC[`${m.maker_id}/${m.model_id}`]
  if (official) return official.cc === null ? `なし（${official.label}）` : `${official.cc}cc（${official.label}）`
  const base = `${m.displacement_cc}cc`
  if (!dispCache) {
    const f = path.join(process.cwd(), 'data', 'displacement-years.json')
    dispCache = fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf-8')) : {}
  }
  const d = dispCache![`${m.maker_id}/${m.model_id}`]
  // 年式別の確認データが無い／車種トップの値が掲載値と違う（取得日以降に出典が変わった）ものは従来表示
  if (!d || !d.top_cc || d.top_cc !== m.displacement_cc || !d.variants.length) return base
  const known = d.variants.filter((v) => v.cc && v.year) as { year: number; cc: number }[]
  const cl = clusterCc([d.top_cc, ...known.map((v) => v.cc)])
  const topKey = cl.get(d.top_cc)!
  // 値が読めなかった年式、または年式不明で値が違うものは「未確認」
  const unknown = d.variants.filter((v) => !v.cc || (!v.year && cl.get(v.cc) !== topKey)).length
  const differs = known.some((v) => cl.get(v.cc) !== topKey)
  if (!differs && !unknown) return base
  const topYear = d.top_year ?? known.filter((v) => v.cc === d.top_cc).map((v) => v.year).sort((a, b) => b - a)[0]
  if (!topYear) return base
  if (!differs || YEAR_ONLY_MAKERS.has(m.maker_id)) return `${base}（${topYear}年式の値）`
  const { groups, overlap } = groupByCc(known.map((v) => ({ year: v.year, key: cl.get(v.cc)! })))
  const same = groups.get(topKey) ?? ''
  const others = [...groups.entries()]
    .filter(([k]) => k !== topKey)
    .sort((a, b) => a[1].localeCompare(b[1]))
    .map(([k, label]) => `${label}年式は ${k}`)
    .join('、')
  return `${base}（${same || topYear}年式。${others}${overlap ? '。同じ年式に排気量の違う仕様があります' : ''}${unknown ? '。その他の年式は未確認' : ''}）`
}
