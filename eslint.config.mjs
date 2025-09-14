import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
    ],
  },
  {
    rules: {
      // Make unused variables warnings instead of errors
      "@typescript-eslint/no-unused-vars": "warn",
      // Allow any type but warn about it
      "@typescript-eslint/no-explicit-any": "warn",
      // Other common warnings
      "prefer-const": "warn",
      "no-var": "warn",
    }
  }
];

export default eslintConfig;
