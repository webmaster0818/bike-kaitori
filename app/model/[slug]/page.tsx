import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import {
  allModels, findBySlug, modelSlug, makerSlug, classOf, stance, spread, yen, SITE, listingUrl, displacementText,
} from '@/lib/data'
import { breadcrumb, faqLd, modelDatasetLd } from '@/lib/schema'
import { pageMeta, fitDesc } from '@/lib/meta'

export function generateStaticParams() {
  return allModels().map((m) => ({ slug: modelSlug(m) }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const m = findBySlug(slug)
  if (!m) return {}
  return pageMeta({
    title: `${m.name}の中古流通台数と価格帯｜${m.maker}`,
    description: fitDesc(
      `${m.maker} ${m.name}は中古車として${m.used_count}台が流通しており、価格帯は${yen(m.used_price_min)}〜${yen(m.used_price_max)}です（${m.fetched_at}時点）。`,
      '売却前の参考として、流通状況をまとめています。',
    ),
    path: `/model/${slug}/`,
  })
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const m = findBySlug(slug)
  if (!m) notFound()

  const cls = classOf(m)
  const peers = allModels().filter((x) => x.class_label === m.class_label)
  const st = stance(m, peers)
  const sp = spread(m)
  const rankInClass =
    peers.slice().sort((a, b) => b.used_count - a.used_count).findIndex((x) => x.model_id === m.model_id) + 1
  const near = peers
    .filter((x) => x.model_id !== m.model_id)
    .sort((a, b) => Math.abs(a.used_count - m.used_count) - Math.abs(b.used_count - m.used_count))
    .slice(0, 6)
  // ⚠️ 被リンクの実測（2026-09-22）で、model 1,537本の中央値が5本・最小1本だった。
  //    クラスが取れない車種は「近い台数6件」が出ず、ほぼ孤立していた。
  //    同じメーカーの車種からも辿れるようにして、どの車種も最低限の導線を持たせる。
  // ⚠️ 「同メーカーの上位8件」にすると、台数の少ない車種は誰からも張られず孤立したまま。
  //    実測（2026-09-22）でも被リンク1本の車種が361件残っていた。
  //    台数順に並べた中での**前後4件ずつ**にして、鎖状に必ず繋がるようにする。
  const makerList = allModels()
    .filter((x) => x.maker === m.maker)
    .sort((a, b) => b.used_count - a.used_count)
  const mi = makerList.findIndex((x) => x.model_id === m.model_id)
  const sameMaker = makerList
    .slice(Math.max(0, mi - 4), mi + 5)
    .filter((x) => x.model_id !== m.model_id)

  // 新車価格が取れている場合だけ、値落ちの位置を出す（取れていない車種では触れない）
  const listing = listingUrl(m)

  const drop =
    m.new_price_min && m.used_price_min
      ? Math.round((1 - m.used_price_min / m.new_price_min) * 100)
      : null

  const ld = [
    breadcrumb([
      { name: 'トップ', url: `${SITE.origin}/` },
      { name: m.maker, url: `${SITE.origin}/maker/${makerSlug(m.maker)}/` },
      ...(cls ? [{ name: cls.label, url: `${SITE.origin}/class/${cls.slug}/` }] : []),
      { name: m.name, url: `${SITE.origin}/model/${slug}/` },
    ]),
    modelDatasetLd(m),
    // ⚠️ 答えられることだけFAQにする。買取額は各社が公表していないので断定しない。
    faqLd([
      {
        q: `${m.name}の中古は何台くらい流通していますか？`,
        a: `${m.fetched_at}時点で${m.used_count}台です。流通台数が多いほど買い手は代替となる車両を見つけやすいため、売り手にとって有利な条件を引き出しにくくなります。`,
      },
      {
        q: `${m.name}の中古車価格帯はいくらですか？`,
        a: `${yen(m.used_price_min)}〜${yen(m.used_price_max)}です（${m.fetched_at}時点）。これは中古車としての販売価格であり、買取価格ではありません。買取額は、販売価格から買取業者の整備費・保証・利益を差し引いた水準となります。`,
      },
      {
        q: `買取価格はいくらですか？`,
        a: `当サイトでは買取価格の断定を控えています。買取業者各社が公表しておらず、年式・走行距離・車検・傷の有無により金額が変わるためです。その代わりに、買取額を左右する主要な要因である流通台数と価格帯を掲載しています。`,
      },
    ]),
  ]

  return (
    <article>
      {ld.map((x, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(x) }} />
      ))}
      <p className="note" style={{ marginTop: 28 }}>
        <a href="/">トップ</a> ／ <a href={`/maker/${makerSlug(m.maker)}/`}>{m.maker}</a>
        {cls && <> ／ <a href={`/class/${cls.slug}/`}>{cls.label}</a></>}
      </p>

      <h1>{m.maker} {m.name}の中古流通台数と価格帯</h1>

      <div className="verdict">
        <div className="tag">流通状況の概要</div>
        <p className="headline">
          {m.name}の中古車は<span className="num">{m.used_count}</span>台流通しており、同じ排気量クラスの中では{st.label}です。
        </p>
        <p style={{ margin: 0 }}>{st.lead}</p>
      </div>

      <p>
        中古車価格帯は<strong className="num">{yen(m.used_price_min)}〜{yen(m.used_price_max)}</strong>で、
        上限は下限の<span className="num">{sp.toFixed(1)}</span>倍です。
        {sp >= 3
          ? 'この倍率は比較的大きく、同じ車種でも状態により評価が大きく変わることを示しています。売却の際は、複数社の査定を比較されることをおすすめします。'
          : '倍率は比較的小さく、状態による価格の差は限定的です。'}
      </p>

      <h2>掲載データ</h2>
      <div className="scroll-x">
        <table className="data">
          <tbody>
            <tr><th>中古車価格帯</th><td className="n">{yen(m.used_price_min)}〜{yen(m.used_price_max)}</td></tr>
            <tr><th>中古車の流通台数</th><td className="n">{m.used_count}台</td></tr>
            {!!m.new_price_min && !!m.new_price_max && (
              <tr><th>新車価格帯（実勢価格）</th><td className="n">{m.new_price_min === m.new_price_max ? yen(m.new_price_min) : `${yen(m.new_price_min)}〜${yen(m.new_price_max)}`}{m.new_count ? `（${m.new_count}台）` : ''}</td></tr>
            )}
            {!!m.displacement_cc && <tr><th>排気量</th><td className="n">{displacementText(m)}</td></tr>}
            {!!m.category && !!m.category_rank && (
              <tr><th>カテゴリ内順位</th><td className="n">{m.category}　{m.category_rank}位</td></tr>
            )}
            {!!m.review_score && !!m.review_count && (
              <tr><th>ユーザーレビュー</th><td className="n">{m.review_score}点（{m.review_count}人）</td></tr>
            )}
            {!!m.owner_count && <tr><th>登録オーナー数</th><td className="n">{m.owner_count.toLocaleString()}人</td></tr>}
          </tbody>
        </table>
      </div>
      <p className="src">
        出典：<a href={m.source_url} rel="noopener noreferrer" target="_blank">バイクブロス バイクカタログ</a>
        （{m.fetched_at} 取得）
      </p>
      {listing && (
        <p className="note">
          現在販売されている{m.name}の中古車は、
          <a href={listing} rel="noopener noreferrer" target="_blank">バイクブロスの中古車在庫一覧</a>
          で確認できます。台数・価格は上記の取得日以降に変動している場合があります。
        </p>
      )}
      <p className="note">
        ※上記は<strong>中古車としての販売価格</strong>であり、買取価格ではありません。
        買取額は、販売価格から買取業者の整備費・保証・利益を差し引いた水準となります。
        当サイトでは、その差引率を推測により掲載することは控えています。
      </p>

      {cls && (
        <>
          <h2>{cls.label}における流通台数の順位</h2>
          <p>
            {cls.label}のうち、当サイトで流通データを確認できた<span className="num">{peers.length}</span>車種の中で、
            {m.name}の流通台数は<strong className="num">{rankInClass}位</strong>です。
            {drop !== null && (
              <>新車の下限価格に対して、中古車の下限価格は<span className="num">{drop}%</span>低い水準にあります。</>
            )}
          </p>
          <h3>流通台数が近い車種</h3>
          <div className="grid">
            {near.map((n) => (
              <a className="card" key={n.model_id} href={`/model/${modelSlug(n)}/`}>
                <div className="k">{n.maker}</div>
                <div className="t">{n.name}</div>
                <div className="v">{n.used_count}台 ／ {yen(n.used_price_min)}〜</div>
              </a>
            ))}
          </div>
        </>
      )}

      {sameMaker.length > 0 && (
        <>
          <h2>{m.maker}の他の車種</h2>
          <div className="grid">
            {sameMaker.map((n) => (
              <a className="card" key={n.model_id} href={`/model/${modelSlug(n)}/`}>
                <div className="k">{n.maker}</div>
                <div className="t">{n.name}</div>
                <div className="v">{n.used_count}台 ／ {yen(n.used_price_min)}〜</div>
              </a>
            ))}
          </div>
          <p className="note">
            <a href={`/maker/${makerSlug(m.maker)}/`}>{m.maker}の車種一覧を見る</a>
          </p>
        </>
      )}

      <h2>売却前の確認事項</h2>
      <h3>流通台数は買取業者の在庫状況を示します</h3>
      <p>
        買取業者は、仕入れた車両を販売して利益を得ています。同じ車種が市場に多く流通している場合、
        買取業者はすでに在庫を保有している可能性が高く、積極的に仕入れる必要性は低くなります。
        反対に流通台数が少ない場合は、需要に対して在庫が不足しやすく、仕入れの需要が生まれます。
        <strong>流通台数は、売却時の交渉に影響する数少ない事前情報の一つ</strong>です。
      </p>
      <h3>価格帯の広さは複数社査定の必要性を示します</h3>
      <p>
        {m.name}の中古車価格帯には<span className="num">{sp.toFixed(1)}</span>倍の開きがあります。
        開きが大きい車種ほど、買取業者ごとの評価にも差が生じやすくなります。
        {sp >= 3 ? '本車種は開きが大きく、複数社の査定を比較する意義が大きいといえます。' : '本車種は開きが比較的小さいため、査定を依頼する社数を増やしても差は生じにくいと考えられます。'}
      </p>
      <h3>掲載データに含まれない情報</h3>
      <p>
        走行距離、車検の残り期間、転倒歴、改造の内容、書類の有無は、掲載データには含まれていません。
        これらは実車を確認しなければ判断できないため、<strong>最終的な買取額は現車査定により決まります</strong>。
        当サイトの数値は、査定前に相場の目安を把握するための参考情報としてご活用ください。
      </p>

      <p className="note" style={{ marginTop: 40 }}>
        <a href={`/maker/${makerSlug(m.maker)}/`}>{m.maker}の他の車種を見る</a>
        {cls && <>　／　<a href={`/class/${cls.slug}/`}>{cls.label}の一覧</a></>}
        　／　<a href="/ranking/">流通台数ランキング</a>
      </p>
    </article>
  )
}
