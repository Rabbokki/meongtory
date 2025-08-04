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
<<<<<<< HEAD
        source: '/api/:path*',
        destination: 'http://localhost:8081/api/:path*',
      },
    ];
=======
        source: '/api/diary/:path*',
        destination: 'http://localhost:8081/api/diary/:path*',
      },
    ]
>>>>>>> feature/diary
  },
}

export default nextConfig
