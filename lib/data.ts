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
