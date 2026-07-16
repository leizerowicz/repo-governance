# DB Migration Governance — ai-fleet — DbUp Adoption

**Client:** Hopskip (internal)
**Source:** greg/repo-governance — db-migration-governance standard (2026-06-15)
**Scope:** Replace the custom Python migration runner with DbUp. Covers `host/` schema only.

## Background

ai-fleet currently uses a custom Python runner (`db/migrate.py`) that applies SQL files from `db/migrations/<namespace>/` and tracks them in a custom `schema_migrations` table. Governance mandates DbUp across all governed repos.

`db/migrations/archive/` and `db/migrations/captains-log/` are dead namespaces — no active runner references them, no live DB uses them. They are removed as part of this prompt.

The `host/` schema is the only active namespace. It has a squashed baseline (`0001_schema.sql`, replaces 0001–0075) plus increments 0076–0080+.

## What to do

### 1. Remove dead migration namespaces

```bash
git rm -r db/migrations/archive db/migrations/captains-log
git commit -m "chore: remove dead migration namespaces (archive, captains-log)"
```

Verify: no workflow file, agent.json, or other config references these paths. If `_db-migrate.yml` has any logic scoped to these namespaces, remove those branches too.

### 2. Create the DbUp project

Create `db/dbmigrations/` as a .NET console project. Use enrichment-pipeline's `dbmigrations.csproj` and `Program.cs` as the reference — copy and adapt:

- NuGet package: `dbup-postgresql` (same as enrichment-pipeline)
- Embed all files from `scripts/migrations/` (path relative to the new project)
- Expose the same CLI commands: `migrate`, `test-harness`, `dump-schema`, `generate-migration`, `verify`
- Default connection target: the ai-fleet production Postgres host (read from agent.json or env)

The `host/` migration files move into the DbUp project:

```
db/dbmigrations/
  dbmigrations.csproj
  Program.cs
  scripts/
    migrations/
      0001_schema.sql        ← squash baseline (replaces 0001–0075)
      0002_platform_seed.sql
      0076_pendo_tools.sql
      0077_add_principal_is_admin.sql
      ... (all current host/ files)
      NOTES.md
    verification/
      001_critical_tables.sql   ← write this (see step 5)
```

Remove `db/migrations/` once all files are embedded in the new project.

### 3. Handle the journal bootstrap

The existing runner tracks applied scripts in `schema_migrations`:
```sql
CREATE TABLE IF NOT EXISTS schema_migrations (
  version     TEXT PRIMARY KEY,
  applied_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
)
```

DbUp expects `schemaversions` (columns: `schemaversionsid SERIAL`, `scriptname VARCHAR(255)`, `applied TIMESTAMP`).

Add a `bootstrap-journal` command to the DbUp CLI that runs **once per existing environment**:

```sql
-- Creates schemaversions if not exists, populates it from schema_migrations.
-- Run once. After this, DbUp takes over and schema_migrations is no longer written.
CREATE TABLE IF NOT EXISTS schemaversions (
    schemaversionsid SERIAL PRIMARY KEY,
    scriptname       CHARACTER VARYING(255) NOT NULL,
    applied          TIMESTAMP WITHOUT TIME ZONE NOT NULL
);

INSERT INTO schemaversions (scriptname, applied)
SELECT version, applied_at
FROM schema_migrations
WHERE version NOT IN (SELECT scriptname FROM schemaversions);
```

**Important:** The `scriptname` values DbUp uses are the embedded resource names — verify the format your project uses (typically `dbmigrations.scripts.migrations.0001_schema.sql` or just `0001_schema.sql` depending on configuration). Match the bootstrap INSERT to whatever format the new DbUp project will use. Test on a dev environment before running on prod.

Add `bootstrap-journal` as a CLI command that executes this SQL against the target DB, then confirm it populated `schemaversions` correctly before the first `migrate` run.

**After running bootstrap-journal, verify the squash baseline is covered:**

```sql
SELECT scriptname FROM schemaversions WHERE scriptname LIKE '%0001_schema%';
-- must return one row
```

If it returns zero rows, the old runner's name format didn't match DbUp's embedded resource name. Add it explicitly:

```sql
INSERT INTO schemaversions (scriptname, applied)
SELECT '<actual-embedded-resource-name-for-0001_schema.sql>', NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM schemaversions
  WHERE scriptname = '<actual-embedded-resource-name-for-0001_schema.sql>'
);
```

