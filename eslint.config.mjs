import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "temp/**",
    "next-env.d.ts",
  ]),
  {
    files: ["src/features/library/domain/**/*.{ts,tsx}", "src/features/library/presentation/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": ["error", {
        patterns: [{
          group: [
            "**/datasources/**",
            "**/graphql-client*",
            "graphql-request",
          ],
          message: "Usa ILibraryRepository; el transporte pertenece a infraestructura.",
        }],
      }],
      "no-restricted-globals": ["error", {
        name: "fetch",
        message: "La capa de presentación y el dominio deben usar ILibraryRepository.",
      }],
    },
  },
]);

export default eslintConfig;
