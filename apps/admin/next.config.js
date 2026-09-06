//@ts-check

const path = require("node:path");

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  reactStrictMode: true,
  poweredByHeader: false,
  // Standalone output must trace files from the workspace root, not the app.
  outputFileTracingRoot: path.join(__dirname, "../../"),
  images: {
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
};

module.exports = nextConfig;
