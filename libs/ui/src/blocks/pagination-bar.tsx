"use client";

import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { cn } from "@repo/utils";
import { Button } from "../components/button";

export type PaginationBarTexts = {
  previous: string;
  next: string;
  /** Receives `from`, `to`, `total`; e.g. "Showing {from}–{to} of {total}". */
  summary?: (range: { from: number; to: number; total: number }) => string;
};

export type PaginationBarProps = {
  page: number;
  lastPage: number;
  total?: number;
  perPage?: number;
  onPageChange: (page: number) => void;
  texts?: Partial<PaginationBarTexts>;
  className?: string;
};

const DEFAULT_TEXTS: PaginationBarTexts = {
  previous: "Previous",
  next: "Next",
};

/**
 * Previous/next pagination with an optional range summary. Chevrons flip in
 * RTL automatically because the buttons are laid out with logical order.
 */
export const PaginationBar: React.FC<PaginationBarProps> = ({
  page,
  lastPage,
  total,
  perPage,
  onPageChange,
  texts,
  className,
}) => {
  const t = { ...DEFAULT_TEXTS, ...texts };
  const from = total && perPage ? (page - 1) * perPage + 1 : undefined;
  const to = total && perPage ? Math.min(page * perPage, total) : undefined;

  return (
    <nav aria-label="pagination" className={cn("flex items-center justify-between gap-4", className)}>
      <p className="text-sm text-muted-foreground">
        {t.summary && from != null && to != null && total != null ? t.summary({ from, to, total }) : null}
      </p>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
          <ChevronLeftIcon className="size-4 rtl:rotate-180" aria-hidden />
          {t.previous}
        </Button>
        <span className="text-sm tabular-nums text-muted-foreground">
          {page} / {Math.max(lastPage, 1)}
        </span>
        <Button variant="outline" size="sm" disabled={page >= lastPage} onClick={() => onPageChange(page + 1)}>
          {t.next}
          <ChevronRightIcon className="size-4 rtl:rotate-180" aria-hidden />
        </Button>
      </div>
    </nav>
  );
};
