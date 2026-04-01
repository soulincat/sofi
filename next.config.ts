import path from "node:path";
import { fileURLToPath } from "node:url";
import type { NextConfig } from "next";

const repoRoot = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  transpilePackages: ["sanity"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
        pathname: "/**",
      },
    ],
  },
  turbopack: {
    root: repoRoot,
  },
};

export default nextConfig;
