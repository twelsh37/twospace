import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Allow cross-origin requests from development machines
  // This fixes the warning when accessing from different devices on the same network
  allowedDevOrigins: [
    "localhost:3000",
    "localhost:3001",
    "192.168.1.47:3000",
    "192.168.1.47:3001",
    // Add your PC's IP address as well for consistency
    "192.168.1.0/24", // This allows any device on the 192.168.1.x network
    // Additional patterns for Next.js static assets
    "192.168.1.47",
    "localhost",
  ],
  // Additional configuration to handle cross-origin requests
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Access-Control-Allow-Origin",
            value: "*",
          },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET, POST, PUT, DELETE, OPTIONS",
          },
          {
            key: "Access-Control-Allow-Headers",
            value: "Content-Type, Authorization",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
