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
  // Use standalone mode for server-side rendering with dynamic routes
  output: 'standalone',
  // Configure for server-side rendering
  experimental: {
    // Disable static optimization
    serverComponentsExternalPackages: ['@supabase/supabase-js']
  },
  // Skip generating 404 pages automatically
  distDir: process.env.NODE_ENV === 'production' ? '.next-prod' : '.next',
}

module.exports = nextConfig 