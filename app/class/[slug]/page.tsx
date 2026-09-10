import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { allModels, CLASSES, classOf, modelSlug, makerSlug, spread, yen, SITE } from '@/lib/data'

export function generateStaticParams() {
  const used = new Set(allModels().map((m) => classOf(m)?.slug).filter(Boolean))
  return CLASSES.filter((c) => used.has(c.slug)).map((c) => ({ slug: c.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const c = CLASSES.find((x) => x.slug === slug)
  if (!c) return {}
  const rows = allModels().filter((m) => classOf(m)?.slug === slug)
  return {
    title: `${c.label}の中古バイク流通台数（${rows.length}車種）`,
    description: `${c.label}の${rows.length}車種について、中古車の流通台数と価格帯を比較しています。同じクラス内で台数が多いか少ないかが、売却時の交渉力を左右します。`,
    alternates: { canonical: `${SITE.origin}/class/${slug}/` },
  }
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const c = CLASSES.find((x) => x.slug === slug)
  if (!c) notFound()
  const rows = allModels().filter((m) => classOf(m)?.slug === slug).sort((a, b) => b.used_count - a.used_count)
  if (!rows.length) notFound()

  const counts = rows.map((r) => r.used_count).sort((a, b) => a - b)
  const median = counts[Math.floor(counts.length / 2)]
  const wide = rows.slice().sort((a, b) => spread(b) - spread(a)).slice(0, 5)

  return (
    <article>
      <p className="note" style={{ marginTop: 28 }}><a href="/">トップ</a> ／ {c.label}</p>
      <h1>{c.label}の中古バイク流通台数</h1>
      <div className="verdict">
        <div className="tag">まず結論</div>
        <p className="headline">
          このクラスの流通台数の中央値は<span className="num">{median}</span>台です（{rows.length}車種）。
        </p>
        <p style={{ margin: 0 }}>
          自分の車種がこの数字より多ければ市場に出回っている側、少なければ手に入りにくい側です。
          買取業者が「その車種をいま欲しいか」は在庫状況に左右されるため、まずここを見てください。
        </p>
      </div>

      <h2>流通台数が多い車種（買い手に在庫がある側）</h2>
      <div className="grid">
        {rows.slice(0, 6).map((m) => (
          <a className="card" key={m.model_id} href={`/model/${modelSlug(m)}/`}>
            <div className="k">{m.maker}</div>
            <div className="t">{m.name}</div>
            <div className="v">{m.used_count}台</div>
          </a>
        ))}
      </div>

      <h2>流通台数が少ない車種（供給が足りていない側）</h2>
      <div className="grid">
        {rows.slice(-6).reverse().map((m) => (
          <a className="card" key={m.model_id} href={`/model/${modelSlug(m)}/`}>
            <div className="k">{m.maker}</div>
            <div className="t">{m.name}</div>
            <div className="v">{m.used_count}台</div>
          </a>
        ))}
      </div>

      <h2>状態で値が振れやすい車種</h2>
      <p>
        中古価格帯の上限が下限の何倍かを見ています。この倍率が大きい車種ほど、
        同じ車種でも個体の状態で評価が変わりやすく、<strong>複数社に査定を取る価値が大きい</strong>と言えます。
      </p>
      <div className="scroll-x">
        <table className="data">
          <thead><tr><th style={{ width: '46%' }}>車種</th><th>価格帯</th><th>開き</th></tr></thead>
          <tbody>
            {wide.map((m) => (
              <tr key={m.model_id}>
                <td><a href={`/model/${modelSlug(m)}/`}>{m.maker} {m.name}</a></td>
                <td className="n">{yen(m.used_price_min)}〜{yen(m.used_price_max)}</td>
                <td className="n">{spread(m).toFixed(1)}倍</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2>{c.label}の全{rows.length}車種</h2>
      <div className="scroll-x">
        <table className="data">
          <thead><tr><th style={{ width: '46%' }}>車種</th><th>流通台数</th><th>中古価格帯</th><th>メーカー</th></tr></thead>
          <tbody>
            {rows.map((m) => (
              <tr key={m.model_id}>
                <td><a href={`/model/${modelSlug(m)}/`}>{m.name}</a></td>
                <td className="n">{m.used_count}台</td>
                <td className="n">{yen(m.used_price_min)}〜{yen(m.used_price_max)}</td>
                <td><a href={`/maker/${makerSlug(m.maker)}/`}>{m.maker}</a></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="src">
        出典：<a href="https://www.bikebros.co.jp/catalog/" rel="noopener noreferrer" target="_blank">バイクブロス バイクカタログ</a>
      </p>
      <p className="note">※中古車として流通している価格であり、買取価格ではありません。</p>
      <div className="chips" style={{ marginTop: 30 }}>
        {CLASSES.map((x) => <a key={x.slug} href={`/class/${x.slug}/`}>{x.label}</a>)}
      </div>
    </article>
  )
}
