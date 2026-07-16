# Governance Sync CLAUDE.md Section — all governed repos

**Client:** Hopskip (internal)
**Source:** greg/repo-governance session 2026-07-07
**Scope:** Add a governance sync section to each repo's CLAUDE.md so agents can find and apply repo-governance updates without going off the rails.

## Context

The three governed repos (ai-fleet, analytics-infrastructure, enrichment-pipeline) currently have no reference to repo-governance in their CLAUDE.md files. When an agent tries a generic prompt like "update from repo-governance," it has no idea where repo-governance lives, what client name to use, or how the downstream prompt convention works. It searches the current repo, finds nothing, and goes off the rails.

This prompt adds a small section to each repo's CLAUDE.md that gives the agent exactly what it needs: the path to repo-governance, the client name, the repo slug, and the convention for finding/applying/marking-done prompts.

## What to do

Append the following section to `CLAUDE.md`. Fill in the `<REPO-SLUG>` placeholder:

```markdown
## Governance

This repo is governed by repo-governance at `~/repos/greg/repo-governance`.
The client identifier is `hopskip` and the repo slug is `<REPO-SLUG>`.

To check for and apply pending governance updates:

1. Read `~/repos/greg/repo-governance/downstream/hopskip/_client.md`
2. Find rows for `<REPO-SLUG>` with status `pending`
3. Read each pending prompt at the linked file path
4. Apply the changes described in the prompt
5. After applying, update `_client.md` — change `pending` to `applied YYYY-MM-DD` (use today's date)

Governance templates live in `~/repos/greg/repo-governance/templates/` and are
the source of truth for ADR format, DoD, issue authoring, audit structure, PR
templates, and watch-list conventions. When in doubt, check the template first.
```

Commit:
```bash
git add CLAUDE.md
git commit -m "docs: add governance sync section to CLAUDE.md

Tells agents where repo-governance lives and how to find and apply
pending downstream prompts."
```

## Repo-specific values

| Repo | `<REPO-SLUG>` |
|---|---|
| ai-fleet | `ai-fleet` |
| analytics-infrastructure | `analytics-infrastructure` |
| enrichment-pipeline | `enrichment-pipeline` |

## Verifiable outcomes

- `grep -q 'repo-governance' CLAUDE.md` — governance section exists
- `grep -q '<CORRECT-SLUG>' CLAUDE.md` — repo slug is correct
- `grep -q 'pending' CLAUDE.md` — the apply-then-mark-applied workflow is documented
- `grep -q 'templates/' CLAUDE.md` — agent can find templates for self-service
