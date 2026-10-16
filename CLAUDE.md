# bike-kaitori（biker-sell.com）

- デプロイ: 方式B（`npm run build` → `out/` を ../bike-kaitori-deploy へ rsync --delete（.git除外）→ push）。デプロイ前に `site-precheck.py --origin https://biker-sell.com out` 全項目OK必須
- sitemap lastmod: `data/lastmod.json`（ページ中身の指紋台帳）で管理。ビルド後に台帳の差分も必ずコミットする（scripts/generate-sitemap.mjs 冒頭コメント参照）

## 作業ログ
- 2026-10-16: X/Facebook カード点検＝sitemap 全1,565URLで og:title/description/image/url(=canonical)/twitter:card 欠け・不一致0、og-image.png 200・1200x630。sitemap lastmod を全件9/5固定→デプロイ履歴から復元した実変更日（9/18:1・9/22:1,550・10/14:14）に（src `041e625`／deploy `3e38065b`）。GSC日別表示: 10/9〜12 は16〜31/日、10/13 は78 に戻り悪化継続なし
