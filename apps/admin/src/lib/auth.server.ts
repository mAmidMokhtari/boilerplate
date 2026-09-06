import "server-only";
import { createAuth } from "@repo/auth/server";
import { getServerEnv, shouldUseSecureCookies } from "@repo/config";

/** Admin app auth: staff audience, cookies prefixed `admin_`. */
export const auth = createAuth({
  appId: "admin",
  audience: "admin",
  backendBaseUrl: getServerEnv().INTERNAL_API_BASE_URL,
  secureCookies: shouldUseSecureCookies(),
});
