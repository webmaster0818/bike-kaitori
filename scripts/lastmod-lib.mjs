// sitemap の lastmod 用：ページの「中身」の指紋を取る（ビルド毎に変わる JS チャンク名などは含めない）。
// 対象 = <title> + meta description + <main> 内のテキスト（構造化データ JSON-LD を含む）。
// CSS クラスやリンク先だけの変更は中身の変更として数えない。
import crypto from 'node:crypto'

const decode = s => s.replace(/&quot;/g, '"').replace(/&#x27;/g, "'").replace(/&lt;/g, '<')
  .replace(/&gt;/g, '>').replace(/&amp;/g, '&')

export function fingerprint(html) {
  const title = (html.match(/<title>([\s\S]*?)<\/title>/) || [])[1] || ''
  const desc = (html.match(/<meta name="description" content="([^"]*)"/) || [])[1] || ''
  const main = (html.match(/<main[\s\S]*?<\/main>/) || [''])[0]
  const ld = [...main.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map(m => m[1]).join('\n')
  const text = main.replace(/<script[\s\S]*?<\/script>/g, ' ').replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
  return crypto.createHash('sha256').update([decode(title), decode(desc), decode(text), ld].join('\u0000')).digest('hex').slice(0, 16)
}

/** out/ 内の html ファイル相対パス → sitemap 上のパス（/model/x/index.html → /model/x/） */
export function htmlToPath(rel) {
  if (rel === 'index.html') return '/'
  if (rel.endsWith('/index.html')) return '/' + rel.slice(0, -'index.html'.length)
  return null
}
