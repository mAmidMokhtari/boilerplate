import type { ReactNode } from "react";
import { cn } from "@repo/utils";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/table";
import { EmptyState } from "./empty-state";
import { TableSkeleton } from "./table-skeleton";

export type DataTableColumn<TRow> = {
  id: string;
  header: ReactNode;
  cell: (row: TRow) => ReactNode;
  className?: string;
  /** Aligns numeric columns to the end. */
  align?: "start" | "end";
};

export type DataTableProps<TRow> = {
  columns: DataTableColumn<TRow>[];
  rows: TRow[];
  rowKey: (row: TRow) => string | number;
  isLoading?: boolean;
  emptyTitle: string;
  emptyDescription?: string;
  emptyAction?: ReactNode;
  className?: string;
};

/**
 * Minimal declarative table for admin lists. Deliberately small: sorting,
 * filtering and pagination are the page hook's job (see `useTableFilters`),
 * this component only renders what it is given.
 */
export function DataTable<TRow>({
  columns,
  rows,
  rowKey,
  isLoading,
  emptyTitle,
  emptyDescription,
  emptyAction,
  className,
}: DataTableProps<TRow>) {
  if (isLoading) return <TableSkeleton columns={columns.length} />;
  if (rows.length === 0) return <EmptyState title={emptyTitle} description={emptyDescription} action={emptyAction} />;

  return (
    <div className={cn("overflow-x-auto rounded-lg border", className)}>
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((col) => (
              <TableHead key={col.id} className={cn(col.align === "end" && "text-end", col.className)}>
                {col.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={rowKey(row)}>
              {columns.map((col) => (
                <TableCell key={col.id} className={cn(col.align === "end" && "text-end tabular-nums", col.className)}>
                  {col.cell(row)}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
