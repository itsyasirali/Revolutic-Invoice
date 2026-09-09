import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(__dirname),
  },
  // TypeORM (reflection-heavy dynamic requires), bcrypt (native addon), and
  // pdfkit (reads font data files at runtime) don't survive webpack/turbopack
  // bundling — keep them external in Node Route Handlers.
  serverExternalPackages: ["typeorm", "bcrypt", "pdfkit", "pg"],
};

export default nextConfig;
