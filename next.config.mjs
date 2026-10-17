/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // /criteria was the public URL of this page until 2026-09-22; it is now /corpus.
  async redirects() {
    return [
      { source: '/criteria', destination: '/corpus', permanent: true },
      { source: '/criteria/workflows', destination: '/corpus/workflows', permanent: true },
    ]
  },
}

export default nextConfig
