import type { Metadata } from 'next'
import { allModels, snapshot, modelSlug, makerSlug, CLASSES, classOf, spread, yen, SITE } from '@/lib/data'
import { websiteLd } from '@/lib/schema'
import { pageMeta } from '@/lib/meta'

// ⚠️ トップにも自己canonicalを置く。無いと pages.dev 側のURLが正規と判断されうる。
export const metadata: Metadata = pageMeta({ description: SITE.description, path: '/' })

export default function Home() {
  const snap = snapshot()
  const all = allModels()
  const total = all.reduce((n, m) => n + m.used_count, 0)
  const makers = [...new Set(all.map((m) => m.maker))]
  const top = all.slice().sort((a, b) => b.used_count - a.used_count).slice(0, 8)
  const wide = all.slice().sort((a, b) => spread(b) - spread(a)).slice(0, 8)
  const usedClasses = CLASSES.filter((c) => all.some((m) => classOf(m)?.slug === c.slug))

  const ld = [websiteLd()]

  return (
    <article>
      {ld.map((x, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(x) }} />
      ))}
      <h1 style={{ marginTop: 44 }}>
        中古バイクの流通台数と価格帯（車種別）
      </h1>
      <p style={{ fontSize: 17 }}>
        バイクの買取価格は、年式・走行距離・車検の残り期間・傷の有無により金額が変わるため、買取業者各社は公表していません。
        そのため当サイトでは、<strong>買取相場の断定を控えています</strong>。その代わりに、買取額を左右する主要な要因である
        <strong>「その車種が中古市場に何台流通しているか」</strong>を車種ごとに掲載しています。
        流通台数が多い場合は買取業者がすでに在庫を保有している可能性が高く、少ない場合は仕入れの需要が高い状態にあると考えられます。
      </p>

      <div className="verdict">
        <div className="tag">掲載データ</div>
        <p className="headline">
          <span className="num">{all.length}</span>車種 ／ のべ<span className="num">{total.toLocaleString()}</span>台 ／ <span className="num">{makers.length}</span>メーカー
        </p>
        <p style={{ margin: 0 }}>
          すべてのデータに出典URLと取得日を併記しています（{snap.generated_at} 取得）。流通データを取得できなかった車種は掲載しておりません。
        </p>
      </div>

      <h2>メーカーから探す</h2>
      <div className="chips">
        {makers.map((mk) => (
          <a key={mk} href={`/maker/${makerSlug(mk)}/`}>{mk}</a>
        ))}
      </div>

      <h2>排気量から探す</h2>
      <div className="chips">
        {usedClasses.map((c) => <a key={c.slug} href={`/class/${c.slug}/`}>{c.label}</a>)}
      </div>

      <h2>流通台数が多い車種</h2>
      <p>中古市場に流通している台数が多い車種です。買取業者にとっては在庫を確保しやすいため、取引条件は買い手に有利になりやすい傾向があります。</p>
      <div className="grid">
        {top.map((m) => (
          <a className="card" key={m.model_id} href={`/model/${modelSlug(m)}/`}>
            <div className="k">{m.maker}</div>
            <div className="t">{m.name}</div>
            <div className="v">{m.used_count}台</div>
          </a>
        ))}
      </div>
      <p className="note" style={{ marginTop: 14 }}><a href="/ranking/">流通台数ランキングを見る</a></p>

      <h2>状態により価格差が大きい車種</h2>
      <p>
        中古車価格帯の上限が下限の何倍であるかを示しています。倍率が大きい車種ほど、同じ車種でも状態による評価の差が大きいため、
        <strong>複数社の査定を比較されることをおすすめします</strong>。
      </p>
      <div className="grid">
        {wide.map((m) => (
          <a className="card" key={m.model_id} href={`/model/${modelSlug(m)}/`}>
            <div className="k">{m.maker}</div>
            <div className="t">{m.name}</div>
            <div className="v">{spread(m).toFixed(1)}倍 ／ {yen(m.used_price_min)}〜</div>
          </a>
        ))}
      </div>

      <h2>掲載データの見方</h2>
      <h3>流通台数は買取業者の在庫状況を示します</h3>
      <p>
        買取業者は、仕入れた車両を販売して利益を得ています。同じ車種が市場に多く流通している場合、
        買取業者はすでに在庫を保有している可能性が高く、積極的に仕入れる必要性は低くなります。
        反対に流通台数が少ない場合は、顧客の需要に対して在庫が不足しやすく、仕入れの需要が生まれます。
        流通台数は、査定を受ける前に確認できる数少ない事前情報の一つです。
      </p>
      <h3>価格帯の広さは複数社査定の必要性を示します</h3>
      <p>
        価格帯の開きが大きい車種は、状態の評価が買取業者ごとに分かれやすい車種です。
        開きが小さい車種では、査定を依頼する社数を増やしても差が生じにくい一方、開きが大きい車種では、複数社の査定を比較することで条件の良い売却先を見つけやすくなります。
      </p>
      <h3>掲載データに含まれない情報</h3>
      <p>
        走行距離、車検の残り期間、転倒歴、改造の内容、書類の有無は含まれていません。
        最終的な買取額は、現車査定により決まります。当サイトの数値は、査定前に相場の目安を把握するための参考情報としてご活用ください。
      </p>

      <p className="note" style={{ marginTop: 36 }}>
        集計データは<a href="/data/">オープンデータとして公開</a>しています（CSV / JSON 形式。出典を明記いただくことで、自由に引用いただけます）。
      </p>
    </article>
  )
}
