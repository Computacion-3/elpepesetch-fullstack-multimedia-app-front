---
name: clean-feature
description: Plan and build a feature (user story / requirement) in a Next.js App Router + Redux Toolkit (thunks) project following Clean Architecture (domain / infrastructure / di / presentation). Interrogates the developer about responsibilities, analyzes existing modules for reuse, writes an action plan with didactic diagrams to temp/clean-plans/, waits for explicit approval, implements with low-effort subagents, audits with `npm run lint:clean`, and generates diagrams of how the layers interact. Use `/clean-feature audit` to only audit, `/clean-feature diagram` to only draw.
argument-hint: "<user story or requirement> | audit [feature] | diagram [feature]"
---

# clean-feature

You are the **architect and orchestrator**. Planning (phases 0–5) happens in THIS conversation with the
current model. Implementation (phase 6) is delegated to `clean-implementer` subagents that follow the plan.

Input: `$ARGUMENTS`

- If it starts with `audit` → run **Audit mode** (bottom of this file) and stop.
- If it starts with `diagram` → run **Diagram mode** (bottom of this file) and stop.
- If it is empty → ask the developer for the user story / requirement (AskUserQuestion, free text via "Other").
- Otherwise it is the functionality to plan.

Skill files live in `.claude/skills/clean-feature/`. Read these before planning:
- `references/layers.md` — what each layer and artifact MEANS (the conceptual model you must defend).
- `references/redux-thunks.md` — how Redux Toolkit fits in (store, slice, thunks via `extra`, selectors, facade).
- `references/interrogation.md` — question bank and push-back rules.
- `references/reuse-analysis.md` — how to classify reuse.
- `references/plan-template.md` — exact format of the plan file.
- `references/audit-rules.md` — what `lint:clean` enforces and how to fix each rule.
- `references/diagrams.md` — planned diagrams (in the plan) and generated diagrams (from code), and how to explain them.

## HARD RULES

1. **No code before approval.** Until the developer selects **Proceed** in phase 5, you may only write
   inside `temp/clean-plans/`. No edits to `src/`, `app/`, `package.json`, configs, and no `npm install`.
2. **Never invent the domain.** Entities, invariants and use-case boundaries come from the developer's
   answers. When something is ambiguous, ask; when an answer breaks the dependency rule, push back
   (explain why, propose the compliant alternative) and ask again.
3. **Reuse before create.** Every artifact in the plan is tagged `reuse`, `extend` or `new`, with evidence
   (file path + signature). Creating something that already exists is a planning defect.
4. **Respect the project's structure.** Follow existing folder and naming conventions found by the inventory.
   Where the project has none, use the templates' conventions (`src/features/<features>/{domain,infrastructure,di,presentation}`).
5. **This Next.js may be newer than your training data.** Read `AGENTS.md` and the relevant guide in
   `node_modules/next/dist/docs/` before planning anything touching routing, layouts, Server/Client components or caching.

---

## Phase 0 — Bootstrap check (read-only)

Check and record (yes/no) in your notes:
- `@reduxjs/toolkit` and `react-redux` in `package.json`.
- `src/store/store.ts` (with `makeStore` and `<clean:*>` markers), `src/store/hooks.ts`, `src/store/StoreProvider.tsx`.
- `app/layout.tsx` wraps children with `<StoreProvider>` (and stays a Server Component).
- `src/shared/domain/errors.ts`, `src/shared/infrastructure/http-client.ts`.
- `eslint.clean.config.mjs` at the root, `lint:clean` and `inventory:clean` scripts, `eslint-plugin-boundaries`
  and `typescript-eslint` in devDependencies.
- `next.config.*` flags that change rules (e.g. `cacheComponents: true` → nothing nondeterministic such as
  `new Date()`/`Date.now()`/`Math.random()` may run while the store or containers are constructed).

Everything missing becomes a **T0.x bootstrap task** in the plan (the scaffold script can create the store and shared kernel).

## Phase 1 — Up-to-date documentation

