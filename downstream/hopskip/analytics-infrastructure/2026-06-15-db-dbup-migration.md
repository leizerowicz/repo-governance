# DB Migration Governance — analytics-infrastructure — DbUp Adoption

**Client:** Hopskip (internal)
**Source:** greg/repo-governance — db-migration-governance standard (2026-06-15)
**Scope:** Introduce DbUp for SQL Server. The 600+ existing idempotent schema scripts become the day-0 baseline set.

## Background

analytics-infrastructure deploys schema via go-sqlcmd in `schema.yml`, running `sql/schema/*.sql` files in order on every deploy. The files use `IF OBJECT_ID IS NULL` guards throughout — they are idempotent. There is no migration runner, no applied-script tracking, and no test harness.

DbUp adoption works cleanly here: DbUp will run all existing scripts as the day-0 baseline. On existing environments, every `IF OBJECT_ID IS NULL` guard no-ops, all scripts get logged to `schemaversions`, and subsequent runs skip them. No journal bootstrap is needed.

Going forward, new schema changes go in new numbered files — the standard append-only pattern.

## What to do

### 1. Create the DbUp project

Create `sql/dbmigrations/` as a .NET console project. Model on enrichment-pipeline, but use SQL Server provider:

```xml
<!-- sql/dbmigrations/dbmigrations.csproj (key package) -->
<PackageReference Include="dbup-sqlserver" Version="5.*" />
```

**Script embedding order:** DbUp applies scripts in lexical order by embedded resource name. Since schema must run before config seeds, use path prefixes to enforce order:

```
sql/dbmigrations/
  dbmigrations.csproj
  Program.cs
  scripts/
    01_schema/          ← symlinks or copies of sql/schema/*.sql
    02_config/          ← symlinks or copies of sql/config/*.sql
    verification/       ← post-migration assertions
  harness-report.json
```

Or configure DbUp to load schema first, then config, by running two `UpgradeEngineBuilder` passes with separate journal prefixes. Either approach is fine — choose whichever keeps the project structure clean.

