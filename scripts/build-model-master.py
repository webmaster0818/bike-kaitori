#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""P1: 車種マスタを作る（メーカー × 車種）。

■ データ源
  バイクブロスのバイクカタログ。
  robots.txt は `User-agent: * / Disallow:`（全許可）。
  ただし GPTBot は明示的に拒否されており、一部エージェントには Crawl-delay 10 が設定されている。
  そのため **メーカーページのみを低速で取得**し、車種ページは P2 で必要な分だけ取る。
  掲載時は全ページで出典URLを明示する（MediaXAI承認済みの方針）。

■ なぜメーカーページだけで足りるか
  車種ページは1メーカーあたり900件を超える。マスタを作るだけなら
  「どの車種が存在し、どのURLか」が分かればよく、排気量・流通台数は
  P2 で実際に使う車種にだけ取りに行けばよい。
  最初に全部取りに行くと、使わないページまで負荷をかけることになる。

■ 出力
  data/model-master.json  … {makers: [...], models: [...]}  出典URL・取得日つき
"""
import json
import re
import subprocess
import sys
import time
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
BASE = "https://www.bikebros.co.jp"
UA = ("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/126.0 Safari/537.36")
SLEEP = 3.0   # 相手側の Crawl-delay 設定に合わせて控えめにする


def get(url: str) -> str:
    r = subprocess.run(["curl", "-sL", "--max-time", "30", "-A", UA, url],
                       capture_output=True, text=True)
    return r.stdout or ""


def text_of(html: str) -> str:
    t = re.sub(r"<script[\s\S]*?</script>", " ", html)
    t = re.sub(r"<style[\s\S]*?</style>", " ", t)
    return re.sub(r"\s+", " ", re.sub(r"<[^>]+>", " ", t))


def parse_makers(html: str) -> list[dict]:
    """カタログトップから メーカーID → 名称 を取る。

    ⚠️ 「日本車」「輸入車」の他に中国・台湾系の小規模メーカーが大量に並ぶ。
       ここで絞らず全部取り、優先順位は P2 側で決める。
    """
    out = []
    for m in re.finditer(r'href="/catalog/(\d+)"[^>]*>([^<]{1,60})<', html):
        mid, raw = m.group(1), m.group(2)
        # 実体は「ホンダ\n | HONDA\n」のように和名と英名が改行＋パイプで並ぶ。
        # 和名を表示用、英名を別フィールドに持つ（英名は車種名の表記ゆれ吸収に使う）。
        parts = [re.sub(r"\s+", " ", p).strip() for p in raw.split("|")]
        name = parts[0]
        name_en = parts[1] if len(parts) > 1 else ""
        if not name or name.isdigit():
            continue
        out.append({"maker_id": mid, "name": name, "name_en": name_en,
                    "url": f"{BASE}/catalog/{mid}"})
    # 同じIDが複数回出てくるので先勝ちで一意化
    seen, uniq = set(), []
    for x in out:
        if x["maker_id"] in seen:
            continue
        seen.add(x["maker_id"])
        uniq.append(x)
    return uniq


def parse_models(html: str, maker_id: str) -> list[dict]:
    """メーカーページから 車種ID → 車種名 を取る。

    ⚠️ 同じhrefがアンカー2回（画像＋テキスト）で出るため、
       テキストが空でない方を採用する。空の方を拾うと名称なしのゴミが混ざる。
    """
    found: dict[str, str] = {}
    pat = re.compile(rf'<a[^>]+href="(/catalog/{maker_id}/(\d+_\d+)/)"[^>]*>([\s\S]{{0,300}}?)</a>')
    for m in pat.finditer(html):
        path, model_id, inner = m.group(1), m.group(2), m.group(3)
        name = text_of(inner).strip()
        if not name:
            continue
        # HTMLエンティティだけ最低限戻す（&#039; = アポストロフィ）
        name = name.replace("&#039;", "'").replace("&amp;", "&")
        if model_id not in found or len(name) > len(found[model_id]):
            found[model_id] = name
    return [{"model_id": k, "name": v, "url": f"{BASE}/catalog/{maker_id}/{k}/"}
            for k, v in sorted(found.items())]


def main() -> None:
    today = date.today().isoformat()
    top = get(f"{BASE}/catalog/")
    if not top:
        raise SystemExit("カタログトップを取得できませんでした")
    makers = parse_makers(top)
    print(f"メーカー: {len(makers)}件")

    models, errors = [], []
    for i, mk in enumerate(makers, 1):
        html = get(mk["url"])
        if not html:
            errors.append(mk["name"])
            print(f"  NG {mk['name']}")
            continue
        ms = parse_models(html, mk["maker_id"])
        for m in ms:
            m["maker_id"] = mk["maker_id"]
            m["maker"] = mk["name"]
            m["source_url"] = mk["url"]
            m["fetched_at"] = today
        models += ms
        print(f"  [{i:>2}/{len(makers)}] {mk['name']:28} {len(ms):>4}車種")
        time.sleep(SLEEP)

    out = {"generated_at": today,
           "source": "バイクブロス バイクカタログ",
           "source_url": f"{BASE}/catalog/",
           "note": "掲載時は車種ごとに source_url を出典として明示すること",
           "makers": makers, "models": models}
    p = ROOT / "data" / "model-master.json"
    p.write_text(json.dumps(out, ensure_ascii=False, indent=1), encoding="utf-8")
    print(f"\n保存: {p}")
    print(f"  メーカー {len(makers)} / 車種 {len(models)}")
    if errors:
        print(f"  ⚠️ 取得できなかったメーカー: {errors}")


if __name__ == "__main__":
    sys.exit(main())
