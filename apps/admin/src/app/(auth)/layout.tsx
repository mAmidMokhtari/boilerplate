import type { ReactNode } from "react";

/** Centered, chrome-free frame for login and password screens. */
export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      {children}
    </main>
  );
}
