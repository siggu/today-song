import type { NextConfig } from 'next';

// GitHub Pages(https://siggu.github.io/today-song)에서는 /today-song 경로 아래에서 서비스됨
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

const nextConfig: NextConfig = {
  output: 'export',
  basePath,
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
