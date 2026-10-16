// ビルド後に out/ へ sitemap.xml / robots.txt / オープンデータ(CSV,JSON) を書き出す。
// ⚠️ ページを増減したらここも必ず追随させる（sitemap更新漏れは全サイト共通のNG）。
import fs from 'node:fs'
import path from 'node:path'
import { fingerprint } from './lastmod-lib.mjs'

const ROOT = process.cwd()
const OUT = path.join(ROOT, 'out')
const ORIGIN = 'https://biker-sell.com'

const stockDir = path.join(ROOT, 'data', 'stock')
const latest = fs.readdirSync(stockDir).filter(f => f.endsWith('.json')).sort().pop()
const snap = JSON.parse(fs.readFileSync(path.join(stockDir, latest), 'utf-8'))

const MAKER_EN = {
  'ホンダ':'honda','ヤマハ':'yamaha','スズキ':'suzuki','カワサキ':'kawasaki',
  'ハーレーダビッドソン':'harley-davidson','ビーエムダブリュー':'bmw','ドゥカティ':'ducati',
  'トライアンフ':'triumph','ケーティーエム':'ktm','MVアグスタ':'mv-agusta',
  'モトグッツィ':'moto-guzzi','アプリリア':'aprilia','ハスクバーナ':'husqvarna',
  'ピアジオ':'piaggio','ベスパ':'vespa','インディアン':'indian',
  'ヴィクトリー':'victory','キムコ':'kymco','ビューエル':'buell',
}
const CLASSES = [
  ['50cc','50cc以下'],['125cc','51～125cc'],['250cc','126～250cc'],['400cc','251～400cc'],
  ['750cc','401～750cc'],['over750cc','751～1000cc'],['over1000cc','1001cc以上'],
]

const models = snap.models
const urls = ['/', '/ranking/', '/data/']
for (const mk of new Set(models.map(m => m.maker))) urls.push(`/maker/${MAKER_EN[mk] ?? mk}/`)
for (const [slug, label] of CLASSES) if (models.some(m => m.class_label === label)) urls.push(`/class/${slug}/`)
for (const m of models) urls.push(`/model/${(MAKER_EN[m.maker] ?? m.maker)}-${m.model_id.replace('_','-')}/`)

// lastmod = そのページの中身（title・description・本文・構造化データ）が最後に変わった日。
// data/lastmod.json に {パス: {hash, lastmod}} を持ち、ビルドした html の指紋が台帳と違うページだけ
// 今日（JST）に更新する。台帳の初期値はデプロイ履歴から復元（scripts/backfill-lastmod.mjs）。
// ⚠️ 台帳 data/lastmod.json はビルド後に必ずコミットする（しないと次回また「今日」になる）。
const LEDGER = path.join(ROOT, 'data', 'lastmod.json')
const ledger = fs.existsSync(LEDGER) ? JSON.parse(fs.readFileSync(LEDGER, 'utf-8')) : {}
const todayJst = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Tokyo' }).format(new Date())
let touched = 0
for (const u of urls) {
  const html = fs.readFileSync(path.join(OUT, u, 'index.html'), 'utf-8')
  const h = fingerprint(html)
  if (!ledger[u] || ledger[u].hash !== h) { ledger[u] = { hash: h, lastmod: todayJst }; touched++ }
}
fs.writeFileSync(LEDGER, JSON.stringify(Object.fromEntries(Object.keys(ledger).sort().map(k => [k, ledger[k]])))
  .replace(/\},"/g, '},\n"') + '\n')
fs.writeFileSync(path.join(OUT, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
  urls.map(u => `<url><loc>${ORIGIN}${u}</loc><lastmod>${ledger[u].lastmod}</lastmod></url>`).join('\n') +
  `\n</urlset>\n`)
console.log(`lastmod: 中身が変わった/新規 ${touched} ページを ${todayJst} に更新`)

fs.writeFileSync(path.join(OUT, 'robots.txt'),
  `User-agent: *\nAllow: /\n\nSitemap: ${ORIGIN}/sitemap.xml\n`)

// オープンデータ配布
const odir = path.join(OUT, 'opendata')
fs.mkdirSync(odir, { recursive: true })
const cols = ['maker','name','used_count','used_price_min','used_price_max','new_price_min','new_price_max',
              'new_count','displacement_cc','class_label','category','category_rank','review_score',
              'review_count','owner_count','source_url','fetched_at']
const esc = v => v === undefined || v === null ? '' : /[",\n]/.test(String(v)) ? `"${String(v).replace(/"/g,'""')}"` : String(v)
fs.writeFileSync(path.join(odir, 'bike-stock.csv'),
  cols.join(',') + '\n' + models.map(m => cols.map(c => esc(m[c])).join(',')).join('\n') + '\n')
fs.writeFileSync(path.join(odir, 'bike-stock.json'), JSON.stringify({
  source: snap.source, source_url: snap.source_url, generated_at: snap.generated_at,
  license: 'CC BY 4.0', note: '中古車としての流通価格・台数であり買取価格ではない', models,
}, null, 1))

console.log(`sitemap ${urls.length} URL / opendata ${models.length}件 を out/ に書き出しました`)
