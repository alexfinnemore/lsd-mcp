/** @type {import('next').NextConfig} */
const nextConfig = {
  // External packages for server components (Next.js 14 syntax)
  experimental: {
    serverComponentsExternalPackages: ['@modelcontextprotocol/sdk'],
  },

  // Skip static generation of error pages - we only care about API routes
  output: 'standalone',

  // Ignore TypeScript errors during build
  typescript: {
    ignoreBuildErrors: true,
  },

  // Ignore ESLint errors during build
  eslint: {
    ignoreDuringBuilds: true,
  },

  // Configure headers for MCP endpoint
  async headers() {
    return [
      {
        source: '/api/mcp/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, POST, OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
        ],
      },
    ];
  },
};

export default nextConfig;
