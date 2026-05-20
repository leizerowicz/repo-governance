# repo-governance

Templates and recipes for sustainable engineering governance: Definition of Done, staleness audits, and lint-enforced architecture decisions.

---

## What this is

A small, portable practice built around three observations:

1. **"CI is green" is not the same as "done."** Every codebase drifts — docs go stale, ADRs promise lints that never ship, bugs recur because there was no regression test. A Definition of Done (DoD) is a per-work-type checklist that makes "done" explicit before a PR merges.

2. **Lints catch things before they happen; audits catch things after they slip through.** The DoD tells you what to check. Lints enforce the most important rules automatically. A periodic staleness audit catches everything that's too expensive or too infrequent to lint.

3. **The practice compounds.** Each audit finding that could have been a lint becomes a lint. Over time, the audit gets quieter and the signal improves. You start with the audit; the lints are its output.

## What you get

| Artifact | Layer | What it does |
|---|---|---|
| `templates/definition-of-done.md` | Policy | Per-work-type done checklist |
| `templates/adr/022-definition-of-done.md` | Policy | ADR giving DoD its authority (optional, for ADR-using repos) |
| `templates/pull_request_template.md` | Friction | `Fixes #N` prompt + per-type checklists on every PR |
| `templates/workflows/scheduled-audit.yml` | Automation | Daily weekday Claude-powered staleness audit → PR |
| `docs/claude-md-additions.md` | Integration | The two lines to add to `CLAUDE.md` or session instructions |
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

## Keeping templates current

If you run this practice across multiple repos, one of them will evolve faster than the templates — audit findings will generate new DoD rules, and "why this rule exists" sections will fill in from real incidents. The `.claude/commands/sync-from-repo.md` skill (for Claude Code users) diffs a live source repo against these templates and applies abstracted improvements as `[PROPOSED]` markers for review.

## What this is not

- A build system or CI framework — it integrates with whatever CI you already have
- An opinionated ADR format — bring your own or start fresh
- Specific to any language or stack — the templates are plain Markdown and GitHub Actions YAML

---

Built from practice in [ai-fleet](https://github.com/HopSkipInc/ai-fleet). Refined over three audit cycles.
