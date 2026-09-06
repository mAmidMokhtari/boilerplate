import type { Metadata } from "next";
import { Toaster } from "sonner";
import type { ReactNode } from "react";
import { fontVariables } from "@/assets/fonts";
import { Providers } from "@/components/providers";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s · Admin" },
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={fontVariables} style={{ ["--font-sans" as string]: "var(--font-latin)" }} suppressHydrationWarning>
      <body className="min-h-screen">
        <Providers>
          {children}
          <Toaster position="top-right" richColors closeButton />
        </Providers>
      </body>
    </html>
  );
}
