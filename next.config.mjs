/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Keep this minimal to avoid invalid-config crashes on CI.
    serverActions: {
      allowedOrigins: ["*.vercel.app"],
    },
  },

  // Reduce memory use during CI builds
  productionBrowserSourceMaps: false,
};

export default nextConfig;
