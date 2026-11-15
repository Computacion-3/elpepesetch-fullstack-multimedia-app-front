# Reuse analysis

Run before interrogation and before writing tasks. Source: `temp/clean-plans/inventory.md` (+ opening the files).

## Classification

| Tag | Meaning | Evidence required |
|---|---|---|
| `reuse` | Used as-is; no file change. | File path + exact signature that already satisfies the need. |
| `extend` | Existing artifact gets a new method/field/case; behavior of existing callers unchanged. | File path + the signature to add + list of current callers (to confirm no breakage). |
| `new` | Nothing equivalent exists. | Inventory search terms you used (entity name, verbs, endpoint) with no match. |
| `refactor` | Existing code violates the model and the story depends on it (e.g. slice imports `di/`). | The `lint:clean` / `clean-audit` rule it violates. Only include if the developer agrees in phase 3. |

## Checklist per capability

1. **Entity / value object** — Is there an entity with the same identity? Add fields/methods (`extend`) instead
   of a parallel entity. Is the validation already a value object elsewhere?
2. **Repository contract** — Does a contract for this aggregate exist? Add the method there. A new contract only
   for a new aggregate or a new external service boundary.
3. **Use case** — Does a use case already perform this action? Can the new behavior be a *composition* of
   existing use cases (new orchestrating use case that depends on their repository contracts)? Never call a use
   case from another use case's thunk chain; orchestrate in the domain.
4. **Datasource** — Same external service already has a datasource (even an empty stub like
   `auth-rest.datasource.ts`)? Extend it. One branch per service: never two datasources for the same API.
5. **DTO / mapper** — Same endpoint payload already typed? Reuse the DTO; extend the mapper.
6. **DI** — Extend the existing container; never create a second container for the same feature.
7. **Slice / thunks / selectors** — Does the feature already have a slice? Add thunks/cases there. New slice only
   for a new feature. Check whether a selector already gives the derived data.
8. **Facade hook** — Extend the existing hook's return API (new action/flag) rather than a second hook,
   unless the new hook represents a clearly separate UI concern (e.g. `useRoutineDetail`).
9. **View models / components** — Add a field to an existing view model; reuse cards/forms with new props.
10. **Shared kernel** — `src/shared` errors/http client exist? Reuse them; never add per-feature copies.

## Output (goes into the plan's Reuse table)

```
| Capability | Tag | Artifact | File | Signature / change | Evidence |
```
