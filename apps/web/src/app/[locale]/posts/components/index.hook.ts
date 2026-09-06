"use client";

import { useMemo, useState } from "react";
import type { IPaginatedResponseModel, IPostModel } from "@repo/models";
import { PaginatedResponseModel, PostModel } from "@repo/models";
import { usePublicPostsList } from "@repo/services";

const PER_PAGE = 12;

export type UsePostsPageOptions = {
  /** Raw first page from the server; rebuilt into a model here to seed the cache. */
  initialRaw: IPaginatedResponseModel<IPostModel> | null;
};

export function usePostsPage({ initialRaw }: UsePostsPageOptions) {
  /* --------------------------------- State --------------------------------- */
  const [page, setPage] = useState(1);

  /* --------------------------------- APIs ---------------------------------- */
  const initialData = useMemo(
    () => (initialRaw && page === 1 ? new PaginatedResponseModel(PostModel, initialRaw) : undefined),
    [initialRaw, page]
  );
  const { data, isLoading, isError, refetch } = usePublicPostsList(
    { page, per_page: PER_PAGE },
    { initialData }
  );

  /* -------------------------------- Handlers ------------------------------- */
  const handlePageChange = (next: number) => {
    setPage(next);
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  };

  /* --------------------------------- Return -------------------------------- */
  const paginate = data?.getPaginate();
  return {
    data,
    posts: data?.getItems() ?? [],
    page,
    lastPage: paginate?.getLastPage() ?? 1,
    total: paginate?.getTotal(),
    perPage: PER_PAGE,
    isLoading,
    isError,
    refetch: () => void refetch(),
    setPage: handlePageChange,
  };
}
