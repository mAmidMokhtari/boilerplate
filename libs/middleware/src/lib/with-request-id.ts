import { REQUEST_ID_HEADER } from "@repo/config";
import type { Middleware } from "./chain";

/**
 * Ensures every request carries an `x-request-id` (kept when the load
 * balancer already set one) and echoes it on the response so support can
 * correlate a browser report with backend logs.
 */
export function withRequestId(header = REQUEST_ID_HEADER): Middleware {
  return async (req, _event, next) => {
    const incoming = req.headers.get(header);
    const id = incoming ?? crypto.randomUUID();
    if (!incoming) req.headers.set(header, id);
    const res = await next();
    res.headers.set(header, id);
    return res;
  };
}
