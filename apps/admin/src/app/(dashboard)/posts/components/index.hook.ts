"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { createPostSchema, type CreatePostDto, type CreatePostInput } from "@repo/dtos";
import { PostStatusEnum } from "@repo/enums";
import type { PostModel } from "@repo/models";
import { useCreatePost, useDeletePost, usePostsList, usePublishPost, useUpdatePost } from "@repo/services";
import { applyServerErrors } from "@repo/ui/blocks/form-errors";
import { useDisclosure, useTableFilters } from "@repo/utils";
import { TEXTS } from "./texts";

const EMPTY_FORM: CreatePostInput = {
  title: { en: "", fa: "" },
  slug: "",
  excerpt: { en: "", fa: "" },
  status: PostStatusEnum.DRAFT,
  tags: [],
};

export function useData() {
  /* --------------------------------- State --------------------------------- */
  const table = useTableFilters<{ status?: PostStatusEnum }>();
  const drawer = useDisclosure();
  const [editing, setEditing] = useState<PostModel | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<PostModel | null>(null);

  /* --------------------------------- APIs ---------------------------------- */
  const list = usePostsList(table.query);

  const closeDrawer = () => {
    drawer.onClose();
    setEditing(null);
    form.reset(EMPTY_FORM);
  };

  const createPost = useCreatePost({
    onSuccess: () => {
      toast.success(TEXTS.TOAST_CREATED);
      closeDrawer();
    },
    onError: (error) => applyServerErrors(form, error),
  });
  const updatePost = useUpdatePost({
    onSuccess: () => {
      toast.success(TEXTS.TOAST_UPDATED);
      closeDrawer();
    },
    onError: (error) => applyServerErrors(form, error),
  });
  const publishPost = usePublishPost({ onSuccess: () => toast.success(TEXTS.TOAST_PUBLISHED) });
  const deletePost = useDeletePost({
    onSuccess: () => {
      toast.success(TEXTS.TOAST_DELETED);
      setDeleteTarget(null);
    },
  });

  /* --------------------------------- Form ---------------------------------- */
  const form = useForm<CreatePostInput>({
    resolver: zodResolver(createPostSchema),
    defaultValues: EMPTY_FORM,
  });

  /* -------------------------------- Handlers ------------------------------- */
  const openCreate = () => {
    setEditing(null);
    form.reset(EMPTY_FORM);
    drawer.onOpen();
  };

  const openEdit = (post: PostModel) => {
    setEditing(post);
    form.reset({
      title: { en: post.getTitle("en"), fa: post.getTitles().fa ?? "" },
      slug: post.getSlug(),
      excerpt: { en: post.getExcerpt("en"), fa: "" },
      status: post.getStatus(),
      tags: post.getTags(),
    });
    drawer.onOpen();
  };

  const onDrawerOpenChange = (open: boolean) => (open ? drawer.onOpen() : closeDrawer());

  const onSubmit = form.handleSubmit((values) => {
    const data = values as CreatePostDto;
    if (editing) updatePost.mutate({ id: editing.getId(), data });
    else createPost.mutate(data);
  });

  const publish = (post: PostModel) => publishPost.mutate(post.getId());
  const openDelete = (post: PostModel) => setDeleteTarget(post);
  const closeDelete = () => setDeleteTarget(null);
  const confirmDelete = () => {
    if (deleteTarget) deletePost.mutate(deleteTarget.getId());
  };

  /* --------------------------------- Return -------------------------------- */
  return {
    table,
    posts: list.data?.getItems() ?? [],
    paginate: list.data?.getPaginate(),
    isLoading: list.isLoading,
    isError: list.isError,
    refetch: () => void list.refetch(),

    drawer,
    editing,
    form,
    onSubmit,
    openCreate,
    openEdit,
    onDrawerOpenChange,
    isSaving: createPost.isPending || updatePost.isPending,

    publish,
    isPublishing: publishPost.isPending,

    deleteTarget,
    openDelete,
    closeDelete,
    confirmDelete,
    isDeleting: deletePost.isPending,
  };
}
