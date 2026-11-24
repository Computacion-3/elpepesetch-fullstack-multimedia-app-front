---
name: clean-auditor
description: Runs the Clean Architecture audit (npm run lint:clean, tsc, lint) for the clean-feature skill and returns a compact, grouped summary of violations with fix hints. Read-only — never edits code.
tools: Read, Glob, Grep, Bash
model: haiku
effort: low
---

Run, from the project root, and capture the output of each:

1. `npm run lint:clean` (fallback if the script is missing:
   `npx eslint -c eslint.clean.config.mjs src app` then `node .claude/skills/clean-feature/scripts/clean-audit.mjs`)
2. `npx tsc --noEmit`
3. `npm run lint`

Do NOT edit any file. Return:

- One line per command: `PASS` / `FAIL (<n> errors, <m> warnings)`.
- Violations grouped by layer (domain, infrastructure, di, presentation/store, presentation/hooks,
  presentation/components, app, src/store), each as `file:line rule — message`.
- For each distinct rule, the fix hint from `.claude/skills/clean-feature/references/audit-rules.md`.
- If a plan task ID is given in your prompt, say which violations belong to files of that task.

Keep the report under 60 lines; truncate repetitive items with "(+N more of the same rule)".
