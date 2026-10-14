// ページ共通のメタデータ（canonical / OGP / Twitter）を1か所で組み立てる。
//
// ⚠️ Next.js はページ側で openGraph を書くと layout の openGraph を**丸ごと上書き**する
//    （images も引き継がれない）。なので各ページは必ずこの pageMeta() を通す。
// ⚠️ og:url は canonical と同じ値にする（ずれると SNS 側の正規URLが割れる）。
// ⚠️ description は 160字以内。超える場合は末尾の補足文を落とす（fitDesc）。
import type { Metadata } from 'next'
import { SITE } from './data'

export const OG_IMAGE = {
  url: `${SITE.origin}/og-image.png`,
  width: 1200,
  height: 630,
  alt: `${SITE.name}｜中古バイクの流通台数と価格帯を車種別に`,
}

export const DESC_MAX = 160

/** 本文 + 補足文。合わせて160字を超えるなら補足文を落とし、それでも超えるなら切り詰める */
export function fitDesc(main: string, extra = ''): string {
  const full = main + extra
  if (full.length <= DESC_MAX) return full
  if (main.length <= DESC_MAX) return main
  return main.slice(0, DESC_MAX - 1) + '…'
}

export function pageMeta(opts: { title?: string; description: string; path: string }): Metadata {
  const url = `${SITE.origin}${opts.path}`
  const ogTitle = opts.title ? `${opts.title}｜${SITE.name}` : `${SITE.name}｜中古バイクの流通台数と価格帯を車種別に公開`
  return {
    ...(opts.title ? { title: opts.title } : {}),
    description: opts.description,
    alternates: { canonical: url },
    openGraph: {
      type: 'website',
      locale: 'ja_JP',
      siteName: SITE.name,
      url,
      title: ogTitle,
      description: opts.description,
      images: [OG_IMAGE],
    },
    twitter: {
      card: 'summary_large_image',
      title: ogTitle,
      description: opts.description,
      images: [OG_IMAGE.url],
    },
  }
}
