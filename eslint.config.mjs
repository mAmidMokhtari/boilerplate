import nx from "@nx/eslint-plugin";
import prettier from "eslint-config-prettier";

/**
 * Dependency direction between project types. Anything not listed is a lint
 * error — move the code to the right layer instead of loosening the rule.
 */
const depConstraints = [
  {
    sourceTag: "type:app",
    onlyDependOnLibsWithTags: [
      "type:service",
      "type:ui",
      "type:auth",
      "type:middleware",
      "type:config",
      "type:dto",
      "type:model",
      "type:util",
      "type:enum",
      "type:testing",
    ],
  },
  { sourceTag: "type:e2e", onlyDependOnLibsWithTags: ["type:app", "type:config", "type:util"] },
  {
    sourceTag: "type:service",
    onlyDependOnLibsWithTags: ["type:config", "type:dto", "type:model", "type:util", "type:enum"],
  },
  {
    sourceTag: "type:auth",
    onlyDependOnLibsWithTags: ["type:config", "type:service", "type:model", "type:util"],
  },
  { sourceTag: "type:middleware", onlyDependOnLibsWithTags: ["type:config"] },
  {
    sourceTag: "type:ui",
    onlyDependOnLibsWithTags: ["type:util", "type:config", "type:model", "type:dto"],
  },
  { sourceTag: "type:dto", onlyDependOnLibsWithTags: ["type:enum"] },
  { sourceTag: "type:model", onlyDependOnLibsWithTags: ["type:model", "type:enum"] },
  { sourceTag: "type:util", onlyDependOnLibsWithTags: ["type:enum"] },
  { sourceTag: "type:enum", onlyDependOnLibsWithTags: [] },
  { sourceTag: "type:config", onlyDependOnLibsWithTags: [] },
  {
    sourceTag: "type:testing",
    onlyDependOnLibsWithTags: [
      "type:service",
      "type:ui",
      "type:config",
      "type:model",
      "type:dto",
      "type:util",
    ],
  },
  { sourceTag: "type:tooling", onlyDependOnLibsWithTags: [] },
  // Apps never import each other.
  { sourceTag: "scope:web", notDependOnLibsWithTags: ["scope:admin"] },
  { sourceTag: "scope:admin", notDependOnLibsWithTags: ["scope:web"] },
];

/**
 * Physical direction utilities break RTL. Only logical ones are allowed:
 * ms/me/ps/pe, start/end, text-start/text-end, rounded-s/rounded-e.
 */
const PHYSICAL_TAILWIND =
  "(^|[\\s\"'`])(-?(ml|mr|pl|pr|left|right|scroll-ml|scroll-mr|scroll-pl|scroll-pr|rounded-l|rounded-r|rounded-tl|rounded-tr|rounded-bl|rounded-br|border-l|border-r)-[\\w\\[\\]/.%-]+|text-left|text-right|float-left|float-right|clear-left|clear-right)([\\s\"'`]|$)";

export default [
  ...nx.configs["flat/base"],
  ...nx.configs["flat/typescript"],
  ...nx.configs["flat/javascript"],
  prettier,
  {
    ignores: [
      "**/dist",
      "**/out-tsc",
      "**/test-output",
      "**/.next",
      "**/storybook-static",
      "**/playwright-report",
      "**/test-results",
      "**/vitest.config.*.timestamp*",
      "**/next-env.d.ts",
    ],
  },
  {
    files: ["**/*.ts", "**/*.tsx", "**/*.js", "**/*.jsx"],
    rules: {
      "@nx/enforce-module-boundaries": [
        "error",
        {
          enforceBuildableLibDependency: true,
          allow: ["^.*/eslint(\\.base)?\\.config\\.[cm]?[jt]s$"],
          depConstraints,
        },
      ],
    },
  },
  {
    files: [
      "**/*.ts",
      "**/*.tsx",
      "**/*.cts",
      "**/*.mts",
      "**/*.js",
      "**/*.jsx",
      "**/*.cjs",
      "**/*.mjs",
    ],
    rules: {
      "no-console": "error",
      "@typescript-eslint/consistent-type-definitions": ["error", "type"],
      "@typescript-eslint/consistent-type-imports": [
        "error",
        { prefer: "type-imports", fixStyle: "inline-type-imports" },
      ],
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_", caughtErrors: "none" },
      ],
      "@typescript-eslint/no-explicit-any": "error",
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@repo/*/src/*"],
              message:
                "Deep imports are not allowed. Import from the package root or a declared subpath.",
            },
            {
              group: ["../../../libs/*", "../../../../libs/*"],
              message: "Import libs by package name (@repo/...).",
            },
          ],
        },
      ],
    },
  },
  {
    // Physical Tailwind directions are RTL bugs waiting to happen.
    files: ["**/*.tsx", "**/*.jsx"],
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          selector: `JSXAttribute[name.name="className"] Literal[value=/${PHYSICAL_TAILWIND}/]`,
          message:
            "Use logical Tailwind utilities (ms-/me-/ps-/pe-/start-/end-/text-start/text-end) instead of physical ones.",
        },
        {
          selector: `JSXAttribute[name.name="className"] TemplateElement[value.raw=/${PHYSICAL_TAILWIND}/]`,
          message:
            "Use logical Tailwind utilities (ms-/me-/ps-/pe-/start-/end-/text-start/text-end) instead of physical ones.",
        },
      ],
    },
  },
  {
    // Test files may use console and any freely.
    files: ["**/*.spec.ts", "**/*.spec.tsx", "**/*.test.ts", "**/*.test.tsx", "**/*.stories.tsx"],
    rules: { "no-console": "off", "@typescript-eslint/no-explicit-any": "off" },
  },
];
