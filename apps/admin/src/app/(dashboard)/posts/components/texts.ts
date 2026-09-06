/** Static English copy for the Posts page and its drawers. */
export const TEXTS = {
  PAGE_TITLE: "Posts",
  PAGE_DESCRIPTION: "The example domain: list, create, edit, publish and delete.",

  ADD: "New post",
  SEARCH_PLACEHOLDER: "Search posts…",
  FILTER_STATUS: "Status",
  FILTER_ALL: "All statuses",

  COL_TITLE: "Title",
  COL_SLUG: "Slug",
  COL_STATUS: "Status",
  COL_PUBLISHED_AT: "Published",
  COL_ACTIONS: "Actions",

  EDIT: "Edit",
  PUBLISH: "Publish",
  DELETE: "Delete",

  EMPTY_TITLE: "No posts yet",
  EMPTY_DESCRIPTION: "Create the first post to see it here.",
  ERROR_TITLE: "Could not load posts",
  RETRY: "Retry",

  DRAWER_CREATE_TITLE: "New post",
  DRAWER_EDIT_TITLE: "Edit post",
  DRAWER_DESCRIPTION: "English title is required; other locales are optional.",
  FIELD_TITLE_EN: "Title (English)",
  FIELD_TITLE_FA: "Title (Persian)",
  FIELD_SLUG: "Slug",
  FIELD_SLUG_HINT: "Lowercase letters, numbers and hyphens.",
  FIELD_EXCERPT_EN: "Excerpt (English)",
  FIELD_STATUS: "Status",
  SAVE: "Save",
  SAVING: "Saving…",
  CANCEL: "Cancel",

  DELETE_CONFIRM_TITLE: "Delete this post?",
  DELETE_CONFIRM_DESCRIPTION: "This cannot be undone.",
  DELETE_CONFIRM: "Delete",

  TOAST_CREATED: "Post created",
  TOAST_UPDATED: "Post updated",
  TOAST_PUBLISHED: "Post published",
  TOAST_DELETED: "Post deleted",

  PAGINATION_PREVIOUS: "Previous",
  PAGINATION_NEXT: "Next",
  PAGINATION_SUMMARY: "Showing {from}–{to} of {total}",
} as const;
