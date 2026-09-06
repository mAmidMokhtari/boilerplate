"use client";

import "@/styles/globals.css";

/** Last-resort boundary when the locale layout itself throws. No i18n context is available here. */
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <body className="flex min-h-screen items-center justify-center bg-background text-foreground">
        <main className="space-y-4 text-center">
          <h1 className="text-2xl font-semibold">Something went wrong</h1>
          <p className="text-sm text-muted-foreground">{error.digest ? `Reference: ${error.digest}` : error.message}</p>
          <button type="button" onClick={reset} className="rounded-md border px-4 py-2 text-sm">
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}
