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
  async rewrites() {
    return [
      {
        source: '/api/diary/:path*',
        destination: 'http://localhost:8081/api/diary/:path*',
      },
    ]
  },
}

export default nextConfig
