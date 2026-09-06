import { formatFiles, generateFiles, joinPathFragments, names, type Tree } from "@nx/devkit";
import type { DomainGeneratorSchema } from "./schema";

function pluralize(word: string): string {
  if (/(s|x|z|ch|sh)$/.test(word)) return `${word}es`;
  if (/[^aeiou]y$/.test(word)) return `${word.slice(0, -1)}ies`;
  return `${word}s`;
}

function appendExport(tree: Tree, indexPath: string, line: string): void {
  const current = tree.read(indexPath, "utf-8") ?? "";
  if (current.includes(line)) return;
  tree.write(indexPath, `${current.trimEnd()}\n${line}\n`);
}

/**
 * Generates model + dto + service for an entity and wires the barrel exports.
 * Endpoints are printed for you to paste into `endpoints.ts` — that file is
 * the one place we keep hand-curated so paths stay reviewable.
 */
export async function domainGenerator(tree: Tree, options: DomainGeneratorSchema): Promise<void> {
  const single = names(options.name);
  const plural = names(pluralize(single.fileName));
  const audience = options.audience ?? "admin";

  const substitutions = {
    ...single,
    plural,
    audience,
    isPublic: options.public ?? false,
    pluralFileName: plural.fileName,
    tmpl: "",
  };

  const modelDir = joinPathFragments("libs/models/src/lib", single.fileName);
  const dtoDir = joinPathFragments("libs/dtos/src/lib", plural.fileName);
  const serviceDir = joinPathFragments("libs/services/src/lib", plural.fileName);

  for (const dir of [modelDir, dtoDir, serviceDir]) {
    if (tree.exists(dir)) throw new Error(`${dir} already exists`);
  }

  generateFiles(
    tree,
    joinPathFragments(import.meta.dirname, "files/model"),
    modelDir,
    substitutions
  );
  generateFiles(tree, joinPathFragments(import.meta.dirname, "files/dto"), dtoDir, substitutions);
  generateFiles(
    tree,
    joinPathFragments(import.meta.dirname, "files/service"),
    serviceDir,
    substitutions
  );

  appendExport(tree, "libs/models/src/index.ts", `export * from "./lib/${single.fileName}";`);
  appendExport(tree, "libs/dtos/src/index.ts", `export * from "./lib/${plural.fileName}";`);
  appendExport(tree, "libs/services/src/index.ts", `export * from "./lib/${plural.fileName}";`);

  await formatFiles(tree);

  const prefix = audience === "admin" ? "admin" : "customer";
  console.log(`
Created:
  ${modelDir}/
  ${dtoDir}/
  ${serviceDir}/

Add to libs/services/src/lib/shared/endpoints.ts:

  ${plural.propertyName}: {
    ${options.public ? `public: { list: \`\${general}/${plural.fileName}\`, bySlug: (slug: string) => \`\${general}/${plural.fileName}/\${slug}\` },\n    ` : ""}${prefix}: {
      list: \`\${${prefix}}/${plural.fileName}\`,
      create: \`\${${prefix}}/${plural.fileName}\`,
      byId: (id: number) => \`\${${prefix}}/${plural.fileName}/\${id}\`,
      update: (id: number) => \`\${${prefix}}/${plural.fileName}/\${id}\`,
      delete: (id: number) => \`\${${prefix}}/${plural.fileName}/\${id}\`,
    },
  },

Then run: pnpm nx sync && pnpm check
`);
}

export default domainGenerator;
