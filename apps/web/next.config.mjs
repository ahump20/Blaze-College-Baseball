/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  trailingSlash: false,
  images: { unoptimized: false },
  experimental: { ppr: true },
  output: 'standalone'
};
export default nextConfig;
