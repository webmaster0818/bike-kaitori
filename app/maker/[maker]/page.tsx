import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { allModels, makerSlug, modelSlug, classOf, yen, SITE } from '@/lib/data'
import { breadcrumb, itemListLd } from '@/lib/schema'

export function generateStaticParams() {
  return [...new Set(allModels().map((m) => makerSlug(m.maker)))].map((maker) => ({ maker }))
}

function jaName(slug: string) {
  return allModels().find((m) => makerSlug(m.maker) === slug)?.maker
}

export async function generateMetadata({ params }: { params: Promise<{ maker: string }> }): Promise<Metadata> {
  const { maker } = await params
  const ja = jaName(maker)
  if (!ja) return {}
  const rows = allModels().filter((m) => makerSlug(m.maker) === maker)
  return {
    title: `${ja}の中古バイク流通台数一覧（${rows.length}車種）`,
    description: `${ja}の${rows.length}車種について、中古車の流通台数と価格帯を掲載しています。台数が多い車種ほど買い手側に在庫があり、条件は買い手に有利になりやすくなります。`,
    alternates: { canonical: `${SITE.origin}/maker/${maker}/` },
  }
}

export default async function Page({ params }: { params: Promise<{ maker: string }> }) {
  const { maker } = await params
  const ja = jaName(maker)
  if (!ja) notFound()
  const rows = allModels().filter((m) => makerSlug(m.maker) === maker)
    .sort((a, b) => b.used_count - a.used_count)
  const total = rows.reduce((n, r) => n + r.used_count, 0)

  const ld = [
    breadcrumb([
      { name: 'トップ', url: `${SITE.origin}/` },
      { name: ja, url: `${SITE.origin}/maker/${maker}/` },
    ]),
    itemListLd(`${ja}の車種一覧`, rows.map((x) => ({
      name: `${x.maker} ${x.name}`, url: `${SITE.origin}/model/${modelSlug(x)}/`,
    }))),
  ]

  return (
    <article>
      {ld.map((x, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(x) }} />
      ))}
      <p className="note" style={{ marginTop: 28 }}><a href="/">トップ</a> ／ {ja}</p>
      <h1>{ja}の中古バイク流通台数一覧</h1>
      <div className="verdict">
        <div className="tag">この一覧について</div>
        <p className="headline">
          {ja}は<span className="num">{rows.length}</span>車種・のべ<span className="num">{total.toLocaleString()}</span>台の流通を確認しました。
        </p>
        <p style={{ margin: 0 }}>
          台数が多い車種は市場に出回っている数が多く、買取業者から見れば在庫を確保しやすい状態です。
          逆に下位の車種は数が少なく、探している買い手に対して供給が足りていない可能性があります。
        </p>
      </div>
      <p className="note">
        ⚠️ 流通データを確認できなかった車種は掲載していません。数値の無いページは作らない方針です。
      </p>

      <h2>流通台数順（{rows.length}車種）</h2>
      <div className="scroll-x">
        <table className="data">
          <thead>
            <tr><th style={{ width: '46%' }}>車種</th><th>流通台数</th><th>中古価格帯</th><th>排気量クラス</th></tr>
          </thead>
          <tbody>
            {rows.map((m) => {
              const c = classOf(m)
              return (
                <tr key={m.model_id}>
                  <td><a href={`/model/${modelSlug(m)}/`}>{m.name}</a></td>
                  <td className="n">{m.used_count}台</td>
                  <td className="n">{yen(m.used_price_min)}〜{yen(m.used_price_max)}</td>
                  <td>{c ? <a href={`/class/${c.slug}/`}>{c.label}</a> : '—'}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <p className="src">
        出典：<a href="https://www.bikebros.co.jp/catalog/" rel="noopener noreferrer" target="_blank">バイクブロス バイクカタログ</a>
        （各車種ページに取得日を明記しています）
      </p>
      <p className="note">※中古車として流通している価格であり、買取価格ではありません。</p>
      <p className="note" style={{ marginTop: 32 }}><a href="/ranking/">全メーカー横断の流通台数ランキングを見る</a></p>
    </article>
  )
}
