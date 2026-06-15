# Governance Maintenance — analytics-infrastructure — 2026-06-15

**Client:** Hopskip (internal)
**Source:** greg/repo-governance sync-review 2026-06-10 — accepted 36/36 proposals

This repo is an early-stage governance adopter (inaugural audit done, code-hygiene not yet wired). This prompt bootstraps the artifacts that are now part of the standard template set.

## What changed in the templates (this sync-review)

- `issue-authoring.md` is now a standard template — canonical issue schema, label taxonomy, layered enforcement model, anti-patterns.
- `audit-deadman.yml` is now a standard template — watches for audit artifacts and goes red if none appears within 4 days.
- `pull_request_template.md` gained gate/probe classification, ADR Consequences rules, enforcement-bearing schema rule, and Scheduled automation type + section.
- `definition-of-done.md` expanded significantly: stronger integration test and regression test wording, enforcement-bearing schema row in Migration, new Scheduled automation section, Stale issue sweep section, and all audit-mechanics rules promoted to body text.

## What to do in this repo

### 1. Add issue-authoring policy

Create `docs/issue-authoring.md`. Copy from `~/repos/greg/repo-governance/templates/issue-authoring.md`. Then adapt two things:
- Label taxonomy: replace `[your subsystem names]` and `[your roadmap track names]` placeholders with this repo's actual label families (or remove the area/theme rows if the repo doesn't use them yet).
- Enforcement note: this repo is early-stage — start with Layer 3 only (add the audit prompt instruction to flag issues missing verifiable outcomes). Add Layer 2 (CI validator) when creation volume justifies it.

Add a reference to it in `docs/definition-of-done.md` under the Issue/Epic section header:
```
See [issue-authoring.md](issue-authoring.md) for the full schema.
```

### 2. Add audit-deadman workflow

Copy `~/repos/greg/repo-governance/templates/workflows/audit-deadman.yml` to `.github/workflows/audit-deadman.yml`.

Adjust the cron trigger: `'30 15 * * 1-5'` fires weekdays at 15:30 UTC — set it to 30–60 minutes after this repo's scheduled audit window. If the audit is manual-only right now, set `MAX_AGE_DAYS: 14` (two weeks) until a scheduled cadence is established, then drop it back to 4.

Verify the workflow uses `--search 'staleness audit in:title'` to find audit PRs — confirm that matches the actual PR title pattern this repo uses.

### 3. Update pull request template

Open `.github/pull_request_template.md` (or create it if absent — copy from `~/repos/greg/repo-governance/templates/pull_request_template.md` and adapt).

Add to the **All PRs** checklist:
```
- [ ] If a CI workflow was added or modified: it is correctly a **gate** (deterministic, blocks merge) or a **probe** (monitors reality, never blocks) — steps sensitive to transient upstream failures belong in probes, not merge gates
```

Add to the **ADR** checklist (if ADRs exist in this repo):
```
- [ ] If completing work described in an existing ADR's Consequences: that bullet rewritten in past tense in this PR
- [ ] Any Consequences bullet with forward-looking language ("will be," "future," "pending") has a tracking issue or an explicit WONT-FIX: <rationale>
```

Add to the **Migration** checklist:
```
- [ ] If an enforcement-bearing schema element is added (access policy, rate-limit/lifecycle column, tenancy flag): consuming code ships here, or the element is registered as dormant with a tracking issue
```

Add the **Scheduled automation / job definition change** type checkbox and section (copy from `~/repos/greg/repo-governance/templates/pull_request_template.md`) if this repo has any scheduled CI or automation.

### 4. Update Definition of Done

Open `docs/definition-of-done.md`. Apply the following:

**Feature section** — replace the integration test row with the more specific wording:
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
- [ ] If the migration adds an enforcement-bearing schema element (an access policy, a rate-limit or lifecycle column, a tenancy flag): the consuming code ships in the same PR, or the element is registered in a dormant-schema register with a tracking issue and an activation condition. Schema that promises a control nobody built is a defect, not a head start.
```

**After Issue/Epic section** — add Stale issue sweep section (copy from `~/repos/greg/repo-governance/templates/definition-of-done.md`).

**Audit section** — add if not present:
```
**The audit doc is the required artifact.** Fixing the findings without committing the audit doc breaks the carry-forward chain and any metrics derived from it. The audit is not complete until the doc is merged.

**P2 aging rule:** A P2 finding that carries across three consecutive audits without a fix or explicit deferral is either filed as a tracked issue or closed as WONT-FIX with written rationale.

**Audit close-out is a required gate, not optional cleanup.** Before recording a clean audit: run the stale issue sweep, merge CI-green PRs, and verify every P0/P1/P2 has a fix, a tracking issue, or a WONT-FIX rationale.
```

### 5. Governance health — defer

This repo has fewer than 6 audit cycles. Do not add `docs/governance-health.md` yet — set a reminder to revisit after audit cycle 6.

## Already present — skip

- `docs/audits/` directory and audit docs
- Scheduled audit workflow (if present)
- Basic DoD structure

## Not applicable — skip

- Scheduled automation DoD section — skip unless this repo has cron jobs or scheduled CI
