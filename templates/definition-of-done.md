# Definition of Done

**Status:** Policy — enforced by PR template, lint scripts, and periodic audit
**Last updated:** [DATE]

Every piece of work has a type. A thing is done when the row for its type is fully satisfied — not before. "CI is green" is a necessary condition, not a sufficient one.

---

## By work type

### ADR

- [ ] Decision is written and clearly states what is decided, why, and what the consequences are
- [ ] Status is **Proposed** until every lint or check it promises is wired into CI
- [ ] Every lint it promises passes on the current codebase, or existing violations are explicitly grandfathered in the script with a named tracking issue
- [ ] Status moves to **Accepted** only after the above; reviewer confirms enforcement exists before approving
- [ ] If the ADR defines its own inline acceptance criteria (beyond the lint requirement), and a PR satisfies those criteria: flip Status to **Accepted** in that same PR
- [ ] If the ADR's Decision section names implementation prerequisites or sequencing constraints: each prerequisite cites a tracking issue number before the PR merges — prerequisites without tracking issues are invisible to the backlog

> **Why this rule exists:** [Fill in with your own incident. Example: "An ADR promised a lint and moved to Accepted without it. The violation it was meant to prevent shipped anyway and caused a production outage; a recheck audit found the same violation still live. Separately, an ADR documented four implementation prerequisites with no tracking issues — the work was invisible to the backlog until a human happened to re-read the ADR."]

### ADR retirement (completing the work an ADR governs)

- [ ] ADR status updated to **Superseded** or **Closed** in the same PR that completes the work
- [ ] Consequences and Decision sections rewritten in past tense; forward-looking language ("will," "should," "pending") removed
- [ ] Any inline inventory tables or checklists within the ADR marked complete or removed
- [ ] `grep -r '<deleted-interface-or-type>' <project docs and source directories>` run and all stale references updated before merging

> **Why this rule exists:** [Fill in with your own incident. Example: "A PR completed an ADR's retirement work but didn't touch the ADR file. The ADR's own Consequences block kept describing the retirement as pending, creating a P1 finding in the very next audit. The audit found what the DoD should have caught."]

---

<!-- Delete this section and the next if your repo has no docs/pdr/ -->
### Product decision (PDR)

- [ ] Decision states who is served, what bet is being made, or what is deliberately not being done — specifically enough to be wrong
- [ ] **Falsifier is present** and observable: a date, a named external event, or a checkable threshold, written as `- [ ] Revisit by YYYY-MM-DD when <condition>`
- [ ] `Confirmed by` names a person, not a role — a record nobody will sign is a record nobody believes
- [ ] Status is **Proposed** until the falsifier exists and the record is registered in `docs/pdr/README.md`; **Accepted** only after
- [ ] `lint:adr-readme-sync` passes — the record is indexed
- [ ] If this PDR states a non-goal: it has its own number, not a bullet inside another record

> **Why this rule exists:** [Fill in with your own incident. Example: "The team spent a full build window on a segment the founder had already privately decided against — the decision existed, but only in their head, so no PR review could cite it. Separately, a 'we serve enterprise' bet sat unexamined for eight months while every actual customer was a solo operator; nothing was wrong enough to notice, because nothing was written down to be wrong."]

### PDR supersession (changing the bet)

- [ ] New PDR written; it cites the record it replaces by number
- [ ] Superseded record's Status set to **Superseded by PDR-NNN** in the same PR
- [ ] Superseded record's Context left **intact** — what was believed and why it turned out wrong is the most valuable thing in the corpus
- [ ] Original Decision never edited in place — changing your mind is healthy, changing it silently is the drift
- [ ] Any work authorized only by the old bet is re-checked against the new one, or filed with a tracking issue

> **Why this rule exists:** [Fill in with your own incident. Example: "The ICP changed and the strategy doc was quietly rewritten to match. Six months later nobody could reconstruct what the original bet was or what evidence had killed it, so the same rejected idea came back twice and got re-litigated from scratch both times."]

---

### Feature

- [ ] Unit tests cover the new code
- [ ] Integration test if the path touches a data store — must use the same wiring the runtime uses, not a standalone test double, and must call the top-level entry point (not just an inner helper) so constraints and identifier resolution are exercised, not bypassed
- [ ] Affected docs updated and internally consistent — no section contradicts another
- [ ] Any new "Known Gaps" entry has a severity label and a tracking issue number; "Known Gap" without a tracking issue is not acceptable
- [ ] If the feature introduces a new pattern that could be violated: a lint ships in the same PR, wired into both the project's local check command and CI
- [ ] If a required field is added to a shared interface or contract: every doc and onboarding guide that shows example objects of that interface is updated in the same PR
- [ ] If this closes a tracked issue: `Fixes #N` is in the PR description — GitHub closes the issue automatically on merge
- [ ] <!-- delete if no docs/pdr/ --> `Serves: PDR-NNN` in the PR description names the bet this feature advances — **or** `Serves: none` with a one-line reason. Both are legitimate; saying nothing is not

