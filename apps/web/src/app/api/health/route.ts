import { NextResponse } from "next/server";

/** Liveness probe for load balancers and Kubernetes. */
export function GET() {
  return NextResponse.json({ status: "ok", timestamp: new Date().toISOString() });
}
