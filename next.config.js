/** @type {import('next').NextConfig} */
const nextConfig = {
  // Standalone output for Vercel deployment
  output: 'standalone',

  // External packages for server components
  experimental: {
    serverComponentsExternalPackages: ['@modelcontextprotocol/sdk'],
  },

  // Skip type checking during build (tsc runs separately)
  typescript: {
    ignoreBuildErrors: true,
  },

  // Skip linting during build
  eslint: {
    ignoreDuringBuilds: true,
  },

  // CORS headers for MCP endpoint
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
