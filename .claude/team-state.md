# repo-governance — Team State

Last updated: 2026-06-14 (session 4)

## Architecture & Key Decisions

- **ICP decision (2026-05-20):** Beachhead is non-technical founders — people who "get it" but don't have the technical chops to "do it." Not corporate CTOs, not VPEs. Jeff Bruno / BModelr is the prototype.
- **Vocabulary shift:** Away from DORA, ADR coherence, governance debt (CTO vocabulary). Toward: contractor, build window, launch date, spec drift, "system holds without you" (founder vocabulary).
- **Value prop reframe:** "Technical judgment for the duration of your build" — governance is the mechanism, not the product.
- **One-pager:** Old CTO-ICP version archived as `gtm/one-pager-cto-icp.md`. New founder-ICP version is `gtm/one-pager.md`.

## Conventions

- GTM artifacts live in `gtm/`. Archive old versions with an ICP or context suffix rather than deleting.
- Positioning working notes in `gtm/positioning.md` — living doc, not finished collateral.

## Current Sprint Focus

Session 5 additions (2026-06-15):
- **`/review-sync` run complete:** 36/36 proposals accepted from the 2026-06-10 ai-fleet sync. All 7 template files cleaned. Three new templates promoted: `issue-authoring.md`, `governance-health.md`, `audit-deadman.yml`. PR template and DoD substantially expanded.
- **Maintenance prompts generated:** first batch in `downstream/hopskip/` for all three repos. enrichment-pipeline already applied theirs. ai-fleet and analytics-infrastructure pending.
- **Tracking process added to `/review-sync`:** Step 5 now has three sub-steps — 5.0 pre-flight (grep downstream repos for prior prompt outcomes, update log), 5.1 generate prompts (every prompt requires `## Verifiable outcomes` shell checks), 5.2 update `_client.md` maintenance log.
- **`_client.md` maintenance log:** tracks all prompts with `pending | applied YYYY-MM-DD | partial` status. Local repo paths added to governed-repos table.

**2026-06-15 maintenance prompts — all applied:**
- enrichment-pipeline: applied 2026-06-15
- analytics-infrastructure: applied 2026-06-15 (5/5 outcomes verified)
- ai-fleet: applied 2026-06-15 (3/4 checks pass; 4th was false positive — `docs/*` glob exists but `!docs/audits/` exception already present from PR #684; review-sync skill updated with `.gitignore` outcome check guidance)

Session 6 additions (2026-06-15):
- **DB migration governance standard added:** `templates/db-migration-governance.md` — DbUp mandatory for all governed repos with a database (Postgres: `dbup-postgresql`, SQL Server: `dbup-sqlserver`). Squash triggers: (b) >50 non-baseline increments OR (c) major schema milestone. Archive replaced files to `scripts/migrations/archive/YYYYMMDD-squash/`. CI harness required as a PR gate (required status check, not advisory).
- **Two new workflow templates:** `templates/workflows/db-migration-harness-postgres.yml` and `templates/workflows/db-migration-harness-sqlserver.yml` — Postgres variant uses `--spawn-container`; SQL Server variant uses GHA service container (`mcr.microsoft.com/mssql/server:2022-latest`).
- **Three new maintenance prompts generated:**
  - enrichment-pipeline: squash 62 files → baseline, wire harness as required PR gate
  - ai-fleet: DbUp adoption — remove dead namespaces (archive, captains-log confirmed dead), create DbUp project, journal bootstrap from `schema_migrations` → `schemaversions`, new PR gate
  - analytics-infrastructure: DbUp for SQL Server — 600+ idempotent scripts become day-0 baseline, no journal bootstrap needed (IF OBJECT_ID guards make re-application safe), replace go-sqlcmd loop in `schema.yml` deploy step
- **Audit gap noted:** Governance audit should check for dead migration namespaces (dirs not referenced by any active runner). ai-fleet's archive/ and captains-log/ were dead but audit missed them. Audit checklist in `templates/db-migration-governance.md` now includes this check.

**Pending DB migration work (all three repos):**
- enrichment-pipeline: [2026-06-15-db-squash.md](../downstream/hopskip/enrichment-pipeline/2026-06-15-db-squash.md) — lightest lift
- ai-fleet: [2026-06-15-db-dbup-migration.md](../downstream/hopskip/ai-fleet/2026-06-15-db-dbup-migration.md) — medium; journal bootstrap is the tricky step, test on dev first
- analytics-infrastructure: [2026-06-15-db-dbup-migration.md](../downstream/hopskip/analytics-infrastructure/2026-06-15-db-dbup-migration.md) — heaviest but clean path; first prod run is slow (600+ no-op scripts), all subsequent runs are fast

Next: no other pending governance work. Resume when next sync-review cycle is due or when a DB migration prompt is ready to apply.

## Conventions (additions)

- **Sync commits:** `sync: from <source-repo> <YYYY-MM-DD>` — `/sync-from-repo` Step 0 finds the last sync date by grepping for this.
- **Review commits:** `sync-review: <source-repo> <date> — accepted N/M proposals` — the N/M ratio calibrates the sync skill's abstraction rules.
- **Skill pair:** `/sync-from-repo` proposes (7 steps now: pre-flight the skill itself, templates, docs reconciliation, GTM proposals gated on user feedback); `/review-sync` dispositions in a later session with fresh eyes.
- ai-fleet's governance shape as of 2026-06: audits in `docs/audits/`, audit runs in-platform (cron machine) with `audit-deadman.yml` as the watchdog, `docs/issue-authoring.md` + 3-layer enforcement, governance-health live with 8+ cycles.
- **Multi-source governance (2026-06-14):** analytics-infrastructure and enrichment-pipeline now under governance. enrichment-pipeline has the most complete code-hygiene / slop-detection implementation (gate + report + WARN→FAIL). analytics-infrastructure is early-stage. Both are calibration sources in `/sync-from-repo`.
- **Downstream prompts:** `downstream/<client>/<repo>/YYYY-MM-DD-maintenance.md` — per-repo maintenance prompts generated by `/review-sync` Step 5. First batch to be generated in the next `/review-sync` session.
- **Kickoff prompt:** `downstream/_kickoff-prompt.md` — universal bootstrap for new repos; fill in context block and run in the target repo's Claude Code.

## Engagement Tracker

| Engagement | Client | Status | Notes |
|---|---|---|---|
| BModelr | Jeff Bruno | Active — pro-bono | Build window May 17–Jun 14 2026. Launch target Jun 17. Founder unreachable Jun 17–30 (Tokyo). Case study pending post-launch (~Aug 2026). |

## Partnership Tracker

| Partner | Status | Notes |
|---|---|---|
| JDAQA (Jay Aigner) | Not yet contacted | First meeting not booked. Referral reciprocity still makes sense despite ICP shift — Jay will encounter founders who can't execute his Assessment findings. Don't lead with BModelr doc. Lead with README + "regression drift" mechanism overlap. |

## Shared Gotchas

- DORA mapping section removed from founder-ICP one-pager — not the buyer's vocabulary.
- "Launch window coverage" engagement shape is new and not in the CTO one-pager — formalized from BModelr pattern.