Replace the placeholder with the actual embedded resource name your DbUp project uses (e.g. `dbmigrations.scripts.migrations.0001_schema.sql`). Without this, DbUp will attempt to apply the squash baseline on existing environments and fail on duplicate primary keys.

### 4. Update the CI deploy workflow

`_db-migrate.yml` currently calls `db/migrate.py` via Python/psycopg2. Replace the migration step with DbUp:

```yaml
- name: Setup .NET
  uses: actions/setup-dotnet@v4
  with:
    dotnet-version: '8.0.x'

- name: Run migration harness (ephemeral Postgres)
  working-directory: db/dbmigrations
  run: dotnet run --configuration Release -- test-harness --spawn-container

- name: Run migrations
  working-directory: db/dbmigrations
  run: |
    dotnet run --configuration Release -- migrate \
      --host "$PG_HOST" \
      --database "$DB_NAME" \
      --username "SQL-Admins" \
      --password "$TOKEN" \
      --ssl-mode Require
```

Keep the Azure login and token-fetch steps — the password is still the OIDC token from `az account get-access-token --resource-type oss-rdbms`. Remove the Python/psycopg2 setup steps.

### 5. Add verification scripts

Create `db/dbmigrations/scripts/verification/`. Write at minimum:

```sql
-- 001_critical_tables.sql
SELECT 1 FROM information_schema.tables WHERE table_name = 'workspaces' AND table_schema = 'public';
SELECT 1 FROM information_schema.tables WHERE table_name = 'tools' AND table_schema = 'public';
SELECT 1 FROM information_schema.tables WHERE table_name = 'machines' AND table_schema = 'public';
-- Add the 5–10 most load-bearing tables for this schema
```

Model after enrichment-pipeline's `scripts/verification/` — keep each file focused on one domain's object presence.

### 6. Add the PR gate workflow

Create `.github/workflows/db-migration-harness.yml`. Copy from `~/repos/greg/repo-governance/templates/workflows/db-migration-harness-postgres.yml` and replace `<DBMIGRATIONS_DIR>` with `db/dbmigrations`.

### 7. Register as a required status check

In GitHub → Settings → Branches → main → Branch protection rules:

Add `Migration harness (ephemeral Postgres)` to **Required status checks**.

### 8. Update repo-local schema-change documentation

If the repo's agent instruction files (`CLAUDE.md`, `AGENTS.md`, `.cursor/rules/`, `.github/copilot-instructions.md`, `GEMINI.md`, etc.), ADRs, or README contain schema-change instructions that describe a pre-DbUp model (e.g. "edit the existing migration file", "re-run all scripts on every deploy", or any pattern where changes go into already-deployed files), update those docs to match the append-only discipline in the same PR. New schema changes go in new numbered migration files; existing journaled files are immutable.

Search broadly: `grep -rI "both changes.*same file\|CREATE TABLE block\|ALTER TABLE ADD section\|edit.*existing.*migration\|re-run.*every.*deploy" .` and update or annotate each hit. ai-fleet used numbered migrations from inception, so this may be a no-op — but verify and annotate if so.

## Not in scope

- Multi-schema DbUp (archive, captains-log) — dead namespaces removed; host is the only active schema
- schema metadata publishing — optional, revisit separately

## Verifiable outcomes

- `test -d db/migrations/archive` → should fail (directory removed)
- `test -d db/migrations/captains-log` → should fail (directory removed)
- `test -f db/dbmigrations/dbmigrations.csproj` — DbUp project exists
- `grep -q 'dbup-postgresql' db/dbmigrations/dbmigrations.csproj` — correct provider
- `test -f db/dbmigrations/scripts/migrations/0001_schema.sql` — squash baseline embedded
- `test -f db/dbmigrations/scripts/verification/001_critical_tables.sql` — verification scripts exist
- `cd db/dbmigrations && dotnet run -- test-harness --spawn-container` — harness passes on a clean ephemeral DB
- `test -f .github/workflows/db-migration-harness.yml` — PR gate workflow exists
- Branch protection: `gh api repos/HopSkipInc/ai-fleet/branches/main --jq '.protection.required_status_checks.contexts[]' | grep -q 'Migration harness'`
- `grep -rIc "edit.*existing.*migration\|both changes.*same file\|re-run.*every.*deploy" CLAUDE.md AGENTS.md docs/adr/ 2>/dev/null` — returns 0 (no stale pre-DbUp instructions in any agent instruction file or ADR)
