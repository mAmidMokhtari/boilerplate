import "server-only";
import { createAuth } from "@repo/auth/server";
import { getServerEnv, shouldUseSecureCookies } from "@repo/config";

/** Web app auth: customer audience, cookies prefixed `web_`. */
export const auth = createAuth({
  appId: "web",
  audience: "customer",
  backendBaseUrl: getServerEnv().INTERNAL_API_BASE_URL,
  secureCookies: shouldUseSecureCookies(),
});
