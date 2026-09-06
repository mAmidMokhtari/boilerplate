/** Error body shape the backend returns for 4xx/5xx responses. */
export type ApiErrorBody = {
  message: string;
  statusCode?: number;
  /** Field-level validation errors keyed by input name. */
  errors?: Record<string, string | string[]>;
  /** Stable business error code when the backend threw a domain exception. */
  code?: number | string;
};

/**
 * The only error type that leaves `libs/services`. `statusCode` is `0` when
 * no HTTP response was received (network down, CORS, aborted).
 */
export class ApiClientError extends Error {
  readonly statusCode: number;
  readonly errors?: Record<string, string | string[]>;
  readonly code?: number | string;
  readonly requestId?: string;

  constructor(
    message: string,
    statusCode: number,
    options: {
      errors?: Record<string, string | string[]>;
      code?: number | string;
      requestId?: string;
    } = {}
  ) {
    super(message);
    this.name = "ApiClientError";
    this.statusCode = statusCode;
    this.errors = options.errors;
    this.code = options.code;
    this.requestId = options.requestId;
  }

  get isNetworkError(): boolean {
    return this.statusCode === 0;
  }

  get isUnauthorized(): boolean {
    return this.statusCode === 401;
  }

  get isForbidden(): boolean {
    return this.statusCode === 403;
  }

  get isNotFound(): boolean {
    return this.statusCode === 404;
  }

  get isValidationError(): boolean {
    return this.statusCode === 422;
  }

  get isServerError(): boolean {
    return this.statusCode >= 500;
  }

  /** First message for a field, for wiring into react-hook-form `setError`. */
  fieldError(field: string): string | undefined {
    const value = this.errors?.[field];
    return Array.isArray(value) ? value[0] : value;
  }
}

export function isApiClientError(error: unknown): error is ApiClientError {
  return error instanceof ApiClientError;
}

/** Safe message extraction for UI (toasts, banners). */
export function getErrorMessage(error: unknown, fallback = "Something went wrong"): string {
  if (isApiClientError(error)) return error.message || fallback;
  if (error instanceof Error) return error.message || fallback;
  return fallback;
}
