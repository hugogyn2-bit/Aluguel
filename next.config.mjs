/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: ["*.vercel.app"]
    }
  }
};

export default nextConfig;
