/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      // Coloque SOMENTE origens confiáveis (nada de '*')
      allowedOrigins: [
        "seudominio.com",
        "www.seudominio.com",
        "*.vercel.app"
      ],
    },
  },

  // reduz chance de estourar memória no build (ajuda muito em CI/Vercel)
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
