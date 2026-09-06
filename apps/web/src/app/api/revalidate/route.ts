import { timingSafeEqual } from "node:crypto";
import { revalidateTag } from "next/cache";
import { NextResponse, type NextRequest } from "next/server";
import { getServerEnv } from "@repo/config";
import { isRevalidatableTag } from "@/lib/cache-tags";

export const dynamic = "force-dynamic";

const MAX_TAGS = 50;

function isAuthorized(req: NextRequest, secret: string): boolean {
  const provided = req.headers.get("x-revalidate-secret");
  if (!provided) return false;
  const a = Buffer.from(provided);
  const b = Buffer.from(secret);
  if (a.length !== b.length) {
    timingSafeEqual(b, b); // constant-time even on length mismatch
    return false;
  }
  return timingSafeEqual(a, b);
}

/**
 * On-demand Data Cache invalidation. The backend calls this after a publish
 * with `{ tags: ["posts"] }`. Unknown tags are rejected (400) so a typo is
 * loud instead of a silent no-op.
 */
export async function POST(req: NextRequest) {
  const secret = getServerEnv().REVALIDATE_SECRET;
  if (!secret)
    return NextResponse.json({ message: "Revalidation is not configured" }, { status: 503 });
  if (!isAuthorized(req, secret))
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const body = (await req.json().catch(() => null)) as { tags?: unknown } | null;
  const tags = body?.tags;
  if (!Array.isArray(tags) || tags.length === 0 || tags.length > MAX_TAGS) {
    return NextResponse.json(
      { message: "Body must be { tags: string[] } with 1–50 entries" },
      { status: 400 }
    );
  }

  const unknown = tags.filter((t) => typeof t !== "string" || !isRevalidatableTag(t));
  if (unknown.length > 0) {
    return NextResponse.json({ message: "Unknown tags", unknown }, { status: 400 });
  }

  for (const tag of tags as string[]) revalidateTag(tag, "max");
  return NextResponse.json({ revalidated: tags, at: new Date().toISOString() });
}
