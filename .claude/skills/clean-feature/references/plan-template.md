# Plan template

File: `temp/clean-plans/<YYYY-MM-DD>-<slug>.md`. Keep headings exactly as below; implementers and the
orchestrator rely on them. Fill every section; write "n/a" rather than deleting one.

```markdown
# <Feature title>

**Status:** draft | awaiting-approval | approved (<date>) | in-progress | done | blocked
**Story:** <verbatim user story / requirement>
**Feature folder:** src/features/<features>/   **Slice key:** <features>

## Acceptance criteria
- [ ] AC1 …
- [ ] AC2 … (error case)

## Docs (versions & notes)
| Package | Version | Source (Context7 / node_modules / npm) | Relevant notes |
|---|---|---|---|

## Decisions
| # | Question | Decision | Rationale / accepted deviation |
|---|---|---|---|

## Layer map
| Layer | Artifact | File | Tag (new/extend/reuse/refactor) |
|---|---|---|---|
| domain | Entity `X` | src/features/x/domain/entities/x.ts | new |
| … | | | |

## Reuse analysis
| Capability | Tag | Artifact | File | Signature / change | Evidence |
|---|---|---|---|---|---|

## Tasks

### Wave 0 — bootstrap (only if needed)
- [ ] **T0.1** <title>
  - Layer: store | shared | tooling
  - Files: `path` (new|extend)
  - Template: `templates/…`
  - Depends on: —
  - Spec: <exact signatures / content>
  - Done when: <observable check>
  - Complexity: low | high

### Wave 1 — domain
- [ ] **T1.1** …

### Wave 2 — infrastructure + di
- [ ] **T2.1** …

### Wave 3 — store wiring + presentation
- [ ] **T3.1** …

### Wave 4 — routes
- [ ] **T4.1** …

## Diagrams
<!-- See references/diagrams.md -->
### Planned layer map (new / extend / reuse)
```mermaid
flowchart LR
  %% nodes per layer with :::new / :::extend / :::reuse
```
### Request flow — <user action>
```mermaid
sequenceDiagram
  autonumber
  %% boxes: Presentation / Domain / Infrastructure; alt success / else failure
```
Generated after implementation: `temp/clean-diagrams/<feature>.html`

## Lint checkpoints
- After wave 1: `npm run lint:clean`
- After wave 2: `npm run lint:clean && npx tsc --noEmit`
- Final: `npm run lint:clean && npx tsc --noEmit && npm run lint` (+ `npm run build` if routes/layout changed)

## Risks & open questions
- …

## Log
- <date time> plan created
- <date time> approved by developer
- <date time> wave N done — lint:clean ✅/❌ (summary)
```

Task-writing rules: one layer per task; ≤5 files; signatures written out (names, params, return types);
no undecided design choices; parallel tasks within a wave touch disjoint files.
