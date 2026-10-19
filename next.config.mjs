import { readFileSync } from 'node:fs'
const n8nAliases = JSON.parse(readFileSync(new URL('./data/n8n/aliases.json', import.meta.url), 'utf8'))

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
      ...Object.entries(n8nAliases).flatMap(([oldSlug, slug]) => [
        { source: `/agents/n8n/${oldSlug}`, destination: `/agents/n8n/${slug}`, permanent: true },
        { source: `/n8n/workflows/${oldSlug}.json`, destination: `/n8n/workflows/${slug}.json`, permanent: true },
      ]),
      { source: '/criteria', destination: '/corpus', permanent: true },
      { source: '/criteria/workflows', destination: '/corpus/workflows', permanent: true },
    ]
  },
}

export default nextConfig
