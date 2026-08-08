import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(__dirname),
  },
  // TypeORM (reflection-heavy dynamic requires), bcrypt (native addon), and
  // pdfkit (reads .afm font data files from its own package directory at
  // runtime) don't survive webpack/turbopack bundling — keep them as real
  // Node `require()`s in Route Handlers instead of being bundled.
  serverExternalPackages: ["typeorm", "bcrypt", "pdfkit", "pg"],
};

export default nextConfig;
