/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Ignore type checking and linting during build
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Use standalone mode for server components
  output: 'standalone',
  // Disable prerendering
  experimental: {
    // Force server-side rendering for all pages
    disableOptimizedLoading: true,
    // Skip prerendering completely
    optimizeCss: false,
  },
  // Set pages to be server-rendered by default
  swcMinify: true,
  // Disable static optimization in production
  productionBrowserSourceMaps: false,
  // Stop attempting to generate static pages for pages with client components
  staticPageGenerationTimeout: 1,
}

module.exports = nextConfig 