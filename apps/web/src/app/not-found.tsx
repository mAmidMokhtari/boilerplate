import "@/styles/globals.css";

/**
 * Root 404 for paths outside `[locale]` (the intl middleware normally
 * redirects everything, so this is a framework-level fallback). No locale
 * context exists here, hence the hardcoded English.
 */
export default function RootNotFound() {
  return (
    <html lang="en">
      <body className="flex min-h-screen items-center justify-center bg-background text-foreground">
        <main className="space-y-2 text-center">
          <h1 className="text-3xl font-semibold">Page not found</h1>
          <a href="/" className="text-primary underline">
            Back to home
          </a>
        </main>
      </body>
    </html>
  );
}
