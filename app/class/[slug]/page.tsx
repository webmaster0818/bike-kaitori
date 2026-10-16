import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { allModels, CLASSES, classOf, modelSlug, makerSlug, spread, yen, SITE } from '@/lib/data'
import { breadcrumb, itemListLd } from '@/lib/schema'
import { pageMeta, fitDesc } from '@/lib/meta'

export function generateStaticParams() {
  const used = new Set(allModels().map((m) => classOf(m)?.slug).filter(Boolean))
  return CLASSES.filter((c) => used.has(c.slug)).map((c) => ({ slug: c.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const c = CLASSES.find((x) => x.slug === slug)
  if (!c) return {}
  const rows = allModels().filter((m) => classOf(m)?.slug === slug)
  return pageMeta({
    title: `${c.label}の中古バイク流通台数（${rows.length}車種）`,
    description: fitDesc(
      `${c.label}の${rows.length}車種について、中古車の流通台数と価格帯を比較しています。`,
      '同じクラス内での流通台数の多寡は、売却時の交渉に影響します。',
    ),
    path: `/class/${slug}/`,
  })
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

  // メーカー別ページと同じ型：パンくず＋このクラスの車種一覧（観測値だけ。価格は載せない）
  const ld = [
    breadcrumb([
      { name: 'トップ', url: `${SITE.origin}/` },
      { name: c.label, url: `${SITE.origin}/class/${slug}/` },
    ]),
    itemListLd(`${c.label}の車種一覧`, rows.map((x) => ({
      name: `${x.maker} ${x.name}`, url: `${SITE.origin}/model/${modelSlug(x)}/`,
    }))),
  ]

  return (
    <article>
      {ld.map((x, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(x) }} />
      ))}
      <p className="note" style={{ marginTop: 28 }}><a href="/">トップ</a> ／ {c.label}</p>
      <h1>{c.label}の中古バイク流通台数</h1>
      <div className="verdict">
        <div className="tag">流通状況の概要</div>
        <p className="headline">
          このクラスの流通台数の中央値は<span className="num">{median}</span>台です（{rows.length}車種）。
        </p>
        <p style={{ margin: 0 }}>
          ご自身の車種の流通台数がこの数値より多い場合は市場に多く流通している車種、少ない場合は入手しにくい車種にあたります。
          買取業者の仕入れ意欲は在庫状況に左右されるため、まずこの数値をご確認ください。
        </p>
      </div>

      <h2>流通台数が多い車種</h2>
      <div className="grid">
        {rows.slice(0, 6).map((m) => (
          <a className="card" key={m.model_id} href={`/model/${modelSlug(m)}/`}>
            <div className="k">{m.maker}</div>
            <div className="t">{m.name}</div>
            <div className="v">{m.used_count}台</div>
          </a>
        ))}
      </div>

      <h2>流通台数が少ない車種</h2>
      <div className="grid">
        {rows.slice(-6).reverse().map((m) => (
          <a className="card" key={m.model_id} href={`/model/${modelSlug(m)}/`}>
            <div className="k">{m.maker}</div>
            <div className="t">{m.name}</div>
            <div className="v">{m.used_count}台</div>
          </a>
        ))}
      </div>

      <h2>状態により価格差が大きい車種</h2>
      <p>
        中古車価格帯の上限が下限の何倍であるかを示しています。倍率が大きい車種ほど、
        同じ車種でも個体の状態により評価が変わりやすいため、<strong>複数社の査定を比較する意義が大きい</strong>といえます。
      </p>
      <div className="scroll-x">
        <table className="data">
          <thead><tr><th style={{ width: '46%' }}>車種</th><th>中古車価格帯</th><th>倍率</th></tr></thead>
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
          <thead><tr><th style={{ width: '46%' }}>車種</th><th>流通台数</th><th>中古車価格帯</th><th>メーカー</th></tr></thead>
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
      <p className="note">※掲載している価格は中古車としての流通価格であり、買取価格ではありません。</p>
      <div className="chips" style={{ marginTop: 30 }}>
        {CLASSES.map((x) => <a key={x.slug} href={`/class/${x.slug}/`}>{x.label}</a>)}
      </div>
    </article>
  )
}
