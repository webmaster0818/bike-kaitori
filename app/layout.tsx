import type { Metadata } from 'next'
import './globals.css'
import { SITE } from '@/lib/data'

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
                当サイトが掲載しているのは<strong>中古車として流通している価格帯と台数</strong>です。
                買取価格そのものではありません。バイクの買取額は年式・走行距離・車検の残り・傷や改造の有無といった
                個体の状態で決まるため、買取各社は車種別の買取価格を公表していません。
                当サイトは公表されていない数字を推測で書かないという方針を採っています。
              </p>
              <p className="note">
                数値の出典：<a href="https://www.bikebros.co.jp/catalog/" rel="noopener noreferrer" target="_blank">バイクブロス バイクカタログ</a>
                （車種ページごとに取得日を明記しています）
              </p>
            </div>
            <div className="note">
              <a href="/data/">データを引用する</a>
            </div>
          </div>
        </footer>
      </body>
    </html>
  )
}
