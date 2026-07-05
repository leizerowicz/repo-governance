# Governance Maintenance — analytics-infrastructure — 2026-06-18

**Client:** Hopskip (internal)
**Source:** greg/repo-governance session — lint:adr-readme-sync wiring + pre-audit prep

## Context

Two things converged today:

1. A new governance lint (`lint:adr-readme-sync`) was implemented in `greg/repo-governance` and propagated to both ai-fleet and analytics-infrastructure. The changes landed locally but were not committed.
2. The audit-deadman fires at day 9 after the June 11 inaugural audit — which puts the alert window around **June 20**. The pending DB migration prompt (2026-06-15-db-dbup-migration.md) is still unstarted. If the second audit runs before DbUp is adopted, that item becomes a P1 carry-forward.

This prompt is two items: one immediate (commit what exists), one planning (prioritize the DB migration before the audit clock hits).

---

## Item 1 — Commit the ADR README lint (immediate)

The following changes exist locally but are not committed:

```
M  .github/workflows/code-hygiene.yml   (+11 lines — new adr-readme-sync gate job)
?? scripts/lint-adr-readme-sync.mjs     (new script)
```

Create a PR that commits both files. The lint runs clean (14 ADRs, all registered). CI will pick up the new `adr-readme-sync` job in `code-hygiene.yml` once merged.

**What the lint does:** For every `docs/adr/NNN-*.md` file, asserts that `docs/adr/README.md` contains the markdown link `(NNN-filename.md)`. Exits non-zero on any unregistered ADR. Prevents the numbering collision pattern (two contributors claiming the same ADR number) that recurred twice in ai-fleet in June 2026.

**To commit:**
```bash
git add scripts/lint-adr-readme-sync.mjs .github/workflows/code-hygiene.yml
git commit -m "chore(governance): wire lint:adr-readme-sync as CI gate

Propagated from greg/repo-governance. Checks every docs/adr/NNN-*.md
file has a registered row in docs/adr/README.md. Prevents ADR number
collisions. Passes clean (14 ADRs, all registered)."
git push
```

## Verifiable outcomes — Item 1

- `test -f scripts/lint-adr-readme-sync.mjs` — script exists and is committed
- `grep -q 'adr-readme-sync' .github/workflows/code-hygiene.yml` — CI job wired
- `node scripts/lint-adr-readme-sync.mjs` — exits 0

---

## Item 2 — DB migration prompt urgency flag

The prompt at `downstream/hopskip/analytics-infrastructure/2026-06-15-db-dbup-migration.md` is still status `pending`. The second audit is due around June 20 (9-day dead-man from the June 11 inaugural audit).

**Recommendation:** Apply the DB migration prompt before June 20 so the second audit doesn't open with a P1 carry-forward on day 1. If June 20 is not achievable, mark the item explicitly as `deferred — tracking issue #NNN` in the client log so it's not an unattributed carry-forward.

No new prompt needed here — the existing `2026-06-15-db-dbup-migration.md` is the work. This note is just the timing flag.

---

## Not applicable — skip

- `governance-health.md` — still deferred (1 audit cycle, need 6+)
- `lint:universal-tool-doc-sync` — ai-fleet-specific (tools table with scope='all' semantics)
