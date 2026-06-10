# Governance Health Metrics — Implementation Spec

**Status:** Implemented — built in ai-fleet (`tools/governance-health.mjs`), refined over 8 audit cycles, synced back 2026-06-10. The canonical output shape now lives in `templates/governance-health.md`; this spec remains the implementation brief for new repos.
**Author:** Greg Leizerowicz
**Date:** 2026-05-20 (reconciled 2026-06-10)

## Reconciliation notes from the live build (2026-06)

Where the implementation diverged from this spec, the implementation won:

- **Resolution time covers all resolved findings with date-prefixed IDs**, not just trailing-30-day P1s — small repos need every data point. The P1 p50/p90 summary line carries the ≤ 7 days target.
- **Phase 2 generalized:** the metrics regenerate wherever the audit runs (CI workflow step, or inside the audit pipeline's PR), plus report-only in the dead-man probe's job log for drive-by visibility.
- **Phase 3 threshold moved from 3+ to 6+ data points** — at 3 cycles the numbers were still calibrating.
- **Data-quality warnings**: the script prints warnings to stderr when its inputs are degraded (short finding IDs, shallow clone, no `gh` auth) and degrades gracefully rather than failing the audit. Warnings appearing in an audit PR are themselves audit findings.
- **Audit docs live in `docs/audits/`** — path references below predate that convention.

---

## Goal

Measure whether the DoD and audit system is actually working — not by feel, but by numbers. Four DORA-adjacent proxy metrics, all derived from artifacts already in the repo. No new instrumentation required for the first two; light GitHub API usage for the last two.

Internal use only. Not exposed to clients/buyers. Used to iterate on governance quality and build case study evidence ("after 6 weeks of DoD enforcement, change failure rate dropped from X to Y").

---

## Metrics

### 1. Governance failure rate (proxy for DORA: Change Failure Rate)

**What:** Weighted count of new audit findings per cycle, normalized to a rate.

**Formula:**
```
score = (P0_new * 3) + (P1_new * 2) + (P2_new * 1)
rate  = score / commits_since_last_audit
```

**Data source:** Audit docs (`docs/audit-YYYY-MM-DD.md`) — the "Headline counts" table already has P0/P1/P2 new counts. Commit count comes from git log between audit dates.

**Interpretation:** Lower is better. A mature, well-enforced DoD should trend toward 0 new P1s per cycle. Spikes indicate a gate that needs strengthening.

---

### 2. Mean time to resolve (proxy for DORA: Mean Time to Recover)

**What:** Median days from a finding's first appearance to "RESOLVED" in a subsequent audit.

**Data source:** Audit docs. Findings are tagged `AUDIT-YYYY-MM-DD-PX-NN`. When resolved, the next audit says `AUDIT-YYYY-MM-DD-PX-NN → RESOLVED`. Parse the date from the finding ID and the resolution audit's date.

**Formula:**
```
ttr = resolution_audit_date - finding_first_date (in days)
report p50 and p90, segmented by severity
```

**Interpretation:** P1 MTTR should be ≤ 7 days (one sprint). P2 MTTR is informational — watch for P2s that never resolve (chronic debt). P0 MTTR should be ≤ 2 days.

---

### 3. Deployment frequency (DORA: Deployment Frequency)

**What:** PR merge rate to main/master, per week.

**Data source:** GitHub API.
```bash
gh pr list --state merged --base master --limit 200 \
  --json mergedAt --jq '[.[] | .mergedAt] | sort'
```

**Formula:** Count merges per 7-day window. Report as merges/week (trailing 4-week average).

**Interpretation:** In a healthy codebase this is a leading indicator. Rising frequency with stable or falling failure rate = good. Rising frequency with rising failure rate = DoD isn't keeping up.

---

### 4. Lead time for changes (DORA: Lead Time)

**What:** Median time from PR creation to merge, in hours.

**Data source:** GitHub API.
```bash
gh pr list --state merged --base master --limit 200 \
  --json createdAt,mergedAt \
  --jq '[.[] | {hours: ((.mergedAt | fromdateiso8601) - (.createdAt | fromdateiso8601)) / 3600}]'
```

**Formula:** p50 and p90 of hours from open to merge.

**Interpretation:** In the context of AI-assisted development, watch for bimodal distribution — fast AI-authored PRs and slow human-review PRs. Governance overhead shows up here if the DoD checklist is slowing reviews. If p90 is high, investigate whether checklist items are creating friction or whether the slowdown is unrelated.

---

## Implementation plan

### Phase 1: Script (implement first)

Create `scripts/governance-health.mjs`. It should:

1. **Parse audit docs** — read all `docs/audit-YYYY-MM-DD.md` files, extract headline counts (P0/P1/P2 new, resolved, carried) from the table in each, and build a time series
2. **Compute MTTR** — match finding IDs across audit docs to compute time-to-resolve for each P1 and P2
3. **Fetch GitHub metrics** — call `gh pr list` for deployment frequency and lead time
4. **Output `docs/governance-health.md`** — see Output Format below

Run it manually first: `node scripts/governance-health.mjs`

### Phase 2: Wire into audit workflow

Extend `.github/workflows/scheduled-audit.yml` to run `node scripts/governance-health.mjs` after the audit agent finishes and commit the updated `docs/governance-health.md` in the same automated commit.

### Phase 3: DoD integration

Once you have 3+ data points and the metrics feel calibrated, add a governance health section to `docs/definition-of-done.md`:

```
### Governance health (periodic, not per-PR)

- [ ] Governance failure rate trending flat or down over the last 3 audit cycles
- [ ] P1 MTTR ≤ 7 days (p50) over trailing 30 days
- [ ] No P2 finding older than 60 days without an explicit "won't fix" decision logged in the audit doc
```

This section is reviewed at the monthly retrospective, not at every PR.

---

## Output format — `docs/governance-health.md`

```markdown
# Governance Health

Last updated: YYYY-MM-DD (auto-generated by governance-health.mjs)

## Trend

| Audit date | P0 new | P1 new | P2 new | Failure score | Commits | Score/commit |
|---|---|---|---|---|---|---|
| 2026-05-20 | 0 | 2 | 7 | 11 | 17 | 0.65 |
| 2026-05-19 | 0 | 3 | 6 | 12 | 14 | 0.86 |
| ...         |   |   |   |    |    |      |

## Resolution time (P1s, trailing 30 days)

| Finding | First seen | Resolved | Days |
|---|---|---|---|
| AUDIT-2026-05-18-P1-02 | 2026-05-18 | 2026-05-20 | 2 |
| ...                    |            |            |   |

p50 MTTR: X days | p90 MTTR: Y days

## Deployment frequency (trailing 4 weeks)

Merges/week: W1=N, W2=N, W3=N, W4=N | 4-week avg: N

## Lead time (trailing 4 weeks)

p50: Xh | p90: Yh

## Signal

<!-- governance-health.mjs writes a one-line interpretation here -->
Failure rate: [trending down ✓ | flat | trending up ⚠]
P1 MTTR: [healthy ✓ | watch | over target ⚠]
```

---

## Sync-back signal

**Done (2026-06-10).** `templates/governance-health.md` proposed from the live structure after 8 audit cycles, and the "Governance health" gate landed in `templates/definition-of-done.md` (commented out until calibrated — 6+ data points).

---

## What not to do

- Don't track individual developer velocity or use these metrics for performance reviews. These measure the governance system, not people.
- Don't expose raw numbers to clients. If you reference them in a case study, report the trend ("failure rate fell 40% over 6 weeks"), not the absolute scores.
- Don't set targets before you have 3 data points. Calibrate first.
