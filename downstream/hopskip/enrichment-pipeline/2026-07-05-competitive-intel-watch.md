# Competitive Intel Watch-List — enrichment-pipeline

**Client:** Hopskip (internal)
**Source:** ai-fleet migration 0291 / greg/repo-governance session 2026-07-05
**Scope:** Add competitive-intel watch-list tracking with Future items section in audit reports.

## Context

ai-fleet merged a new pattern today: the audit sweep scans `docs/competitive-intel/*.md` for unchecked watch-list lines and renders them under a `## Future items` section. Watch items whose revisit condition has arrived escalate to P2 findings. This keeps competitive intel visible without cluttering the issue backlog.

enrichment-pipeline uses the `audit-enrichment-pipeline` state machine in ai-fleet for its audits — the sweep wiring needs to reach that machine's goal text.

## What to do

### 1. Create the competitive-intel directory

```bash
mkdir -p docs/competitive-intel
cat > docs/competitive-intel/README.md << 'EOF'
# Competitive Intelligence

Competitive analysis docs live here. Each file is the output of an analysis session.

## Watch-list convention

Every competitive intel doc ends with a Proposed next steps section. Watch-list items
use this format — the audit sweep reads these lines:

- [ ] **Watch list:** revisit in [N months] when [condition]

Every watch-list line must include a specific revisit condition or date. A line without
a condition is not actionable. A checked-off line (`- [x] **Watch list:**`) is resolved
and never reported.
EOF

git add docs/competitive-intel/
git commit -m "docs: create competitive-intel directory with watch-list convention

Sets up the competitive-intel directory and watch-list format. The audit
sweep will scan these files for unchecked watch-list lines and render them
under a ## Future items section in audit reports."
```

### 2. Update `docs/definition-of-done.md`

Find the dead-man probe paragraph in the Audit section and add this paragraph after it:

```markdown
**Future items section.** The audit report includes a `## Future items` section from the competitive-intel watch-list sweep. It lists unchecked watch-list items from `docs/competitive-intel/*.md` with their source, date, and revisit condition. This section is informational — items whose revisit condition has arrived are escalated to P2 findings, but watch items with future conditions are tracked here without filing backlog issues.
```

Also update the Audit doc structure in `docs/audits/README.md` — add "competitive intel watch-list sweep" as a fifth domain alongside the existing four (ADR coherence, docs vs reality, code + migrations, GitHub backlog).

### 3. Wire the watch-list sweep into the audit machine

The `audit-enrichment-pipeline` machine's goal text needs the watch-list sweep domain added — same pattern as ai-fleet migration 0291 for the `audit-fleet` machine.

**Option A (recommended):** File an issue in ai-fleet to apply migration 0291's pattern to `audit-enrichment-pipeline`. Reference the existing migration as the template:

> ai-fleet migration `0291_audit_fleet_watch_sweep.sql` patches the `audit-fleet` machine's goal text. enrichment-pipeline's `audit-enrichment-pipeline` machine needs the same patch. Copy the watch-list sweep domain block from 0291, replace `audit-fleet` references with `audit-enrichment-pipeline`, and apply as a new migration.

**Option B (interim):** Before each audit run, manually prepend the watch-list sweep as a pre-step in the audit prompt. Add a row to the audit doc's `## Future items` section yourself. This works until the machine migration lands.

### 4. Update PR template

If you have a `.github/PULL_REQUEST_TEMPLATE.md` or `.github/pull_request_template.md` that references a Documentation checklist, add:

```markdown
- [ ] If adding a competitive intel doc (`docs/competitive-intel/`): every **Watch list** line includes a specific revisit condition or date, not just "revisit later"
```

## Verifiable outcomes

- `test -d docs/competitive-intel/` — directory exists
- `test -f docs/competitive-intel/README.md` — README with watch-list convention exists
- `grep -q 'Future items section' docs/definition-of-done.md` — DoD updated
- `grep -q 'competitive intel watch-list sweep' docs/audits/README.md` — audit README updated to five domains
- ai-fleet issue filed for `audit-enrichment-pipeline` machine goal-text patch (Option A), or a manual process documented (Option B)
