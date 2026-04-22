/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["mammoth", "pdf-parse", "formidable"],
  },
};

export default nextConfig;
