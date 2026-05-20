## What this PR does

<!-- One sentence. -->

## Closes

<!-- If this fixes a GitHub issue, write "Fixes #N" here — GitHub closes it automatically on merge. Delete if not applicable. -->

## Type

<!-- Check the one that applies. Multiple types = multiple PRs (usually). -->

- [ ] ADR
- [ ] Feature
- [ ] Bug fix
- [ ] Migration
- [ ] Documentation
- [ ] Chore / housekeeping

---

## Checklist

**Read [`docs/definition-of-done.md`](../docs/definition-of-done.md) for the full rules. Check every box that applies to your type.**

### All PRs
- [ ] CI passes locally
- [ ] `CLAUDE.md` updated if it describes something this PR changes
- [ ] No doc section contradicts another in this PR or in linked docs

### ADR
- [ ] Every lint this ADR promises is wired into CI and passes
- [ ] Existing violations are fixed or explicitly grandfathered with a named tracking issue
- [ ] Status is **Proposed** in the file; moves to **Accepted** only after the above (reviewer confirms)

### Feature
- [ ] Integration test exists if the path touches a data store
- [ ] Any new "Known Gaps" entry has a severity label and a tracking issue number
- [ ] If this closes a tracked issue: `Fixes #N` is in the **Closes** section above

### Bug fix
- [ ] Regression test at the same level the bug manifested (unit or integration)
- [ ] Root cause in commit message — what assumption was wrong, not just what changed
- [ ] If bug exposed a missing lint: lint ships here OR a P0 issue is filed and linked
- [ ] `Fixes #N` is in the **Closes** section above

### Migration
- [ ] Post-migration integrity check if the SQL is data-manipulating
- [ ] If a new schema pattern is introduced: consuming code path has an integration test, or a P0 issue is filed

### Documentation
- [ ] Every file path, function name, command, and issue number cited verified to exist
- [ ] No contradictions with other sections in the same doc or linked docs
- [ ] Planned features marked `(planned)`, not present-tense

### Issue close (if this PR closes one)
- [ ] `Fixes #N` or `Closes #N` is in the **Closes** section above — GitHub closes the issue automatically on merge
- [ ] All deliverables in the issue are done, or remaining items are filed with severity and linked in a comment
