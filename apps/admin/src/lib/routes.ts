/** Every internal route in one place so links never carry string literals. */
export const ROUTES = {
  home: "/",
  login: "/login",
  posts: "/posts",
  users: "/users",
} as const;

export const AUTH_PAGES = [ROUTES.login];
