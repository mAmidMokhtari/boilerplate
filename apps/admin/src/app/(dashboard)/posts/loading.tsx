import { TableSkeleton } from "@repo/ui/blocks/table-skeleton";

export default function Loading() {
  return <TableSkeleton rows={8} columns={5} />;
}
