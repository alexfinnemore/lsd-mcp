/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable experimental features for App Router
  experimental: {
    // Allow external packages in server components
    serverComponentsExternalPackages: ['@modelcontextprotocol/sdk'],
  },

  // Ignore TypeScript errors during build (we handle them separately)
  typescript: {
    ignoreBuildErrors: false,
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
