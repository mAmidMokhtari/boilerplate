"use client";

import { PostStatusEnum } from "@repo/enums";
import { useMe, usePostsList, useUsersList } from "@repo/services";
import { TEXTS } from "./texts";

export function useData() {
  /* --------------------------------- APIs ---------------------------------- */
  const me = useMe("admin");
  const posts = usePostsList({ per_page: 1 });
  const published = usePostsList({ per_page: 1, status: PostStatusEnum.PUBLISHED });
  const users = useUsersList({ per_page: 1 });

  /* --------------------------------- Return -------------------------------- */
  return {
    userName: me.data?.getName(),
    stats: [
      { label: TEXTS.STAT_POSTS, value: posts.data?.getPaginate().getTotal() ?? null, isLoading: posts.isLoading },
      { label: TEXTS.STAT_PUBLISHED, value: published.data?.getPaginate().getTotal() ?? null, isLoading: published.isLoading },
      { label: TEXTS.STAT_USERS, value: users.data?.getPaginate().getTotal() ?? null, isLoading: users.isLoading },
    ],
  };
}
