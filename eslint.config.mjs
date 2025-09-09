import path from "node:path";
import { fileURLToPath } from "node:url";

import { FlatCompat } from "@eslint/eslintrc";
import js from "@eslint/js";
import eslintPluginImport from "eslint-plugin-import";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

export default [
  // ...compat.extends([
  //   "next/core-web-vitals",
  //   "next/typescript",
  //   "standard",
  //   "plugin:tailwindcss/recommended",
  //   "prettier",
  // ]),
  {
    plugins: {
      import: eslintPluginImport,
    },
    rules: {
      "curly": "error",
      "import/order": [
        "error",
        {
          groups: [
            "builtin",
            "external",
            "internal",
            ["parent", "sibling"],
            "index",
            "object",
          ],
          "newlines-between": "always",
          alphabetize: {
            order: "asc",
            caseInsensitive: true,
          },
        },
      ],
    },
    ignores: ["components/ui/**"],
    // overrides: [
    //   {
    //     files: ["*.ts", "*.tsx"],
    //     rules: {
    //       "no-undef": "off",
    //     },
    //   },
    // ],
  },
];