**Default connection:** Read from env vars or CLI flags. Connect to SQL Azure via Azure AD token (same as `schema.yml`'s `--authentication-method=ActiveDirectoryAzCli` pattern), or username/password for harness/local use.

Expose CLI commands: `migrate`, `test-harness`, `generate-migration`, `verify`. `dump-schema` for SQL Server uses `sqlpackage` rather than `pg_dump` — optional, implement if useful.

### 2. Add verification scripts

Create `sql/dbmigrations/scripts/verification/`. Cover the critical tables that underpin the most-used analytics surfaces:

```sql
-- 001_core_tables.sql
SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'gold_app_hotels' AND TABLE_SCHEMA = 'dbo';
SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'gold_app_proposal_requests_core' AND TABLE_SCHEMA = 'dbo';
SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'gold_app_users_hoteliers' AND TABLE_SCHEMA = 'dbo';
-- Add 5–10 more load-bearing tables
```

```sql
-- 002_views.sql
SELECT 1 FROM INFORMATION_SCHEMA.VIEWS WHERE TABLE_NAME = 'vw_proposal_metrics' AND TABLE_SCHEMA = 'dbo';
SELECT 1 FROM INFORMATION_SCHEMA.VIEWS WHERE TABLE_NAME = 'vw_search_venues' AND TABLE_SCHEMA = 'dbo';
```

```sql
-- 003_seed_sanity.sql
-- Confirm at least one event_topic_partitions row (from 02_config seeds)
SELECT CASE WHEN COUNT(*) >= 1 THEN 1
       ELSE (SELECT 1/0) END  -- forces error if seed is missing
FROM [dbo].[event_topic_partitions];
```

### 3. Implement the test harness

The harness must use a SQL Server container. Add a `test-harness` command that:

1. Connects to the SQL Server instance at `HARNESS_HOST:HARNESS_PORT` (defaults: `localhost:1433`)
2. Creates an ephemeral database: `analytics_infrastructure_harness_<UTC-timestamp>`
3. Applies all embedded scripts in order (01_schema → 02_config)
4. Runs verification scripts
5. Drops the ephemeral database
6. Emits `harness-report.json`

**First run note:** Applying 600+ files takes longer than a typical harness run. On a clean SQL Server container this is ~2–5 minutes. Subsequent runs (with baseline logged to `schemaversions`) are instant. The CI timeout should be set to 20 minutes for this repo.

### 4. Add the PR gate workflow

Create `.github/workflows/db-migration-harness.yml`. Copy from `~/repos/greg/repo-governance/templates/workflows/db-migration-harness-sqlserver.yml` and replace `<DBMIGRATIONS_DIR>` with `sql/dbmigrations`.

Adjust `timeout-minutes` to `20` given the volume of files.

### 5. Update schema.yml to call DbUp for migrations

The existing `schema.yml` handles indexer pausing, function-app stop/start, multi-environment fan-out, and search reconciliation — keep all of that. Replace only the **"Deploy schema files"** step in each environment job.

Current pattern (go-sqlcmd loop):
```yaml
- name: Deploy schema files
  run: |
    for f in sql/schema/*.sql; do
      sqlcmd -S <host> -d data-platform ... -i "$TMP"
    done
```

Replace with:
```yaml
- name: Setup .NET
  uses: actions/setup-dotnet@v4
  with:
    dotnet-version: '8.0.x'

- name: Run migrations (DbUp)
  working-directory: sql/dbmigrations
  env:
    HARNESS_HOST: <env-specific-sql-host>
    DB_NAME: data-platform
    DB_PASSWORD: ${{ env.AZURE_SQL_TOKEN }}  # or however the token is injected
  run: |
    dotnet run --configuration Release -- migrate \
      --host "$HARNESS_HOST" \
      --database "$DB_NAME" \
      --username "SQL-Admins" \
      --password "$DB_PASSWORD"
```

The `go-sqlcmd` install step and the file loop can be removed once DbUp is wired. Keep the `go-sqlcmd` diagnostic query (lock holder snapshot) if desired — it's useful ops context and is not part of the migration proper.

**First prod run behavior:** DbUp applies all 600+ idempotent scripts (each is a no-op), logs them all to `schemaversions`, and exits. The deploy will be slower than usual this one time. Every subsequent deploy skips all existing scripts and only applies new ones.

### 6. Register as a required status check

In GitHub → Settings → Branches → main → Branch protection rules:

Add `Migration harness (ephemeral SQL Server)` to **Required status checks**.

Update the PR template's **Migration** checklist to note that new schema objects go in new numbered files under `sql/schema/` (append-only from here), not by editing existing files.

### 7. Update repo-local schema-change documentation

**This step was missing from the original prompt and caused stuck migrations in July 2026.** PR #155 adopted DbUp but CLAUDE.md §Schema Changes and ADR-002 still instructed developers to "add the column to the CREATE TABLE block AND add an ALTER TABLE ADD section in the same file" — the pre-DbUp idempotent-replay pattern. Developers following those docs edited already-journaled files, which DbUp skipped by name, so changes never reached any environment.

Fix in the same PR (or a follow-up PR if DbUp is already merged):

1. **Agent instruction files** — search all files that agents or developers read for schema-change guidance: `CLAUDE.md`, `AGENTS.md`, `.cursor/rules/`, `.github/copilot-instructions.md`, `GEMINI.md`, or any other tool-specific instruction file. Rewrite schema-change sections to say new changes go in new numbered files. Remove the "both changes in the same file" pattern. Keep the idempotent DDL rules (IF OBJECT_ID guards, CREATE OR ALTER) as those still apply within each file, but clarify that the append-only model replaces the edit-existing-file model.
2. **ADRs** — any architecture decision record that governs schema DDL patterns. Update the decision text to note that DbUp adoption supersedes the "same file" pattern. The idempotent DDL rules remain (they're still needed for fresh deploys and squash baselines), but the deployment model changed from "re-run everything" to "DbUp journals by name, edits to journaled files are invisible."
3. **README, contributing guides, lint comments** — search the repo broadly: `grep -rI "both changes.*same file\|CREATE TABLE block\|ALTER TABLE ADD section\|edit.*existing.*migration\|re-run.*every.*deploy" .` and update or annotate every hit.

## Already present — skip

- Idempotent DDL pattern throughout `sql/schema/` — no changes to existing files
- `sql/config/` seed files using MERGE — embed as-is into `02_config/`
- Schema metadata publishing (`docs/sql-schema.json`, `docs/sql-schema/<table>.json`) — no changes

## Not in scope

- Changing the multi-environment fan-out logic in `schema.yml`
- Rewriting existing schema files to remove `IF OBJECT_ID IS NULL` guards — leave them as-is, they're the squash-baseline mechanism for this repo

## Verifiable outcomes

- `test -f sql/dbmigrations/dbmigrations.csproj` — DbUp project exists
- `grep -q 'dbup-sqlserver' sql/dbmigrations/dbmigrations.csproj` — correct provider
- `test -f sql/dbmigrations/scripts/verification/001_core_tables.sql` — verification scripts exist
- `cd sql/dbmigrations && dotnet run -- test-harness` (with SQL Server container running) — harness passes
- `test -f .github/workflows/db-migration-harness.yml` — PR gate workflow exists
- `grep -q 'mcr.microsoft.com/mssql/server' .github/workflows/db-migration-harness.yml` — SQL Server container configured
- Branch protection: `gh api repos/HopSkipInc/analytics-infrastructure/branches/main --jq '.protection.required_status_checks.contexts[]' | grep -q 'Migration harness'`
- `grep -rIc "both changes" CLAUDE.md AGENTS.md .github/copilot-instructions.md 2>/dev/null` — returns 0 (stale pattern removed from all agent instruction files)
- `grep -rIc "new numbered files" CLAUDE.md AGENTS.md 2>/dev/null` — returns ≥1 (append-only instruction present in at least one agent instruction file)
