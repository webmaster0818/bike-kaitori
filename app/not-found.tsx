export default function NotFound() {
  return (
    <article>
      <h1 style={{ marginTop: 48 }}>ページが見つかりません</h1>
      <p>
        お探しのページは存在しないか、流通データが取得できなかったため掲載していない車種です。
        当サイトは数値が取れなかった車種のページを作らない方針を採っています。
      </p>
      <p className="note"><a href="/">トップへ戻る</a> ／ <a href="/ranking/">流通台数ランキング</a></p>
    </article>
  )
}
