# Two-Phase Audit Lifecycle — ai-fleet

**Client:** Hopskip (internal)
**Source:** greg/repo-governance session 2026-07-23
**Scope:** Update DoD audit section, PR template, and add personas doc to reflect the two-session, one-PR audit lifecycle.

## Context

The audit process has been formalized into a two-phase, single-PR lifecycle:

1. **Phase 1 — Audit session (read-only):** Scan, write audit doc, commit to `audit/YYYY-MM-DD` branch, open PR, stop.
2. **Human review:** Repo owner reviews findings, agrees on dispositions.
3. **Phase 2 — Remediation session (same PR, separate session):** Check out audit branch, apply dispositions (fix P0s, file issues for P1s, WONT-FIX P2s), update audit doc inline with dispositions, push to same PR.
4. **Human merge:** Repo owner merges. Audit doc + fixes land together.

Personas are now defined (repo owner, reviewer, auditor, remediator) so templates don't name a specific person. Most small teams collapse all into the founder/owner — that's the feature, not the bug.

The ai-fleet audit skill (`~/.claude/skills/audit-ai-fleet/SKILL.md`) has already been updated with this flow. This prompt updates the repo files.

## What to do

### 1. Copy `docs/personas.md`

```bash
cp ~/repos/greg/repo-governance/docs/personas.md docs/personas.md
git add docs/personas.md
```

### 2. Update the DoD audit section

In `docs/definition-of-done.md`, find the `## Audit` section. Make these changes:

**a) Replace the first paragraph** (the one starting "A staleness audit runs weekdays via the **`audit-fleet` cron state machine**...") — keep the repo-specific intro about the state machine, domains, and migrations, but replace the disposition language at the end. Change:

> P0 findings are fixed that week. P1 findings go into the next audit cycle. P2 findings are tracked and reviewed at the next audit.

To:

> **The audit PR has a two-phase, single-PR lifecycle:**
>
> 1. **Phase 1 — Audit session (read-only):** The auditor scans all domains, writes the audit doc, commits it to branch `audit/YYYY-MM-DD`, opens the PR, and **stops**. No code changes, no issue writes, no fixes. The audit session's only output is the doc and the PR.
> 2. **Human review:** The reviewer reads the findings and agrees on what to triage, what to file, what to WONT-FIX.
> 3. **Phase 2 — Remediation session (same PR, separate session):** The remediator checks out the audit branch, applies dispositions to every finding, updates the audit doc inline, and pushes to the same PR.
> 4. **Human merge:** The reviewer or repo owner merges the PR. The merged PR contains both the audit doc (with dispositions) and the fixes.
>
> See `docs/personas.md` for the role definitions. When one person holds all personas (the common case in small repos), the separation is temporal — two sessions, not two people.

**b) Replace the close-out paragraph** (the one starting "**Audit close-out is a required gate, not optional cleanup.**") with:

> **Audit close-out is a remediation-session gate, not an audit-session task.** The audit session is complete when the doc is committed and the PR is open. The remediation session is complete when: every finding has a disposition written inline in the audit doc (RESOLVED, FILED #N, or WONT-FIX), the stale issue sweep has been run, and CI is green on the audit PR branch.

### 3. Add the "Audit remediation" work type to the DoD

Insert this section **before** the `## The single underlying rule` section (or before the `## Audit` section if the single underlying rule comes after Audit — match the template ordering in `~/repos/greg/repo-governance/templates/definition-of-done.md`):

```markdown
### Audit remediation

- [ ] Checked out the audit branch (`audit/YYYY-MM-DD`), not master
- [ ] Every P0 finding from the audit doc is fixed in this PR
- [ ] Every P1 finding has a filed tracking issue (`#N`) cited inline in the audit doc, or is fixed in this PR if trivial
- [ ] Every P2 finding has a WONT-FIX rationale written inline in the audit doc, or is fixed
- [ ] Carried P2s hitting the three-audit aging rule are either filed as issues or WONT-FIXed with rationale
- [ ] Audit doc updated inline — each finding has a `**Disposition:**` line (RESOLVED / FILED #N / WONT-FIX)
- [ ] Stale issue sweep run — open issues whose fixes are in merged PRs are closed with a comment citing the PR
- [ ] CI passes on the audit branch
- [ ] All changes (audit doc + fixes) are on the same branch — single PR, not a separate remediation PR
```

### 4. Update the PR template

In `.github/pull_request_template.md`:

**a) Add "Audit remediation" to the Type checklist** (before "Chore / housekeeping"):

```markdown
- [ ] Audit remediation
```

**b) Add the audit remediation checklist section** (after the Documentation section, before the Issue close section):

```markdown
### Audit remediation
- [ ] Checked out the audit branch (`audit/YYYY-MM-DD`), not master
- [ ] Every P0 finding from the audit doc is fixed in this PR
- [ ] Every P1 finding has a filed tracking issue cited inline in the audit doc, or is fixed in this PR
- [ ] Every P2 finding has a WONT-FIX rationale inline in the audit doc, or is fixed
- [ ] Audit doc updated — each finding has a `**Disposition:**` line (RESOLVED / FILED #N / WONT-FIX)
- [ ] Stale issue sweep run — open issues fixed by merged PRs are closed
- [ ] All changes are on the same branch as the audit doc (single PR)
```

### 5. Check the state machine PR body (optional but recommended)

The `audit-fleet` state machine creates the audit PR automatically. Its PR body text may still say the old "Review P0/P1 findings first" phrasing. Check whether the state machine's goal text or PR creation logic needs updating to reflect the two-phase flow. If the PR body is defined in a migration or config file, update it to:

> Scheduled staleness audit — Phase 1 (read-only scan). Review the findings below, then run the remediation session on this same branch. See `docs/definition-of-done.md` → Audit remediation for the checklist.

If the PR body is generated dynamically by the fleet worker, that code may need a small update too. Use judgment on whether this is a code change or a migration.

## Verifiable outcomes

- `test -f docs/personas.md` — personas doc exists
- `grep -q 'two-phase, single-PR lifecycle' docs/definition-of-done.md` — DoD has the new lifecycle text
- `grep -q 'remediation-session gate' docs/definition-of-done.md` — close-out reframed
- `grep -q '### Audit remediation' docs/definition-of-done.md` — new work type exists
- `grep -q 'Audit remediation' .github/pull_request_template.md` — PR template has the new type
- `grep -q 'audit branch' .github/pull_request_template.md` — PR template has the checklist section
