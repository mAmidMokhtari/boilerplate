"use client";

import { AlertTriangleIcon } from "lucide-react";
import { cn } from "@repo/utils";
import { Button } from "../components/button";

export type ErrorStateProps = {
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void };
  className?: string;
};

/** Inline error panel for a failed fetch or an error boundary. */
export const ErrorState: React.FC<ErrorStateProps> = ({
  title,
  description,
  action,
  className,
}) => (
  <div
    role="alert"
    className={cn(
      "flex flex-col items-center justify-center gap-3 rounded-lg border border-destructive/30 bg-destructive/5 px-6 py-12 text-center",
      className
    )}
  >
    <div className="flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
      <AlertTriangleIcon className="size-6" aria-hidden />
    </div>
    <div className="space-y-1">
      <p className="text-base font-medium">{title}</p>
      {description ? <p className="max-w-md text-sm text-muted-foreground">{description}</p> : null}
    </div>
    {action ? (
      <Button variant="outline" size="sm" onClick={action.onClick}>
        {action.label}
      </Button>
    ) : null}
  </div>
);
