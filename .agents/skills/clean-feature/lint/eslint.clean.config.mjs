// Clean Architecture boundaries for Next.js (App Router) + Redux Toolkit.
// Run with: npm run lint:clean  (eslint -c eslint.clean.config.mjs src app)
// Rules reference: .agents/skills/clean-feature/references/audit-rules.md
import { defineConfig, globalIgnores } from "eslint/config";
import boundaries from "eslint-plugin-boundaries";
import tseslint from "typescript-eslint";

const SAME_FEATURE = { feature: "{{ from.element.captured.feature }}" };
const OTHER_FEATURE = { feature: "!{{ from.element.captured.feature }}" };

const el = (type, captured) => ({ element: captured ? { type, captured } : { type } });

const FRAMEWORK_MODULES = [
  { group: ["react", "react-dom", "react/*", "react-dom/*"], message: "Domain must be framework-agnostic: no React." },
  { group: ["next", "next/*"], message: "Domain must be framework-agnostic: no Next.js." },
  { group: ["@reduxjs/*", "react-redux", "redux"], message: "Domain must not know the state library." },
  { group: ["axios", "graphql-request", "@apollo/*", "@supabase/*", "firebase", "firebase/*"], message: "SDKs/HTTP clients belong in infrastructure/datasources." },
];

