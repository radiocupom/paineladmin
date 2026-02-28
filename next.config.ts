import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3001',
        pathname: '/uploads/**',
      },
      // Adicione outros hosts conforme necessário (ex: em produção)
      // {
      //   protocol: 'https',
      //   hostname: 'api.seudominio.com',
      //   port: '',
      //   pathname: '/uploads/**',
      // },
    ],
  },
};

export default nextConfig;