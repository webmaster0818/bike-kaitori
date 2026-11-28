import type { Metadata } from 'next'
import { SITE } from '@/lib/data'
import { breadcrumb, itemListLd } from '@/lib/schema'
import { pageMeta } from '@/lib/meta'
import { COLUMNS } from '@/lib/columns'

export const metadata: Metadata = pageMeta({
  title: 'バイクの売却・手続きガイド（廃車・名義変更・車検・保険）',
  description:
    'バイクを手放す・乗り換える際の手続きを、国土交通省・市区町村・総務省・警察などの公式情報にもとづきご説明しています。各ガイドに出典と確認日を記載しています。',
  path: '/column/',
})

export default function Page() {
  const ld = [
    breadcrumb([
      { name: 'トップ', url: `${SITE.origin}/` },
      { name: '売却・手続きガイド', url: `${SITE.origin}/column/` },
    ]),
    itemListLd('バイクの売却・手続きガイド', COLUMNS.map((c) => ({ name: c.h1, url: `${SITE.origin}/column/${c.slug}/` }))),
  ]
  return (
    <article>
      {ld.map((x, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(x) }} />
      ))}
      <p className="note" style={{ marginTop: 28 }}><a href="/">トップ</a> ／ 売却・手続きガイド</p>
      <h1>バイクの売却・手続きガイド</h1>
      <div className="verdict">
        <div className="tag">このガイドについて</div>
        <p className="headline">
          廃車・名義変更・車検・保険など、バイクを手放す際の手続きを<span className="num">{COLUMNS.length}</span>本のガイドでご説明しています。
        </p>
        <p style={{ margin: 0 }}>
          手続き・税・法令の記載は、国土交通省・運輸支局・市区町村・総務省・警察などの公式情報のみを出典としています。
          各ガイドに出典URLと確認日を記載しています。買取業者の比較・順位付けは行っていません。
        </p>
      </div>
      <div className="grid">
        {COLUMNS.map((c) => (
          <a className="card" key={c.slug} href={`/column/${c.slug}/`}>
            <div className="k">確認日 {c.checked}</div>
            <div className="t">{c.h1}</div>
            <div className="note" style={{ margin: 0 }}>{c.lead.headline}</div>
          </a>
        ))}
      </div>
      <p className="note" style={{ marginTop: 28 }}>
        車種ごとの中古車の流通台数と価格帯は<a href="/ranking/">流通台数ランキング</a>でご覧いただけます。
      </p>
    </article>
  )
}
