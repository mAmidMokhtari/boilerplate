# Conventions

## Naming

| Thing           | Convention                                                              | Example                                                |
| --------------- | ----------------------------------------------------------------------- | ------------------------------------------------------ |
| Folders & files | kebab-case                                                              | `product-card/`, `use-table-filters.ts`                |
| Components      | PascalCase, named export                                                | `export const ProductCard: React.FC<ProductCardProps>` |
| Props type      | `<Component>Props`                                                      | `ProductCardProps`                                     |
| Hooks           | `use` + noun/verb                                                       | `usePostsList`, `useData` (admin pages)                |
| Models          | `IXModel` + `XModel`                                                    | `IPostModel`, `PostModel`                              |
| DTO schemas     | `<verb><Entity>Schema` + `<Verb><Entity>Dto`                            | `createPostSchema`, `CreatePostDto`                    |
| Query keys      | `X_QUERY_KEY` + `xKeys`                                                 | `POSTS_QUERY_KEY`, `postsKeys.detail(id)`              |
| Enums           | `XEnum` with SCREAMING members                                          | `PostStatusEnum.PUBLISHED`                             |
| Env vars        | SCREAMING*SNAKE; `NEXT_PUBLIC*` only if browser-safe                    | `INTERNAL_API_BASE_URL`                                |
| Route segments  | kebab-case; dynamic `[id]`, catch-all `[...slug]`, groups `(dashboard)` |                                                        |
| i18n keys       | dot-namespaced, camelCase leaves                                        | `posts.list.emptyTitle`                                |
| Texts (admin)   | `TEXTS.SCREAMING_SNAKE`                                                 | `TEXTS.TOAST_CREATED`                                  |

## TypeScript

- `strict: true`; no `any` unless quarantined with a comment explaining why.
- `type` over `interface` for new code. Existing `IXModel` names stay.
- Prefer `readonly` arrays/tuples in constants: `["en","fa"] as const`.
- Narrow with guards from `@repo/utils` (`isDefined`, `assertNever`).
- Never `as unknown as`. If the type does not fit, the shape is wrong.

## React

- Server Components by default. Add `"use client"` only where hooks or browser APIs are used.
- `params` and `searchParams` are Promises in Next 16 — always `await`.
- One `useData()` / feature hook per page; components below receive props.
- Effects are for synchronizing with external systems, not for deriving state — use `useMemo`.
- Keys are stable ids, never array indices for mutable lists.
- Lists render `loading`, `error`, `empty` and `data` branches explicitly.

## Page contract

### web

```
apps/web/src/app/[locale]/<route>/
├── page.tsx               server: metadata, fetch via api fn or src/lib helper, notFound()
├── loading.tsx            when the segment streams
├── error.tsx              when the segment fetches
└── components/
    ├── index.tsx          "use client"; presentational; t("key") for every string
    └── index.hook.ts      "use client"; useXPage(); React Query from @repo/services only here
```

### admin

```
apps/admin/src/app/(dashboard)/<route>/
├── page.tsx               server: <PageShell title={TEXTS.PAGE_TITLE} description=…><Index/></PageShell>
└── components/
    ├── index.tsx          "use client"; export function Index(); const vm = useData()
    ├── index.hook.ts      "use client"; export function useData() with block-comment dividers
    ├── texts.ts           export const TEXTS = {...} as const
    └── <feature>/         children of this page (form-drawer/, filters/, …)
```

Divider format inside `index.hook.ts` (both apps):

```ts
/* --------------------------------- State --------------------------------- */
/* --------------------------------- APIs ---------------------------------- */
/* --------------------------------- Form ---------------------------------- */
/* -------------------------------- Handlers ------------------------------- */
/* ------------------------------- LifeCycles ------------------------------ */
/* --------------------------------- Return -------------------------------- */
```

## Service contract

```ts
// <x>.query-keys.ts
export const POSTS_QUERY_KEY = ["posts"] as const;
export const postsKeys = {
  all: POSTS_QUERY_KEY,
  lists: () => [...POSTS_QUERY_KEY, "list"] as const,
  list: (params?: GetPostsListInput) => [...POSTS_QUERY_KEY, "list", params ?? {}] as const,
  detail: (id: number) => [...POSTS_QUERY_KEY, "detail", id] as const,
};

// <x>.api.ts — pure; apiClient in, Model out
export const postsApi = {
  getList: async (params: GetPostsListInput = {}) => {
    const raw = await apiClient.get<IPaginatedResponseModel<IPostModel>>(
      withQuery(endpoints.posts.admin.list, params)
    );
    return new PaginatedResponseModel(PostModel, raw);
  },
};

// <x>.hooks.ts — React Query; invalidation here, UI side effects via options
export function useCreatePost(options?: BaseMutation<PostModel, CreatePostDto>) {
  return useMutation({
    mutationFn: (d) => postsApi.create(d),
    invalidates: [postsKeys.lists()],
    options,
  });
}
```

Invalidate `lists()` after create/delete, `all` after update (detail + lists).

## Model contract

```ts
export type IPostModel = IBaseModel & {
  title: ILocalizedString;
  slug: string;
  status: PostStatusEnum;
  cover?: IMediaModel | null;
};

export class PostModel extends BaseModel<IPostModel> {
  getTitle(locale: string) {
    return pickLocalized(this.props.title, locale);
  }
  getSlug() {
    return this.props.slug ?? "";
  }
  isPublished() {
    return this.getStatus() === PostStatusEnum.PUBLISHED;
  }
  getCover() {
    return this.props.cover ? new MediaModel(this.props.cover) : null;
  }
}
```

Rules: getters only, null-safe defaults, nested objects wrapped in their own
model, no I/O, no business workflow, no field renaming.

## DTO contract

```ts
export const createPostSchema = z.object({
  title: localizedStringSchema(["en", "fa"], "en", { max: 255 }),
  slug: slugSchema,
  status: z.enum(PostStatusEnum).default(PostStatusEnum.DRAFT),
});
export type CreatePostDto = z.infer<typeof createPostSchema>; // after defaults
export type CreatePostInput = z.input<typeof createPostSchema>; // before defaults (form values)
```

List queries extend `listQuerySchema`. Error messages are English and
sentence-case; web maps them to `t()` keys in the form layer if needed.

## Styling

- Tailwind utility classes; `cn()` for conditional merging.
- Design tokens are CSS variables declared in `libs/ui/src/styles/globals.css` under `@theme`.
- Logical properties only: `ms-4` not `ml-4`, `text-start` not `text-left`.
- Component variants via `class-variance-authority`.
- No inline `style` except for truly dynamic values (transforms, measured sizes).

## Forms

```ts
const form = useForm<CreatePostInput>({ resolver: zodResolver(createPostSchema), defaultValues });
const onSubmit = form.handleSubmit((values) => createPost.mutate(values as CreatePostDto));
```

Server validation errors (`422`) are mapped onto fields with
`applyServerErrors(form, error)` from `@repo/ui/form`.

## Errors

- `ApiClientError` is the only error type leaving `libs/services`.
- `statusCode >= 500` throws to the nearest `error.tsx` automatically (QueryClient default).
- `4xx` is handled inline: `error.isValidationError`, `error.fieldError("slug")`.
- Network failures have `statusCode === 0` and are retried twice.

## Git

- Branch prefixes: `feat/ fix/ chore/ refactor/ docs/ test/ hotfix/`.
- Commit: one line, imperative, ≤ 72 chars, no trailer, no emoji, no AI attribution.
- PR/MR: draft first, one-line title, short plain description, link the issue.
- Squash-merge into `develop`; `main` receives release merges and tags.
