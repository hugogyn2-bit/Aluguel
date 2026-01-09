/** @type {import('next').NextConfig} */
const nextConfig = {
  // Keep config minimal and valid for Next.js 16
  experimental: {
    serverActions: {
      // Use a safe default for Vercel deployments.
      allowedOrigins: ["*.vercel.app"],
    },

    // Reduce memory spikes during Webpack builds (helps avoid SIGBUS on CI).
    webpackMemoryOptimizations: true,
    webpackBuildWorker: true,
  },

  // Save memory during CI builds
  productionBrowserSourceMaps: false,
};

export default nextConfig;
