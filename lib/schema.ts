// 構造化データ（JSON-LD）の組み立て。
//
// ⚠️ 事実だけを出す。このサイトは**買取価格を断定していない**（各社が公表していないため）。
//    なので Product/Offer で「買取価格」を名乗らない。出せるのは
//    「中古市場に何台出ているか」「中古の価格帯がいくらか」という**観測値**だけ。
//    Offer に中古相場を入れると「この価格で売買する申し出」と読まれるので使わない。
// ⚠️ 代わりに Dataset を使う。実際にやっていること（流通台数の収集・公開）と一致する。
import { SITE, modelSlug, yen, type Model } from './data'

export function breadcrumb(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.name,
      item: it.url,
    })),
  }
}

export function websiteLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE.name,
    url: `${SITE.origin}/`,
    description: SITE.description,
    inLanguage: 'ja',
  }
}

/** 車種ページ。⚠️ 価格は「中古の流通価格帯」であって買取保証額ではない、と明記する。 */
export function modelDatasetLd(m: Model) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Dataset',
    name: `${m.maker} ${m.name} の中古流通データ`,
    description:
      `${m.maker} ${m.name} について、中古車として流通している台数（${m.used_count}台）と ` +
      `価格帯（${yen(m.used_price_min)}〜${yen(m.used_price_max)}）を収集したデータ。${m.fetched_at}時点。` +
      `掲載しているのは中古市場の流通価格であり、買取価格ではありません。`,
    url: `${SITE.origin}/model/${modelSlug(m)}/`,
    creator: { '@type': 'Organization', name: SITE.name },
    dateModified: m.fetched_at,
    isAccessibleForFree: true,
    variableMeasured: [
      { '@type': 'PropertyValue', name: '中古流通台数', value: m.used_count, unitText: '台' },
      { '@type': 'PropertyValue', name: '中古価格帯（下限）', value: m.used_price_min, unitCode: 'JPY' },
      { '@type': 'PropertyValue', name: '中古価格帯（上限）', value: m.used_price_max, unitCode: 'JPY' },
    ],
  }
}

export function faqLd(items: { q: string; a: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((x) => ({
      '@type': 'Question',
      name: x.q,
      acceptedAnswer: { '@type': 'Answer', text: x.a },
    })),
  }
}

/** 一覧ページ（メーカー・クラス・ランキング）の ItemList */
export function itemListLd(name: string, urls: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name,
    numberOfItems: urls.length,
    itemListElement: urls.map((u, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: u.name,
      url: u.url,
    })),
  }
}
