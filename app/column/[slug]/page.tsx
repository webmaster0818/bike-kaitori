import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { SITE } from '@/lib/data'
import { breadcrumb, faqLd } from '@/lib/schema'
import { pageMeta } from '@/lib/meta'
import { COLUMNS, columnBySlug, type Block } from '@/lib/columns'

export function generateStaticParams() {
  return COLUMNS.map((c) => ({ slug: c.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const c = columnBySlug(slug)
  if (!c) return {}
  return pageMeta({ title: c.title, description: c.description, path: `/column/${c.slug}/` })
}

// 本文中の **太字** と [文言](URL) だけを解釈する。外部URLは別タブ・noopener。
function Inline({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\))/g).filter(Boolean)
  return (
    <>
      {parts.map((t, i) => {
        const b = t.match(/^\*\*(.+)\*\*$/)
        if (b) return <strong key={i}>{b[1]}</strong>
        const a = t.match(/^\[(.+)\]\((.+)\)$/)
        if (a) {
          const ext = /^https?:/.test(a[2])
          return ext
            ? <a key={i} href={a[2]} rel="noopener noreferrer" target="_blank">{a[1]}</a>
            : <a key={i} href={a[2]}>{a[1]}</a>
        }
        return <span key={i}>{t}</span>
      })}
    </>
  )
}

function Render({ b }: { b: Block }) {
  if ('p' in b) return <p><Inline text={b.p} /></p>
  if ('h3' in b) return <h3>{b.h3}</h3>
  if ('note' in b) return <p className="note"><Inline text={b.note} /></p>
  if ('ul' in b) return <ul>{b.ul.map((x, i) => <li key={i}><Inline text={x} /></li>)}</ul>
  const t = b.table
  return (
    <>
      <div className="scroll-x">
        <table className="data">
          <thead><tr>{t.head.map((h, i) => <th key={i}>{h}</th>)}</tr></thead>
          <tbody>
            {t.rows.map((r, i) => (
              <tr key={i}>{r.map((v, j) => <td key={j}>{v}</td>)}</tr>
            ))}
          </tbody>
        </table>
      </div>
      {t.caption && <p className="src">{t.caption}</p>}
    </>
  )
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const c = columnBySlug(slug)
  if (!c) notFound()
  const url = `${SITE.origin}/column/${c.slug}/`
  const ld = [
    breadcrumb([
      { name: 'トップ', url: `${SITE.origin}/` },
      { name: '売却・手続きガイド', url: `${SITE.origin}/column/` },
      { name: c.h1, url },
    ]),
    {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: c.h1,
      description: c.description,
      url,
      mainEntityOfPage: url,
      datePublished: c.published,
      dateModified: c.checked,
      inLanguage: 'ja',
      author: { '@type': 'Organization', name: SITE.name, url: `${SITE.origin}/` },
      publisher: { '@type': 'Organization', name: SITE.name, url: `${SITE.origin}/` },
    },
    faqLd(c.faq),
  ]
  const related = c.related.map((s) => columnBySlug(s)).filter((x) => !!x)

  return (
    <article>
      {ld.map((x, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(x) }} />
      ))}
      <p className="note" style={{ marginTop: 28 }}>
        <a href="/">トップ</a> ／ <a href="/column/">売却・手続きガイド</a> ／ {c.h1}
      </p>
      <h1>{c.h1}</h1>
      <p className="note">公開日：{c.published} ／ 公式情報の確認日：{c.checked}</p>

      <div className="verdict">
        <div className="tag">{c.lead.tag}</div>
        <p className="headline">{c.lead.headline}</p>
        <p style={{ margin: 0 }}><Inline text={c.lead.text} /></p>
      </div>

      {c.sections.map((s, i) => (
        <section key={i}>
          <h2>{s.h2}</h2>
          {s.blocks.map((b, j) => <Render key={j} b={b} />)}
        </section>
      ))}

      <h2>よくあるご質問</h2>
      {c.faq.map((f, i) => (
        <div key={i}>
          <h3>{f.q}</h3>
          <p>{f.a}</p>
        </div>
      ))}

      <h2>出典</h2>
      <p className="note">
        当ページの手続き・税・法令の記載は、以下の公式情報を{c.checked}に確認して作成しています。
        手数料や必要書類は改定されることがあるため、手続きの前に各窓口の最新の案内をご確認ください。
      </p>
      <ul className="src">
        {c.sources.map((s, i) => (
          <li key={i}><a href={s.url} rel="noopener noreferrer" target="_blank">{s.name}</a></li>
        ))}
      </ul>

      <h2>関連するガイド</h2>
      <div className="grid">
        {related.map((r) => (
          <a className="card" key={r!.slug} href={`/column/${r!.slug}/`}>
            <div className="k">売却・手続きガイド</div>
            <div className="t">{r!.h1}</div>
          </a>
        ))}
      </div>
      <p className="note" style={{ marginTop: 14 }}><a href="/column/">ガイドの一覧を見る</a></p>
    </article>
  )
}
