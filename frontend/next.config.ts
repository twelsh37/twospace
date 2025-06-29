import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Remove the rewrites that proxy /api/* to localhost:3001
  // async rewrites() {
  //   return [
  //     {
  //       source: "/api/:path*",
  //       destination: "http://localhost:3001/api/:path*",
  //     },
  //   ];
  // },
};

export default nextConfig;
