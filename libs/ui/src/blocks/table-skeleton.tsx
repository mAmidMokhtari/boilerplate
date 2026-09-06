import { Skeleton } from "../components/skeleton";

export type TableSkeletonProps = {
  rows?: number;
  columns?: number;
};

/** Placeholder rows shown while a table's first page loads. */
export const TableSkeleton: React.FC<TableSkeletonProps> = ({ rows = 6, columns = 4 }) => (
  <div className="space-y-3" aria-busy="true" aria-live="polite">
    <div className="flex items-center justify-between">
      <Skeleton className="h-9 w-64" />
      <Skeleton className="h-9 w-28" />
    </div>
    <div className="overflow-hidden rounded-lg border">
      <div className="grid gap-4 border-b bg-muted/40 px-4 py-3" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} className="h-4 w-24" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="grid gap-4 border-b px-4 py-3 last:border-b-0" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
          {Array.from({ length: columns }).map((_, c) => (
            <Skeleton key={c} className="h-4 w-full max-w-40" />
          ))}
        </div>
      ))}
    </div>
  </div>
);
