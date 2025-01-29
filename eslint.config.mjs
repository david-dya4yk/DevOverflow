import path from "node:path";
import { fileURLToPath } from "node:url";

import { FlatCompat } from "@eslint/eslintrc";
import js from "@eslint/js";
import eslintPluginImport from "eslint-plugin-import"; // Імпортуємо плагін

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

export default [
  ...compat.extends([
    "next/core-web-vitals",
    "next/typescript",
    "standard",
    "plugin:tailwindcss/recommended",
    "prettier"
  ]),
  {
    plugins: {
      import: eslintPluginImport, // Вказуємо плагін як об'єкт
    },
    rules: {
      "import/order": [
        "error",
        {
          groups: [
            "builtin", // Built-in types are first
            "external", // External libraries
            "internal", // Internal modules
            ["parent", "sibling"], // Parent and sibling types can be mingled together
            "index", // Then the index file
            "object", // Object imports
          ],
          "newlines-between": "always",
          alphabetize: {
            order: "asc",
            caseInsensitive: true,
          },
        },
      ],
    },
    ignores: ["components/ui/**"], // Використовуємо "ignores" замість "ignorePatterns"
  },
  {
    files: ["*.ts", "*.tsx"], // Файли TypeScript
    rules: {
      "no-undef": "off", // Disable no-undef for TypeScript files
    },
  },
];
