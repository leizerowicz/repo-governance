# CLAUDE.md additions

Two additions to make Claude Code sessions aware of the DoD and audit practice.

---

## Addition 1 — Before Declaring Any Work Done

Add this wherever your `CLAUDE.md` describes session behavior:

```markdown
## Before Declaring Any Work Done

Check `docs/definition-of-done.md` — find the row for your work type and satisfy every item.
CI passing is necessary, not sufficient.
```

This is the most important addition. Without it, Claude will declare a bug fix "done" when the fix is in place, without checking for a regression test or a `Fixes #N` in the description.

---

## Addition 2 — Key Files table

If your `CLAUDE.md` has a "Key Files" or "Read Before You Work" table, add:

```markdown
| `docs/definition-of-done.md` | Per-work-type done checklist — check before every merge |
```

---

## Optional: audit close-out instruction

If you want Claude to follow the full close-out protocol when an audit round is complete:

```markdown
## Audit Close-Out Protocol

Before declaring an audit "fully closed" and writing "0 open P1s" in state:

1. All P0/P1/P2 findings have a fix, disposition, or tracking issue
2. Open GitHub issues whose fixes are in merged PRs are closed:
   ```bash
   gh issue list --state open --limit 200 --json number,title | jq -r '.[] | "#\(.number) \(.title)"'
   # Cross-reference against recent merged PRs — close any that are already fixed
   gh issue close N --comment "Fixed in PR #M — <description>."
   ```
3. CI-green PRs that have been waiting are merged

The third bar is the one that gets missed most often.
```

---

## Minimal CLAUDE.md (if you don't have one yet)

```markdown
# [Repo Name]

[One paragraph describing what this repo is and its core architecture principle.]

## Before Declaring Any Work Done

Check `docs/definition-of-done.md` — find the row for your work type and satisfy every item.
CI passing is necessary, not sufficient.

## Key Files

| File | Purpose |
|------|---------|
| `docs/definition-of-done.md` | Per-work-type done checklist — check before every merge |
| `docs/adr/` | Architecture Decision Records — read the relevant ADR before touching that system |

## Development

[Your build/test commands here.]
```
