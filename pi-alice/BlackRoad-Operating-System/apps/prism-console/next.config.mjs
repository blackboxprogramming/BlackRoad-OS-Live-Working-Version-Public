/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  experimental: {
    appDir: true
  },
  env: {
    API_URL: process.env.API_URL || "https://api.blackroad.systems"
  }
};

export default nextConfig;
