// 車種ページのうち、検索語に合わせて title / h1 / 冒頭を個別に変える車種だけを書く台帳。
// ⚠️ 全車種の title テンプレートは変えない（1,537本を一括で動かさない）。ここに無い車種は従来どおり。
// ⚠️ キーは「maker_id/model_id」。model_id はメーカーをまたいで重複する（例 999_63＝ハーレー FLTC と BMW R18 B）。
// ⚠️ 新車の記述は、確認日に公式・出典を開いて確かめたものだけを書く。
export type ModelSeo = {
  /** title・h1・description で使う車種名（出典の「英字名 カナ名」の重複を除いたもの） */
  name: string
  /** title の「車種名の」に続く部分 */
  titleSuffix: string
  /** 新車についての答え（検索語に「新車」がある車種だけ） */
  newCar?: { text: string; descText: string; sources: { label: string; url: string }[]; checkedAt: string }
}

export const MODEL_SEO: Record<string, ModelSeo> = {
  '5/999_63': {
    name: 'FLTC ツアーグライドクラシック',
    titleSuffix: '中古車価格と新車の有無',
    newCar: {
      text: 'ハーレーダビッドソン公式サイト（日本）の現行モデル一覧に掲載がなく、バイクブロスの新車の販売車両も0台です。バイクブロスのカタログに掲載されている年式は1981〜1991年式です。',
      descText: '新車は公式の現行モデル一覧に掲載がなく、バイクブロスの販売車両も0台です（2026-11-04確認）。',
      sources: [
        { label: 'ハーレーダビッドソン公式 現行モデル一覧', url: 'https://www.harley-davidson.com/jp/ja/motorcycles/index.html' },
        { label: 'バイクブロス 新車ページ', url: 'https://www.bikebros.co.jp/catalog/5/999_63/new-bike/' },
      ],
      checkedAt: '2026-11-04',
    },
  },
  '5/1_25': { name: 'CVO FLSTSE3 ソフテイルコンバーチブル', titleSuffix: '中古車価格帯と流通台数' },
  '1/196_3': { name: 'NC700S・NC700S DCT', titleSuffix: '中古車価格帯と流通台数' },
  '8/7_3': { name: '750 PASO（750パゾ・750パソ）', titleSuffix: '中古車価格帯と流通台数' },
}
