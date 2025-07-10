import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        // Authorized uploads from Strapi
        protocol: 'http',
        hostname: 'localhost',
        port: '1338',
        pathname: '/uploads/**',
      },
    ],
  },
  env: {
    STRAPI_URL: process.env.STRAPI_URL || 'http://localhost:1338',
  },
};

export default nextConfig;
