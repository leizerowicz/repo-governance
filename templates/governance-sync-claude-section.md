# Governance sync — CLAUDE.md section

When a downstream repo's CLAUDE.md includes this section, the agent can reliably find
and apply governance updates from repo-governance. Without it, the agent has no way to
discover the repo-governance path, the client name, or the prompt convention.

## Template

Add this section to the repo's CLAUDE.md. Replace `<CLIENT>` and `<REPO-SLUG>` with
the actual values (e.g., `hopskip` and `enrichment-pipeline`).

```markdown
## Governance

This repo is governed by repo-governance at `~/repos/greg/repo-governance`.
The client identifier is `<CLIENT>` and the repo slug is `<REPO-SLUG>`.

To check for and apply pending governance updates:

1. Read `~/repos/greg/repo-governance/downstream/<CLIENT>/_client.md`
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

## Design notes

- The section is intentionally small — the agent needs location, convention, and the
  apply-then-record-locally workflow. Everything else it can discover by reading.
- The `Applied governance updates` subsection is where the downstream repo records what
  it has applied. repo-governance reads this during `/review-sync` to reconcile `_client.md`.
  The downstream repo never writes to repo-governance — that's a trust boundary.
- The template path is included so the agent can self-serve on conventions without
  needing a prompt for every question.
- This replaces the pattern of generating detailed per-repo downstream prompts with
  repo-governance knowing every ADR filename. The agent reads the prompt, the prompt
  tells it what to do, and the agent discovers the repo's specifics at runtime.
