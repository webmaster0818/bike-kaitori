// 一度だけ実行：デプロイ用リポ（bike-kaitori-deploy）の全コミット履歴から、
// 各ページの中身（lastmod-lib の指紋）が最後に変わったコミットの日付（JST）を data/lastmod.json に書く。
// 使い方: node scripts/backfill-lastmod.mjs ../bike-kaitori-deploy
import fs from 'node:fs'
import path from 'node:path'
import { execFileSync, spawnSync } from 'node:child_process'
import { fingerprint, htmlToPath } from './lastmod-lib.mjs'

const repo = path.resolve(process.argv[2] || '../bike-kaitori-deploy')
const git = (...a) => execFileSync('git', ['-C', repo, ...a], { encoding: 'utf-8', maxBuffer: 1 << 28 })
const commits = git('log', '--reverse', '--format=%H %ad', '--date=format-local:%Y-%m-%d').trim().split('\n')
  .map(l => l.split(' '))
const ledger = {}
for (const [sha, date] of commits) {
  const files = git('ls-tree', '-r', '--name-only', sha).split('\n').filter(f => htmlToPath(f))
  const r = spawnSync('git', ['-C', repo, 'cat-file', '--batch'], { input: files.map(f => `${sha}:${f}`).join('\n') + '\n', maxBuffer: 1 << 30 })
  const buf = r.stdout
  let off = 0, changed = 0
  for (const f of files) {
    const nl = buf.indexOf(10, off)
    const size = Number(buf.subarray(off, nl).toString().split(' ')[2])
    const html = buf.subarray(nl + 1, nl + 1 + size).toString('utf-8')
    off = nl + 1 + size + 1
    const p = htmlToPath(f), h = fingerprint(html)
    if (!ledger[p] || ledger[p].hash !== h) { ledger[p] = { hash: h, lastmod: date }; changed++ }
  }
  console.log(sha.slice(0, 8), date, `${files.length}ページ中 ${changed} 件の中身が変化`)
}
const sorted = Object.fromEntries(Object.keys(ledger).sort().map(k => [k, ledger[k]]))
fs.writeFileSync(path.join(process.cwd(), 'data', 'lastmod.json'), JSON.stringify(sorted, null, 0).replace(/\},"/g, '},\n"') + '\n')
console.log(`data/lastmod.json: ${Object.keys(sorted).length} ページ`)
