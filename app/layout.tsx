import type { Metadata } from 'next'
import './globals.css'
import { SITE } from '@/lib/data'
import { OG_IMAGE } from '@/lib/meta'

// ⚠️ ここに静的な alternates.canonical を書かないこと。
//    子ページが全部それを継承して「正規URL＝トップ」と宣言してしまう
//    （pilates-biyori で全403ページが該当し、順位を落としていた実例がある）。
export const metadata: Metadata = {
  metadataBase: new URL(SITE.origin),
  title: {
    default: `${SITE.name}｜中古バイクの流通台数と価格帯を車種別に公開`,
    template: `%s｜${SITE.name}`,
  },
  description: SITE.description,
  // 子ページは lib/meta.ts の pageMeta() で openGraph を明示する（ここは404等の保険）
  openGraph: { type: 'website', locale: 'ja_JP', siteName: SITE.name, images: [OG_IMAGE] },
  twitter: { card: 'summary_large_image', images: [OG_IMAGE.url] },
  icons: {
    icon: [{ url: '/favicon.ico', sizes: 'any' }, { url: '/icon.png', type: 'image/png', sizes: '512x512' }],
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Oswald:wght@400;500;600&family=Zen+Kaku+Gothic+New:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <header className="site">
          <div className="inner">
            <a className="logo" href="/">BIKE KAITORI</a>
            <nav>
              <a href="/ranking/">流通台数ランキング</a>
              <a href="/maker/honda/">メーカー別</a>
              <a href="/class/400cc/">排気量別</a>
              <a href="/data/">データ公開</a>
            </nav>
          </div>
        </header>
        <main className="wrap">{children}</main>
        <footer className="site">
          <div className="wrap">
            <div style={{ maxWidth: 560 }}>
              <p className="note">
                当サイトでは、<strong>中古車として流通している価格帯と台数</strong>を掲載しています。
                掲載している数値は買取価格ではありません。バイクの買取額は、年式・走行距離・車検の残り期間・傷や改造の有無といった
                個体の状態により決まるため、買取業者は車種別の買取価格を公表していません。
                当サイトでは、公表されていない数値を推測により掲載することは控えています。
              </p>
              <p className="note">
                数値の出典：<a href="https://www.bikebros.co.jp/catalog/" rel="noopener noreferrer" target="_blank">バイクブロス バイクカタログ</a>
                （取得日は車種ページごとに明記しています）
              </p>
            </div>
            <div className="note">
              <a href="/data/">データの引用について</a>
            </div>
          </div>
        </footer>
      </body>
    </html>
  )
}
