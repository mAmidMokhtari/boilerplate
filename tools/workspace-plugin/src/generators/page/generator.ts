import { formatFiles, generateFiles, joinPathFragments, names, type Tree } from "@nx/devkit";
import type { PageGeneratorSchema } from "./schema";

/**
 * Creates the mandated page files for an app. web pages live under
 * `src/app/[locale]/<path>`, admin pages under `src/app/(dashboard)/<path>`.
 */
export async function pageGenerator(tree: Tree, options: PageGeneratorSchema): Promise<void> {
  const n = names(options.name);
  const routedRoot = options.app === "web" ? "src/app/[locale]" : "src/app/(dashboard)";
  const target = joinPathFragments(
    "apps",
    options.app,
    routedRoot,
    options.path.replace(/^\/+|\/+$/g, "")
  );
  const routeSegment = options.path.split("/").filter(Boolean).pop() ?? n.fileName;

  if (tree.exists(joinPathFragments(target, "page.tsx"))) {
    throw new Error(`A page already exists at ${target}`);
  }

  const substitutions = {
    ...n,
    hookName: options.app === "admin" ? "useData" : `use${n.className}Page`,
    routeSegment,
    withLoading: options.withLoading ?? true,
    withError: options.withError ?? true,
    tmpl: "",
  };

  generateFiles(
    tree,
    joinPathFragments(import.meta.dirname, "files", options.app),
    target,
    substitutions
  );

  if (!substitutions.withLoading) tree.delete(joinPathFragments(target, "loading.tsx"));
  if (!substitutions.withError) tree.delete(joinPathFragments(target, "error.tsx"));

  await formatFiles(tree);

  console.log(`\nCreated ${target}`);
  if (options.app === "web") {
    console.log(`Next: add "${n.propertyName}" keys to apps/web/messages/*.json`);
  } else {
    console.log(`Next: add a nav entry in apps/admin/src/config/navigation.ts`);
  }
}

export default pageGenerator;
