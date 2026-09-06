"use client";

import type { UserModel } from "@repo/models";
import { Avatar, AvatarFallback, AvatarImage } from "@repo/ui/avatar";
import { Badge } from "@repo/ui/badge";
import { DataTable, type DataTableColumn } from "@repo/ui/blocks/data-table";
import { ErrorState } from "@repo/ui/blocks/error-state";
import { PaginationBar } from "@repo/ui/blocks/pagination-bar";
import { Input } from "@repo/ui/input";
import { formatDate } from "@repo/utils";
import { useData } from "./index.hook";
import { TEXTS } from "./texts";

export function Index() {
  const vm = useData();

  const columns: DataTableColumn<UserModel>[] = [
    {
      id: "name",
      header: TEXTS.COL_NAME,
      cell: (user) => (
        <div className="flex items-center gap-3">
          <Avatar className="size-8">
            <AvatarImage src={user.getAvatarUrl() ?? undefined} alt="" />
            <AvatarFallback>{user.getInitials()}</AvatarFallback>
          </Avatar>
          <span className="font-medium">{user.getName()}</span>
        </div>
      ),
    },
    { id: "email", header: TEXTS.COL_EMAIL, cell: (user) => user.getEmail() },
    {
      id: "roles",
      header: TEXTS.COL_ROLES,
      cell: (user) => (
        <div className="flex flex-wrap gap-1">
          {user.getRoleNames().map((role) => (
            <Badge key={role} variant="secondary">
              {role}
            </Badge>
          ))}
        </div>
      ),
    },
    {
      id: "status",
      header: TEXTS.COL_STATUS,
      cell: (user) => (
        <Badge variant={user.isActive() ? "default" : "outline"}>{user.getStatus()}</Badge>
      ),
    },
    {
      id: "created",
      header: TEXTS.COL_CREATED,
      cell: (user) => formatDate(user.getCreatedAt(), "en"),
    },
  ];

  return (
    <div className="space-y-4">
      <Input
        placeholder={TEXTS.SEARCH_PLACEHOLDER}
        value={vm.table.state.search}
        onChange={(e) => vm.table.setSearch(e.target.value)}
        className="max-w-xs"
        aria-label={TEXTS.SEARCH_PLACEHOLDER}
      />

      {vm.isError ? (
        <ErrorState
          title={TEXTS.ERROR_TITLE}
          action={{ label: TEXTS.RETRY, onClick: vm.refetch }}
        />
      ) : (
        <>
          <DataTable
            columns={columns}
            rows={vm.users}
            rowKey={(u) => u.getId()}
            isLoading={vm.isLoading}
            emptyTitle={TEXTS.EMPTY_TITLE}
            emptyDescription={TEXTS.EMPTY_DESCRIPTION}
          />
          {vm.paginate ? (
            <PaginationBar
              page={vm.paginate.getCurrentPage()}
              lastPage={vm.paginate.getLastPage()}
              onPageChange={vm.table.setPage}
              texts={{ previous: TEXTS.PAGINATION_PREVIOUS, next: TEXTS.PAGINATION_NEXT }}
            />
          ) : null}
        </>
      )}
    </div>
  );
}
