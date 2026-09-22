import type { Metadata } from 'next'
import { allModels, modelSlug, makerSlug, classOf, spread, yen, SITE, snapshot } from '@/lib/data'
import { breadcrumb, itemListLd } from '@/lib/schema'

export const metadata: Metadata = {
  title: '中古バイク流通台数ランキング｜買い叩かれやすい車種はどれか',
  description:
    '中古車として市場に何台出回っているかを車種別に集計しました。台数が多い車種は買取業者の在庫も潤沢で、条件は買い手に有利になりやすくなります。全データに出典と取得日を付けています。',
  alternates: { canonical: `${SITE.origin}/ranking/` },
}

export default function Page() {
  const snap = snapshot()
  const all = allModels()
  const top = all.slice().sort((a, b) => b.used_count - a.used_count).slice(0, 30)
  const scarce = all.filter((m) => m.used_count >= 3).sort((a, b) => a.used_count - b.used_count).slice(0, 20)
  const wide = all.slice().sort((a, b) => spread(b) - spread(a)).slice(0, 20)
  const total = all.reduce((n, m) => n + m.used_count, 0)

  const ld = [
    breadcrumb([
      { name: 'トップ', url: `${SITE.origin}/` },
      { name: '流通台数ランキング', url: `${SITE.origin}/ranking/` },
    ]),
  ]

  return (
    <article>
      {ld.map((x, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(x) }} />
      ))}
      <p className="note" style={{ marginTop: 28 }}><a href="/">トップ</a> ／ 流通台数ランキング</p>
      <h1>中古バイク流通台数ランキング</h1>

      <div className="verdict">
        <div className="tag">この集計について</div>
        <p className="headline">
          <span className="num">{all.length}</span>車種・のべ<span className="num">{total.toLocaleString()}</span>台の中古流通を集計しました。
        </p>
        <p style={{ margin: 0 }}>
          買取価格は各社が公表していないため、当サイトは<strong>買取相場を断定しません</strong>。
          代わりに、買取額を左右する最大の要因である「その車種がいま何台市場に出ているか」を出します。
          台数が多ければ業者は在庫を持っており、少なければ仕入れたい状態です。
        </p>
      </div>

      <h2>流通台数が多い車種 30</h2>
      <p>市場に出回っている数が多い車種です。売ると決めているなら、時間をかけすぎない判断も選択肢になります。</p>
      <div className="scroll-x">
        <table className="data">
          <thead><tr><th style={{ width: 44 }}>#</th><th style={{ width: '40%' }}>車種</th><th>流通台数</th><th>中古価格帯</th></tr></thead>
          <tbody>
            {top.map((m, i) => (
              <tr key={m.model_id}>
                <td className="n">{i + 1}</td>
                <td><a href={`/model/${modelSlug(m)}/`}>{m.maker} {m.name}</a></td>
                <td className="n">{m.used_count}台</td>
                <td className="n">{yen(m.used_price_min)}〜{yen(m.used_price_max)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2>流通台数が少ない車種 20</h2>
      <p>
        探している人に対して供給が足りていない側です。急いで手放す理由は小さく、査定を複数取る余裕があります。
        <span className="note">（データの信頼性のため、3台以上流通している車種に限っています）</span>
      </p>
      <div className="scroll-x">
        <table className="data">
          <thead><tr><th style={{ width: 44 }}>#</th><th style={{ width: '40%' }}>車種</th><th>流通台数</th><th>中古価格帯</th></tr></thead>
          <tbody>
            {scarce.map((m, i) => (
              <tr key={m.model_id}>
                <td className="n">{i + 1}</td>
                <td><a href={`/model/${modelSlug(m)}/`}>{m.maker} {m.name}</a></td>
                <td className="n">{m.used_count}台</td>
                <td className="n">{yen(m.used_price_min)}〜{yen(m.used_price_max)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2>状態で値が振れやすい車種 20</h2>
      <p>中古価格帯の上限が下限の何倍か。倍率が大きいほど、業者ごとの評価差も出やすく、<strong>1社だけで決めると差が損得になります</strong>。</p>
      <div className="scroll-x">
        <table className="data">
          <thead><tr><th style={{ width: 44 }}>#</th><th style={{ width: '40%' }}>車種</th><th>価格帯</th><th>開き</th></tr></thead>
          <tbody>
            {wide.map((m, i) => (
              <tr key={m.model_id}>
                <td className="n">{i + 1}</td>
                <td><a href={`/model/${modelSlug(m)}/`}>{m.maker} {m.name}</a></td>
                <td className="n">{yen(m.used_price_min)}〜{yen(m.used_price_max)}</td>
                <td className="n">{spread(m).toFixed(1)}倍</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2>集計方法</h2>
      <p className="note">
        バイクブロスのバイクカタログから、車種ページに掲載されている「中古車価格帯」と流通台数を取得しています。
        価格帯と台数の両方が取得できた車種のみを対象とし、取得できなかった車種は集計にも掲載にも含めていません。
        取得日は {snap.generated_at} です。数値は取得時点のもので、現在の状況とは異なる場合があります。
      </p>
      <p className="src">
        出典：<a href={snap.source_url} rel="noopener noreferrer" target="_blank">{snap.source}</a>（{snap.generated_at} 取得）
      </p>
      <p className="note" style={{ marginTop: 24 }}>
        この集計は<a href="/data/">オープンデータとして公開</a>しています。出典を明記していただければ引用は自由です。
      </p>
    </article>
  )
}
