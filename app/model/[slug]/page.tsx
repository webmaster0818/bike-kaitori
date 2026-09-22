import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import {
  allModels, findBySlug, modelSlug, makerSlug, classOf, stance, spread, yen, SITE,
} from '@/lib/data'
import { breadcrumb, faqLd, modelDatasetLd } from '@/lib/schema'

export function generateStaticParams() {
  return allModels().map((m) => ({ slug: modelSlug(m) }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const m = findBySlug(slug)
  if (!m) return {}
  return {
    title: `${m.name}の中古流通台数と価格帯｜${m.maker}`,
    description: `${m.maker} ${m.name}は中古車として${m.used_count}台が流通しており、価格帯は${yen(m.used_price_min)}〜${yen(m.used_price_max)}です（${m.fetched_at}時点）。売却前に押さえておきたい流通の状況をまとめています。`,
    alternates: { canonical: `${SITE.origin}/model/${slug}/` },
  }
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
        a: `${m.fetched_at}時点で${m.used_count}台です。流通台数が多いほど買い手にとって代替が効くため、査定では強気に出にくくなります。`,
      },
      {
        q: `${m.name}の中古価格帯はいくらですか？`,
        a: `${yen(m.used_price_min)}〜${yen(m.used_price_max)}です（${m.fetched_at}時点）。これは中古車として売られている価格であり、買取価格ではありません。買取額はここから業者の整備費・保証・利益を差し引いた水準になります。`,
      },
      {
        q: `買取価格はいくらですか？`,
        a: `当サイトは買取価格を断定していません。各社が公表しておらず、年式・走行距離・車検・傷で金額が変わるためです。代わりに、買取額を左右する最大の要因である流通台数と価格帯を公開しています。`,
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
        <div className="tag">まず結論</div>
        <p className="headline">
          {m.name}は中古車が<span className="num">{m.used_count}</span>台流通しています。{st.label}です。
        </p>
        <p style={{ margin: 0 }}>{st.lead}</p>
      </div>

      <p>
        価格帯は<strong className="num">{yen(m.used_price_min)}〜{yen(m.used_price_max)}</strong>で、
        上限は下限の<span className="num">{sp.toFixed(1)}</span>倍です。
        {sp >= 3
          ? 'この開きは大きいほうで、同じ車種でも状態によって評価が大きく変わることを示しています。1社だけの査定で決めると、その差がそのまま損得になります。'
          : '開きは比較的小さく、状態による振れ幅は限定的です。'}
      </p>

      <h2>実データ</h2>
      <div className="scroll-x">
        <table className="data">
          <tbody>
            <tr><th>中古車価格帯</th><td className="n">{yen(m.used_price_min)}〜{yen(m.used_price_max)}</td></tr>
            <tr><th>中古車の流通台数</th><td className="n">{m.used_count}台</td></tr>
            {m.new_price_min && m.new_price_max && (
              <tr><th>新車価格帯（実勢価格）</th><td className="n">{yen(m.new_price_min)}〜{yen(m.new_price_max)}{m.new_count ? `（${m.new_count}台）` : ''}</td></tr>
            )}
            {m.displacement_cc && <tr><th>排気量</th><td className="n">{m.displacement_cc}cc</td></tr>}
            {m.category && m.category_rank && (
              <tr><th>カテゴリ内順位</th><td className="n">{m.category}　{m.category_rank}位</td></tr>
            )}
            {m.review_score && m.review_count && (
              <tr><th>ユーザーレビュー</th><td className="n">{m.review_score}点（{m.review_count}人）</td></tr>
            )}
            {m.owner_count && <tr><th>登録オーナー数</th><td className="n">{m.owner_count.toLocaleString()}人</td></tr>}
          </tbody>
        </table>
      </div>
      <p className="src">
        出典：<a href={m.source_url} rel="noopener noreferrer" target="_blank">バイクブロス バイクカタログ</a>
        （{m.fetched_at} 取得）
      </p>
      <p className="note">
        ※上記は<strong>中古車として売られている価格</strong>であり、買取価格ではありません。
        買取額は販売価格から業者の整備費・保証・利益を差し引いた水準になります。
        当サイトはその差引率を推測で書きません。
      </p>

      {cls && (
        <>
          <h2>{cls.label}の中での位置</h2>
          <p>
            {cls.label}のうち当サイトが流通データを確認できた<span className="num">{peers.length}</span>車種の中で、
            {m.name}の流通台数は<strong className="num">{rankInClass}位</strong>です。
            {drop !== null && (
              <>　新車の下限価格に対して、中古の下限は<span className="num">{drop}%</span>低い位置にあります。</>
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
            <a href={`/maker/${makerSlug(m.maker)}/`}>{m.maker}の車種一覧をすべて見る</a>
          </p>
        </>
      )}

      <h2>売却前に押さえておきたいこと</h2>
      <h3>台数が示すのは「相手の在庫状況」</h3>
      <p>
        買取業者は仕入れた車体を売って利益を出します。同じ車種が市場に何台も出ていれば、
        業者はすでに在庫を持っている可能性が高く、無理をして仕入れる理由がありません。
        逆に台数が少なければ、探している顧客に対して在庫が足りないので、仕入れる動機が生まれます。
        <strong>流通台数は、こちらの交渉力を左右する数少ない事前情報</strong>です。
      </p>
      <h3>価格帯の広さは「査定を複数取る価値」</h3>
      <p>
        {m.name}の価格帯は<span className="num">{sp.toFixed(1)}</span>倍の開きがあります。
        開きが大きい車種ほど、業者ごとの評価の差も出やすくなります。
        {sp >= 3 ? '複数社に見てもらう価値が大きい車種です。' : '開きが小さいため、社数を増やしても差は出にくい可能性があります。'}
      </p>
      <h3>この数字で分からないこと</h3>
      <p>
        走行距離、車検の残り、転倒歴、改造の内容、書類の有無は、この数字には含まれていません。
        これらは実車を見なければ判断できず、<strong>最終的な金額は現車査定でしか決まりません</strong>。
        当サイトの数値は、査定を受ける前に相場観を持つためのものとしてお使いください。
      </p>

      <p className="note" style={{ marginTop: 40 }}>
        <a href={`/maker/${makerSlug(m.maker)}/`}>{m.maker}の他の車種を見る</a>
        {cls && <>　／　<a href={`/class/${cls.slug}/`}>{cls.label}の一覧</a></>}
        　／　<a href="/ranking/">流通台数ランキング</a>
      </p>
    </article>
  )
}
