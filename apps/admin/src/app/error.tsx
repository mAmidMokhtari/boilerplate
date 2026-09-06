"use client";

import { ErrorState } from "@repo/ui/blocks/error-state";

export default function RootError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="container py-12">
      <ErrorState title="Something went wrong" description={error.digest ?? error.message} action={{ label: "Try again", onClick: reset }} />
    </main>
  );
}
