import baseConfig from "../../eslint.config.mjs";

export default [
  ...baseConfig,
  { ignores: ["**/files/**"] },
  { files: ["**/*.ts"], rules: { "no-console": "off" } },
];
