/** @type {import('next').NextConfig} */
// Cloudflare Pages へローカルビルド方式で載せるため静的書き出しに固定する。
// trailingSlash: true = /model/honda-100-1/ の形。canonical と内部リンクも必ずスラッシュ付きで揃える。
const nextConfig = {
  output: 'export',
  images: { unoptimized: true },
  trailingSlash: true,
}
export default nextConfig
