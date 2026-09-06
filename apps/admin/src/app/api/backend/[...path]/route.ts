import { auth } from "@/lib/auth.server";

/** BFF proxy for `/admin/v1/*`. See docs/auth.md. */
export const dynamic = "force-dynamic";

const handler = auth.proxy;
export { handler as GET, handler as POST, handler as PUT, handler as PATCH, handler as DELETE };
