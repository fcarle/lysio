/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Ignore type checking during build for Vercel
  typescript: {
    ignoreBuildErrors: true,
  },
  // Ignore ESLint during build for Vercel
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Use server components instead of static generation
  output: 'standalone',
}

module.exports = nextConfig 