import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    "192.168.1.7",
    "localhost",
    "betatest-prime.vercel.app"
  ],
};

export default nextConfig;