import type { Metadata } from "next";
import { PageShell } from "@/components/page-shell";
import { Index } from "./components";
import { TEXTS } from "./components/texts";

export const metadata: Metadata = { title: TEXTS.PAGE_TITLE };

export default function PostsPage() {
  return (
    <PageShell title={TEXTS.PAGE_TITLE} description={TEXTS.PAGE_DESCRIPTION}>
      <Index />
    </PageShell>
  );
}
