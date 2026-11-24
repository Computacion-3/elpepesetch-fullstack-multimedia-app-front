# Layers: what each one means

Clean Architecture separates **what the application is about** (domain) from **how it talks to the world**
(infrastructure) and **how it is shown** (presentation). The arrows of dependency point inward:

```
app/ (routes) ──▶ presentation ──▶ domain ◀── infrastructure
                      ▲                            ▲
                src/store ─────────▶ di ───────────┘
```

**Dependency rule:** source code may only depend on layers closer to the domain. The domain depends on
nothing (no React, Next.js, Redux, HTTP or SDKs). Concrete classes are known only by the composition roots
(`di/` and `src/store/store.ts`).

Two ideas from the course lesson "Aplicando arquitectura limpia" (lesson 0090) that the plan must honor:

1. **Presentation makes ONE call.** The Bloc/thunk calls a single use case and waits for a domain result. It
   does not know that the operation has several steps or which backend exists.
2. **The use case decides the order.** When an operation spans several services (e.g. sign-up = create
   account in Auth, then create the profile with the returned id), the use case orchestrates the repository
   *contracts* (`AuthRepository`, `ProfileRepository`). Each external service has its own branch:
   contract → implementation → datasource. Only datasources touch the SDK, and they convert SDK responses into
   plain types, so nothing above them ever sees an SDK class.

## Folder layout

```
src/
  shared/
    domain/errors.ts                 DomainError hierarchy + describeError (pure TS)
    infrastructure/http-client.ts    HttpClient + HttpError (fetch lives here or in datasources)
    infrastructure/error-translator.ts  HttpError/SDK error → DomainError
  features/<features>/
    domain/
      entities/<entity>.ts           entity class + invariants (assertValid<Entity>Draft)
      value-objects/<vo>.ts          optional: Email, Money, DateRange… (self-validating)
      repositories/<entity>.repository.ts   contract (interface) + Params types
      usecases/<verb>-<noun>.usecase.ts     one class, one execute()
    infrastructure/
      dtos/<entity>.dto.ts           backend shapes (snake_case, ISO strings)
      mappers/<entity>.mapper.ts     DTO ⇄ entity
      datasources/<entity>.datasource.ts        datasource contract (DTO-level)
      datasources/<entity>-<kind>.datasource.ts mock | http | graphql | supabase…
      repositories/<entity>.repository.impl.ts  implements the domain contract
    di/<entity>.container.ts         composition root: builds datasource → repository → use cases
    presentation/
      viewmodels/<entity>.viewmodel.ts   UI-shaped plain data + mapper from entity
      store/<features>.slice.ts          state, thunks (use cases via `extra`), reducers
      store/<features>.selectors.ts      selectors over the slice
      hooks/use-<features>.ts            facade hook: the only bridge to Redux
      components/*.tsx                   UI; consume props / the facade hook
  store/
    store.ts          makeStore(): combineSlices + thunk extraArgument (feature containers)
    hooks.ts          useAppDispatch / useAppSelector / useAppStore (withTypes)
    StoreProvider.tsx 'use client' provider, useState(makeStore)
app/
  <route>/page.tsx    thin route: renders a presentation screen; no data access
  layout.tsx          Server Component wrapping children with <StoreProvider>
```

## Artifact by artifact

### Domain (the "what")
| Artifact | Meaning | Belongs here when… | Never contains |
|---|---|---|---|
| **Entity** | A business concept with identity and invariants (`Routine`, `Profile`). | The rule is true regardless of UI or backend ("a name has 3–100 chars"). | DTO field names, `Date` parsing of ISO strings, React, fetch. |
| **Value object** | Immutable, self-validating value without identity (`Email`, `Password`). | The same validation repeats across entities or use cases. | Persistence concerns. |
| **Repository contract** | The *port* the domain needs: what data operations exist, in domain terms. | A use case needs to read/write something. | HTTP verbs, URLs, DTOs, SDK types. |
| **Use case** | One application action (`CreateRoutine`, `SignUp`). Validates input, orchestrates repositories, applies policies (sorting, permissions, sequencing). | There is a business decision, ordering, or more than one repository involved. Pure pass-through is acceptable when the action is a public capability the UI triggers. | UI messages formatting, Redux, framework imports. |
| **Domain errors** | Typed failures (`ValidationError`, `NotFoundError`, `UnauthorizedError`, `ConflictError`). | Any rule violation or translated infrastructure failure. | HTTP status codes. |

### Infrastructure (the "how")
| Artifact | Meaning | Notes |
|---|---|---|
| **DTO** | Exact wire shape of the backend. | Changes when the API changes; the domain does not. |
| **Datasource contract** | DTO-level operations of ONE external service. | Lets mock/http/sdk implementations be swapped. |
| **Datasource implementation** | The only code that calls `fetch`, an HTTP client or an SDK. | Converts SDK classes to plain DTOs. Deterministic constructors (no `new Date()` at construction). |
| **Mapper** | DTO ⇄ entity translation. | No session data, no defaults invented for the backend (e.g. `userId: 1`). |
| **Repository implementation** | Implements the domain contract using datasource + mapper. | Translates infrastructure errors to domain errors (`toDomainError`). |

### DI (composition root)
Builds the object graph: datasource (chosen by env, e.g. `NEXT_PUBLIC_DATA_SOURCE=mock|http`) → repository →
use cases. Exposed as `create<Entity>Container()`. A feature that needs another feature's repository receives
it here (the orchestrating use case still depends only on contracts).

### Presentation (the "show")
| Artifact | Meaning | Rules |
|---|---|---|
| **View model** | Plain, serializable, UI-shaped data (`title`, `createdAtLabel`). | This is what Redux stores — never entities or class instances. |
| **Slice + thunks** | UI state machine of the feature. Thunks call use cases received through `extra` and map results to view models. | No `fetch`, no container import, no `new UseCase()`. `rejectWithValue(describeError(...))`. |
| **Selectors** | Read functions over the slice state. | Typed against `{ <feature>: State }`, not `RootState` (avoids cycles). |
| **Facade hook** | The feature's public API for components (`useRoutines()` → items, flags, actions). | The only file that imports `useAppDispatch`/`useAppSelector`. |
| **Components** | Render props/view models and forward user intents. | No `react-redux`, no business rules, no infrastructure. |
| **Route (app/)** | URL entry point. | Thin; prefer a Server Component that renders a client screen. |

## Deciding where something goes (quick test)

- Would it still be true if the app were a CLI or mobile app? → **domain**.
- Would it change if the backend changed (REST → GraphQL, field renamed)? → **infrastructure**.
- Would it change if the design changed (labels, formatting, layout)? → **presentation** (view model / component).
- Is it about choosing concrete implementations? → **di**.
- Is it about wiring Redux globally? → **src/store**.
