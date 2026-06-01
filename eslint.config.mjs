// ESLint 9 flat config. `eslint-config-next` v16 ships native flat-config
// arrays, so we spread them directly (no FlatCompat shim needed).
import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

/** @type {import("eslint").Linter.Config[]} */
const eslintConfig = [
  ...nextCoreWebVitals,
  ...nextTypescript,
  {
    // Prisma's generated client is checked in but not ours to lint.
    ignores: ["src/generated/**"],
  },
];

export default eslintConfig;
