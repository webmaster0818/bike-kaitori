import type { Metadata } from 'next'
import { allModels, snapshot, modelSlug, makerSlug, CLASSES, classOf, spread, yen, SITE } from '@/lib/data'
import { websiteLd } from '@/lib/schema'

// ⚠️ トップにも自己canonicalを置く。無いと pages.dev 側のURLが正規と判断されうる。
export const metadata: Metadata = {
  alternates: { canonical: `${SITE.origin}/` },
}

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
        あなたのバイクは、いま何台出回っているか。
      </h1>
      <p style={{ fontSize: 17 }}>
        買取価格は各社が公表していません。年式・走行距離・車検・傷で金額が変わるからです。
        だから当サイトは<strong>買取相場を断定しません</strong>。代わりに、買取額を左右する最大の要因である
        <strong>「その車種が中古市場に何台出ているか」</strong>を車種ごとに出しています。
        台数が多ければ業者はすでに在庫を持っており、少なければ仕入れたい状態です。
      </p>

      <div className="verdict">
        <div className="tag">掲載データ</div>
        <p className="headline">
          <span className="num">{all.length}</span>車種 ／ のべ<span className="num">{total.toLocaleString()}</span>台 ／ <span className="num">{makers.length}</span>メーカー
        </p>
        <p style={{ margin: 0 }}>
          すべて出典URLと取得日つきです（{snap.generated_at} 取得）。流通データが取れなかった車種はページを作っていません。
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
      <p>市場に出回っている数が多い車種です。買取業者から見れば在庫を確保しやすく、条件は買い手に有利になりやすくなります。</p>
      <div className="grid">
        {top.map((m) => (
          <a className="card" key={m.model_id} href={`/model/${modelSlug(m)}/`}>
            <div className="k">{m.maker}</div>
            <div className="t">{m.name}</div>
            <div className="v">{m.used_count}台</div>
          </a>
        ))}
      </div>
      <p className="note" style={{ marginTop: 14 }}><a href="/ranking/">流通台数ランキングをすべて見る</a></p>

      <h2>状態で値が振れやすい車種</h2>
      <p>
        中古価格帯の上限が下限の何倍あるかを見ています。倍率が大きい車種ほど、同じ車種でも状態による評価差が大きく、
        <strong>1社だけの査定で決めるとその差がそのまま損得になります</strong>。
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

      <h2>この数字の読み方</h2>
      <h3>流通台数は「相手の在庫状況」を映す</h3>
      <p>
        買取業者は仕入れた車体を売って利益を出します。同じ車種が何台も市場に出ていれば、
        業者はすでに在庫を持っている可能性が高く、無理に仕入れる理由がありません。
        逆に台数が少なければ、顧客の希望に対して在庫が足りず、仕入れる動機が生まれます。
        査定を受ける前に知っておける、数少ない事前情報です。
      </p>
      <h3>価格帯の広さは「査定を複数取る価値」を映す</h3>
      <p>
        価格帯の開きが大きい車種は、状態の評価が業者ごとに割れやすい車種です。
        開きが小さい車種で社数を増やしても差は出にくく、逆に開きが大きい車種で1社に決めるのは機会損失になります。
      </p>
      <h3>この数字で分からないこと</h3>
      <p>
        走行距離、車検の残り、転倒歴、改造の内容、書類の有無は含まれていません。
        最終的な金額は現車査定でしか決まりません。当サイトの数値は、査定前に相場観を持つためのものです。
      </p>

      <p className="note" style={{ marginTop: 36 }}>
        集計データは<a href="/data/">オープンデータとして公開</a>しています（CSV / JSON・出典明記で引用自由）。
      </p>
    </article>
  )
}
