import type { ReactNode } from "react";
import { PageHeader } from "@repo/ui/blocks/page-header";

export type PageShellProps = {
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
};

/** Standard admin page frame: header + content column. Used by every (dashboard) page.tsx. */
export function PageShell({ title, description, actions, children }: PageShellProps) {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={title} description={description} actions={actions} />
      {children}
    </div>
  );
}
