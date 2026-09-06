/**
 * Data Cache tags. The backend POSTs these names to `/api/revalidate` when
 * content changes; renaming one here without updating the backend turns a
 * publish into a silent no-op, so treat the names as a cross-repo contract.
 */
export const CACHE_TAGS = {
  posts: "posts",
  siteSettings: "site-settings",
} as const;

export type CacheTag = (typeof CACHE_TAGS)[keyof typeof CACHE_TAGS];

/** TTL backstop per tag, for when on-demand revalidation is missed. */
export const CACHE_TTL_SECONDS = {
  posts: 60,
  siteSettings: 300,
} as const;

type CacheInit = { next: { revalidate: number; tags: string[] } };

export function postsCache(): CacheInit {
  return { next: { revalidate: CACHE_TTL_SECONDS.posts, tags: [CACHE_TAGS.posts] } };
}

const KNOWN_TAGS: readonly string[] = Object.values(CACHE_TAGS);

export function isRevalidatableTag(tag: string): tag is CacheTag {
  return KNOWN_TAGS.includes(tag);
}
