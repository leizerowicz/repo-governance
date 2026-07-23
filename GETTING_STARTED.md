# Getting Started

Apply this practice to any repo — new or existing. The steps below take about 20 minutes for a fresh repo, 40 minutes if you have existing ADRs or docs to reconcile.

## Prerequisites

- A GitHub repo with Actions enabled
- An `ANTHROPIC_API_KEY` secret set in the repo (or org-level) — the audit workflow uses it
- Claude Code locally if you want AI-assisted audit sessions

---

## Step 1 — Copy the templates

```bash
# From the root of your repo
mkdir -p docs/audits .github/workflows
cp path/to/repo-governance/templates/definition-of-done.md docs/definition-of-done.md
cp path/to/repo-governance/templates/pull_request_template.md .github/pull_request_template.md
cp path/to/repo-governance/templates/workflows/scheduled-audit.yml .github/workflows/scheduled-audit.yml
cp path/to/repo-governance/templates/workflows/audit-deadman.yml .github/workflows/audit-deadman.yml
```

If your backlog needs structure (most do):
```bash
cp path/to/repo-governance/templates/issue-authoring.md docs/issue-authoring.md
```

Audit docs land in `docs/audits/` — if your `.gitignore` has a `docs/*` pattern, make sure it doesn't silently block that subdirectory.

If your repo uses ADRs:
```bash
mkdir -p docs/adr
cp path/to/repo-governance/templates/adr/022-definition-of-done.md docs/adr/022-definition-of-done.md
cp path/to/repo-governance/templates/scripts/check-adr-readme-sync.mjs scripts/check-adr-readme-sync.mjs
```

To record *why the software exists* — not just how the code is shaped (see Step 3):
```bash
mkdir -p docs/pdr
cp path/to/repo-governance/templates/pdr/_template.md docs/pdr/_template.md
cp path/to/repo-governance/templates/pdr/README.md docs/pdr/README.md
cp path/to/repo-governance/templates/adr/023-product-decision-records.md docs/adr/023-product-decision-records.md   # if you use ADRs
```

If you want the watch-list convention and the skills:
```bash
cp path/to/repo-governance/templates/watch-items.md docs/watch-items.md
cp -r path/to/repo-governance/templates/skills/competitive-analysis .claude/skills/
cp -r path/to/repo-governance/templates/skills/pdr-interview .claude/skills/
```

If your repo has a database, also see `templates/db-migration-governance.md` and the matching `templates/workflows/db-migration-harness-*.yml`. If it has migrations, also copy the breaking-migration gate (edit `MIGRATIONS_DIR` and `SOURCE_DIRS` at the top of the file for your layout):
```bash
cp path/to/repo-governance/templates/scripts/check-breaking-migrations.mjs scripts/check-breaking-migrations.mjs
```

If your repo is TypeScript, the following three lints catch duplicated values/types and duplicated inline SQL before they drift (edit `SRC_DIR` at the top of each file):
```bash
cp path/to/repo-governance/templates/scripts/check-magic-strings.mjs scripts/check-magic-strings.mjs
cp path/to/repo-governance/templates/scripts/check-inline-type-unions.mjs scripts/check-inline-type-unions.mjs
cp path/to/repo-governance/templates/scripts/check-duplicated-sql.mjs scripts/check-duplicated-sql.mjs   # only if your repo embeds SQL as backtick template literals
```

Every repo — no language dependency, edit `ALLOWED` for your actual top-level entries:
```bash
cp path/to/repo-governance/templates/scripts/check-root-clutter.mjs scripts/check-root-clutter.mjs
```

If your repo has migrations that add enforcement-bearing schema (RLS policies, rate-limit or lifecycle columns), edit `MIGRATIONS_DIR`/`SOURCE_DIRS`/`ENFORCEMENT_COLUMNS` for your layout:
```bash
cp path/to/repo-governance/templates/scripts/check-schema-promises.mjs scripts/check-schema-promises.mjs
```

If your repo uses npm test scripts, this catches false-green stubs (report mode, not a gate):
```bash
cp path/to/repo-governance/templates/scripts/lint-stub-tests.mjs scripts/lint-stub-tests.mjs
```

---

## Step 2 — Customize definition-of-done.md

Open `docs/definition-of-done.md` and work through it:

**Remove rows that don't apply.** If your repo has no database migrations, delete the Migration row. If it's a library with no deployment, trim the feature row's deployment checks.

**Add rows for work types you have that aren't listed.** Common additions: `Hotfix` (subset of bug fix, no test required if time-critical — make that explicit), `Dependency update`, `Refactor`.

**Fill in the "why this rule exists" callouts.** Each row has a placeholder. Go back to a real incident, a real audit finding, or a real bug that slipped through and write one sentence. The "why" is what makes the rule stick — a checklist without a story is just friction.

