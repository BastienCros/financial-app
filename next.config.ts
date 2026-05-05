import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Import .sql files as raw strings (used for Drizzle migrations).
  // Turbopack's built-in 'raw' module type handles this without an external loader.
  turbopack: {
    rules: {
      "*.sql": {
        type: "raw",
      },
    },
  },

  async headers() {
    return [
      {
        source: '/:path*', // apply to all routes
        headers: [
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin',
          },
          {
            key: 'Cross-Origin-Embedder-Policy',
            value: 'require-corp',
          },
        ],
      },
    ]
  },

};

export default nextConfig;
