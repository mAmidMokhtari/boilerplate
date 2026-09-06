//@ts-check

const path = require("node:path");

/**
 * next-intl wiring for BOTH bundlers, done by hand instead of via
 * `createNextIntlPlugin`: the plugin decides webpack-vs-turbopack from
 * `process.env.TURBOPACK`, which is not guaranteed to be set when a task
 * runner evaluates this file. Declaring both aliases is deterministic.
 * Turbopack wants a project-relative specifier; webpack wants an absolute path.
 */
const I18N_REQUEST_RELATIVE = "./src/i18n/request.ts";
const I18N_REQUEST_ABSOLUTE = path.join(__dirname, I18N_REQUEST_RELATIVE).replace(/\\/g, "/");

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  reactStrictMode: true,
  poweredByHeader: false,
  // Standalone output must trace files from the workspace root, not the app.
  outputFileTracingRoot: path.join(__dirname, "../../"),
  turbopack: {
    resolveAlias: { "next-intl/config": I18N_REQUEST_RELATIVE },
  },
  webpack(config) {
    config.resolve.alias["next-intl/config"] = I18N_REQUEST_ABSOLUTE;
    return config;
  },
  images: {
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
  // Security headers are set in src/proxy.ts (withSecurityHeaders) so they
  // are testable and shared with the admin app.
};

module.exports = nextConfig;
