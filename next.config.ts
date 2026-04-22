import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["mammoth", "pdf-parse", "formidable"],
  },
  api: {
    bodyParser: false,
  },
};

export default nextConfig;
