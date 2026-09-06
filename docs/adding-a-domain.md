# Adding a domain (vertical slice)

Example: **brands**, managed in admin, listed publicly in web.

```bash
pnpm g:domain --name=brand --audience=admin --public
```

The generator creates the files below; this page explains what each one is
for so you can also do it by hand.

## 1. Enum (optional) — `libs/enums/src/lib/brand-status.enum.ts`

```ts
export enum BrandStatusEnum {
  ACTIVE = "active",
  INACTIVE = "inactive",
}
```

Export from `libs/enums/src/index.ts`.

## 2. Model — `libs/models/src/lib/brand/`

`brand.interface.ts` mirrors the API JSON. `brand.model.ts` adds getters.
Export from `libs/models/src/index.ts`.

## 3. DTO — `libs/dtos/src/lib/brands/brands.dto.ts`

`getBrandsListSchema = listQuerySchema.extend({...})`, `createBrandSchema`,
`updateBrandSchema = createBrandSchema.partial()`. Export from `libs/dtos/src/index.ts`.

## 4. Endpoints — `libs/services/src/lib/shared/endpoints.ts`

```ts
brands: {
  public: { list: `${general}/brands`, bySlug: (slug: string) => `${general}/brands/${slug}` },
  admin:  { list: `${admin}/brands`, create: `${admin}/brands`, byId: (id: number) => `${admin}/brands/${id}`, … },
},
```

## 5. Service — `libs/services/src/lib/brands/`

`brands.query-keys.ts`, `brands.api.ts`, `brands.hooks.ts`, `index.ts`.
Export from `libs/services/src/index.ts`.

## 6. Page — admin

```bash
pnpm g:page --app=admin --path=catalog/brands --name=Brands
```

In `index.hook.ts`:

```ts
const table = useTableFilters<{ status?: BrandStatusEnum }>();
const { data, isLoading, error } = useBrandsList(table.query);
const createBrand = useCreateBrand({
  onSuccess: () => {
    toast.success(TEXTS.TOAST_CREATED);
    drawer.onClose();
  },
});
```

## 7. Page — web (public)

```bash
pnpm g:page --app=web --path=brands --name=Brands
```

`page.tsx` fetches on the server with cache tags and passes `initialData` to
the client hook so the first paint has data:

```ts
const brands = await publicBrandsApi.getList({}, { next: { revalidate: 300, tags: ["brands"] } });
```

## 8. Tests

- `libs/models/src/lib/brand/brand.model.spec.ts` — getters with empty/partial payloads.
- `libs/dtos/src/lib/brands/brands.dto.spec.ts` — accept/reject cases.
- `libs/services/src/lib/brands/brands.api.spec.ts` — `apiClient` mocked, URL and model assertions.

## 9. Wire-up checklist

- [ ] All four `index.ts` barrels updated (enums, models, dtos, services).
- [ ] `pnpm nx sync` run.
- [ ] Cache tag added to `apps/web/src/lib/cache-tags.ts` if the backend revalidates it.
- [ ] Sidebar entry in `apps/admin/src/config/navigation.ts` with its permission.
- [ ] `pnpm check` green.
