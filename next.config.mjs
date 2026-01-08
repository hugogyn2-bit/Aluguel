/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: [
        "*.vercel.app"
      ]
    }
  },
  eslint: {
    ignoreDuringBuilds: true
  }
};

export default nextConfig;
