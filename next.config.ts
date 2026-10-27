import { withPayload } from '@payloadcms/next/withPayload'
import type { NextConfig } from 'next'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(__filename)

const nextConfig: NextConfig = {
  images: {
    localPatterns: [
      {
        pathname: '/api/media/file/**',
      },
    ],
  },
  webpack: (webpackConfig) => {
    webpackConfig.resolve.extensionAlias = {
      '.cjs': ['.cts', '.cjs'],
      '.js': ['.ts', '.tsx', '.js', '.jsx'],
      '.mjs': ['.mts', '.mjs'],
    }

    return webpackConfig
  },
  turbopack: {
    root: path.resolve(dirname),
  },
  // The journal became "News"; keep old links and search results working.
  async redirects() {
    return [
      { source: '/:locale(fr|en)/journal', destination: '/:locale/news', permanent: true },
      { source: '/:locale(fr|en)/journal/:slug', destination: '/:locale/news/:slug', permanent: true },
    ]
  },
}

export default withPayload(nextConfig, { devBundleServerPackages: false })
