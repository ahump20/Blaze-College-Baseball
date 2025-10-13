/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  trailingSlash: false,
  images: { unoptimized: false },
  experimental: { ppr: true },
  transpilePackages: ['@bsi/ui'],
  output: 'standalone'
};
export default nextConfig;
