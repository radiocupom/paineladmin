import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  output: 'export', // 🔥 Ativa o build estático
  
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3001',
        pathname: '/uploads/**',
      },
      // 🔥 Adiciona o padrão para produção
      {
        protocol: 'https',
        hostname: 'api.radiocupom.online',
        port: '',
        pathname: '/uploads/**',
      },
    ],
    // ⚠️ Necessário para imagens em build estático
    unoptimized: true,
  },
  
  // Opcional: desabilita a geração de etags se necessário
  // generateEtags: false,
};

export default nextConfig;