export default defineConfig([
  globalIgnores([".next/**", "out/**", "build/**", "node_modules/**", "next-env.d.ts", "temp/**", ".agents/**"]),

  {
    files: ["**/*.{ts,tsx,mts}"],
    languageOptions: { parser: tseslint.parser, parserOptions: { ecmaFeatures: { jsx: true } } },
    plugins: { boundaries, "@typescript-eslint": tseslint.plugin },
    settings: {
      "import/resolver": { typescript: { alwaysTryTypes: true, project: "./tsconfig.json" }, node: true },
      "boundaries/include": ["src/**/*", "app/**/*"],
      "boundaries/legacy-templates": false,
      // Order matters: the first matching descriptor wins, so specific folders go first.
      "boundaries/elements": [
        { type: "shared-domain", pattern: "src/shared/domain" },
        { type: "shared-infrastructure", pattern: "src/shared/infrastructure" },
        { type: "shared", pattern: "src/shared" },
        { type: "domain", pattern: "src/features/*/domain", capture: ["feature"] },
        { type: "infrastructure", pattern: "src/features/*/infrastructure", capture: ["feature"] },
        { type: "di", pattern: "src/features/*/di", capture: ["feature"] },
        { type: "pres-store", pattern: "src/features/*/presentation/store", capture: ["feature"] },
        { type: "pres-viewmodel", pattern: "src/features/*/presentation/viewmodels", capture: ["feature"] },
        { type: "pres-hook", pattern: "src/features/*/presentation/hooks", capture: ["feature"] },
        { type: "pres-component", pattern: "src/features/*/presentation/components", capture: ["feature"] },
        { type: "app-store", pattern: "src/store" },
        { type: "app", pattern: "app" },
      ],
    },
    rules: {
      "boundaries/dependencies": [2, {
        default: "disallow",
        message:
          "[clean] {{ from.element.type }} must not depend on {{ to.element.type }}. " +
          "If it only needs a domain type, use `import type`. See references/audit-rules.md",
        policies: [
          // Shared kernel: depends only on itself.
          { from: el("shared-domain"), allow: { to: el("shared-domain") } },
          { from: el("shared"), allow: { to: { element: { types: { anyOf: ["shared", "shared-domain"] } } } } },
          // Shared infrastructure (http client, error translator): reachable only from infrastructure and di.
          { from: el("shared-infrastructure"), allow: { to: { element: { types: { anyOf: ["shared", "shared-domain", "shared-infrastructure"] } } } } },

          // Domain: own domain + shared domain. Another feature's domain only as TYPES
          // (repository contracts / entities used by an orchestrating use case).
          { from: el("domain"), allow: { to: { element: { types: { anyOf: ["domain"] }, captured: SAME_FEATURE } } } },
          { from: el("domain"), allow: { to: el("shared-domain") } },
          { from: el("domain"), allow: { to: el("domain", OTHER_FEATURE), dependency: { kind: "type" } } },

          // Infrastructure implements own domain contracts.
          { from: el("infrastructure"), allow: { to: { element: { types: { anyOf: ["domain", "infrastructure"] }, captured: SAME_FEATURE } } } },
          { from: el("infrastructure"), allow: { to: { element: { types: { anyOf: ["shared", "shared-domain", "shared-infrastructure"] } } } } },

          // DI (composition root of the feature) wires own domain + infrastructure.
          // It may receive other features' repositories only through their di (container) module.
          { from: el("di"), allow: { to: { element: { types: { anyOf: ["domain", "infrastructure"] }, captured: SAME_FEATURE } } } },
          { from: el("di"), allow: { to: el("di", OTHER_FEATURE) } },
          { from: el("di"), allow: { to: { element: { types: { anyOf: ["shared", "shared-domain", "shared-infrastructure"] } } } } },

          // Presentation/store (slice + thunks): use cases arrive via thunk extraArgument,
          // so it only needs own domain TYPES + own viewmodels.
          { from: el("pres-store"), allow: { to: el("domain", SAME_FEATURE), dependency: { kind: "type" } } },
          { from: el("pres-store"), allow: { to: el("shared-domain") } },
          { from: el("pres-store"), allow: { to: { element: { types: { anyOf: ["pres-store", "pres-viewmodel"] }, captured: SAME_FEATURE } } } },

          // ViewModels map entities to plain UI data.
          { from: el("pres-viewmodel"), allow: { to: el("domain", SAME_FEATURE), dependency: { kind: "type" } } },
          { from: el("pres-viewmodel"), allow: { to: el("pres-viewmodel", SAME_FEATURE) } },

          // Facade hooks: the only bridge between components and Redux.
          { from: el("pres-hook"), allow: { to: { element: { types: { anyOf: ["pres-store", "pres-viewmodel", "pres-hook"] }, captured: SAME_FEATURE } } } },
          { from: el("pres-hook"), allow: { to: el("domain", SAME_FEATURE), dependency: { kind: "type" } } },
          { from: el("pres-hook"), allow: { to: el("app-store") } },

          // Components: props, viewmodels, own hooks, other components. Domain only as types (params).
          { from: el("pres-component"), allow: { to: { element: { types: { anyOf: ["pres-component", "pres-viewmodel", "pres-hook"] }, captured: SAME_FEATURE } } } },
          { from: el("pres-component"), allow: { to: el("pres-component", OTHER_FEATURE) } },
          { from: el("pres-component"), allow: { to: el("domain", SAME_FEATURE), dependency: { kind: "type" } } },
          { from: el("pres-component"), allow: { to: el("shared") } },

          // Global store: combines feature slices and injects feature containers as thunk extraArgument.
          // It is the ONLY place (besides di) allowed to touch di.
          { from: el("app-store"), allow: { to: { element: { types: { anyOf: ["app-store", "pres-store", "di"] } } } } },

          // Next.js routes: thin. Hooks, components and the StoreProvider only.
          { from: el("app"), allow: { to: { element: { types: { anyOf: ["app", "pres-hook", "pres-component", "app-store", "shared"] } } } } },

          // Explicit messages for the most common mistakes (these never allow anything).
          {
            from: { element: { types: { anyOf: ["pres-store", "pres-viewmodel", "pres-hook", "pres-component", "app"] } } },
            disallow: { to: el("di") },
            message: "[clean] {{ from.element.type }} must not import a DI container. Thunks receive use cases through `extra` (thunk extraArgument wired in src/store/store.ts).",
          },
          {
            from: { element: { types: { anyOf: ["pres-store", "pres-viewmodel", "pres-hook", "pres-component", "app", "domain"] } } },
            disallow: { to: el("infrastructure") },
            message: "[clean] {{ from.element.type }} must not import infrastructure (DTOs, datasources, repository impls). Depend on the domain contract instead.",
          },
        ],
      }],
    },
  },

  // Domain stays pure TypeScript.
  {
    files: ["src/features/*/domain/**", "src/shared/domain/**"],
    rules: { "no-restricted-imports": ["error", { patterns: FRAMEWORK_MODULES }] },
  },

  // Presentation may only see domain as types; `import type` makes that explicit (auto-fixable with --fix).
  {
    files: ["src/features/*/presentation/**", "app/**"],
    rules: { "@typescript-eslint/consistent-type-imports": ["error", { fixStyle: "separate-type-imports" }] },
  },

  // Only facade hooks talk to Redux.
  {
    files: ["src/features/*/presentation/components/**", "app/**"],
    rules: {
      "no-restricted-imports": ["error", {
        paths: [{ name: "react-redux", message: "Components consume the feature facade hook (presentation/hooks/use-*.ts), never react-redux." }],
        patterns: [{ group: ["**/store/hooks"], message: "Components consume the feature facade hook, not the typed store hooks." }],
      }],
    },
  },

  // Network access only inside datasources.
  {
    files: ["src/**", "app/**"],
    ignores: ["src/features/*/infrastructure/datasources/**", "src/shared/infrastructure/**"],
    rules: {
      "no-restricted-globals": ["error",
        { name: "fetch", message: "Network access belongs in infrastructure/datasources behind a datasource interface." },
        { name: "XMLHttpRequest", message: "Network access belongs in infrastructure/datasources." },
      ],
    },
  },

  // Every file inside a feature must belong to a known layer folder.
  {
    files: ["src/features/**"],
    rules: { "boundaries/no-unknown-files": 2 },
  },
]);
