#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""車種ごとの年式別排気量を出典カタログから集める（2026-10-21 追加）。

■ なぜ
  カタログの車種トップに出る「排気量 (cc)」は1つの年式（多くは最新年式）の諸元だけ。
  例: FXDF ダイナ ファットボブは車種トップが 2017年式 1690cc だが、2008〜2011年式は 1584cc。
  車種ページで 1690cc を全年式の値のように出していたため、年式別に確認して表示を分ける。

■ 取り方
  1) 車種トップ（data/stock の source_url）から
     - 「排気量 (cc)」と「発売年」（＝トップに出ている年式）
     - 年式一覧（/catalog/<maker>/<model>/<variant>/#spec_top と、その画像 alt「2008年 FXDF Fat Bob・[海外]」）
  2) 年式ページ（/catalog/<maker>/<model>/<variant>/）を1つずつ開き「排気量 (cc)」を読む
  年式一覧が1件だけの車種は 2) を省く（トップの値＝その年式の値）。

■ 出力
  data/displacement-years.json
    { "<maker_id>/<model_id>": {
        "fetched_at", "top_cc", "top_year",          # 車種トップの値とその年式（発売年。取れなければ null）
        "variants": [ {"id", "year", "cc"} ... ],   # 年式ページで読んだ値（year/cc は取れなければ null）
    } }
  ⚠️ 表示側（lib/data.ts displacementNote）は、年式ページで確認できた値だけを使う。

  使い方: python3 scripts/collect-displacement-years.py [--sleep 1.0] [--workers 3]
  途中で止めても data/displacement-years.json に溜まった分から再開する。
"""
import json
import re
import subprocess
import sys
import threading
import time
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "data" / "displacement-years.json"
UA = ("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/126.0 Safari/537.36")


def get(url: str) -> str:
    for _ in range(2):
        r = subprocess.run(["curl", "-sL", "--max-time", "30", "-A", UA, url],
                           capture_output=True, text=True)
        if r.stdout:
            return r.stdout
        time.sleep(3)
    return ""


def text_of(html: str) -> str:
    t = re.sub(r"<script[\s\S]*?</script>", " ", html)
    t = re.sub(r"<style[\s\S]*?</style>", " ", t)
    return re.sub(r"\s+", " ", re.sub(r"<[^>]+>", " ", t))


def cc_of(t: str):
    m = re.search(r"排気量 \(cc\)\s*([\d.]+)", t)
    return float(m.group(1)) if m else None


def main() -> None:
    sleep = 1.0
    if "--sleep" in sys.argv:
        sleep = float(sys.argv[sys.argv.index("--sleep") + 1])
    workers = 3
    if "--workers" in sys.argv:
        workers = int(sys.argv[sys.argv.index("--workers") + 1])

    stock = sorted((ROOT / "data" / "stock").glob("*.json"))[-1]
    models = json.loads(stock.read_text(encoding="utf-8"))["models"]
    done = json.loads(OUT.read_text(encoding="utf-8")) if OUT.exists() else {}
    today = date.today().isoformat()
    t0 = time.time()

    def one(m):
        url = m["source_url"]
        html = get(url)
        time.sleep(sleep)
        if not html:
            return None
        t = text_of(html)
        ym = re.search(r"発売年\s*(\d{4})", t)
        path = re.escape(url.replace("https://www.bikebros.co.jp", "").rstrip("/"))
        variants = []
        for vm in re.finditer(path + r'/(\d+)/#spec_top"[^>]*>\s*<img[^>]*alt="([^"]*)"', html):
            yr = re.match(r"(\d{4})年", vm.group(2))
            variants.append({"id": vm.group(1), "year": int(yr.group(1)) if yr else None, "cc": None})
        if len(variants) > 1:
            for v in variants:
                vh = get(f'{url.rstrip("/")}/{v["id"]}/')
                time.sleep(sleep)
                v["cc"] = cc_of(text_of(vh)) if vh else None
        elif len(variants) == 1:
            variants[0]["cc"] = cc_of(t)
        return {"fetched_at": today, "top_cc": cc_of(t),
                "top_year": int(ym.group(1)) if ym else None, "variants": variants}

    todo = [m for m in models if f'{m["maker_id"]}/{m["model_id"]}' not in done]
    lock = threading.Lock()
    n = 0
    # 同時3本・各本 sleep 秒間隔（出典への負荷は概ね 2〜3 リクエスト/秒）
    with ThreadPoolExecutor(max_workers=workers) as ex:
        futs = {ex.submit(one, m): m for m in todo}
        for f in as_completed(futs):
            m = futs[f]
            r = f.result()
            with lock:
                n += 1
                if r:
                    done[f'{m["maker_id"]}/{m["model_id"]}'] = r
                if n % 25 == 0:
                    OUT.write_text(json.dumps(done, ensure_ascii=False, indent=0), encoding="utf-8")
                    print(f"  [{n:>5}/{len(todo)}] {(time.time()-t0)/60:.1f}分", flush=True)
    OUT.write_text(json.dumps(done, ensure_ascii=False, indent=0), encoding="utf-8")
    print("保存:", OUT, len(done))


if __name__ == "__main__":
    sys.exit(main())
