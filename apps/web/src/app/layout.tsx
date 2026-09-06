import type { ReactNode } from "react";

/**
 * Pass-through by design. The document shell lives in `[locale]/layout.tsx`,
 * the first layout that knows the locale (needed for `<html lang dir>` and
 * for next-intl to render statically).
 */
export default function RootLayout({ children }: { children: ReactNode }) {
  return children;
}
