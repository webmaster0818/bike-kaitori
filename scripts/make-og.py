#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""OG画像（public/og-image.png・1200x630）と favicon 一式を作る。

⚠️ 画像に台数・車種数・価格などの数字を入れない（データ更新のたびに画像だけ古くなるため）。
   入れるのはサイト名と短いキャッチだけ。
⚠️ 書体はサイト本体と同じ Oswald（英字・数字）＋ Zen Kaku Gothic New（和文）。
   Google Fonts のリポジトリから scripts/.fonts/ に取得してキャッシュする（gitignore 済み）。

  python3 scripts/make-og.py
"""
import urllib.request
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent.parent
FONTS = ROOT / "scripts" / ".fonts"
SRC = {
    "Oswald.ttf": "https://github.com/google/fonts/raw/main/ofl/oswald/Oswald%5Bwght%5D.ttf",
    "ZenBold.ttf": "https://github.com/google/fonts/raw/main/ofl/zenkakugothicnew/ZenKakuGothicNew-Bold.ttf",
    "ZenMed.ttf": "https://github.com/google/fonts/raw/main/ofl/zenkakugothicnew/ZenKakuGothicNew-Medium.ttf",
}

# globals.css と同じ3色
INK = (22, 24, 28)        # --ink   #16181c
PAPER = (245, 242, 236)   # --paper #f5f2ec
RUST = (180, 84, 31)      # --rust  #b4541f
SOFT = (90, 96, 105)      # --ink-soft
W, H = 1200, 630


def font(name: str, size: int, weight: str | None = None) -> ImageFont.FreeTypeFont:
    FONTS.mkdir(parents=True, exist_ok=True)
    p = FONTS / name
    if not p.exists():
        urllib.request.urlretrieve(SRC[name], p)
    f = ImageFont.truetype(str(p), size)
    if weight:
        f.set_variation_by_name(weight)
    return f


def og() -> None:
    S = 2  # 2倍で描いて縮める
    im = Image.new("RGB", (W * S, H * S), PAPER)
    d = ImageDraw.Draw(im)

    # 右側：墨の面に錆色の斜めストライプ（走りの速度感）
    d.polygon([(820 * S, 0), (W * S, 0), (W * S, H * S), (640 * S, H * S)], fill=INK)
    for i, x in enumerate((900, 980, 1060)):
        w = 34 - i * 8
        d.polygon([(x * S, 0), ((x + w) * S, 0), ((x + w - 180) * S, H * S), ((x - 180) * S, H * S)], fill=RUST)

    # 左上：英字ロゴ（ヘッダーと同じ字形）
    d.text((80 * S, 70 * S), "BIKE KAITORI", font=font("Oswald.ttf", 40 * S, "SemiBold"), fill=INK)
    d.rectangle([80 * S, 136 * S, 140 * S, 142 * S], fill=RUST)

    # サイト名
    d.text((76 * S, 190 * S), "バイク買取ナビ", font=font("ZenBold.ttf", 92 * S), fill=INK)

    # キャッチ（数字を入れない）
    zm = font("ZenMed.ttf", 36 * S)
    d.text((80 * S, 340 * S), "中古バイクの流通台数と価格帯を", font=zm, fill=INK)
    d.text((80 * S, 394 * S), "車種別に、出典つきで。", font=zm, fill=RUST)

    # ドメイン
    d.text((80 * S, 536 * S), "biker-sell.com", font=font("Oswald.ttf", 28 * S, "Regular"), fill=SOFT)

    out = ROOT / "public" / "og-image.png"
    im.resize((W, H), Image.LANCZOS).save(out, optimize=True)
    print(f"書き出し → {out}")


def icon(size: int) -> Image.Image:
    S = 4
    n = size * S
    im = Image.new("RGBA", (n, n), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    d.rounded_rectangle([0, 0, n - 1, n - 1], radius=int(n * 0.18), fill=INK)
    # 錆色の斜め帯（OG画像と同じモチーフ）
    d.polygon([(int(n * .70), 0), (int(n * .86), 0), (int(n * .56), n), (int(n * .40), n)], fill=RUST)
    f = font("Oswald.ttf", int(n * .78), "SemiBold")
    box = d.textbbox((0, 0), "B", font=f)
    tw, th = box[2] - box[0], box[3] - box[1]
    d.text(((n - tw) / 2 - box[0] - n * .06, (n - th) / 2 - box[1]), "B", font=f, fill=PAPER)
    return im.resize((size, size), Image.LANCZOS)


def icons() -> None:
    pub = ROOT / "public"
    icon(512).save(pub / "icon.png", optimize=True)
    icon(180).save(pub / "apple-icon.png", optimize=True)
    icon(64).save(pub / "favicon.ico", sizes=[(16, 16), (32, 32), (48, 48), (64, 64)])
    print("書き出し → public/icon.png / apple-icon.png / favicon.ico")


if __name__ == "__main__":
    og()
    icons()
