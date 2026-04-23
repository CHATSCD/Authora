/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["mammoth", "pdf-parse", "formidable"],
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      // pdf-parse tries to load test fixtures at require-time; stub them out
      config.resolve.alias["./test/unit/data/05-versions-space.pdf"] = false;
    }
    if (!isServer) {
      // These are server-only packages; prevent webpack from trying to bundle them
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        stream: false,
        crypto: false,
      };
    }
    return config;
  },
};

export default nextConfig;
