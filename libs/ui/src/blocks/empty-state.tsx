import type { ReactNode } from "react";
import { InboxIcon } from "lucide-react";
import { cn } from "@repo/utils";

export type EmptyStateProps = {
  title: string;
  description?: string;
  icon?: ReactNode;
  /** Primary call to action (a Button, a Link). */
  action?: ReactNode;
  className?: string;
};

/** Centered placeholder for lists and tables with no rows. */
export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon,
  action,
  className,
}) => (
  <div
    role="status"
    className={cn(
      "flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed px-6 py-14 text-center",
      className
    )}
  >
    <div className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
      {icon ?? <InboxIcon className="size-6" aria-hidden />}
    </div>
    <div className="space-y-1">
      <p className="text-base font-medium">{title}</p>
      {description ? <p className="max-w-sm text-sm text-muted-foreground">{description}</p> : null}
    </div>
    {action ? <div className="pt-2">{action}</div> : null}
  </div>
);
