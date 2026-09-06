import { NextResponse, type NextFetchEvent, type NextRequest } from "next/server";

export type MiddlewareNext = () => Promise<NextResponse>;

/**
 * Koa-style middleware: call `next()` to continue, or return a response to
 * short-circuit (redirect, 404, 410). Responses from `next()` may be mutated
 * (headers, cookies) before returning.
 */
export type Middleware = (
  req: NextRequest,
  event: NextFetchEvent,
  next: MiddlewareNext
) => Promise<NextResponse> | NextResponse;

/**
 * Composes middlewares left-to-right. The last one runs innermost; when
 * every middleware calls `next()` the chain ends in `NextResponse.next()`.
 *
 * ```ts
 * export default chain([withRequestId(), withSecurityHeaders(), withAuthGuard({...}), withIntl(routing)]);
 * ```
 */
export function chain(middlewares: Middleware[]) {
  return async function proxy(req: NextRequest, event: NextFetchEvent): Promise<NextResponse> {
    let index = -1;

    const dispatch = async (i: number): Promise<NextResponse> => {
      if (i <= index) throw new Error("next() called multiple times in middleware");
      index = i;
      const middleware = middlewares[i];
      if (!middleware) return NextResponse.next();
      return middleware(req, event, () => dispatch(i + 1));
    };

    return dispatch(0);
  };
}

/** Adapts a classic `(req) => NextResponse` middleware (e.g. next-intl's) into the chain. */
export function fromLegacy(
  handler: (req: NextRequest, event: NextFetchEvent) => NextResponse | Promise<NextResponse> | undefined | void
): Middleware {
  return async (req, event, next) => (await handler(req, event)) ?? next();
}
