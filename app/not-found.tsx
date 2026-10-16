export default function NotFound() {
  return (
    <article>
      <h1 style={{ marginTop: 48 }}>ページが見つかりません</h1>
      <p>
        お探しのページは存在しないか、流通データを取得できなかったため掲載していない車種のページです。
        当サイトでは、数値を取得できなかった車種のページは作成しておりません。
      </p>
      <p className="note"><a href="/">トップへ戻る</a> ／ <a href="/ranking/">流通台数ランキング</a></p>
    </article>
  )
}
