import type { Middleware } from "./chain";

export type SecurityHeadersOptions = {
  /**
   * Content-Security-Policy directives. Start in report-only mode, read the
   * violation reports, then flip `enforce: true`.
   */
  csp?: {
    directives: Record<string, string[]>;
    enforce?: boolean;
    reportUri?: string;
  };
  /** Send HSTS (only meaningful behind https). */
  hsts?: boolean | { maxAge?: number; includeSubDomains?: boolean; preload?: boolean };
  frameOptions?: "DENY" | "SAMEORIGIN" | false;
  referrerPolicy?: string | false;
  permissionsPolicy?: Record<string, string[]> | false;
};

/** Sensible CSP starting point; extend `connect-src` with your API origin. */
export function defaultCspDirectives(apiOrigin?: string | null): Record<string, string[]> {
  return {
    "default-src": ["'self'"],
    "script-src": ["'self'", "'unsafe-inline'"],
    "style-src": ["'self'", "'unsafe-inline'"],
    "img-src": ["'self'", "https:", "data:", "blob:"],
    "font-src": ["'self'", "data:"],
    "connect-src": ["'self'", ...(apiOrigin ? [apiOrigin] : [])],
    "object-src": ["'none'"],
    "base-uri": ["'self'"],
    "frame-ancestors": ["'self'"],
    "form-action": ["'self'"],
  };
}

function serializeCsp(directives: Record<string, string[]>, reportUri?: string): string {
  const parts = Object.entries(directives).map(([key, values]) => `${key} ${values.join(" ")}`);
  if (reportUri) parts.push(`report-uri ${reportUri}`);
  return parts.join("; ");
}

/**
 * Adds the standard hardening headers to every response. Defaults are safe
 * for a typical app; pass options to loosen (e.g. `frameOptions: false` for
 * an embeddable widget).
 */
export function withSecurityHeaders(options: SecurityHeadersOptions = {}): Middleware {
  const {
    csp,
    hsts = true,
    frameOptions = "SAMEORIGIN",
    referrerPolicy = "strict-origin-when-cross-origin",
    permissionsPolicy = { camera: [], microphone: [], geolocation: [], "interest-cohort": [] },
  } = options;

  return async (_req, _event, next) => {
    const res = await next();
    const headers = res.headers;

    headers.set("X-Content-Type-Options", "nosniff");
    headers.set("X-DNS-Prefetch-Control", "on");
    if (frameOptions) headers.set("X-Frame-Options", frameOptions);
    if (referrerPolicy) headers.set("Referrer-Policy", referrerPolicy);

    if (permissionsPolicy) {
      const value = Object.entries(permissionsPolicy)
        .map(([feature, allow]) => `${feature}=(${allow.join(" ")})`)
        .join(", ");
      headers.set("Permissions-Policy", value);
    }

    if (hsts) {
      const { maxAge = 63_072_000, includeSubDomains = true, preload = false } =
        typeof hsts === "object" ? hsts : {};
      headers.set(
        "Strict-Transport-Security",
        `max-age=${maxAge}${includeSubDomains ? "; includeSubDomains" : ""}${preload ? "; preload" : ""}`
      );
    }

    if (csp) {
      headers.set(
        csp.enforce ? "Content-Security-Policy" : "Content-Security-Policy-Report-Only",
        serializeCsp(csp.directives, csp.reportUri)
      );
    }

    return res;
  };
}
