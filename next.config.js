/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  redirects: async () => {
    return [
      {
        source: "/scoreboard",
        destination: "/baseball/ncaab",
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;
