/** @type {import('next').NextConfig} */
const allowed = new Set(["*.vercel.app"]);

const addHost = (value) => {
  if (!value) return;
  try {
    const url = value.startsWith("http") ? new URL(value) : new URL(`https://${value}`);
    if (url.hostname) allowed.add(url.hostname);
  } catch {
    // ignore invalid
  }
};

// Support common deployment env vars
addHost(process.env.NEXT_PUBLIC_APP_URL);
addHost(process.env.VERCEL_URL);

const nextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: Array.from(allowed),
    },
  },
};

export default nextConfig;