**Don't add rules you won't enforce.** Every rule in the DoD is a promise. An unenforced rule erodes trust in the whole document faster than having no rule at all.

---

## Step 3 — Capture why the software exists (PDRs)

<!-- Skip this step if you're not adopting docs/pdr/ -->

Before you record how the code is shaped, record what it's for. Every project runs on a handful of product bets — who it serves, what it deliberately won't do, what has to become true for it to matter. Those bets authorize every architectural decision underneath them, and they are almost never written down.

**This step is unlike the next one, and the difference is the point.** In Step 4 you can interview the codebase — consistent patterns that would be expensive to break are decisions, whether or not anyone wrote them down. **You cannot interview a codebase for purpose.** It isn't in there. It exists only in the head of whoever is making the call, so the only way to get it is to ask them.

1. **Get the actual decision-maker in the room.** Not their proxy. A PDR corpus reconstructed by an engineer guessing at the founder's intent is fiction with line numbers.
2. **Write 3–5 records** in `docs/pdr/`, following `templates/pdr/_template.md`. Include at least one **non-goal** — the thing you've already decided not to build. It's the highest-signal record and the least likely to exist anywhere else.
3. **Every record ships with a falsifier** — the observable condition that would retire it. A date, a named event, a threshold. This is the whole gate: **a decision without a falsifier is a wish.** A record that can't be settled can't go stale loudly, and a bet that can't go stale loudly is one you'll keep building against long after it stopped being true.
4. **Register each record in `docs/pdr/README.md`** — `check-adr-readme-sync.mjs` fails the build otherwise.

**Claude Code users:** the `pdr-interview` skill does this properly — it probes the repo first, drafts candidates from real evidence, surfaces the places the repo contradicts itself about its own purpose, and only then asks. Blank-slate interviews produce mission statements; evidence-led interviews produce decisions.

Expect resistance to the falsifiers. That's the artifact working — a falsifier is a commitment to being checkable, and people resist those for good reasons. Sit in it.

Keep it to five or fewer.

---

## Step 4 — Capture the implicit decisions (ADRs with enforcement)

Every codebase already runs on a handful of load-bearing architectural decisions that exist only in someone's head — "all DB access goes through the repository layer," "secrets never touch env vars," "migrations are append-only." Don't wait for the audit to trip over violations one at a time. Capture them now:

1. **Identify 3–5 decisions** the build actually depends on. Interview whoever holds them; where nobody does, interview the codebase — consistent patterns that would be expensive to break are decisions, whether or not anyone wrote them down.
2. **Write each as an ADR** (`docs/adr/`) — what is decided, why, and what the consequences are.
3. **Ship each ADR with its enforcement** — a lint in the same PR, per the DoD's core rule. If the lint is genuinely expensive to build now, the ADR stays **Proposed** with a tracking issue, and the audit holds the gap.

Keep it to five or fewer. An ADR corpus seeded at onboarding should cover the decisions a new contractor (human or AI) could violate *silently* — everything else can emerge from audit findings later, which is the normal path.

This step is what makes the practice survive personnel changes: the rules stop living with the people who happen to know them.

---

## Step 5 — Add to CLAUDE.md (or your session instructions)

Add these two things to whatever file describes your repo to Claude:

```markdown
## Before Declaring Any Work Done

Check `docs/definition-of-done.md` — find the row for your work type and satisfy every item.
CI passing is necessary, not sufficient.
```

And in your "Key Files" or "Read Before You Work" table:

```markdown
| `docs/definition-of-done.md` | Per-work-type done checklist — check before every merge |
```

If you don't have a `CLAUDE.md`, see `docs/claude-md-additions.md` for the full minimal snippet.

---

## Step 6 — Configure the audit workflow

Open `.github/workflows/scheduled-audit.yml` and set the cron schedule to fit your cadence. The default is weekdays at 09:00 ET (14:00 UTC).

The workflow prompt already covers six domains (ADR coherence, docs drift, codebase discipline, GitHub backlog, watch-list sweep, PDR coherence). Delete the PDR domain if you're not adopting `docs/pdr/` — a domain that sweeps a directory you don't have reports nothing, which is indistinguishable from a clean result. If your repo has specific patterns you want audited — a particular directory, a specific naming convention, a known recurring drift type — add them to the prompt's "also check" section.

Ensure `ANTHROPIC_API_KEY` is available as a secret.

The workflow opens a PR each run with the audit doc (Phase 1). Review the findings, then run the remediation session on the same branch to apply dispositions and fixes (Phase 2). See `docs/definition-of-done.md` → Audit remediation for the checklist.

