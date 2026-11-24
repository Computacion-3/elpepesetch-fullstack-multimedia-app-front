# Audit rules (`npm run lint:clean`)

`lint:clean` = `eslint -c eslint.clean.config.mjs src app` (import boundaries) **+** `clean-audit.mjs`
(structural checks). Auto-fix the `import type` cases with `npx eslint -c eslint.clean.config.mjs --fix src app`.

## ESLint (eslint.clean.config.mjs)

Elements (from `boundaries/elements`): `shared-domain`, `shared-infrastructure`, `shared`, `domain`,
`infrastructure`, `di`, `pres-store`, `pres-viewmodel`, `pres-hook`, `pres-component`, `app-store` (src/store), `app`.

| Message / rule | What it means | Fix |
|---|---|---|
| `[clean] X must not depend on domain. If it only needs a domain type, use import type` | Presentation imported a domain *value* (class/function). Presentation may only see domain **types**. | `import type { … }`. If you truly need behavior (validation, creation), it belongs in a use case reached through a thunk. |
| `[clean] X must not import a DI container` | Presentation/app touched `di/`. | Thunks get use cases from `extra`; wire the container in `src/store/store.ts` (`createThunkExtra`). |
| `[clean] X must not import infrastructure` | Domain or presentation imported DTOs, mappers, datasources or repository impls. | Depend on the domain contract; mapping happens in the repository impl. |
| `[clean] X must not depend on shared-infrastructure` | Only infrastructure/di may use the http client or error translator. | Move the call into a datasource. |
| `[clean] domain must not depend on domain` (other feature) | Cross-feature value import in domain. | Only `import type` of another feature's contracts/entities; wire its repository in your `di/`. |
| `[clean] app must not depend on …` | Routes reaching beyond hooks/components/StoreProvider. | Render a presentation screen component. |
| `no-restricted-imports` (domain) | Domain imported React/Next/Redux/SDK. | Domain is pure TS. Move framework code to presentation/infrastructure. |
| `no-restricted-imports` (components/app → react-redux / store hooks) | UI coupled to Redux. | Use the feature facade hook `use-<feature>.ts`. |
| `no-restricted-globals` (fetch) | Network outside datasources. | Create/extend a datasource; call it through repository → use case → thunk. |
| `boundaries/no-unknown-files` | File in a feature outside the known layer folders (e.g. `utils/`). | Move it to the layer it belongs to, or to `src/shared/...`. |
| `@typescript-eslint/consistent-type-imports` | Type-only import written as value import (presentation/app). | `--fix`. |

## Structural (clean-audit.mjs)

| Rule | Level | Meaning | Fix |
|---|---|---|---|
| `structure/missing-layer` | warn | Feature lacks domain/infrastructure/presentation. | Add the layer or confirm it is UI-only. |
| `structure/missing-di` | error | Feature has a slice but no container. | Add `di/<entity>.container.ts`, inject in `store.ts`. |
| `naming` | warn | File name doesn't follow the layer convention. | Rename (see hint). |
| `contract/unimplemented-repository` | error | Domain contract with no `implements` in infrastructure. | Add `<entity>.repository.impl.ts`. |
| `contract/datasource-without-interface` | error | Datasource class not implementing a contract. | Add `<entity>.datasource.ts` interface. |
| `contract/repository-impl-without-contract` | error | Repository impl not implementing a domain contract. | `implements XRepository`. |
| `usecase/no-execute` | warn | Use case without `execute()`. | One public `execute`. |
| `usecase/concrete-dependency` | error | Use case constructor takes `*Impl`/datasource. | Depend on contracts. |
| `state/entity-in-state` | error | Slice state typed with a domain entity. | Store view models. |
| `thunk/no-extra` | error | Thunk not using `extra` (likely imports container or fetches). | `async (arg, { extra, rejectWithValue }) => extra.<f>.<uc>.execute(arg)`. |
| `thunk/no-reject-with-value` | warn | Errors not mapped. | `rejectWithValue(describeError(err, '…'))`. |
| `thunk/instantiates-dependencies` | error | `new XUseCase()` etc. in slice. | Only `di/` constructs. |
| `hook/refetch-on-empty` | warn | `if (items.length === 0) dispatch(fetch…)`. | `status === 'idle'`. |
| `mapper/hardcoded-session` | warn | `userId: 1` in a mapper. | Pass through params / http client. |
| `component/duplicated-invariant` | warn | Component re-implements a length rule. | Let the use case validate. |
| `store/singleton` | error | `export const store = configureStore(...)`. | `makeStore()` + `useState(makeStore)`. |
| `store/no-extra-argument` | warn | Store doesn't inject containers. | `thunk: { extraArgument: createThunkExtra() }`. |
| `store/provider-not-client` | error | StoreProvider lacks `'use client'`. | Add directive. |
| `app/client-layout` | warn | Root layout is a Client Component. | Keep it a Server Component. |

## Reading results

- Fix **errors** before moving to the next wave. Warnings go to the plan's Risks unless trivial.
- If a rule is wrong for a legitimate case, do not disable it silently: record the deviation in the plan's
  Decisions table and use a targeted `// eslint-disable-next-line <rule> -- <reason>`.
