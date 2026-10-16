import type { Metadata } from 'next'
import { allModels, modelSlug, makerSlug, classOf, spread, yen, SITE, snapshot } from '@/lib/data'
import { breadcrumb, itemListLd } from '@/lib/schema'
import { pageMeta } from '@/lib/meta'

export const metadata: Metadata = pageMeta({
  title: '中古バイク流通台数ランキング｜車種別の流通台数と価格帯',
  description:
    '中古車として市場に流通している台数を車種別に集計しています。流通台数が多い車種は買取業者の在庫も多く、取引条件は買い手に有利になりやすい傾向があります。すべてのデータに出典と取得日を併記しています。',
  path: '/ranking/',
})

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
          <span className="num">{all.length}</span>車種・のべ<span className="num">{total.toLocaleString()}</span>台の中古車流通を集計しています。
        </p>
        <p style={{ margin: 0 }}>
          買取価格は買取業者各社が公表していないため、当サイトでは<strong>買取相場の断定を控えています</strong>。
          その代わりに、買取額を左右する主要な要因である「その車種が現在市場に何台流通しているか」を掲載しています。
          流通台数が多い場合は買取業者が在庫を保有している可能性が高く、少ない場合は仕入れの需要が高い状態にあると考えられます。
        </p>
      </div>

      <h2>流通台数が多い車種（上位30車種）</h2>
      <p>中古市場に流通している台数が多い車種です。売却を決めている場合は、早めに判断することも選択肢となります。</p>
      <div className="scroll-x">
        <table className="data">
          <thead><tr><th style={{ width: 44 }}>#</th><th style={{ width: '40%' }}>車種</th><th>流通台数</th><th>中古車価格帯</th></tr></thead>
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

      <h2>流通台数が少ない車種（20車種）</h2>
      <p>
        需要に対して供給が不足している車種です。売却を急ぐ必要性は比較的小さく、複数社の査定を比較する時間を確保しやすいと考えられます。
        <span className="note">（データの信頼性を確保するため、3台以上流通している車種に限定しています）</span>
      </p>
      <div className="scroll-x">
        <table className="data">
          <thead><tr><th style={{ width: 44 }}>#</th><th style={{ width: '40%' }}>車種</th><th>流通台数</th><th>中古車価格帯</th></tr></thead>
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

      <h2>状態により価格差が大きい車種（20車種）</h2>
      <p>中古車価格帯の上限が下限の何倍であるかを示しています。倍率が大きいほど買取業者ごとの評価にも差が生じやすいため、<strong>複数社の査定を比較されることをおすすめします</strong>。</p>
      <div className="scroll-x">
        <table className="data">
          <thead><tr><th style={{ width: 44 }}>#</th><th style={{ width: '40%' }}>車種</th><th>中古車価格帯</th><th>倍率</th></tr></thead>
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
        当サイトでは、バイクブロスのバイクカタログの車種ページに掲載されている「中古車価格帯」と流通台数を取得しています。
        価格帯と台数の両方を取得できた車種のみを対象とし、取得できなかった車種は集計・掲載の対象に含めていません。
        取得日は {snap.generated_at} です。数値は取得時点のものであり、現在の状況とは異なる場合があります。
      </p>
      <p className="src">
        出典：<a href={snap.source_url} rel="noopener noreferrer" target="_blank">{snap.source}</a>（{snap.generated_at} 取得）
      </p>
      <p className="note" style={{ marginTop: 24 }}>
        この集計は<a href="/data/">オープンデータとして公開</a>しています。出典を明記いただくことで、自由に引用いただけます。
      </p>
    </article>
  )
}
