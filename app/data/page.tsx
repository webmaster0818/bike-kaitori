import type { Metadata } from 'next'
import { allModels, snapshot, SITE } from '@/lib/data'
import { pageMeta } from '@/lib/meta'

export const metadata: Metadata = pageMeta({
  title: '中古バイク流通データの公開（CSV / JSON）',
  description:
    '当サイトが集計した車種別の中古車流通台数・価格帯を、出典と取得日を付してCSV・JSON形式で公開しています。出典を明記いただくことで、自由に引用・再利用いただけます。',
  path: '/data/',
})

export default function Page() {
  const snap = snapshot()
  const all = allModels()
  const total = all.reduce((n, m) => n + m.used_count, 0)
  const makers = new Set(all.map((m) => m.maker)).size

  // 回答エンジン・AIが数値を機械的に引用できるようにDatasetを出す
  const dataset = {
    '@context': 'https://schema.org',
    '@type': 'Dataset',
    name: '車種別 中古バイク流通台数・価格帯データ',
    description:
      '国内で流通している中古バイクについて、車種ごとの流通台数と中古車価格帯を集計したデータです。買取価格ではなく、中古車としての流通価格です。',
    creator: { '@type': 'Organization', name: SITE.name },
    url: `${SITE.origin}/data/`,
    dateModified: snap.generated_at,
    isAccessibleForFree: true,
    license: 'https://creativecommons.org/licenses/by/4.0/',
    variableMeasured: [
      { '@type': 'PropertyValue', name: '掲載車種数', value: all.length },
      { '@type': 'PropertyValue', name: '中古流通台数の合計', value: total },
      { '@type': 'PropertyValue', name: '対象メーカー数', value: makers },
    ],
    distribution: [
      { '@type': 'DataDownload', encodingFormat: 'text/csv', contentUrl: `${SITE.origin}/opendata/bike-stock.csv` },
      { '@type': 'DataDownload', encodingFormat: 'application/json', contentUrl: `${SITE.origin}/opendata/bike-stock.json` },
    ],
  }

  return (
    <article>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(dataset) }} />
      <p className="note" style={{ marginTop: 28 }}><a href="/">トップ</a> ／ データ公開</p>
      <h1>中古バイク流通データの公開</h1>

      <div className="verdict">
        <div className="tag">公開データ</div>
        <p className="headline">
          <span className="num">{all.length}</span>車種 ／ のべ<span className="num">{total.toLocaleString()}</span>台 ／ <span className="num">{makers}</span>メーカー
        </p>
        <p style={{ margin: 0 }}>
          取得日：{snap.generated_at}。1行につき1車種で、流通台数・中古車価格帯・新車価格帯・排気量・出典URLを収録しています。
        </p>
      </div>

      <div className="chips">
        <a href="/opendata/bike-stock.csv">CSVをダウンロード</a>
        <a href="/opendata/bike-stock.json">JSONをダウンロード</a>
      </div>

      <h2>収録項目</h2>
      <div className="scroll-x">
        <table className="data">
          <tbody>
            <tr><th>maker / name</th><td>メーカー名・車種名</td></tr>
            <tr><th>used_count</th><td>中古車として流通している台数</td></tr>
            <tr><th>used_price_min / max</th><td>中古車価格帯（円）</td></tr>
            <tr><th>new_price_min / max / new_count</th><td>新車価格帯（実勢価格・円）と台数（取得できた車種のみ）</td></tr>
            <tr><th>displacement_cc / class_label</th><td>排気量と排気量クラス</td></tr>
            <tr><th>category / category_rank</th><td>カテゴリとカテゴリ内順位</td></tr>
            <tr><th>review_score / review_count / owner_count</th><td>ユーザーレビューと登録オーナー数</td></tr>
            <tr><th>source_url / fetched_at</th><td>出典URLと取得日（全行に付与）</td></tr>
          </tbody>
        </table>
      </div>

      <h2>集計方法</h2>
      <p>
        当サイトでは、バイクブロスのバイクカタログの各車種ページに掲載されている数値を取得しています。
        <strong>中古車価格帯と流通台数の両方を取得できた車種のみ</strong>を収録し、
        取得できなかった車種は収録・掲載の対象外としています。推計値・補完値は含んでおりません。
      </p>

      <h2>掲載データが買取価格ではない理由</h2>
      <p>
        バイクの買取価格は、年式・走行距離・車検の残り期間・傷や転倒歴・改造の内容といった
        個体の状態により決まります。そのため、買取業者各社は車種別の買取価格を公表していません。
      </p>
      <p>
        当サイトでは、公表されていない数値を推測により掲載することは控えています。その代わりに、
        <strong>根拠を確認できる「中古車としての流通価格と台数」</strong>を掲載し、
        それらが買取交渉にどのように影響するかをご説明しています。
      </p>

      <h2>引用について</h2>
      <p>
        出典を明記いただくことで、記事・研究・アプリケーションなどで自由にご利用いただけます（CC BY 4.0）。
        表記例は以下のとおりです。
      </p>
      <p className="note" style={{ background: 'var(--paper-2)', border: '1px solid var(--line)', padding: '14px 16px' }}>
        出典：{SITE.name}「車種別 中古バイク流通台数・価格帯データ」（{snap.generated_at} 取得）{SITE.origin}/data/
      </p>
      <p className="src">
        一次データ出典：<a href={snap.source_url} rel="noopener noreferrer" target="_blank">{snap.source}</a>
      </p>
    </article>
  )
}
