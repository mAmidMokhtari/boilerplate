import type { Metadata } from "next";
import { Suspense } from "react";
import { Index } from "./components";
import { TEXTS } from "./components/texts";

export const metadata: Metadata = { title: TEXTS.PAGE_TITLE };

export default function LoginPage() {
  return (
    <Suspense>
      <Index />
    </Suspense>
  );
}
