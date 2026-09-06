"use client";

import { PlusIcon } from "lucide-react";
import { PostStatusEnum } from "@repo/enums";
import type { PostModel } from "@repo/models";
import { Badge } from "@repo/ui/badge";
import { ConfirmDialog } from "@repo/ui/blocks/confirm-dialog";
import { DataTable, type DataTableColumn } from "@repo/ui/blocks/data-table";
import { ErrorState } from "@repo/ui/blocks/error-state";
import { PaginationBar } from "@repo/ui/blocks/pagination-bar";
import { Button } from "@repo/ui/button";
import { Input } from "@repo/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@repo/ui/select";
import { formatDate } from "@repo/utils";
import { Can } from "@/components/can";
import { useData } from "./index.hook";
import { PostFormDrawer } from "./post-form-drawer";
import { TEXTS } from "./texts";

const ALL = "__all__";

const STATUS_VARIANT: Record<PostStatusEnum, "default" | "secondary" | "outline"> = {
  [PostStatusEnum.PUBLISHED]: "default",
  [PostStatusEnum.DRAFT]: "secondary",
  [PostStatusEnum.ARCHIVED]: "outline",
};

export function Index() {
  const vm = useData();

  const columns: DataTableColumn<PostModel>[] = [
    { id: "title", header: TEXTS.COL_TITLE, cell: (post) => <span className="font-medium">{post.getTitle("en")}</span> },
    { id: "slug", header: TEXTS.COL_SLUG, cell: (post) => <code className="text-xs">{post.getSlug()}</code> },
    {
      id: "status",
      header: TEXTS.COL_STATUS,
      cell: (post) => <Badge variant={STATUS_VARIANT[post.getStatus()]}>{post.getStatus()}</Badge>,
    },
    { id: "published", header: TEXTS.COL_PUBLISHED_AT, cell: (post) => formatDate(post.getPublishedAt(), "en") || "—" },
    {
      id: "actions",
      header: TEXTS.COL_ACTIONS,
      align: "end",
      cell: (post) => (
        <div className="flex justify-end gap-1">
          <Button variant="ghost" size="sm" onClick={() => vm.openEdit(post)}>
            {TEXTS.EDIT}
          </Button>
          {!post.isPublished() ? (
            <Can permission="posts.publish">
              <Button variant="ghost" size="sm" onClick={() => vm.publish(post)} disabled={vm.isPublishing}>
                {TEXTS.PUBLISH}
              </Button>
            </Can>
          ) : null}
          <Can permission="posts.delete">
            <Button variant="ghost" size="sm" className="text-destructive" onClick={() => vm.openDelete(post)}>
              {TEXTS.DELETE}
            </Button>
          </Can>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 gap-2">
          <Input
            placeholder={TEXTS.SEARCH_PLACEHOLDER}
            value={vm.table.state.search}
            onChange={(e) => vm.table.setSearch(e.target.value)}
            className="max-w-xs"
            aria-label={TEXTS.SEARCH_PLACEHOLDER}
          />
          <Select
            value={vm.table.state.filters.status ?? ALL}
            onValueChange={(value) => vm.table.setFilter("status", value === ALL ? undefined : (value as PostStatusEnum))}
          >
            <SelectTrigger className="w-44" aria-label={TEXTS.FILTER_STATUS}>
              <SelectValue placeholder={TEXTS.FILTER_STATUS} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>{TEXTS.FILTER_ALL}</SelectItem>
              {Object.values(PostStatusEnum).map((status) => (
                <SelectItem key={status} value={status}>
                  {status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Can permission="posts.create">
          <Button onClick={vm.openCreate}>
            <PlusIcon className="size-4" aria-hidden />
            {TEXTS.ADD}
          </Button>
        </Can>
      </div>

      {vm.isError ? (
        <ErrorState title={TEXTS.ERROR_TITLE} action={{ label: TEXTS.RETRY, onClick: vm.refetch }} />
      ) : (
        <>
          <DataTable
            columns={columns}
            rows={vm.posts}
            rowKey={(post) => post.getId()}
            isLoading={vm.isLoading}
            emptyTitle={TEXTS.EMPTY_TITLE}
            emptyDescription={TEXTS.EMPTY_DESCRIPTION}
          />
          {vm.paginate ? (
            <PaginationBar
              page={vm.paginate.getCurrentPage()}
              lastPage={vm.paginate.getLastPage()}
              total={vm.paginate.getTotal()}
              perPage={vm.paginate.getPerPage()}
              onPageChange={vm.table.setPage}
              texts={{
                previous: TEXTS.PAGINATION_PREVIOUS,
                next: TEXTS.PAGINATION_NEXT,
                summary: ({ from, to, total }) =>
                  TEXTS.PAGINATION_SUMMARY.replace("{from}", String(from)).replace("{to}", String(to)).replace("{total}", String(total)),
              }}
            />
          ) : null}
        </>
      )}

      <PostFormDrawer
        open={vm.drawer.open}
        onOpenChange={vm.onDrawerOpenChange}
        form={vm.form}
        onSubmit={vm.onSubmit}
        isPending={vm.isSaving}
        mode={vm.editing ? "edit" : "create"}
      />

      <ConfirmDialog
        open={vm.deleteTarget !== null}
        onOpenChange={(open) => !open && vm.closeDelete()}
        title={TEXTS.DELETE_CONFIRM_TITLE}
        description={TEXTS.DELETE_CONFIRM_DESCRIPTION}
        confirmLabel={TEXTS.DELETE_CONFIRM}
        cancelLabel={TEXTS.CANCEL}
        onConfirm={vm.confirmDelete}
        destructive
        isPending={vm.isDeleting}
      />
    </div>
  );
}
