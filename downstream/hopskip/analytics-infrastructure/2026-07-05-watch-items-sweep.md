# Watch-List Sweep — analytics-infrastructure

**Client:** Hopskip (internal)
**Source:** ai-fleet migration 0291 / greg/repo-governance session 2026-07-05
**Scope:** Add watch-item tracking with `## Future items` section in audit reports.

## Context

ai-fleet merged a pattern where the audit sweep scans a directory of markdown files for unchecked watch-list lines and renders them under a `## Future items` section. Watch items whose revisit condition has arrived escalate to P2 findings. This keeps deferred decisions visible without cluttering the issue backlog.

The mechanism is format-based (`- [ ] **Watch list:** revisit in [N] when [condition]`), not topic-locked — it tracks anything worth revisiting: competitive intel, vendor deprecations, architectural alternatives, customer signals, regulatory timelines. Each repo decides what goes in its watch directory.

analytics-infrastructure uses the `audit-data-platform` state machine in ai-fleet for its audits — the sweep wiring needs to reach that machine's goal text.

## What to do

### 1. Create the watch-items directory

```bash
mkdir -p docs/watch-items
cat > docs/watch-items/README.md << 'EOF'
# Watch Items

Items worth revisiting live here — from any source: competitive analysis,
vendor evaluations, deprecation timelines, architectural decisions that
need a future re-check, customer feedback that might become a feature,
regulatory changes on the horizon, or anything else that shouldn't be
forgotten but isn't actionable today.

The audit sweep scans these files for unchecked watch-list lines and
surfaces them under a ## Future items section in the audit report, so
they stay visible until the revisit condition arrives or you decide
they're resolved.

## Watch-list convention

Every doc ends with a Proposed next steps section. Watch-list items
use this format — the audit sweep reads these lines:

- [ ] **Watch list:** revisit in [N months] when [condition]

Every watch-list line must include a specific revisit condition or date.
A line without a condition is not actionable. A checked-off line
(`- [x] **Watch list:**`) is resolved and never reported.

### Examples

- `- [ ] **Watch list:** revisit in 6 months when Apache Spark 4.0 hits GA`
- `- [ ] **Watch list:** revisit when Snowpark runtime supports Python 3.12`
- `- [ ] **Watch list:** revisit in 3 months — competing product pricing
  announced at conference, re-evaluate response`
- `- [ ] **Watch list:** revisit when AWS Lambda support for Python 3.13
  is announced (tracking issue #NNN)`
- `- [ ] **Watch list:** revisit next quarter — customer X's contract
  renews, their feedback on Y may be a product opportunity`
EOF

git add docs/watch-items/
git commit -m "docs: create watch-items directory with watch-list convention

Sets up the watch-items directory and watch-list format. The audit
sweep will scan these files for unchecked watch-list lines and render
them under a ## Future items section in audit reports."
```

### 2. Update `docs/definition-of-done.md`

Find the dead-man probe paragraph in the Audit section and add this paragraph after it:

```markdown
**Future items section.** The audit report includes a `## Future items` section from the watch-list sweep. It lists unchecked watch-list items from `docs/watch-items/*.md` with their source, date, and revisit condition. This section is informational — items whose revisit condition has arrived are escalated to P2 findings, but watch items with future conditions are tracked here without filing backlog issues.
```

Also update the Audit doc structure in `docs/audits/README.md` — add "watch-list sweep" as a fifth domain alongside the existing four (ADR coherence, docs vs reality, SQL schema + workflows discipline, GitHub backlog).

### 3. Wire the watch-list sweep into the audit machine

The `audit-data-platform` machine's goal text needs the watch-list sweep domain added — same pattern as ai-fleet migration 0291 for the `audit-fleet` machine.

**Option A (recommended):** File an issue in ai-fleet to apply migration 0291's pattern to `audit-data-platform`. Reference the existing migration as the template:

> ai-fleet migration `0291_audit_fleet_watch_sweep.sql` patches the `audit-fleet` machine's goal text. analytics-infrastructure's `audit-data-platform` machine needs the same patch. Copy the watch-list sweep domain block from 0291, replace `docs/competitive-intel/` with `docs/watch-items/` and `audit-fleet` references with `audit-data-platform`, then apply as a new migration.

**Option B (interim):** Before each audit run, manually prepend the watch-list sweep as a pre-step in the audit prompt. Add a row to the audit doc's `## Future items` section yourself. This works until the machine migration lands.

### 4. Update PR template

If you have a `.github/PULL_REQUEST_TEMPLATE.md` or `.github/pull_request_template.md` that references a Documentation checklist, add:

```markdown
- [ ] If adding a doc to `docs/watch-items/`: every **Watch list** line includes a specific revisit condition or date, not just "revisit later"
```

## Verifiable outcomes

- `test -d docs/watch-items/` — directory exists
- `test -f docs/watch-items/README.md` — README with watch-list convention exists
- `grep -q 'Future items section' docs/definition-of-done.md` — DoD updated
- `grep -q 'watch-list sweep' docs/audits/README.md` — audit README updated to five domains
- ai-fleet issue filed for `audit-data-platform` machine goal-text patch (Option A), or a manual process documented (Option B)
