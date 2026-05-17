import { createRequire } from "node:module";
import nextTypescript from "eslint-config-next/typescript";

const require = createRequire(import.meta.url);
const nextConfigRequire = createRequire(require.resolve("eslint-config-next"));
const nextPlugin = nextConfigRequire("@next/eslint-plugin-next");

export default [
  ...nextTypescript,
  {
    files: ["**/*.{js,jsx,mjs,ts,tsx}"],
    plugins: {
      "@next/next": nextPlugin,
    },
    rules: {
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs["core-web-vitals"].rules,
    },
  },
  {
    ignores: [
      ".next/**",
      "node_modules/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
      "tsconfig.tsbuildinfo",
    ],
  },
];
