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
  output: 'export',
  // Configure for pure client-side rendering
  images: {
    unoptimized: true,
  },
  // Enable standalone mode for server components
  trailingSlash: true,
}

module.exports = nextConfig 