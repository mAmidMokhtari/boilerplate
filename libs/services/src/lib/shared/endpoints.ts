import { API_PREFIX, AUTH_ROUTES, getPublicEnv, type ApiAudience } from "@repo/config";

const { general, customer, admin } = API_PREFIX;

/**
 * Every backend path in one place. Functions take ids so call sites never
 * concatenate strings. Group by domain; prefix by audience.
 */
export const endpoints = {
  /** Backend base URL for direct (public) calls. Resolved lazily so tests can stub env. */
  get base(): string {
    return getPublicEnv().NEXT_PUBLIC_API_BASE_URL.replace(/\/+$/, "");
  },

  /** Same-origin app routes (handled by the app's route handlers, not the backend). */
  auth: {
    login: AUTH_ROUTES.login,
    register: AUTH_ROUTES.register,
    logout: AUTH_ROUTES.logout,
    session: AUTH_ROUTES.session,
    /** Backend endpoints the route handlers forward to. */
    backend: {
      login: `${general}/auth/login`,
      register: `${general}/auth/register`,
      refresh: `${general}/auth/refresh`,
      logout: `${general}/auth/logout`,
      requestOtp: `${general}/auth/otp/request`,
      verifyOtp: `${general}/auth/otp/verify`,
      forgotPassword: `${general}/auth/password/forgot`,
      resetPassword: `${general}/auth/password/reset`,
    },
  },

  /** Current user for a given audience. */
  me: (audience: Exclude<ApiAudience, "general">) => ({
    profile: `${API_PREFIX[audience]}/me`,
    updateProfile: `${API_PREFIX[audience]}/me`,
    changePassword: `${API_PREFIX[audience]}/me/password`,
    permissions: `${API_PREFIX[audience]}/me/permissions`,
  }),

  users: {
    list: `${admin}/users`,
    create: `${admin}/users`,
    byId: (id: number) => `${admin}/users/${id}`,
    update: (id: number) => `${admin}/users/${id}`,
    delete: (id: number) => `${admin}/users/${id}`,
    syncRoles: (id: number) => `${admin}/users/${id}/roles`,
  },

  roles: {
    list: `${admin}/roles`,
    create: `${admin}/roles`,
    byId: (id: number) => `${admin}/roles/${id}`,
    update: (id: number) => `${admin}/roles/${id}`,
    delete: (id: number) => `${admin}/roles/${id}`,
    syncPermissions: (id: number) => `${admin}/roles/${id}/permissions`,
  },

  permissions: {
    list: `${admin}/permissions`,
  },

  posts: {
    /** Public reads for the web app. */
    public: {
      list: `${general}/posts`,
      bySlug: (slug: string) => `${general}/posts/${encodeURIComponent(slug)}`,
    },
    /** Admin CRUD. */
    admin: {
      list: `${admin}/posts`,
      create: `${admin}/posts`,
      byId: (id: number) => `${admin}/posts/${id}`,
      update: (id: number) => `${admin}/posts/${id}`,
      delete: (id: number) => `${admin}/posts/${id}`,
      publish: (id: number) => `${admin}/posts/${id}/publish`,
    },
  },


  media: {
    list: `${admin}/media`,
    upload: `${admin}/media`,
    byId: (id: number) => `${admin}/media/${id}`,
    delete: (id: number) => `${admin}/media/${id}`,
  },

  /** Example of a customer-audience domain (kept minimal). */
  customer: {
    profile: `${customer}/me`,
  },
} as const;
