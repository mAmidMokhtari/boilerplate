import { Geist } from "next/font/google";

/**
 * The admin panel is English-only, so it loads a single family.
 *
 * `next/font/google` downloads the files **at build time** and self-hosts
 * them; the running app never calls Google. See docs/gotchas.md for the
 * offline / air-gapped alternative.
 */
export const latinFont = Geist({
  subsets: ["latin"],
  variable: "--font-latin",
  display: "swap",
  fallback: ["ui-sans-serif", "system-ui", "sans-serif"],
});

export const fontVariables = latinFont.variable;
