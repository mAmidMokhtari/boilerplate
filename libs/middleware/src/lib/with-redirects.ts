import { NextResponse } from "next/server";
import type { Middleware } from "./chain";

export type RedirectRule = {
  /** Exact pathname or a RegExp tested against the pathname. */
  from: string | RegExp;
  /** Destination; `$1`, `$2` refer to RegExp capture groups. */
  to: string;
  permanent?: boolean;
};

/**
 * Static redirects evaluated at the edge — retired locales, renamed routes,
 * marketing vanity URLs. Prefer this over `next.config` redirects when rules
 * change often or need to be tested in isolation.
 */
export function withRedirects(rules: RedirectRule[]): Middleware {
  return async (req, _event, next) => {
    const { pathname } = req.nextUrl;
    for (const rule of rules) {
      let destination: string | null = null;
      if (typeof rule.from === "string") {
        if (pathname === rule.from) destination = rule.to;
      } else {
        const match = pathname.match(rule.from);
        if (match) destination = rule.to.replace(/\$(\d+)/g, (_, i) => match[Number(i)] ?? "");
      }
      if (destination) {
        const url = req.nextUrl.clone();
        url.pathname = destination;
        return NextResponse.redirect(url, rule.permanent ? 308 : 307);
      }
    }
    return next();
  };
}
