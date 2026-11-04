/**
 * メーカー一覧に載せる公式情報。公式ページを開いて確認したものだけを書く（確認日つき）。
 * 国内公式が確認できないメーカー（例: ビューエル）は載せない。
 */
export type MakerFact = { label: string; value: string; sourceName: string; sourceUrl: string; checkedAt: string }
export type MakerFacts = { heading: string; rows: MakerFact[]; notes: string[] }

const PGJ_ABOUT = 'https://www.piaggio.co.jp/aboutus.html'
const PGJ_TOP = 'https://www.piaggio.co.jp/'
const CHECKED = '2026-11-04'

export const MAKER_FACTS: Record<string, MakerFacts> = {
  ピアジオ: {
    heading: 'ピアッジオの国内輸入元と公式情報',
    rows: [
      {
        label: '国内の輸入元',
        value: 'ピアッジオ グループ ジャパン 株式会社（イタリア Piaggio & C. S.p.A. 全額出資の日本法人）',
        sourceName: '同社 会社概要',
        sourceUrl: PGJ_ABOUT,
        checkedAt: CHECKED,
      },
      {
        label: '所在地',
        value: '東京都港区芝二丁目12番10号 タカナミビル1階',
        sourceName: '同社 会社概要',
        sourceUrl: PGJ_ABOUT,
        checkedAt: CHECKED,
      },
      {
        label: '業務内容',
        value: 'Piaggio & C. S.p.A. が製造するスクーター、モーターサイクル及び部品、ウェア等関連商品の輸入、販売',
        sourceName: '同社 会社概要',
        sourceUrl: PGJ_ABOUT,
        checkedAt: CHECKED,
      },
      {
        label: '取扱ブランド',
        value: 'ベスパ、モト・グッツィ、アプリリア、ピアッジオ',
        sourceName: '同社 会社概要',
        sourceUrl: PGJ_ABOUT,
        checkedAt: CHECKED,
      },
      {
        label: 'ピアッジオ Mymoover（発売時）',
        value: '3輪の原付二種スクーター。4ストローク水冷単気筒125cc。2022年7月1日発売、メーカー希望小売価格913,000円（消費税10%込）',
        sourceName: '同社 ニュースリリース PGJPR22-018（2022年6月30日）',
        sourceUrl: 'https://www.piaggio.co.jp/2022PR/PGJPR22-018.pdf',
        checkedAt: CHECKED,
      },
      {
        label: 'Ciao（チャオ）の国内での発表',
        value: '同社のプレスリリース一覧（2016〜2026年）の題名に Ciao（チャオ）の記載はありません',
        sourceName: '同社 プレスリリース一覧',
        sourceUrl: PGJ_TOP,
        checkedAt: CHECKED,
      },
      {
        label: 'Ciao 9T（1967年）の諸元',
        value: '2ストローク単気筒。内径38.4mm×行程43mm、排気量49.77cc',
        sourceName: 'Museo Piaggio（ピアッジオ博物館）',
        sourceUrl: 'https://museopiaggio.it/en/models/2-piaggio/55-ciao-9t',
        checkedAt: CHECKED,
      },
    ],
    notes: [
      '※Mymoover は上の流通台数の掲載車種ではありません。',
      '※上の一覧の CHIAO チャオの年式は特定しておりません。Ciao 9T の諸元は1967年のモデルの値です。',
      '※「ピアジオ」は出典カタログの表記、「ピアッジオ」は輸入元の表記です。',
      '※現行の取扱い車種は、公式サイトまたは正規販売店にてご確認ください。',
    ],
  },
}
