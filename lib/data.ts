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
      label: '流通量は少なめ',
      lead: '同じ排気量クラスの中では市場に出ている台数が少ない車種です。買い手側から見れば代わりが見つけにくいため、急いで手放す理由は小さいと言えます。',
    }
  }
  if (m.used_count >= q(0.85)) {
    return {
      key: 'saturated',
      label: '流通量は多め',
      lead: '同じ排気量クラスの中で市場に出ている台数が多い車種です。在庫が潤沢なぶん条件は買い手に有利になりやすいため、売ると決めているなら時間をかけすぎない判断も選択肢になります。',
    }
  }
  return {
    key: 'normal',
    label: '流通量は平均的',
    lead: '同じ排気量クラスの中では平均的な流通量です。台数からは強気・弱気のどちらとも言えないため、年式・走行距離・状態といった個体差のほうが結果を左右します。',
  }
}

export const SITE = {
  name: 'バイク買取ナビ',
  // ⚠️ ドメインはMediaXAI側で取得中。確定したらここだけ差し替える（canonical・sitemapが追随する）。
  origin: 'https://biker-sell.com',
  description:
    '中古バイクの流通台数と価格帯を車種ごとに公開しています。買取価格そのものは各社が公表していないため断定せず、出典つきの実データだけを掲載しています。',
}
