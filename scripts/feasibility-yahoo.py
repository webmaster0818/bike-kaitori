#!/usr/bin/env python3
"""バイク実売相場をヤフオク実落札から取れるかの実現性テスト。

■ なぜ先にこれをやるか
  トレカ(toreka-kaitori)でサイト設計まで進めてから
  「32銘柄中20件が状態差で数値を出せない」と判明し、手戻りになった。
  ページを作る前に「そもそも一次データが取れる商材か」を確かめる。

■ 判定
  ok           … 中央値を掲載してよい
  wide_spread  … レンジのみ。単価を出すと誤読される
  insufficient … 母数不足
"""
import json, re, statistics, time, urllib.parse, urllib.request
from datetime import date
from pathlib import Path

UA = ("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/126.0 Safari/537.36")
MAX_PAGES = 6
MIN_SAMPLE = 20
SPREAD_NG = 50
# ⚠️ バイク特有: 部品・ミニカー・カタログ・書籍が大量に混ざる。車体は最低でも数万円
PRICE_MIN, PRICE_MAX = 50_000, 8_000_000

# 検索需要が大きい定番車種（メーカー×車種）
MODELS = [
    ("honda", "ホンダ", "CB400SF", "ホンダ CB400SF"),
    ("honda", "ホンダ", "レブル250", "ホンダ レブル250"),
    ("honda", "ホンダ", "PCX", "ホンダ PCX"),
    ("yamaha", "ヤマハ", "SR400", "ヤマハ SR400"),
    ("yamaha", "ヤマハ", "MT-07", "ヤマハ MT-07"),
    ("yamaha", "ヤマハ", "セロー250", "ヤマハ セロー250"),
    ("kawasaki", "カワサキ", "Ninja250", "カワサキ Ninja250"),
    ("kawasaki", "カワサキ", "Z900RS", "カワサキ Z900RS"),
    ("suzuki", "スズキ", "GSX-R125", "スズキ GSX-R125"),
    ("suzuki", "スズキ", "ジクサー150", "スズキ ジクサー150"),
    ("harley", "ハーレーダビッドソン", "スポーツスター", "ハーレー スポーツスター"),
    ("honda", "ホンダ", "スーパーカブ110", "ホンダ スーパーカブ110"),
]

def fetch(url):
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=20) as r:
        return r.read().decode("utf-8", errors="replace")

def prices_from(html):
    return [int(m.group(1)) for m in re.finditer(r'"price"\s*:\s*(\d+)', html)
            if PRICE_MIN <= int(m.group(1)) <= PRICE_MAX]

def iqr(ps):
    if len(ps) < 4: return ps
    s = sorted(ps); n = len(s)
    q1, q3 = s[n//4], s[(3*n)//4]
    lo, hi = q1 - 1.5*(q3-q1), q3 + 1.5*(q3-q1)
    return [p for p in s if lo <= p <= hi]

def survey(query):
    raw = []
    for page in range(1, MAX_PAGES+1):
        b = 1 + (page-1)*50
        url = ("https://auctions.yahoo.co.jp/closedsearch/closedsearch"
               f"?p={urllib.parse.quote(query)}&b={b}&n=50")
        try: html = fetch(url)
        except Exception as e: return {"error": str(e)[:60]}
        got = prices_from(html)
        if not got: break
        raw.extend(got)
        if page < MAX_PAGES: time.sleep(1.3)
    f = iqr(raw); n = len(f)
    rec = {"query": query, "raw_n": len(raw), "n": n}
    if n == 0: return {**rec, "status": "no_data", "median": None}
    lo, hi = min(f), max(f)
    sp = hi/lo if lo else float("inf")
    rec.update({"min": lo, "max": hi, "spread": round(sp,1)})
    if n < MIN_SAMPLE:   rec.update({"status":"insufficient","median":None})
    elif sp > SPREAD_NG: rec.update({"status":"wide_spread","median":None})
    else:                rec.update({"status":"ok","median":int(statistics.median(f))})
    return rec

results, counts = [], {}
for mk, mk_ja, name, q in MODELS:
    r = survey(q)
    r.update({"maker": mk, "makerJa": mk_ja, "model": name})
    results.append(r)
    counts[r.get("status","error")] = counts.get(r.get("status","error"),0)+1
    med = f"{r['median']:,}円" if r.get("median") else "—"
    rng = f"{r.get('min',0):,}〜{r.get('max',0):,}" if r.get("min") else "—"
    print(f"  {mk_ja:12}{name:16} {r.get('status','ERROR'):12} 中央{med:>11} 幅={rng:>20} n={r.get('n',0)}")
    time.sleep(1.0)

out = Path.home()/"projects/bike-kaitori/data/feasibility.json"
out.write_text(json.dumps({"checked": date.today().isoformat(), "results": results},
                          ensure_ascii=False, indent=1), encoding="utf-8")
print("\n=== 集計 ===")
for k,v in sorted(counts.items()): print(f"  {k:14}{v:>4}")
ok = counts.get("ok",0)
print(f"\n判定: {ok}/{len(MODELS)} が掲載可能水準")
