# Governance Maintenance — ai-fleet — 2026-06-15

**Client:** Hopskip (internal)
**Source:** greg/repo-governance sync-review 2026-06-10 — accepted 36/36 proposals

This repo is the governance source. Most of what was accepted in this sync-review originated here. The items below are small refinements and cross-checks — not bootstraps.

## What changed in the templates (this sync-review)

- `scheduled-audit.yml` gained a comment warning about `.gitignore` patterns like `docs/*` silently blocking the `docs/audits/` subdirectory.
- `pull_request_template.md` gained explicit gate/probe classification as an "All PRs" checklist item, ADR Consequences past-tense and forward-language tracking-issue rules, and a full "Scheduled automation / job definition change" type + section.
- `definition-of-done.md`: ADR section gained inline-acceptance-criteria and prerequisites-need-tracking-issues rows; integration test, regression test, and lint wording made more specific; enforcement-bearing schema element row added to Migration; new Scheduled automation section; Stale issue sweep section added; all audit-mechanics rules promoted from comments to body text.

## What to do in this repo

1. **Check `.gitignore` for patterns that block `docs/audits/`.**
   Run: `grep -n 'docs/' .gitignore` — confirm no `docs/*` or `docs/**` glob that would silently exclude the subdirectory. If one exists, add `!docs/audits/` as an exception line immediately after it.

2. **PR template — verify "All PRs" gate/probe item is present.**
   Open `.github/pull_request_template.md`. Confirm there is an "All PRs" row for gate/probe classification of CI workflow changes. If absent, add:
   ```
   - [ ] If a CI workflow was added or modified: it is correctly a **gate** (deterministic, blocks merge) or a **probe** (monitors reality, never blocks) — steps sensitive to transient upstream failures belong in probes, not merge gates
   ```

3. **PR template — verify ADR Consequences rows are present.**
   Confirm the ADR section includes:
   ```
   - [ ] If completing work described in an existing ADR's Consequences: that bullet rewritten in past tense in this PR
   - [ ] Any Consequences bullet with forward-looking language ("will be," "future," "pending") has a tracking issue or an explicit WONT-FIX: <rationale>
   ```

4. **PR template — verify Scheduled automation section exists.**
   Confirm there is a `### Scheduled automation / job definition change` section (or equivalent) with rows covering: referenced resources exist, timezone correctness, idempotency, artifact verification. If absent, add it — this repo has scheduled audit + agent jobs that this section directly governs.

5. **DoD — verify Stale issue sweep section is present.**
   Open `docs/definition-of-done.md`. Confirm a stale-issue-sweep section exists with the `gh pr list --state merged` and `gh issue list` one-liners. If absent, add it after the Issue/Epic section.

## Already present — skip

- `docs/governance-health.md` — live and regenerated each audit cycle
- `audit-deadman.yml` — live
- `scheduled-audit.yml` — live (in-platform now, but template shape is already there)
- Issue-authoring policy — already enforced with three layers of tooling
- All DoD "Why this rule exists" blocks — already contain real incidents, not placeholders
- Enforcement-bearing schema element rule in Migration DoD — already present

## Not applicable — skip

- "Fill in with your own incident" placeholder language — this repo already has real incidents in its DoD
