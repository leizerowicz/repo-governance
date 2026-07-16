# repo-governance — Team State

Last updated: 2026-07-07 (session 10)

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

**DB migration work status:**
- enrichment-pipeline: [2026-06-15-db-squash.md](../downstream/hopskip/enrichment-pipeline/2026-06-15-db-squash.md) — **applied 2026-06-15** (#408)
- ai-fleet: [2026-06-15-db-dbup-migration.md](../downstream/hopskip/ai-fleet/2026-06-15-db-dbup-migration.md) — **applied 2026-07-06**
- analytics-infrastructure: [2026-06-15-db-dbup-migration.md](../downstream/hopskip/analytics-infrastructure/2026-06-15-db-dbup-migration.md) — **applied 2026-07-05** (#155)

Session 8 additions (2026-07-05):

- **`templates/competitive-intel.md`:** New template codifying the competitive-intel watch-list format and Future items convention, propagated from ai-fleet migration 0291 (`8c84a12` — feat: surface competitive-intel watch items as Future items in scheduled audit).
- **DoD Future items section added** to `templates/definition-of-done.md` Audit section — matches ai-fleet's addition to their DoD in the same commit.
- **Watch-list sweep domain** added as domain 5 in `templates/workflows/scheduled-audit.yml` — scans `docs/competitive-intel/*.md` for unchecked watch-list lines, renders Future items section in audit reports, escalates due items to P2.
- **PR template updated** — Documentation checklist now requires watch-list lines in competitive intel docs to have specific revisit conditions.
- **Two new downstream prompts generated** (2026-07-05-competitive-intel-watch.md) for analytics-infrastructure and enrichment-pipeline — each creates the competitive-intel directory, updates DoD, and wires the sweep into their respective audit machines (audit-data-platform, audit-enrichment-pipeline) via ai-fleet migration.

Session 10 additions (2026-07-07):

- **`templates/skills/competitive-analysis/SKILL.md`:** Self-discovering competitive analysis skill. Instead of baking in repo-specific ADR lists, primitive names, and source paths, the skill teaches Agent B to *discover* the architecture at runtime: find the ADR directory, read all ADRs, read architecture docs, list the source tree, and synthesize primitives from what it finds. Agent A researches the external product in parallel. Synthesis produces a gap analysis with decision (integrate / steal ideas / watch / reject). Output lands in `docs/watch-items/`. This replaces the earlier `.claude/commands/` approach — skills are portable across harnesses (Claude Code, Codex, fleet workers) since they're plain markdown workflows, not CLI-specific slash commands.
- **Single generic downstream prompt:** [2026-07-07-competitive-analysis-skill.md](../downstream/hopskip/2026-07-07-competitive-analysis-skill.md) — identical for all three governed repos. No per-repo customization. The skill discovers each repo's architecture at runtime.
- **Reverted the repo-specific prompts** (analytics-infrastructure/2026-07-07-competitive-analysis-command.md and enrichment-pipeline/2026-07-07-competitive-analysis-command.md) — they encoded too much repo-specific knowledge (exact ADR filenames, source paths, primitive names) which doesn't scale to real clients.
- **`templates/governance-sync-claude-section.md`:** A small CLAUDE.md section that tells downstream repo agents where repo-governance lives, what client name to use, and the convention for finding/applying/marking-done prompts. Without this breadcrumb, agents fly blind trying to "update from repo-governance."
- **Single downstream prompt:** [2026-07-07-governance-sync-claude-section.md](../downstream/hopskip/2026-07-07-governance-sync-claude-section.md) — identical for all three repos. Each repo fills in its own slug. The section is intentionally tiny (~12 lines) — just enough for an agent to self-navigate.
- **Key design principle:** repo-governance should teach *patterns and discovery methods*, not maintain a shadow mirror of each client's file tree. Skills that say "read all ADRs, read the architecture docs, discover the primitives" scale infinitely — skills that list `adr/0017-enrichment-prioritization.md` don't survive the next ADR write.
- **Bug discovered (2026-07-07):** The governance-sync CLAUDE.md section told downstream agents to update `_client.md` in repo-governance (step 5). This is wrong — cross-repo writes create race conditions and violate the trust boundary. Downstream repos should never modify repo-governance files.
- **Fix:** [2026-07-07-fix-governance-sync-ownership.md](../downstream/hopskip/2026-07-07-fix-governance-sync-ownership.md) — downstream agents now record applied prompts in their own CLAUDE.md under `### Applied governance updates`. repo-governance reconciles from there during `/review-sync`. Step 5 now explicitly warns "do not modify files in repo-governance."
- **Reconciliation design:** `/review-sync` reads each downstream repo's `### Applied governance updates` section and updates `_client.md`. Downstream repos are read-only sources; repo-governance owns the ledger.

Session 7 additions (2026-06-18):
- **lint:adr-readme-sync:** New governance lint. Every docs/adr/NNN-*.md must appear in docs/adr/README.md as a markdown link `(NNN-filename.md)`. Hard fail on any unregistered file. Catches ADR numbering collisions at PR time. Template at `templates/scripts/check-adr-readme-sync.mjs`.
- **lint:universal-tool-doc-sync:** New ai-fleet-specific governance lint. Scans db/migrations/host/*.sql for `scope = 'all'` in executable SQL, extracts tool_ids via three patterns (WHERE clause, IN clause, INSERT VALUES), asserts each appears in docs/adding-an-agent.md. Hard fail on missing or unresolvable entries.
- **ai-fleet wiring:** Both lints added to `host/package.json` (lint:adr-readme-sync, lint:universal-tool-doc-sync), to the `check` script chain, and to `.github/workflows/run-tests.yml`. Meta-lint passes at 28 scripts. Both lints pass clean on master.
- **ai-fleet doc fix:** Added `post_for_acknowledgement` to the universal tools list in docs/adding-an-agent.md (was missing since migration 0192, June 2026; caught by the new lint).
- **ai-fleet ADR fix:** Registered ADR-051 (In-Loop Context Compaction Policy) in docs/adr/README.md — was filed 2026-06-17 but not indexed; caught by the new lint on first run.
- **analytics-infrastructure wiring:** lint:adr-readme-sync added as `scripts/lint-adr-readme-sync.mjs` and as `adr-readme-sync` gate job in `.github/workflows/code-hygiene.yml`. Passes clean (14 ADRs all registered).
- **Propagation assessment:** enrichment-pipeline (no docs/adr/) and compliance (no docs/adr/) → lint:adr-readme-sync WONT-FIX; not applicable. lint:universal-tool-doc-sync is ai-fleet-specific; no other governed repo has the tools table with scope='all' semantics.

Session 9 additions (2026-07-06):
- **analytics-infrastructure reconciliation:** Verified all 4 downstream prompts applied. DbUp migration (#155) and ADR lint (#144) were already landed but our log showed `pending` — corrected to `applied 2026-07-05` and `applied 2026-07-03`. Watch-items sweep was still pending at check time; re-checked after user flag and found commit `b203235` landed same day with all 4 verifiable outcomes passing. `_client.md` fully reconciled: analytics-infrastructure has zero open governance prompts.

Next: Zero open governance prompts. All three repos are current. `/review-sync` needs a reconciliation step added that reads each downstream repo's `### Applied governance updates` section to update `_client.md` (replacing the old write-back pattern). Resume when next sync-review cycle is due.

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
