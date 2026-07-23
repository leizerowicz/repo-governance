# repo-governance

Templates and recipes for sustainable engineering governance: Definition of Done, staleness audits, and lint-enforced architecture decisions.

---

## What this is

A small, portable practice built around four observations:

1. **"CI is green" is not the same as "done."** Every codebase drifts — docs go stale, ADRs promise lints that never ship, bugs recur because there was no regression test. A Definition of Done (DoD) is a per-work-type checklist that makes "done" explicit before a PR merges.

2. **Lints catch things before they happen; audits catch things after they slip through.** The DoD tells you what to check. Lints enforce the most important rules automatically. A periodic staleness audit catches everything that's too expensive or too infrequent to lint.

3. **The practice compounds.** Each audit finding that could have been a lint becomes a lint. Over time, the audit gets quieter and the signal improves. You start with the audit; the lints are its output.

4. **A build can be perfectly disciplined and still be pointed at the wrong thing.** Every check above compares one repo artifact to another — code to docs, ADRs to lints. None of them can tell you the product drifted from its reason for existing, because purpose isn't in the repo to compare against. That failure is silent: no red CI, no failed test, just velocity in the wrong direction. Product Decision Records give it something to compare against.

## What you get

| Artifact | Layer | What it does |
|---|---|---|
| `templates/definition-of-done.md` | Policy | Per-work-type done checklist |
| `templates/adr/022-definition-of-done.md` | Policy | ADR giving DoD its authority (optional, for ADR-using repos) |
| `templates/pdr/` | Policy | Product Decision Records — who this serves, what bet it makes, what it won't do. Every record carries the condition that would retire it |
| `templates/adr/023-product-decision-records.md` | Policy | ADR giving PDRs their authority (optional, for ADR-using repos) |
| `templates/pull_request_template.md` | Friction | `Fixes #N` prompt + per-type checklists on every PR |
| `templates/workflows/scheduled-audit.yml` | Automation | Daily weekday Claude-powered staleness audit → PR |
| `templates/workflows/audit-deadman.yml` | Automation | Dead-man probe — goes red and files a P1 if the audit itself silently dies |
| `templates/workflows/db-migration-harness-*.yml` | Automation | Ephemeral-DB migration harness as a required PR gate (Postgres + SQL Server) |
| `templates/issue-authoring.md` | Policy | Issue schema + label taxonomy so every issue is born actionable |
| `templates/db-migration-governance.md` | Standard | DbUp mandate, append-only discipline, squash triggers, audit checklist |
| `templates/watch-items.md` | Policy | Watch-list format — anything deferred on a condition, swept by the audit |
| `templates/governance-health.md` | Measurement | Output shape for the auto-generated DORA-proxy metrics doc |
| `templates/scripts/check-adr-readme-sync.mjs` | Lint (GATE) | Every ADR and PDR must be registered in its index — catches numbering collisions |
| `templates/scripts/check-breaking-migrations.mjs` | Lint (GATE) | A dropped/renamed migration column or table must have zero remaining code references |
| `templates/scripts/check-magic-strings.mjs` | Lint (GATE, TS repos) | A value from an exported type alias used as a magic string instead of the alias's constant |
| `templates/scripts/check-inline-type-unions.mjs` | Lint (GATE, TS repos) | An inline string-literal union that duplicates an exported type alias elsewhere |
| `templates/scripts/check-duplicated-sql.mjs` | Lint (GATE, TS repos) | A SQL query inlined in 2+ files instead of centralized in one registry/adapter |
| `templates/scripts/check-root-clutter.mjs` | Lint (GATE) | Repo root holds project-defining files only — working files must live in a subdirectory |
| `templates/scripts/check-schema-promises.mjs` | Lint (GATE) | An enforcement-bearing schema element (RLS policy, rate-limit/lifecycle column) must have a real consumer or a tracked dormant-schema entry |
| `templates/scripts/lint-stub-tests.mjs` | Lint (REPORT, npm repos) | A `test`/`test:*` script that exits 0 without running anything — false-green CI |
| `templates/skills/competitive-analysis/` | Skill | Self-discovering competitive analysis → a watch-item doc + PR |
| `templates/skills/pdr-interview/` | Skill | Probes the repo, then interviews the person who holds the thesis → a PDR corpus + PR |
| `templates/governance-sync-claude-section.md` | Integration | CLAUDE.md breadcrumb so downstream agents can self-navigate to governance |
| `docs/claude-md-additions.md` | Integration | The two lines to add to `CLAUDE.md` or session instructions |
| `docs/personas.md` | Reference | Named roles (repo owner, reviewer, auditor, remediator) used by templates — most small teams collapse all into the founder |
| `docs/governance-health-spec.md` | Measurement | Implementation spec for DORA-proxy metrics derived from audit docs |

## How to apply it

See [GETTING_STARTED.md](./GETTING_STARTED.md) — roughly 20 minutes for a new repo, 40 minutes if you have existing ADRs to reconcile.

## The compounding dynamic

```
Audit catches drift → finding prompts a lint → lint enforces pre-commit
     ↑                                                    ↓
     └──────────── audit has less noise next time ────────┘
          ↕
  governance-health.md tracks failure rate + MTTR over time
```

Start with just the audit and DoD. Add lints as ADRs accumulate. Don't wait until the lint exists to apply the ADR — the audit holds the gap. Once you have a few audit cycles, add governance health tracking to measure whether the practice is actually working.

## The three layers of why

Each layer answers a different question, and each has its own way of going stale:

| Layer | Artifact | Answers | Retired by |
|---|---|---|---|
| Product | `docs/pdr/` | Why does this software exist at all? | Its falsifier firing |
| Architecture | `docs/adr/` | Why is the code shaped this way? | Being superseded |
| Rule | `docs/definition-of-done.md` | Why does this check exist? | The incident stopping |

The bottom two are recoverable from the repo — you can interview a codebase for its architecture, since consistent patterns that would be expensive to break are decisions whether or not anyone wrote them down. **The top one isn't.** Purpose exists only in a human's head, which is why the PDR corpus is the one artifact here that can't be bootstrapped by reading code. See `templates/skills/pdr-interview/`.

## Keeping templates current

If you run this practice across multiple repos, one of them will evolve faster than the templates — audit findings will generate new DoD rules, and "why this rule exists" sections will fill in from real incidents. The `.claude/commands/sync-from-repo.md` skill (for Claude Code users) diffs a live source repo against these templates and applies abstracted improvements as `[PROPOSED]` markers for review.

## What this is not

- A build system or CI framework — it integrates with whatever CI you already have
- An opinionated ADR format — bring your own or start fresh
- Specific to any language or stack — the templates are plain Markdown and GitHub Actions YAML

---

Built from practice in [ai-fleet](https://github.com/HopSkipInc/ai-fleet). Refined over eleven audit cycles and counting — including two silent failures of the audit machinery itself, which is why the dead-man probe exists.