> **Why this rule exists:** [Fill in with your own incident. Example: "A new dispatch path shipped with no integration test. A database constraint and a type cast both passed CI — the unit tests mocked the layer where both lived — and broke in production."]
>
> **Why `Serves:` allows "none":** an escape hatch cheaper than lying is what keeps the field honest. A mandatory field with no out gets filled with whatever passes review, and then the traceability is worse than useless because it looks real. The rate of `Serves: none` is the signal — a few is healthy, a majority means the PDR corpus doesn't describe what the team is actually building.

---

### Bug fix

- [ ] Fix is in place
- [ ] **Regression test** at the same level the bug manifested (unit if caught by mocks, integration if it required a real data store) — exercising the function that actually failed, not just a sub-component it delegates to
- [ ] Root cause documented in the commit message — what assumption was wrong, not just what changed
- [ ] If the bug exposed a missing lint: either the lint ships in the same PR, or a P0 issue is filed and linked
- [ ] `Fixes #N` is in the PR description — GitHub closes the tracking issue automatically on merge

> **Why this rule exists:** [Fill in — a bug that recurred because the fix had no regression test. The `Fixes #N` rule exists because PRs that fix issues without linking them leave those issues open indefinitely, caught only by the next audit.]

---

### Migration

- [ ] Naming convention passes CI lint (if one exists)
- [ ] Tested against a fresh data store in CI
- [ ] If data-manipulation SQL (UPDATE, DELETE, INSERT with type casts): a post-migration integrity check is included to guard against production data surprises — fresh-DB CI is not sufficient alone
- [ ] If the migration introduces a new schema pattern consumed by code: the consuming code path has an integration test in the same PR or a P0 issue filed
- [ ] If the migration adds an enforcement-bearing schema element (an access policy, a rate-limit or lifecycle column, a tenancy flag): the consuming code ships in the same PR, **or** the element is registered in a dormant-schema register with a tracking issue and an activation condition. Schema that promises a control nobody built is a defect, not a head start.

> **Why this rule exists:** [Fill in with your own incident. Example: "A data-manipulation migration passed CI against an empty database but failed in production where rows had unexpected values. Separately, a schema review found four enforcement mechanisms the schema promised and no code delivered — inert access policies, phantom rate limits, a dead lifecycle column — all silent for months because no control ever asked 'does anything consume this?'"]

---

<!-- Delete this section if your repo has no scheduled automation -->
### Scheduled automation / job definition change

- [ ] Every tool, command, file path, or resource the job's definition or prompt references actually exists and is active — a definition that instructs automation to call something deleted is a P1 the moment it deploys
- [ ] Schedule expressions are written in the timezone the scheduler parses them in, and any human-readable description of the schedule matches the trigger exactly — a UTC-shaped cron parsed in a local timezone fires at the wrong hour
- [ ] Scheduled jobs are idempotent per period — a re-trigger on the same period detects the existing artifact and no-ops, not duplicates
- [ ] If the job produces an artifact (doc, PR, message): the job verifies the artifact exists before reporting success

> **Why this rule exists:** [Fill in. Example patterns from source repo: "A scheduled job fired at the wrong hour for its entire life — the cron was written as if UTC but parsed in a local timezone, while its own description said otherwise. An automation prompt referenced seven deleted tools for weeks; no lint reads prompt prose, so the checklist row is the gate. A scheduled audit 'succeeded' without committing its only required artifact." None of these are lint-visible; all are checklist-preventable.]

---

### Documentation

- [ ] Every file path, function name, command, and issue number cited actually exists and is correct — verify with `grep` or `gh issue view`, not memory
- [ ] No section contradicts another section in the same doc or in docs linked from it
- [ ] Any feature described as current tense actually exists; planned features are marked `(planned)`
- [ ] If the doc describes a system that `CLAUDE.md` also describes: `CLAUDE.md` is updated in the same PR
- [ ] **When fixing a specific cited issue in a doc:** grep the full file for related stale content before declaring it fixed — don't stop at the originally-cited lines

> **Why this rule exists:** [Fill in with your own incident. Example: "A commit fixed the section an audit flagged but left a contradictory example three paragraphs up in the same file — same file, same problem, different lines. Separately, files touched by PRs between audits accounted for all of the next audit's new doc findings: the author didn't sweep for internal contradictions."]

---

### Issue / Epic

**Structure at creation** — an issue is well-formed only if, *when it is filed*, it has:

- [ ] **Verifiable outcomes** — at least one binary, observable checkbox outcome (not an open question; "decide whether X or Y" is a needs-decision gate, not an outcome)
- [ ] A **verification method** — the exact command, named test file, or query that proves each outcome
- [ ] A **work type** and whatever labels your taxonomy requires (priority at minimum)

**At closing:**

- [ ] All deliverables in the issue description are done — or each remaining item is explicitly filed as a separate issue with severity and linked in a comment before closing
- [ ] If the issue promised a lint or test that wasn't part of the primary work: either done in the same PR or filed as a P0/P1 before close
- [ ] "Cleanup" issues are not closed until the cleanup is actually complete — not 70% complete

