/**
 * Immutable helper for editing a URL query string, typically from
 * `useSearchParams()`:
 *
 * ```ts
 * const next = QueryParamBuilder.from(searchParams).set("page", 2).delete("q").toString();
 * router.push(`${pathname}?${next}`);
 * ```
 */
export class QueryParamBuilder {
  private readonly params: URLSearchParams;

  private constructor(params: URLSearchParams) {
    this.params = params;
  }

  static from(
    source?: URLSearchParams | string | Record<string, string> | null
  ): QueryParamBuilder {
    if (!source) return new QueryParamBuilder(new URLSearchParams());
    if (source instanceof URLSearchParams)
      return new QueryParamBuilder(new URLSearchParams(source));
    return new QueryParamBuilder(new URLSearchParams(source));
  }

  set(key: string, value: string | number | boolean | null | undefined): QueryParamBuilder {
    const next = new URLSearchParams(this.params);
    if (value == null || value === "") next.delete(key);
    else next.set(key, String(value));
    return new QueryParamBuilder(next);
  }

  setMany(values: Record<string, string | number | boolean | null | undefined>): QueryParamBuilder {
    return Object.entries(values).reduce<QueryParamBuilder>(
      (builder, [key, value]) => builder.set(key, value),
      this
    );
  }

  delete(...keys: string[]): QueryParamBuilder {
    const next = new URLSearchParams(this.params);
    keys.forEach((key) => next.delete(key));
    return new QueryParamBuilder(next);
  }

  /** Resets `page` — call after changing any filter so results start at page 1. */
  resetPage(pageKey = "page"): QueryParamBuilder {
    return this.delete(pageKey);
  }

  get(key: string): string | null {
    return this.params.get(key);
  }

  toString(): string {
    return this.params.toString();
  }

  toObject(): Record<string, string> {
    return Object.fromEntries(this.params.entries());
  }
}
