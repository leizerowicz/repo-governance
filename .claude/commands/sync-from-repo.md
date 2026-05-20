---
name: sync-from-repo
description: Compare a source repo's live DoD/audit/PR templates against repo-governance and apply structural improvements as [PROPOSED] markers
---

# Sync Governance Templates from Source Repo

A "source repo" is a live implementation built on repo-governance's templates — the proving ground where patterns get stress-tested against real incidents. This skill spots structural drift between the source repo and the templates, then proposes abstracted improvements back here.

**Default source repo:** `~/repos/HopSkipInc/ai-fleet`
If the user specifies a different repo, use that path instead. Confirm at the start of the run: "Using `<path>` as source repo — correct?"

**Do not run during active development in the source repo.** Wait for audit dust to settle — run after a sprint boundary or after a "Recipe lessons" section appears in the audit docs.

---

## Step 1: Read governance artifacts

Read both versions of each governance artifact.

**repo-governance (templates being maintained — paths relative to this repo):**
- `templates/definition-of-done.md`
- `templates/pull_request_template.md`
- `templates/workflows/scheduled-audit.yml`
- `templates/adr/022-definition-of-done.md`

**Source repo (live implementation — paths relative to `<source repo root>`):**
- `docs/definition-of-done.md`
- `.github/pull_request_template.md` — also check `.github/PULL_REQUEST_TEMPLATE.md` (case variants both)
- `.github/workflows/scheduled-audit.yml`
- The most recent `docs/audit-YYYY-MM-DD.md`:
  ```bash
  ls <source-repo>/docs/audit-*.md | sort | tail -1
  ```
- `docs/governance-health.md` if it exists — this is where DORA proxy metrics live once implemented

Adjust paths if the source repo organizes docs differently (e.g., `documentation/` instead of `docs/`). Use judgment.

---

## Step 2: Structural comparison

Compare section by section. You are looking for **structural improvements, not content copying.** The goal is to make the template more complete and actionable — not to reproduce the source repo's implementation details.

### definition-of-done.md — what to look for:

- **New work type sections** not present in the template (e.g., "Dependency upgrade," "Schema change," "Governance health metric")
- **New checklist items** within existing work type sections
- **"Why this rule exists" sections** — the template has `[Fill in with a real incident...]` placeholders; the source repo may have real incidents. Extract the *structural lesson* (not the specific incident details) and propose it
- **More specific instructions** — if the source repo replaced vague guidance ("find stale references") with a concrete step (e.g., a specific grep command pattern), propose the generic form
- **Changes to the "single underlying rule" or "Audit" sections** — cadence changes, new severity handling rules

### pull_request_template.md — what to look for:

- **New work types** in the Type checklist
- **New items in All PRs** section
- **New type-specific checklist sections**
- **Case mismatch:** if both `.github/pull_request_template.md` (lowercase) and `.github/PULL_REQUEST_TEMPLATE.md` (uppercase) exist, note this as a finding — GitHub uses lowercase on Linux; only one should exist

### Audit structure (from recent audit docs) — what to look for:

- **New structural sections** (e.g., "Recipe lessons," "Superseded since last audit") that should be reflected in the audit template or workflow
- **Changes to severity definitions** or P0/P1/P2 handling conventions
- **Changes to the resolution tracking table** (columns, naming)

### governance-health.md (if present) — what to look for:

- Metrics structure and definitions that could be abstracted into a governance health template
- Any DORA proxy metrics that are ready to be generalized (change failure rate, MTTR, deployment frequency, lead time)

---

## Step 3: Abstraction rules

When the source repo's version contains implementation-specific details, abstract them before applying. The template must work for any repo, not just the source.

| Source-specific | Template form |
|---|---|
| `npm run check` / repo-specific lint command | `[project CI check command]` or "the project's configured lint command" |
| Specific DB engine ("real Postgres") | "real data store (not mocks or in-memory doubles)" |
| Specific deleted interface/type names | `<deleted-interface-or-type>` as a placeholder pattern |
| Specific PR numbers, SHAs, issue numbers | Remove — don't carry repo-specific references |
| Specific dates in "Why" sections | Remove — keep the pattern, drop the date |
| Specific `docs/` subdirectory paths | Use generic `<project docs path>` or describe the pattern |
| `CLAUDE.md` | Keep — this is universal to Claude Code projects |
| Source-specific directory structure (`host/`, `host-tools/`, etc.) | Replace with `<project source directories>` |

**For "Why this rule exists" sections:**

If the template placeholder says `[Fill in with a real incident...]` and the source repo has it filled in, extract the *class of failure* and propose it as an example pattern the implementer should replace with their own incident:

```
> **Why this rule exists:** [Fill in with an incident from your codebase. Example pattern: "An ADR moved to Accepted before its promised lint existed. The violation it was meant to catch shipped anyway and reached production."]
```

If the template placeholder already has content, check whether the source repo's version is materially better. Propose the improved version if so.

---

## Step 4: Apply [PROPOSED] markers

Apply changes directly to the repo-governance template files. Do not create new files.

**Marker formats:**

New checklist item:
```
- [ ] [PROPOSED from source repo] <abstracted item>
```

Improved "Why this rule exists":
```
> **Why this rule exists:** [PROPOSED — replace with your incident. Example pattern from source repo: <abstract lesson in one sentence>]
```

New section:
```
<!-- [PROPOSED from source repo] New section — review and adapt before committing -->
### New Section Title
...
```

Change to an existing item (comment above, change inline):
```
<!-- [PROPOSED from source repo: more specific than previous version] -->
- [ ] Revised checklist item (was: original text)
```

Structural/workflow change:
```
<!-- [PROPOSED from source repo: e.g., cadence changed from "periodically" to "daily weekdays" — adjust to your team's capacity] -->
```

---

## Step 5: Report

After applying markers, output a concise summary.

```
## Sync complete — N proposed changes applied
Source repo: <path>

### templates/definition-of-done.md (X changes)
- [new item] <section>: <what and why>
- [why section] <section>: replaced placeholder with abstract pattern
- [cadence] Audit section: proposed daily cadence

### templates/pull_request_template.md (Y changes)
- [new type] Added "<type>" to type checklist

### Structural patterns not applied (Z items)
- <item> — too implementation-specific; noted for awareness
  Lesson: <what the pattern teaches in general terms>

Review the [PROPOSED] markers in each file.
Remove the marker text to accept. Delete the line to reject.
```

---

## Notes

- **When to run:** After a significant audit cycle with Recipe lessons, or when the source repo's DoD adds a new work type. Not every sprint.
- **Recipe lessons are the highest-signal input.** Each lesson in the source repo's audit docs is a DoD gate that was missing. Propose the generic form as a checklist item or "why" addition.
- **The "[Fill in]" placeholders are the priority target.** A filled-in "why" section in the source repo is the highest-value thing to sync — it replaces an empty promise with learned evidence.
- **What not to carry over:** If a finding is purely about the source repo's specific architecture, note it in the summary under "not applied" but don't add a marker.
- **governance-health.md:** Once implemented in the source repo and refined through a few cycles, its structure is a candidate for a new template in `templates/governance-health.md`. Propose it when the structure looks stable.
