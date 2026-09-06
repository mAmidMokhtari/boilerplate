import { Geist, Vazirmatn } from "next/font/google";

/**
 * Every font the app uses, in one module so a project can swap the whole
 * typography layer by editing this file alone.
 *
 * `next/font/google` downloads the files **at build time** and self-hosts
 * them, so the running app never calls Google. The build machine does need
 * to reach `fonts.googleapis.com` once — see docs/gotchas.md for the
 * offline / air-gapped alternative (`next/font/local`).
 */
export const latinFont = Geist({
  subsets: ["latin"],
  variable: "--font-latin",
  display: "swap",
  fallback: ["ui-sans-serif", "system-ui", "sans-serif"],
});

/** Persian / Arabic. Vazirmatn covers both scripts and pairs well with Geist. */
export const rtlFont = Vazirmatn({
  subsets: ["arabic", "latin"],
  variable: "--font-rtl",
  display: "swap",
  fallback: ["Tahoma", "ui-sans-serif", "system-ui", "sans-serif"],
});

/** Class names to put on `<html>` so both CSS variables are defined. */
export const fontVariables = `${latinFont.variable} ${rtlFont.variable}`;

/** The variable the active locale should resolve `--font-sans` to. */
export function fontVarForDirection(isRtl: boolean): string {
  return isRtl ? "var(--font-rtl)" : "var(--font-latin)";
}
