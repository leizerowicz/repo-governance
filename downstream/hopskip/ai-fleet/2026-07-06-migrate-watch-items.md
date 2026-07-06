# Migrate to Generic Watch-Items — ai-fleet

**Client:** Hopskip (internal)
**Source:** greg/repo-governance session 2026-07-06
**Scope:** Migrate `docs/competitive-intel/` → `docs/watch-items/` and update the audit goal text to use the generic path and label.

## Context

ai-fleet originated the watch-list sweep pattern (migration 0291), but it was framed as a competitive-intel feature — the directory is `docs/competitive-intel/`, the goal text says `Watch-list sweep (competitive intel)`, and the DoD paragraph references competitive intel specifically.

The pattern is actually generic — it tracks anything worth revisiting (vendor deprecations, architectural alternatives, customer signals, regulatory changes, competitive moves). analytics-infrastructure and enrichment-pipeline now use `docs/watch-items/` with a topic-agnostic convention. ai-fleet should migrate to the same convention so all three repos are aligned.

The 8 existing competitive-intel docs are still valid watch items — they just happen to be competitive intel. They move as-is into the new directory.

## What to do

### 1. Rename the directory

```bash
git mv docs/competitive-intel docs/watch-items
```

### 2. Add the generic README

```bash
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
EOF

git add docs/watch-items/README.md
git commit -m "docs: rename competitive-intel to watch-items with generic convention

Renames docs/competitive-intel/ to docs/watch-items/ and adds a README
describing the generic watch-list convention. The 8 existing competitive-intel
docs move as-is — they are valid watch items that happen to be competitive
analysis."
```

### 3. Update `docs/definition-of-done.md`

Find the **Future items section** paragraph (it mentions "competitive-intel watch-list sweep") and update it:

```markdown
**Future items section.** The audit report includes a `## Future items` section from the watch-list sweep. It lists unchecked watch-list items from `docs/watch-items/*.md` with their source, date, and revisit condition. This section is informational — items whose revisit condition has arrived are escalated to P2 findings, but watch items with future conditions are tracked here without filing backlog issues.
```

### 4. Create migration 0292 to update the state machine goal text

Create `db/migrations/host/0292_watch_items_generic_path.sql`:

```sql
-- 0292_watch_items_generic_path.sql
--
-- Update the audit-fleet goal text to use the generic watch-items path
-- and label, replacing the competitive-intel-specific references.
--
-- Depends on: 0291 (watch-list sweep domain exists in goal text).
-- Uses the same jsonb_set + replace pattern.

DO $$
DECLARE
  v_workspace_id uuid;
  v_old_path    text;
  v_old_label   text;
  v_new_path    text;
  v_new_label   text;
  v_old_text    text;
  v_new_text    text;
BEGIN
  SELECT workspace_id INTO v_workspace_id
    FROM workspaces WHERE slug = 'hopskip-default' LIMIT 1;

  IF v_workspace_id IS NULL THEN
    RAISE NOTICE '0292: workspace hopskip-default not found — skipping';
    RETURN;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM state_machines
     WHERE workspace_id = v_workspace_id AND slug = 'audit-fleet'
  ) THEN
    RAISE NOTICE '0292: audit-fleet machine not found — skipping';
    RETURN;
  END IF;

  -- Replace path: docs/competitive-intel/ -> docs/watch-items/
  -- Replace label: (competitive intel) -> (watch-list sweep)
  UPDATE state_machines
     SET definition = jsonb_set(
           definition,
           '{initial_context,audit_fleet_goal}',
           to_jsonb(
             replace(
               replace(
                 definition->'initial_context'->>'audit_fleet_goal',
                 'docs/competitive-intel/',
                 'docs/watch-items/'
               ),
               'Watch-list sweep (competitive intel)',
               'Watch-list sweep'
             )
           )
         )
   WHERE workspace_id = v_workspace_id
     AND slug = 'audit-fleet';

  IF NOT (definition->'initial_context'->>'audit_fleet_goal' LIKE '%docs/watch-items/%')
    FROM state_machines WHERE workspace_id = v_workspace_id AND slug = 'audit-fleet'
  THEN
    RAISE EXCEPTION '0292: goal text path replacement did not land';
  END IF;

  IF NOT (definition->'initial_context'->>'audit_fleet_goal' LIKE '%Watch-list sweep%')
    FROM state_machines WHERE workspace_id = v_workspace_id AND slug = 'audit-fleet'
  THEN
    RAISE EXCEPTION '0292: goal text label replacement did not land';
  END IF;

  RAISE NOTICE '0292: audit-fleet goal updated to generic watch-items path and label';
END;
$$;
```

Apply it:

```bash
# From the repo root, run the migration through your normal DbUp pipeline
# or apply it directly against the host database if you're in dev:
# psql $HOST_DATABASE_URL -f db/migrations/host/0292_watch_items_generic_path.sql
```

### 5. Update ADR references (optional but clean)

Three ADRs reference the old directory path:
- `docs/adr/045-external-tool-registry.md` — "Informed by Foundry Build 2026 analysis"
- `docs/adr/051-in-loop-context-compaction.md` — cites `2026-06-17-langchain-loop-engineering.md`
- `docs/adr/052-opencode-fleet-worker-runtime.md` — uses `2026-07-05-opencode-worker-runtime.md`

If these ADRs link to the file path directly, update the path. If they just reference the doc by name, no change needed — the filename is the same, only the directory changed.

## Verifiable outcomes

- `test -d docs/watch-items/` — directory exists (renamed)
- `test ! -d docs/competitive-intel/` — old directory gone
- `test -f docs/watch-items/README.md` — README with generic convention exists
- `test -f docs/watch-items/2026-07-05-opencode-worker-runtime.md` — existing docs preserved (spot-check one)
- `grep -q 'watch-list sweep' docs/definition-of-done.md` — DoD updated (no mention of "competitive-intel")
- Migration 0292 applied and verified (both path and label replacements landed)
