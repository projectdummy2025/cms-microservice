import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // unoptimized allows any image src without domain whitelist configuration
    unoptimized: true,
  },
};

export default nextConfig;
