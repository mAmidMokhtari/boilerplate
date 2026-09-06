import Link from "next/link";
import { Button } from "@repo/ui/button";
import { ROUTES } from "@/lib/routes";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 text-center">
      <p className="text-sm font-medium text-muted-foreground">404</p>
      <h1 className="text-3xl font-semibold tracking-tight">Page not found</h1>
      <Button asChild>
        <Link href={ROUTES.home}>Back to dashboard</Link>
      </Button>
    </main>
  );
}
