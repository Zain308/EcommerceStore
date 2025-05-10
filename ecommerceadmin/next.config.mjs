/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    MONGODB_URI: process.env.MONGODB_URI, // Ensure MONGODB_URI is available in Next.js
  },
};

export default nextConfig;
