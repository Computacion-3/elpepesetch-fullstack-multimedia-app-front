# Interrogation guide

Goal: make the developer state their intent and own the separation of responsibilities. You propose, they
decide; you push back when a decision breaks the dependency rule.

Ask concise batches of no more than four questions. Where useful, offer 2–4 concrete choices and always allow a free-form answer. Pre-fill options from the story and inventory. Ask in rounds; skip questions already answered by the story or codebase.

## Round 1 — Intent and domain

1. **Outcome / acceptance** — "When is this story done?" Offer 2–3 concrete acceptance criteria variants
   derived from the story (happy path + main error case).
2. **Entities** — "Which business concepts does this story manipulate?" Options: existing entities from the
   inventory (reuse), a new entity, a value object inside an existing entity.
3. **Invariants** — "Which rules must ALWAYS hold?" List candidate rules found in the story (lengths, formats,
   uniqueness, state transitions). Ask where each lives: entity constructor / value object / use case policy.
4. **Identity & ownership** — "Who owns this data, and how does the user id reach the request?" Options:
   use case param from the auth state, http client token, server derives it from the session.

## Round 2 — Use cases and infrastructure

1. **Use case boundaries** — "Which user actions are separate use cases?" Propose the list (e.g. `GetX`, `CreateX`,
   `SignUp`). Flag candidates that are composition of existing use cases.
2. **Orchestration** — when the story spans several services: "In which order, and what happens if step 2 fails?"
   (e.g. account created but profile fails → compensate? retry? surface error?).
3. **External services** — "Which backend(s) serve this data?" One datasource branch per service. Options:
   existing datasource (extend), REST, GraphQL, SDK (Supabase/Firebase), mock first.
4. **Contract shape** — "Do you know the API payloads?" Options: yes (paste/point to them), not yet (mock DTOs
   now, mark as risk), generated types exist.

## Round 3 — Presentation

1. **State & updates** — pessimistic (Recommended) vs optimistic; what is cached; when to refetch (on mount if
   idle, on focus, manual reload).
2. **Screens & routes** — which routes; Server page rendering a client screen (Recommended) vs client page.
3. **Feedback** — loading/empty/error states required; messages language.
4. **Cross-feature UI** — does another feature's UI show this data (e.g. header shows profile name)? Then the
   other feature consumes THIS feature's facade hook or a shared selector, never its slice internals.

## Push-back rules

When an answer matches the left column, explain the consequence, propose the right column, and ask again
(one short paragraph followed by a concise question offering the compliant option first).

| Developer says | Why it breaks the model | Propose |
|---|---|---|
| "Validate it in the form" | Rule duplicated, bypassable from other entry points | Invariant in entity/value object; form only displays the `ValidationError` |
| "The thunk can call the API directly" | Presentation coupled to transport; no reuse; untestable | Datasource behind a contract, repository, use case; thunk calls use case via `extra` |
| "Put the entity in the store" | Class instances aren't serializable; hydration issues | View model in state; mapper in `presentation/viewmodels` |
| "Hardcode the user id for now" | Session data leaks into infrastructure | Param from auth state or token in http client; mock datasource may fake it |
| "Use case just calls the repo, skip it" | Fine for pure pass-through — but not if there's ordering/policy | Keep a thin use case if it's a UI action; mandatory if it orchestrates or validates |
| "Component imports the repository/mapper" | UI depends on infrastructure | Facade hook → thunk → use case |
| "Reuse feature B's datasource from feature A" | Cross-feature infrastructure coupling | Depend on B's repository **contract**; wire B's repository in A's `di/` |
| "One big use case for the whole screen" | Mixed responsibilities, hard to reuse | One use case per user action; screen composes via the facade |
| "Store derived data in state" | Duplication, stale data | Selector (with `createSelector` if it allocates) |

## Recording decisions

For each question, record in the plan's **Decisions** section: the question, the chosen answer, and a one-line
rationale (especially when you pushed back and the developer kept a different choice — record it as an
accepted deviation, and it will appear as a risk).
