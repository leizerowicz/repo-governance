# Governance Maintenance — enrichment-pipeline — 2026-06-15

**Client:** Hopskip (internal)
**Source:** greg/repo-governance sync-review 2026-06-10 — accepted 36/36 proposals

This repo is an early-mid governance adopter (first audit cycle done, code-hygiene / slop-detection most complete here — the reference implementation for that artifact class). The items below build on what's already in place.

## What changed in the templates (this sync-review)

- `issue-authoring.md` is now a standard template — canonical issue schema, label taxonomy, layered enforcement model, anti-patterns.
- `audit-deadman.yml` is now a standard template — watches for audit artifacts and goes red if none appears within 4 days.
- `pull_request_template.md` gained gate/probe classification, ADR Consequences rules, enforcement-bearing schema rule, and Scheduled automation type + section.
- `definition-of-done.md` expanded: stronger integration test and regression test wording, enforcement-bearing schema row in Migration, new Scheduled automation section, Stale issue sweep section, all audit-mechanics rules promoted to body text.

## What to do in this repo

### 1. Add issue-authoring policy

Create `docs/issue-authoring.md`. Copy from `~/repos/greg/repo-governance/templates/issue-authoring.md`. Adapt:
- Label taxonomy: replace `[your subsystem names]` and `[your roadmap track names]` placeholders with this repo's actual labels, or remove area/theme rows if not used.
- Enforcement: this repo already has an audit (Layer 3). If a CI validator on `issues: [opened, edited]` doesn't exist yet, add it as Layer 2 now — this repo's creation volume likely justifies it. Layer 1 (creation tool validation) applies if agents are filing issues programmatically.

Add a reference to it in `docs/definition-of-done.md` under the Issue/Epic section header:
```
See [issue-authoring.md](issue-authoring.md) for the full schema.
```

### 2. Add audit-deadman workflow

Copy `~/repos/greg/repo-governance/templates/workflows/audit-deadman.yml` to `.github/workflows/audit-deadman.yml`.

Set the cron trigger to 30–60 minutes after this repo's scheduled audit window. `MAX_AGE_DAYS: 4` is the right default (tolerates a weekend). Verify `--search 'staleness audit in:title'` matches this repo's audit PR title convention.

### 3. Update pull request template

Open `.github/pull_request_template.md`.

Add to **All PRs** checklist:
```
- [ ] If a CI workflow was added or modified: it is correctly a **gate** (deterministic, blocks merge) or a **probe** (monitors reality, never blocks) — steps sensitive to transient upstream failures belong in probes, not merge gates
```

This repo has code-hygiene / slop-detection as a gate — confirm that classification is correct (it should be deterministic and block on quality gates, not on transient upstream failures). If it ever has false positives due to upstream flakiness, move the flaky step to a probe.

Add to the **Migration** checklist:
```
- [ ] If an enforcement-bearing schema element is added (access policy, rate-limit/lifecycle column, tenancy flag): consuming code ships here, or the element is registered as dormant with a tracking issue
```

Add the **Scheduled automation / job definition change** type checkbox and section if this repo has scheduled CI or automation (copy from `~/repos/greg/repo-governance/templates/pull_request_template.md`).

### 4. Update Definition of Done

Open `docs/definition-of-done.md`. Apply:

**Feature section** — replace integration test row:
```
- [ ] Integration test if the path touches a data store — must use the same wiring the runtime uses, not a standalone test double, and must call the top-level entry point (not just an inner helper) so constraints and identifier resolution are exercised, not bypassed
```

**Feature section** — add if not present:
```
- [ ] If a required field is added to a shared interface or contract: every doc and onboarding guide that shows example objects of that interface is updated in the same PR
```

**Bug fix section** — make regression test row more specific:
```
- [ ] Regression test at the same level the bug manifested (unit if caught by mocks, integration if it required a real data store) — exercising the function that actually failed, not just a sub-component it delegates to
```

**Migration section** — add:
```
- [ ] If the migration adds an enforcement-bearing schema element (an access policy, a rate-limit or lifecycle column, a tenancy flag): the consuming code ships in the same PR, or the element is registered in a dormant-schema register with a tracking issue and an activation condition.
```

**After Issue/Epic section** — add Stale issue sweep section (copy from `~/repos/greg/repo-governance/templates/definition-of-done.md`).

**Audit section** — add if not present:
```
**The audit doc is the required artifact.** Fixing the findings without committing the audit doc breaks the carry-forward chain and any metrics derived from it.

**P2 aging rule:** A P2 finding that carries across three consecutive audits without a fix or explicit deferral is either filed as a tracked issue or closed as WONT-FIX with written rationale.

**Audit close-out is a required gate, not optional cleanup.** Before recording a clean audit: run the stale issue sweep, merge CI-green PRs, and verify every P0/P1/P2 has a fix, a tracking issue, or a WONT-FIX rationale.
```

### 5. Governance health — approaching threshold

This repo has completed its first audit cycle. Begin tracking the Trend table manually (or via script) now so that data exists by cycle 6. Copy the shape from `~/repos/greg/repo-governance/templates/governance-health.md` into `docs/governance-health.md` as a stub — populate each row after each audit. Enable the automated gate once 6+ data points exist and the metrics feel calibrated.

## Already present — skip

- `docs/audits/` and audit docs
- Code-hygiene / slop-detection gate and report (reference implementation — no changes needed here)
- Basic DoD structure

## Not applicable — skip

- ADR Consequences rules — skip if this repo has no ADRs yet; add when the first ADR lands