> **Why this rule exists:** [Fill in with your own incident. Example: "An issue was closed when the primary migration shipped, while IaC files, docs, and dependent issues still referenced the retired pattern — a P1 in the next audit. On creation: a backlog sweep of ~50 open issues found most lacked verifiable outcomes — they captured intent but gave no one a way to self-verify completion, so the whole backlog had to be re-authored by hand."]

---

### Stale issue sweep (after every PR merge and after every audit)

Before declaring any session or audit "closed":

```bash
# Open issues whose fixes are in recently merged PRs but were never explicitly linked
gh pr list --state merged --limit 20 --json number,title,body \
  | jq -r '.[] | "#\(.number) \(.title)\n\(.body)"' | grep -iE "fixes|closes|resolves"

# Any open issue describing work that is visibly already complete
gh issue list --state open --limit 200 --json number,title | jq -r '.[] | "#\(.number) \(.title)"'
```

For each stale issue found: close it with a comment citing the PR and a one-line reason.

> **Why this rule exists:** [Fill in. Example pattern from source repo: "Issues stayed open for days after their fixing PRs merged because the author didn't write `Fixes #N`. The audit caught them — but only the *next* audit, so every audit accumulated a batch of already-done items that polluted severity counts and wasted triage time. The sweep takes 60 seconds at a session boundary."]

---

## The single underlying rule

**Enforcement ships with the promise, not after it.**

If an ADR says "we will lint X" — the lint is in the PR that accepts the ADR.  
If a feature description says "integration tests TBD" — that is not done.  
If an issue is closed with "follow-up lints filed separately" — those issues must exist and be linked before close.

Deferred enforcement is not enforcement. It is optimism.

---

## Audit

A staleness audit runs on a schedule — as a CI workflow (`.github/workflows/scheduled-audit.yml`) or via an in-platform scheduler — and produces `docs/audits/audit-YYYY-MM-DD.md`. Each audit finding is a place where a DoD gate was not enforced. P0 findings are fixed immediately. P1 findings go into the next sprint. P2 findings are tracked and reviewed at the next audit.

**The audit doc is the required artifact.** Fixing the findings without committing the audit doc breaks the carry-forward chain and any metrics derived from it. The audit is not complete until the doc is merged.

**Dead-man probe.** A separate workflow watches for audit artifacts and goes red — and files a P1 issue — if none has appeared within a few days. A dead audit produces *nothing*, and nothing turns red on its own; the probe is the watchdog's watchdog, deliberately outside the mechanism it watches. It must depend only on repo artifacts — never on production credentials or upstream services.

**Future items section.** The audit report includes a `## Future items` section from the watch-list sweep. It lists unchecked watch-list items from `docs/watch-items/*.md` and unchecked PDR falsifiers from `docs/pdr/*.md` with their source, date, and revisit condition — a product bet with a check condition is structurally a watch item. This section is informational — items whose revisit condition has arrived are escalated to P2 findings, but items with future conditions are tracked here without filing backlog issues. See `templates/watch-items.md` for the watch-list format and escalation rules.

<!-- Delete this paragraph if your repo has no docs/pdr/ -->
**PDR coherence is a probe, not a gate.** The audit's PDR domain checks that accepted bets carry observable falsifiers, that nobody has left a bet unconfirmed for a quarter, that features name what they serve, and that shipped work doesn't contradict a stated non-goal. These read intent from prose, so they will occasionally be wrong — which is exactly why they are audit findings and never merge gates. A judgment call belongs in a probe; only deterministic checks belong in gates.

**P2 aging rule:** A P2 finding that carries across three consecutive audits without a fix or explicit deferral is either filed as a tracked issue (assigned, labeled, removed from the audit) or closed as WONT-FIX with written rationale. P2s that accumulate silently are indistinguishable from P1s that have been quietly de-prioritized.

**Audit close-out is a required gate, not optional cleanup.** Before recording a clean audit: run the stale issue sweep above, merge any CI-green PRs that have been waiting, and verify every P0/P1/P2 has a fix, a tracking issue, or a WONT-FIX rationale.

The audit is the periodic check that this document is working. If findings are consistently few, the DoD is being followed. If findings accumulate, a gate needs strengthening.

<!-- see templates/governance-health.md. Uncomment the gate below once you have 6+ audit cycles of data and the metrics feel calibrated. -->
**Governance health metrics** are tracked in `docs/governance-health.md` — four DORA proxies derived entirely from artifacts already in the repo (governance failure rate, P1 MTTR, deployment frequency, lead time), regenerated as part of each audit. Review at a monthly retrospective — not per-PR.

<!-- Governance health gate (enable once calibrated, 6+ data points):

### Governance health (periodic — monthly retrospective, not per-PR)

- [ ] Governance failure rate trending flat or down over the last 3 audit cycles
- [ ] P1 MTTR ≤ 7 days (p50) over trailing 30 days
- [ ] No P2 finding older than 60 days without an explicit WONT-FIX decision logged in the audit doc
-->

> **Why the audit-mechanics rules exist:** [Fill in. Example pattern from source repo: "The scheduled audit died silently twice in three weeks — first as a CI job, then as its replacement. Twelve unaudited days accumulated a measured backlog of drift findings. The probe exists so a third death is loud within days, not weeks."]
