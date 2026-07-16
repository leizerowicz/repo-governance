# Fix Governance Sync Ownership — all governed repos

**Client:** Hopskip (internal)
**Source:** greg/repo-governance session 2026-07-07
**Scope:** Fix the CLAUDE.md governance section so downstream agents record application locally instead of writing to repo-governance's `_client.md`.

## Context

The original governance sync CLAUDE.md section (2026-07-07) had a bug: step 5 told downstream agents to update `_client.md` in repo-governance. This is wrong — downstream repos should never write into the governance repo. Race conditions, trust boundary violation, data ownership.

This prompt fixes step 5: downstream agents now record applied prompts in their own CLAUDE.md under `### Applied governance updates`. repo-governance reconciles from there during `/review-sync`.

## What to do

In `CLAUDE.md`, find the `## Governance` section and make two changes:

1. Replace step 5 with the new version (records locally, not in repo-governance)
2. Replace the `### Applied governance updates` subsection header (if it exists) with the clean version

The corrected section should look like this (replace `<REPO-SLUG>` with the correct slug — ai-fleet, analytics-infrastructure, or enrichment-pipeline):

```markdown
## Governance

This repo is governed by repo-governance at `~/repos/greg/repo-governance`.
The client identifier is `hopskip` and the repo slug is `<REPO-SLUG>`.

To check for and apply pending governance updates:

1. Read `~/repos/greg/repo-governance/downstream/hopskip/_client.md`
2. Find rows for `<REPO-SLUG>` with status `pending`
3. Read each pending prompt at the linked file path
4. Apply the changes described in the prompt
5. Record the application in this repo by appending to the `## Applied governance updates` list at the bottom of THIS section. Format:
   ```
   - [prompt-filename] — applied [YYYY-MM-DD]
   ```
   (repo-governance's `_client.md` is the source of truth, NOT this repo — do not modify files in repo-governance)

### Applied governance updates

<!-- append new entries below when you apply a downstream prompt -->

Governance templates live in `~/repos/greg/repo-governance/templates/` and are
the source of truth for ADR format, DoD, issue authoring, audit structure, PR
templates, and watch-list conventions. When in doubt, check the template first.
```

Commit:
```bash
git add CLAUDE.md
git commit -m "docs: fix governance sync — record applications locally, not in repo-governance

Downstream repos should never write into the governance repo. Record applied
prompts in the Applied governance updates subsection of this file instead."
```

## Repo-specific values

| Repo | `<REPO-SLUG>` |
|---|---|
| ai-fleet | `ai-fleet` |
| analytics-infrastructure | `analytics-infrastructure` |
| enrichment-pipeline | `enrichment-pipeline` |

## Verifiable outcomes

- `grep -q 'do not modify files in repo-governance' CLAUDE.md` — downstream agent warned not to touch repo-governance
- `grep -q 'Applied governance updates' CLAUDE.md` — local recording section exists
- Step 5 no longer references updating `_client.md`
