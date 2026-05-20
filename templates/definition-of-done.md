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

> **Why this rule exists:** [Fill in with a real incident — an ADR that moved to Accepted without its promised lint, and what broke as a result.]

### ADR retirement (completing the work an ADR governs)

- [ ] ADR status updated to **Superseded** or **Closed** in the same PR that completes the work
- [ ] Consequences and Decision sections rewritten in past tense; forward-looking language ("will," "should," "pending") removed
- [ ] Any inline inventory tables or checklists within the ADR marked complete or removed
- [ ] Stale references to deleted types, interfaces, or commands found with `grep` and updated before merging

> **Why this rule exists:** [Fill in — an ADR completed by a PR that didn't update the ADR text, creating a P1 audit finding in the next cycle.]

---

### Feature

- [ ] Unit tests cover the new code
- [ ] Integration test if the path touches a data store — must use the same wiring the runtime uses, not a standalone test double
- [ ] Affected docs updated and internally consistent — no section contradicts another
- [ ] Any new "Known Gaps" entry has a severity label and a tracking issue number; "Known Gap" without a tracking issue is not acceptable
- [ ] If the feature introduces a new pattern that could be violated: a lint ships in the same PR
- [ ] If this closes a tracked issue: `Fixes #N` is in the PR description — GitHub closes the issue automatically on merge

> **Why this rule exists:** [Fill in — a feature that shipped without an integration test and broke in a way the unit tests couldn't catch.]

---

### Bug fix

- [ ] Fix is in place
- [ ] **Regression test** at the same level the bug manifested (unit if caught by mocks, integration if it required a real data store)
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

> **Why this rule exists:** [Fill in — a data-manipulation migration that passed CI against an empty database but failed in production where rows had unexpected values.]

---

### Documentation

- [ ] Every file path, function name, command, and issue number cited actually exists and is correct — verify with `grep` or `gh issue view`, not memory
- [ ] No section contradicts another section in the same doc or in docs linked from it
- [ ] Any feature described as current tense actually exists; planned features are marked `(planned)`
- [ ] If the doc describes a system that `CLAUDE.md` also describes: `CLAUDE.md` is updated in the same PR
- [ ] **When fixing a specific cited issue in a doc:** grep the full file for related stale content before declaring it fixed — don't stop at the originally-cited lines

> **Why this rule exists:** [Fill in — a doc fix that addressed the cited line but left a contradictory example three paragraphs down in the same file.]

---

### Issue / Epic

- [ ] All deliverables in the issue description are done — or each remaining item is explicitly filed as a separate issue with severity and linked in a comment before closing
- [ ] If the issue promised a lint or test that wasn't part of the primary work: either done in the same PR or filed as a P0/P1 before close
- [ ] "Cleanup" issues are not closed until the cleanup is actually complete — not 70% complete

> **Why this rule exists:** [Fill in — an issue closed when the primary migration shipped, while Bicep files, docs, and dependent issues still referenced the retired pattern.]

---

## The single underlying rule

**Enforcement ships with the promise, not after it.**

If an ADR says "we will lint X" — the lint is in the PR that accepts the ADR.  
If a feature description says "integration tests TBD" — that is not done.  
If an issue is closed with "follow-up lints filed separately" — those issues must exist and be linked before close.

Deferred enforcement is not enforcement. It is optimism.

---

## Audit

A staleness audit runs periodically via `.github/workflows/scheduled-audit.yml` and produces `docs/audit-YYYY-MM-DD.md`. Each audit finding is a place where a DoD gate was not enforced. P0 findings are fixed immediately. P1 findings go into the next sprint. P2 findings are tracked and reviewed at the next audit.

The audit is the periodic check that this document is working. If findings are consistently few, the DoD is being followed. If findings accumulate, a gate needs strengthening.