The companion `audit-deadman.yml` is the watchdog's watchdog: if no audit artifact appears for 4 days, it goes red and files a P1 issue. This matters more than it sounds — GitHub disables scheduled workflows after 60 days of repo inactivity, and an audit that dies produces *nothing*, so nothing turns red on its own. Set its cron to fire after your audit's window.

---

## Step 7 — Run your first audit

Either wait for the scheduled run or trigger it manually:

```bash
gh workflow run scheduled-audit.yml
```

Your first audit will be noisy. That's expected and useful — it's an inventory of existing drift, not a grade. The audit PR has a two-phase lifecycle:

**Phase 1 (audit session):** The audit runs, writes the doc, opens a PR, and stops. Review the findings.

**Phase 2 (remediation session):** Check out the audit branch, apply dispositions to each finding — fix P0s in the PR, file issues for P1s (cite them inline), WONT-FIX P2s with rationale — update the audit doc with dispositions, and push to the same PR. See `docs/definition-of-done.md` → Audit remediation for the checklist.

Merge the PR once CI is green and every finding has a disposition. The merged PR contains both the audit doc and the fixes.

As you fix findings, note which ones could have been caught by a lint. Each one of those is an ADR waiting to be written.

---

## Step 8 — Add governance health tracking (optional, recommended after 3+ audit cycles)

Once you have three audit docs, you have enough data to measure whether the practice is working. The `docs/governance-health-spec.md` in this repo is an implementation brief — read it, then implement it in your repo.

**What you get:** Four metrics derived entirely from artifacts already in your repo:

| Metric | Proxy for | Data source |
|---|---|---|
| Weighted new findings per audit | Change failure rate | Audit doc headline table |
| Median days P1 first seen → resolved | MTTR | Audit doc finding IDs |
| PR merge rate (merges/week) | Deployment frequency | GitHub API |
| PR open-to-merge time (p50/p90) | Lead time | GitHub API |

The first two are free — the audit docs already contain everything needed. The last two require a short `gh pr list` query.

**What to build:** A script (`scripts/governance-health.mjs` or equivalent) that reads the audit docs, queries GitHub, and writes `docs/governance-health.md` with a running trend table. Wire it into your audit workflow so it updates automatically. `templates/governance-health.md` shows the exact output shape, refined over 8 audit cycles in the reference implementation.

**When to look at it:** Monthly retrospective — not per-PR. You're measuring the governance system, not individuals. Don't set targets until you have 6+ data points; calibrate first.

See `docs/governance-health-spec.md` for the full output format, implementation plan, and notes on what not to do.

---

## Building lints over time

The DoD has a core rule: **enforcement ships with the promise, not after it.** When you write an ADR that says "we will always do X," a lint for X goes in the same PR.

Lints are just scripts that run in `npm run check` (or your equivalent pre-commit/CI step). Common first lints:

- **Migration naming** — enforce a prefix + sequential numbering convention
- **Schema from types** — if you derive JSON schemas from TypeScript, lint that no hand-authored schemas exist
- **Dependency declarations** — if tools declare their external dependencies, lint that declarations and implementations match
- **Test coverage shape** — if you have a three-tier test pattern, lint that each tier exists

You don't need any of these on day 1. Add them when an audit finding proves they're needed.

---

## What "done" looks like

After setup, your normal workflow looks like this:

1. Work on a feature or fix
2. Open a PR — the template prompts you for `Fixes #N` and the type-specific checklist
3. Satisfy the checklist before requesting review
4. Merge — GitHub closes the linked issue automatically
5. Each weekday morning, the audit runs and opens a PR with the audit doc (Phase 1)
6. Review the audit findings, then run the remediation session on the same branch — fix P0s, file issues for P1s, WONT-FIX P2s, update the doc with dispositions, push (Phase 2)
7. Merge the audit PR — audit doc and fixes land together

Over time: each audit P1 that could be a lint becomes a lint. The audit gets quieter. The codebase stays honest.

---

## Keeping the templates current

If you run this practice in multiple repos, your fastest-moving repo will generate improvements that should flow back to the templates — new DoD rules born from real incidents, "why this rule exists" sections filled in from actual outages, new work types that turned out to matter.

**For Claude Code users:** The `.claude/commands/sync-from-repo.md` skill automates this. Invoke `/sync-from-repo` from inside this repo after a sprint boundary in your source repo. It reads both repos' governance artifacts, abstracts any implementation-specific details, and applies proposed improvements as `[PROPOSED]` markers directly in the template files for you to review and accept or reject.

The intended flow:
1. Build and refine new practices in your live repo (audit → lint → DoD update)
2. Run `/sync-from-repo` when things stabilize
3. Review `[PROPOSED]` markers, remove the ones that don't generalize
4. Commit and the improvement is available for all future repos