Use Context7 MCP when available (`resolve-library-id`, then the docs query tool) for the libraries the
story touches: `next`, `@reduxjs/toolkit`, `react-redux`, `eslint-plugin-boundaries`, plus any SDK the story
involves (e.g. Supabase, Firebase, Apollo). Focus queries on the APIs you will plan around
(e.g. "createAsyncThunk withTypes extra argument", "combineSlices", "use client provider app router").

Fallback when Context7 is not available: `npm view <pkg> version`, the installed versions in `node_modules/<pkg>/package.json`,
and `node_modules/next/dist/docs/`. Record versions and anything that changes the plan in the plan's **Docs** section.

## Phase 2 — Inventory and reuse analysis

1. Run `npm run inventory:clean -- --out temp/clean-plans` (or `node .claude/skills/clean-feature/scripts/inventory.mjs --out temp/clean-plans`).
2. Read `temp/clean-plans/inventory.md`, then open the candidate files it points to.
3. Decompose the story into the capabilities it needs and classify each one following `references/reuse-analysis.md`:
   entity / value object, repository contract method, use case, datasource contract + implementation,
   DTO, mapper, DI wiring, view model, slice state / thunk / selector, facade hook, component, route.
4. Look explicitly for: use cases that can be **composed** inside a new orchestrating use case; repository
   methods already present; datasources for the same external service (one branch per service — extend it,
   don't duplicate it); view models and components that only need a new field.

## Phase 3 — Interrogate the developer

Run AskUserQuestion rounds (≤4 questions per round, usually 2–3 rounds) using `references/interrogation.md`.
Pre-fill options from the story and the inventory so the developer mostly confirms or corrects. Cover:

1. Intent and acceptance criteria (what "done" looks like, error cases).
2. **Domain**: which entities/value objects; which invariants; where each rule lives
   (entity/value object vs. use case — never the component).
3. **Use cases**: which operations deserve a use case; which ones orchestrate several repositories and in what order.
4. **Infrastructure**: which external services; datasource kind per service (mock / REST / GraphQL / SDK);
   DTO shape known or to be mocked; how session/auth data reaches requests.
5. **Presentation**: state shape, pessimistic vs. optimistic updates, cache/refetch policy, screens and routes,
   Server vs. Client components.

Push back when an answer violates the model (see "Push-back rules" in `interrogation.md`), e.g.
"validate in the form" → the rule belongs to the entity; "the thunk calls the API" → a datasource behind a
contract; "store the entity in Redux" → store a view model. Record the final decision and the rationale.

## Phase 4 — Write the action plan

Write `temp/clean-plans/<YYYY-MM-DD>-<slug>.md` following `references/plan-template.md` exactly. Make sure
`temp/` is in `.gitignore` (only add it if missing — this is the one config change allowed before approval).

Task rules:
- Order by dependency: `T0` bootstrap → shared → domain → infrastructure → di → store wiring → presentation → app → audit.
- Each task: ID, layer, files (with `new`/`extend`), depends-on, exact signatures to create/change,
  done-criteria, and a **template** pointer (`templates/...`) when one applies.
- Tasks are small enough for a low-effort agent: one layer, ≤5 files, no open design decisions left.
  If a task still needs a decision, it is not ready — go back to phase 3.
- Group tasks into **waves**: tasks in the same wave touch disjoint files and can run in parallel.
- Add lint checkpoints after the domain, infrastructure+di and presentation waves.

Diagrams (see `references/diagrams.md`): fill the plan's **Diagrams** section with a planned layer map colored
by `new`/`extend`/`reuse`, and one sequence diagram per user action showing how the request crosses the layers
(including the order an orchestrating use case calls its repositories and the failure path). If the feature
already exists, also run `npm run diagram:clean -- --feature <name>` and link the current-state diagrams.

## Phase 5 — Approval gate

Present a concise summary in chat: the plan path, the layer map (counts of new/extend/reuse), the waves,
the key decisions and open risks. Walk the developer through the planned request-flow diagram in a few numbered
steps (which layer does what, and why) so the separation of responsibilities is explicit before approving. Then call AskUserQuestion with exactly these options:

- **Proceed** — start implementation as planned.
- **Revise** — the developer says what to change → update the plan (back to phase 3 or 4) → gate again.
- **Cancel** — stop; leave the plan in `temp/`.

Do not interpret anything other than an explicit **Proceed** as approval. Record the approval in the plan's
**Status** section.

## Phase 6 — Implementation (subagents)

For each wave, in order:

1. Spawn one `clean-implementer` agent per task (parallel within the wave, in a single message). Use
   `subagent_type: "clean-implementer"`, and pass `effort: "low"` for routine tasks (templates/patterns apply),
   `effort: "medium"` for tasks the plan marks `complexity: high` (orchestrating use cases, SDK datasources).
   These effort levels are explicitly required by this skill.
2. The prompt for each agent must be self-contained:
   - the plan file path and the task ID (the agent reads ONLY that task + the plan's Decisions section),
   - the exact files to create/extend and the signatures,
   - the template path(s) to follow and any existing file to mirror,
   - "Do not touch files outside this list. Do not make design decisions; if blocked, report back."
   - For bootstrap or new-feature skeletons, tell the agent it may run
     `node .claude/skills/clean-feature/scripts/scaffold.mjs --name <singular> [--plural <plural>] --layers <...>`
     (dry run first, then `--write`) and then adapt the generated files to the plan.
3. When the wave finishes, review the agents' reports, run `npm run lint:clean` (or spawn `clean-auditor`), and
   tick the task checkboxes in the plan. Fix-forward: violations go back to a `clean-implementer` with the
   rule's fix hint from `audit-rules.md`.

You (the orchestrator) only edit the plan file and `src/store/store.ts` wiring if an agent could not; all other
code is written by implementers.

## Phase 7 — Final audit

Run, in order: `npm run lint:clean`, `npx tsc --noEmit`, `npm run lint`. (Optionally `npm run build` if the
plan touched routes/layouts.) If something fails, send the failures to a `clean-implementer` with the fix hints;
at most 2 fix loops, then stop and report to the developer with the remaining output.

Then generate the diagrams of what was actually built: `npm run diagram:clean -- --feature <name>` (writes
`temp/clean-diagrams/<name>.md` and `.html`). Compare them with the planned diagrams; any red arrow is an
audit failure to fix. Offer to open the HTML (`start "" temp/clean-diagrams/<name>.html` on Windows,
`open`/`xdg-open` elsewhere) and explain one request flow step by step.

Finish with: files created / extended / reused, audit results (verbatim summary lines), diagram paths, and
follow-ups. Update the plan's **Status** to `done` (or `blocked` with reasons).

---

## Audit mode (`/clean-feature audit [feature]`)

1. Phase 0 checks (report what's missing; do not install anything).
2. `npm run lint:clean` (if the script is missing: `npx eslint -c eslint.clean.config.mjs src app` and
   `node .claude/skills/clean-feature/scripts/clean-audit.mjs [--feature <name>]`).
3. Group the violations by layer, explain each one using `references/audit-rules.md` (what is wrong
   conceptually, and the fix).
4. Run `npm run diagram:clean [-- --feature <name>]`: violations appear as red arrows in the dependency map;
   reference the diagram paths in the report.
5. Write a remediation plan to `temp/clean-plans/<date>-audit-remediation.md` (same template, tasks only) and
   offer to execute it through the normal approval gate (phase 5 onward). Do not fix anything without **Proceed**.

## Diagram mode (`/clean-feature diagram [feature]`)

1. Run `npm run diagram:clean [-- --feature <name>]` (fallback: `node .claude/skills/clean-feature/scripts/diagram.mjs ...`).
2. Report the generated paths and offer to open the HTML.
3. Teach with it, following `references/diagrams.md`: explain the onion (what each ring means and why the domain
   is at the center), walk one request flow step by step naming the layer and responsibility of each participant,
   and explain every red arrow in the dependency map with its fix. Read-only: change no code.
