import { Skeleton } from "@repo/ui/skeleton";

export default function Loading() {
  return (
    <main className="container space-y-6 py-10">
      <Skeleton className="h-9 w-48" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-40 w-full" />
        ))}
      </div>
    </main>
  );
}
