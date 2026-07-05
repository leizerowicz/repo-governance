# Competitive Intelligence Watch-List

**Status:** Policy — enforced by periodic audit sweep
**Last updated:** [DATE]

## Purpose

Competitive analysis produces decisions. But not every decision requires immediate action. **Watch items** are competitor or adjacent-product findings that are worth tracking but not worth filing as backlog issues — their revisit condition hasn't arrived yet.

This template defines:
- Where competitive intel docs live
- The watch-list format with required revisit conditions
- How the periodic audit sweeps watch items and renders them as Future items
- When a watch item escalates to a P2 finding

Without this structure, competitive intel either clogs the issue backlog with "someday" items or gets lost entirely — the analysis is done, the doc is written, and the watch items are never re-evaluated.

---

## Directory convention

Competitive analysis docs live in `docs/competitive-intel/`:

```
docs/competitive-intel/
  YYYY-MM-DD-<product-slug>.md    ← one per analysis
```

Each file is the output of a competitive analysis session (via a command template or manual research).

---

## Watch-list format

Every competitive intel doc ends with a **Proposed next steps** section. Watch-list items use this format:

```markdown
- [ ] **Watch list:** revisit in [N months] when [condition]
```

**Every watch-list line must include a specific revisit condition or date.** The audit sweep reads these lines to determine whether the item is still on hold or has come due.

Examples:
```markdown
- [ ] **Watch list:** revisit in 3 months when LangGraph reaches GA
- [ ] **Watch list:** revisit in 6 months (2027-01-05)
- [ ] **Watch list:** revisit when we have >100 fleet agents (condition: agent_count > 100)
```

A watch-list line without a condition or date is not actionable — the audit sweep cannot determine if it's due.

A checked-off watch-list line (`- [x] **Watch list:**`) is resolved — the audit never reports it.

---

## Audit sweep behavior

The periodic staleness audit includes a **watch-list sweep** domain that:

1. Scans `docs/competitive-intel/*.md` for unchecked watch-list lines (grep pattern: `- [ ] **Watch list`)
2. Lists each hit under a `## Future items` section in the audit report, including:
   - The item text
   - Source doc path and date
   - Stated revisit condition
3. Does NOT file issues for items whose revisit condition has not arrived

The `## Future items` section is informational — it keeps watch items visible without cluttering the backlog.

---

## Escalation rule

If a watch item's revisit condition **has arrived** (date passed, named external event occurred), the audit raises it as a P2 finding:

> **watch item due — re-evaluate or check it off in the source doc**

Normal P2 carry rules apply: a P2 finding that carries across three consecutive audits without action must be either filed as a tracked issue (assigned, labeled, removed from the audit) or closed as WONT-FIX with explicit written rationale.

---

## Getting started

1. Create `docs/competitive-intel/` in your repo
2. Add your first competitive analysis doc following the format above
3. Wire the watch-list sweep into your audit mechanism (see `templates/workflows/scheduled-audit.yml` — add the sweep as a step or append it to the audit prompt)
4. Update `docs/definition-of-done.md` — add the Future items section (see `templates/definition-of-done.md` Audit section)
