import type { ReactNode } from "react";
import { cn } from "@repo/utils";

export type PageHeaderProps = {
  title: string;
  description?: string;
  /** Right-aligned (end-aligned in RTL) actions. */
  actions?: ReactNode;
  /** Breadcrumb or eyebrow rendered above the title. */
  eyebrow?: ReactNode;
  className?: string;
};

/** Title block used at the top of every admin page and most web sections. */
export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  actions,
  eyebrow,
  className,
}) => (
  <header
    className={cn("flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between", className)}
  >
    <div className="space-y-1">
      {eyebrow}
      <h1 className="text-2xl font-semibold tracking-tight text-balance">{title}</h1>
      {description ? (
        <p className="max-w-2xl text-sm text-muted-foreground">{description}</p>
      ) : null}
    </div>
    {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
  </header>
);
