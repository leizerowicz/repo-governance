# Client: Hopskip (internal)

**Owner:** Greg Leizerowicz
**Engagement type:** Internal — reference implementation portfolio
**Governance start:** 2026-05

## Governed repos

| Repo | Local path | Governance since | Maturity | Notes |
|---|---|---|---|---|
| HopSkipInc/ai-fleet | `~/repos/HopSkipInc/ai-fleet` | 2026-05 | High — 8+ audit cycles, governance-health live | Primary reference implementation; source for most template improvements |
| HopSkipInc/analytics-infrastructure | `~/repos/HopSkipInc/analytics-infrastructure` | 2026-06 | Early — inaugural audit done, code-hygiene not yet wired | Recent adopter; surface onboarding friction as a template signal |
| HopSkipInc/enrichment-pipeline | `~/repos/HopSkipInc/enrichment-pipeline` | 2026-06 | Early-mid — first audit cycle done | Code-hygiene / slop-detection most complete here; reference for that artifact class |

## Maintenance Log

| Repo | Prompt | Status |
|---|---|---|
| HopSkipInc/enrichment-pipeline | [2026-06-15](enrichment-pipeline/2026-06-15-maintenance.md) | applied 2026-06-15 |
| HopSkipInc/analytics-infrastructure | [2026-06-15](analytics-infrastructure/2026-06-15-maintenance.md) | applied 2026-06-15 |
| HopSkipInc/ai-fleet | [2026-06-15](ai-fleet/2026-06-15-maintenance.md) | applied 2026-06-15 |
| HopSkipInc/enrichment-pipeline | [2026-06-15 db-squash](enrichment-pipeline/2026-06-15-db-squash.md) | applied 2026-06-15 |
| HopSkipInc/ai-fleet | [2026-06-15 db-dbup-migration](ai-fleet/2026-06-15-db-dbup-migration.md) | applied 2026-07-06 |
| HopSkipInc/analytics-infrastructure | [2026-06-15 db-dbup-migration](analytics-infrastructure/2026-06-15-db-dbup-migration.md) | applied 2026-07-05 |
| HopSkipInc/analytics-infrastructure | [2026-06-18 adr-lint + audit prep](analytics-infrastructure/2026-06-18-adr-lint-and-audit-prep.md) | applied 2026-07-03 |
| HopSkipInc/analytics-infrastructure | [2026-07-05 watch-items sweep](analytics-infrastructure/2026-07-05-watch-items-sweep.md) | applied 2026-07-06 |
| HopSkipInc/enrichment-pipeline | [2026-07-05 watch-items sweep](enrichment-pipeline/2026-07-05-watch-items-sweep.md) | applied 2026-07-06 |
| HopSkipInc/ai-fleet | [2026-07-06 migrate to generic watch-items](ai-fleet/2026-07-06-migrate-watch-items.md) | applied 2026-07-06 |
| HopSkipInc/ai-fleet | [2026-07-07 governance sync CLAUDE.md section](2026-07-07-governance-sync-claude-section.md) | applied 2026-07-07 |
| HopSkipInc/analytics-infrastructure | [2026-07-07 governance sync CLAUDE.md section](2026-07-07-governance-sync-claude-section.md) | applied 2026-07-07 |
| HopSkipInc/enrichment-pipeline | [2026-07-07 governance sync CLAUDE.md section](2026-07-07-governance-sync-claude-section.md) | applied 2026-07-07 |
| HopSkipInc/ai-fleet | [2026-07-07 competitive-analysis skill](2026-07-07-competitive-analysis-skill.md) | applied 2026-07-07 |
| HopSkipInc/analytics-infrastructure | [2026-07-07 competitive-analysis skill](2026-07-07-competitive-analysis-skill.md) | applied 2026-07-07 |
| HopSkipInc/enrichment-pipeline | [2026-07-07 competitive-analysis skill](2026-07-07-competitive-analysis-skill.md) | applied 2026-07-07 |

Prompts are dated files in each repo's subdirectory. Run them in the respective repo's Claude Code context. Update status to `applied YYYY-MM-DD` once run, or `partial — <note>` if only some steps landed.
