# bike-kaitori（biker-sell.com）

- デプロイ: 方式B（`npm run build` → `out/` を ../bike-kaitori-deploy へ rsync --delete（.git除外）→ push）。デプロイ前に `site-precheck.py --origin https://biker-sell.com out` 全項目OK必須
- sitemap lastmod: `data/lastmod.json`（ページ中身の指紋台帳）で管理。ビルド後に台帳の差分も必ずコミットする（scripts/generate-sitemap.mjs 冒頭コメント参照）

## 作業ログ
- 2026-10-16: X/Facebook カード点検＝sitemap 全1,565URLで og:title/description/image/url(=canonical)/twitter:card 欠け・不一致0、og-image.png 200・1200x630。sitemap lastmod を全件9/5固定→デプロイ履歴から復元した実変更日（9/18:1・9/22:1,550・10/14:14）に（src `041e625`／deploy `3e38065b`）。GSC日別表示: 10/9〜12 は16〜31/日、10/13 は78 に戻り悪化継続なし
- 2026-10-16 夜: 全文言のビジネス文書化（MediaXAI 指示・writing-standards §8）。layout/TOP/model/maker/class/ranking/data/404＋lib（stance 文・SITE.description・Dataset）を「当サイトでは〜しています」型に。h1「あなたのバイクは、いま何台出回っているか。」→「中古バイクの流通台数と価格帯（車種別）」、ranking title「買い叩かれやすい車種はどれか」→「車種別の流通台数と価格帯」、「まず結論」→「流通状況の概要」、「1社だけで決めると損得になります」→「複数社の査定を比較されることをおすすめします」。用語統一: 中古価格帯→中古車価格帯／業者・買取各社→買取業者／開き(表見出し)→倍率。/data/ の他サイト批判文（「買取相場◯◯円と書かれた比較サイトは…出どころは示されていない」）は削除。out/ NG 0件・precheck 全項目OK（src `dbcdf1a`／deploy `a35264c1`）。lastmod 台帳は文言変更で全1,537 model＋α を 10/16 に更新（中身の変更なので正当）
  - 未修正（要判断）: クラス未判定の車種（例 /model/harley-davidson-1-8/）でも stance 文が「同じ排気量クラスの中では」と出る（peers がクラス未設定車種の集合になるロジック）。データ取得日が 2026-09-05 のまま。「その他のモデル」が倍率上位カードに出る。カテゴリ内順位 3367位 など出典値そのまま
- 2026-10-18: GSC 28日（9/18〜10/16）表示上位3本＝/model/kawasaki-87-18/(46)・suzuki-122-14/(45)・harley-davidson-2-4/(42)、全てクリック0、語は「〇〇 中古」「〇〇 新車」。サイトに買取業者の事実（エリア・出張料・手数料・営業時間・キャンペーン）の掲載は無し＝照合対象0。受け皿として出典カタログの「中古車在庫一覧」リンクを3車種に追加（`data/listing-urls.json`・目視で写した URL。在庫検索IDはカタログIDと別体系で計算不可）。collect-stock.py は次回収集から listing_url を取る。あわせて表の上に「0」が出る表示崩れ（review_score/owner_count が 0 の車種、598ページ）を修正（src `4a668d3`／deploy `9081783f`）
  - 未修正: collect-stock.py の新車価格帯の正規表現は「〜」付きの範囲しか取れず、単一価格（例 MT-15「32万6900円」）を取りこぼす。9/5 取得値と出典の現在値にずれ（例 87_18 は台数・価格帯とも一致、2_4 7→6台/上限124.8万→150万・122_14 3→2台）。データ更新は未実施
