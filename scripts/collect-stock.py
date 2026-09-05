#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""P2: 車種別の中古流通データを収集して日次スナップショットに保存する。

■ このサイトの土台になるデータ
  バイクの買取価格は「現車査定（年式・走行距離・車検・傷）」で決まるため、
  買取店は車種別の買取価格を公表していない（P1の検証で確認済み）。
  そこで当サイトは **買取価格を断定せず、実データで裏が取れる「中古流通の状況」** を出す。

    中古車価格帯・流通台数  … 業者の在庫状況＝買い叩かれやすさの指標
    新車価格帯              … 値落ちの度合いを見るための基準
    カテゴリ内ランキング      … 需要の代理指標
    ユーザーレビュー・オーナー数 … 母集団の厚み

■ データ源と敬意
  バイクブロス バイクカタログ。robots.txt は `User-agent: * / Disallow:`（全許可）で、
  `*` に Crawl-delay の指定は無い（実測 2026-09-05）。GPTBot のみ全面拒否だが当方は該当しない。
  それでも1サイトに数千リクエストを投げるので **既定2秒間隔** で流す。
  ⚠️ 取得した数値は全ページで source_url ＋ fetched_at を明示する（MediaXAI承認方針 2026-08-12）。

■ 品質ゲート（空ページ量産を避ける）
  中古車価格帯と流通台数の両方が取れた車種だけを ok に入れる。
  取れなかったものは skipped に理由つきで残し、**ページ化しない**。
  （takushoku-biyori で薄いページを量産して被弾した経験を踏まえる）

■ 出力
  data/stock/YYYY-MM-DD.json
"""
import json
import re
import subprocess
import sys
import time
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
UA = ("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/126.0 Safari/537.36")
SLEEP = 2.0


def get(url: str) -> str:
    r = subprocess.run(["curl", "-sL", "--max-time", "30", "-A", UA, url],
                       capture_output=True, text=True)
    return r.stdout or ""


def text_of(html: str) -> str:
    t = re.sub(r"<script[\s\S]*?</script>", " ", html)
    t = re.sub(r"<style[\s\S]*?</style>", " ", t)
    return re.sub(r"\s+", " ", re.sub(r"<[^>]+>", " ", t))


def yen(s: str) -> int | None:
    """「172万7000円」「275万円」「9万8800円」→ 円（int）。

    ⚠️ 「万」を単純に10000倍すると 172万7000 が 1,727,0000 になる。
       万の前後を分けて計算する。
    """
    s = s.replace(",", "").strip()
    m = re.match(r"^(?:(\d+)万)?(\d+)?円?$", s)
    if not m or not (m.group(1) or m.group(2)):
        return None
    man = int(m.group(1)) if m.group(1) else 0
    rest = int(m.group(2)) if m.group(2) else 0
    return man * 10000 + rest


PRICE_BAND = r"([\d,]+(?:万)?(?:\d+)?円)\s*〜\s*([\d,]+(?:万)?(?:\d+)?円)\s*(\d+)\s*台"


def parse_model(t: str) -> dict:
    """カタログ本文テキストから数値を取り出す。取れない項目は入れない（Noneで埋めない）。"""
    rec: dict = {}

    m = re.search(r"新車価格帯（実勢価格）\s*" + PRICE_BAND, t)
    if m:
        rec["new_price_min"] = yen(m.group(1))
        rec["new_price_max"] = yen(m.group(2))
        rec["new_count"] = int(m.group(3))

    m = re.search(r"中古車価格帯\s*" + PRICE_BAND, t)
    if m:
        rec["used_price_min"] = yen(m.group(1))
        rec["used_price_max"] = yen(m.group(2))
        rec["used_count"] = int(m.group(3))

    m = re.search(r"ランキング\s*(.+?)\s*(\d+)\s*位", t)
    if m:
        rec["category"] = m.group(1).strip()
        rec["category_rank"] = int(m.group(2))

    m = re.search(r"ユーザーレビュー\s*([\d.]+)\s*点\s*評価人数：\s*(\d+)\s*人", t)
    if m:
        rec["review_score"] = float(m.group(1))
        rec["review_count"] = int(m.group(2))

    m = re.search(r"愛車オーナー\s*([\d,]+)\s*人", t)
    if m:
        rec["owner_count"] = int(m.group(1).replace(",", ""))

    m = re.search(r"排気量 \(cc\)\s*([\d.]+)", t)
    if m:
        rec["displacement_cc"] = float(m.group(1))

    m = re.search(r"バイクカタログ\s+\S+?\s*\(\S+?\)\s*(\S*?cc\S*?)\s", t)
    if m:
        rec["class_label"] = m.group(1)

    return rec


def main() -> None:
    argv = sys.argv[1:]
    limit = int(argv[0]) if argv and argv[0].isdigit() else None

    master = json.loads((ROOT / "data" / "model-master.json").read_text(encoding="utf-8"))
    models = master["models"]
    if limit:
        models = models[:limit]

    today = date.today().isoformat()
    ok, skipped = [], []
    t0 = time.time()

    for i, mdl in enumerate(models, 1):
        html = get(mdl["url"])
        if not html:
            skipped.append({**mdl, "reason": "取得失敗"})
        else:
            rec = parse_model(text_of(html))
            row = {"model_id": mdl["model_id"], "maker": mdl["maker"],
                   "maker_id": mdl["maker_id"], "name": mdl["name"],
                   "source_url": mdl["url"], "fetched_at": today, **rec}
            # 品質ゲート: 中古の価格帯と台数が揃っていなければページ化しない
            if row.get("used_count") and row.get("used_price_min") and row.get("used_price_max"):
                ok.append(row)
            else:
                skipped.append({**row, "reason": "中古流通データなし"})

        if i % 50 == 0 or i == len(models):
            el = time.time() - t0
            eta = el / i * (len(models) - i) / 60
            print(f"  [{i:>5}/{len(models)}] 採用{len(ok):>5} 除外{len(skipped):>5} "
                  f"残り約{eta:.0f}分", flush=True)
        time.sleep(SLEEP)

    outdir = ROOT / "data" / "stock"
    outdir.mkdir(parents=True, exist_ok=True)
    p = outdir / f"{today}.json"
    p.write_text(json.dumps({
        "generated_at": today,
        "source": "バイクブロス バイクカタログ",
        "source_url": "https://www.bikebros.co.jp/catalog/",
        "note": "中古車価格帯・流通台数は掲載時に source_url と fetched_at を必ず併記すること。買取価格ではない。",
        "ok_count": len(ok), "skipped_count": len(skipped),
        "models": ok, "skipped": skipped,
    }, ensure_ascii=False, indent=1), encoding="utf-8")
    print(f"\n保存: {p}\n  採用 {len(ok)} / 除外 {len(skipped)}")


if __name__ == "__main__":
    sys.exit(main())
