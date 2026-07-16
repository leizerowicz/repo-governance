# MetaHarness — Competitive Analysis

**Date:** 2026-07-07
**URL:** https://github.com/ruvnet/metaharness
**Focus:** Architecture, generation model, and governance patterns — is this competing with repo-governance?
**Research coverage:** Full README, ARCHITECTURE.md, ADR INDEX (81+ ADRs), Cargo.toml, package.json, USERGUIDE.md, SUBMISSIONS.md — all fetched directly.

---

## TL;DR

MetaHarness is a factory that turns any GitHub repo into a branded AI agent harness (npm-publishable, `npx <name>` CLI, MCP server, memory, governance policy, Ed25519-signed releases). It is not an agent framework — it generates agent frameworks. Targets nine agent runtimes (Claude Code, Codex, pi.dev, Hermes, OpenClaw, RVM, Copilot, OpenCode, GitHub Actions). **It does not compete with repo-governance. It attacks the same problem (make repos more effective) from the complementary AI-tooling angle while repo-governance attacks it from the human-process angle.**

---

## Overlap map

| Their concept | Our equivalent | Notes |
|---|---|---|
| ADR-driven decision making (81+ ADRs, strict lifecycle) | ADR-driven decision making (templates/adr/ + DoD) | Same philosophy — propose, accept, never edit in-place, supersede via follow-on. Their scale is higher (81 vs ~5), but our ADR governance is tighter (check-adr-readme-sync lint enforces index registration). |
| Governance policy per harness (`mcp-policy.json`, default-deny) | Governance templates per repo (DoD, issue-authoring, PR template) | Same concept — per-repo config that gates quality. Theirs is machine-enforced (MCP tool dispatch gates). Ours is process-enforced (PR template surfaces DoD checklist). |
| `harness validate` — scaffold health check | `check-adr-readme-sync.mjs` lint + scheduled audit | Same concept — automated quality gates. Theirs is per-harness, gate-range is broader (doctor + witness + path-guard + MCP + GCP). Ours is per-repo, gate-range is narrower but deeper (5-domain audit sweep). |
| Template-based generation (19 verticals, `--template vertical:coding`) | Template-based generation (templates/ directory, per-work-type DoD) | Both generate from templates. Theirs generates npm packages with code. Ours generates markdown config files. |
| `harness analyze-repo <path>` — deterministic static analysis of target repo | `downstream/_kickoff-prompt.md` — manual bootstrap prompt | Both analyze a target repo to produce config. Theirs is automated CLI. Ours is a paste-and-run Claude Code prompt. |
| Self-evolution (Darwin Mode — mutate harness config, sandbox-test, promote wins) | Compounding dynamic (audit → finding → lint → less noise next audit) | Same philosophical loop — system improves over time through structured feedback. Theirs is automated ML-style evolution. Ours is human-driven process refinement. |
| Watch-list mechanism (`SUBMISSIONS.md` — open leaderboard, community contributions) | Watch-list mechanism (`competitive-intel.md` — watch items with revisit conditions, audit sweep) | Same concept but different domain. Theirs tracks benchmark entries. Ours tracks competitive intel. |
| Quality gates (16-job CI matrix, Rust × 3 OS, WASM size budget, healthcheck) | Quality gates (check-adr-readme-sync lint, scheduled audit CI, audit-deadman probe, db-migration harnesses) | Both gate on health. Theirs gates on code quality (compile, lint, test, size). Ours gates on governance quality (ADR coherence, docs freshness, watch-list timeliness). |
| Provenance (Ed25519 witness-signed manifests, SLSA L2) | Provenance (ADR index enforced by lint, audit trail via artifact commits) | Theirs is cryptographic, machine-verifiable. Ours is process-level, human-reasonable. |

---

## Gap analysis (top 5 by roadmap relevance)

**1. Automated repo analysis and config generation**
> Their approach: `harness analyze-repo <path>` runs deterministic static analysis (lockfile/manifest probing + lexical scoring + optional embeddings) and produces `repo-profile.json` + `harness-plan.json` in seconds, no code execution.
> Our current state: `downstream/_kickoff-prompt.md` is a paste-and-run Claude Code prompt. Fully manual bootstrap. Each new repo takes a human session.
> Relevance: HIGH — directly addresses our bootstrap bottleneck. Every new governed repo currently requires Greg or Claude to manually discover the architecture and apply templates.
> Existing issue: no existing issue
> Candidate action: Steal the idea — a `governance analyze-repo <path>` slash command that statically probes the target, outputs a scored reposcape, and recommends which templates to apply.

**2. Publishing generated output as versioned packages**
> Their approach: Generated harnesses are npm-publishable with proper `package.json`, `bin`, CLI entry point, and versioning. `npm publish --provenance` with SLSA L2. `@metaharness/*` has 19 example-wrappers published this way.
> Our current state: Templates live in `repo-governance/templates/`. Maintenance prompts live in `downstream/<client>/<repo>/`. Both are plain files — no versioning, no distribution mechanism, no way to assert "this repo is on template v2.1.0."
> Relevance: HIGH — as governed repo count scales beyond 3, we need to version-governed-config. "Did enrichment-pipeline get the 2026-07-07 sync?" should be answerable by version, not by searching CLAUDE.md applied-updates sections.
> Existing issue: no existing issue
> Candidate action: Steal the idea — a `governance version` concern that stamps templates and downstream repos with a governance-manifest version that `harness validate` / audit can check.

**3. Self-evolving config (Darwin Mode)**
> Their approach: Darwin Mode mutates harness config (planner, context, retry, scorer, etc.), sandbox-tests each variant against benchmark tasks, and promotes only statistically-significant measured wins. The model is frozen; the harness evolves. Population-based, bounded, reproducible. Honest about null results (reports killed experiments with 0 compounding lift).
> Our current state: The compounding dynamic (audit → finding → lint → less noise) is the same philosophical loop, but fully human-driven. Improvements flow upstream from ai-fleet via `/sync-from-repo` → `[PROPOSED]` markers → `/review-sync`. No automated "try this DoD variant against 3 repos and measure PR merge rate" exists.
> Relevance: LOW — our domain is human process, not code optimization. But the *pattern* is worth stealing: structured mutation, sandbox test, statistical gate, honest null reporting.
> Existing issue: no existing issue
> Candidate action: Steal the idea — lightweight self-evolution for governance config. Not a Darwin loop (overkill), but a "canary" mechanism: propose a template change, apply it to one governed repo, measure audit-finding-count delta after 2 cycles, accept/reject based on measured improvement.

**4. Cost-per-outcome benchmarking (Cost-Pareto Leaderboard)**
> Their approach: Public leaderboard ranking agents by resolve-per-dollar, not raw score. Tunable Value Score. Open submissions with conformance rules. Honest null results displayed alongside wins.
> Our current state: `governance-health.md` spec defines DORA-proxy metrics (audit-finding count, cycle time, deployment frequency) but no leaderboard or relative comparison between governed repos.
> Relevance: MEDIUM — a governance-health leaderboard across governed repos would motivate adoption and surface which repos need attention. But it's a post-10-repo concern.
> Existing issue: no existing issue
> Candidate action: Watch — revisit when we have >5 governed repos with 3+ audit cycles each. The leaderboard concept is vector-aligned with our compounding dynamic.

**5. MCP as a default-deny security primitive**
> Their approach: MCP server generation emits `mcp-policy.json` with `off | local | remote` modes, approve-dangerous, 30s timeout, 8 calls/turn limit, audit on. `harness mcp-scan` is "npm audit for agent tools" — static scan flagging shell/network grants, wildcard permissions, unguarded secrets.
> Our current state: No MCP or agent-tool governance. Our security governance is environment-level (Azure SQL firewall, PAT rotation, permissions blocks in GHA workflows). We don't govern what tools AI agents are allowed to call on governed repos.
> Relevance: MEDIUM — as downstream repos deploy AI agents (Claude Code, Copilot), tool governance becomes a governance concern. Repo-governance should have an opinion on MCP tool policies.
> Existing issue: no existing issue
> Candidate action: Watch — add to watch list. When downstream repos start shipping MCP servers or agent tools, steal the `mcp-policy.json` default-deny pattern as a governance template.

---

## Their advantages over us

- Automated repo analysis in seconds vs our manual bootstrap per repo
- Package distribution — versioned, publishable, installable via npx
- Self-evolution with statistical gates — automated improvement loop vs our human-driven one
- 568 tests + 16-job CI matrix — deep operational rigor
- 81 ADRs — comprehensive decision history we can learn from
- Cost-Pareto benchmarking — quantifiable, comparable outcomes
- Nine host adapters — broad ecosystem reach
- Rust kernel + WASM — cross-platform, deterministic, client-only (zero backend)

## Our advantages over them

- Our "generation" is human process, not code — deeper domain (engineering culture vs tool scaffolding). They can't generate a Definition of Done that a team actually follows.
- Compounding over time, not just at bootstrap — our audit→lint→less-noise loop runs continuously. Their harness is generated once and then optionally evolved via Darwin.
- Competitive analysis is a first-class governance concern — watch-list sweeps, revisit conditions, audit escalation. Their competitive analysis is benchmarking (leaderboard), not strategic intel.
- Simpler and self-contained — no Rust toolchain, no npm ecosystem dependency, no WASM compilation. A governed repo just copies markdown files.
- Honest null reporting built into our process (audit carries forward unresolved findings for 3 cycles, then escalate-or-close). Theirs is documented in ADRs but not structurally enforced in their governance model.
- We target non-technical founders — MetaHarness targets technical teams building AI tooling. Different ICPs, different problems.

---

## Decision

**STEAL IDEAS**

MetaHarness is not a competitor. It attacks the same problem (making repos more effective) from the AI-tooling side while repo-governance attacks it from the human-process side. The overlap is patterns, not products.

Three ideas worth stealing now:
1. **Automated repo analysis** — a `governance analyze-repo` slash command that statically probes a target, outputs a scored reposcape, and recommends template applicability. Replaces the manual `_kickoff-prompt.md` flow.
2. **Governance-client versioning** — stamp each governed repo with a governance-manifest version so "is enrichment-pipeline on the latest templates?" has a programmatic answer.
3. **Default-deny MCP policy template** — for when governed repos inevitably deploy AI agents.

Two ideas worth watching:
4. **Self-evolving governance config** — canary mechanism: propose template change → apply to one repo → measure audit delta after 2 cycles → promote/reject.
5. **Governance-health leaderboard** — cross-repo metrics comparison. Revisit when >5 governed repos with 3+ audit cycles.

**New ADR needed?** Yes — Governance-client versioning (how template versions are stamped, how downstream repos declare compliance, and how the audit verifies drift).

---

## Proposed next steps

- [x] **New issue to file in repo-governance:** "governance analyze-repo — automated bootstrap via static repo probing" — slash command that statically probes target repo, outputs scored reposcape + template applicability recommendations. Replaces manual `_kickoff-prompt.md`. → [#1](https://github.com/leizerowicz/repo-governance/issues/1) — `.claude/commands/analyze-repo.md` written and probe-tested.
- [ ] **New issue to file in repo-governance:** "Governance-client versioning — stamp governed repos with manifest version" — define version scheme, stamp mechanism, audit drift-detection. Needs ADR.
- [ ] **Watch list:** revisit in 6 months (2027-01-07) — when governed repos start deploying AI agents that call tools on the repo. Steal `mcp-policy.json` default-deny pattern as a governance template.
- [ ] **Watch list:** revisit when governed-repo count exceeds 5 with 3+ audit cycles each — steal the Cost-Pareto leaderboard concept as a governance-health dashboard.
- [ ] **Watch list:** revisit when a template change would benefit from A/B-style validation — steal Darwin Mode's canary pattern (propose → test on 1 repo → measure → promote/reject).

---

## Notes / Quotes worth keeping

> "It is not another agent framework. It is a factory for agent frameworks." — README

> "The model is replaceable. The harness is the product." — README

> "Enforcement ships with the promise, not after it." — ARCHITECTURE.md (their ADR-007). *This is the same rule repo-governance was built on.*

> "Darwin evolves the harness, not the model. The model is frozen. The harness (planner, context builder, reviewer, retry policy, tool selection, memory config, scorer) is what Darwin mutates and selects." — ADR-070

> "Accepted ADRs are superseded by follow-ons, never edited in-place." — ADR INDEX. *Same rule as repo-governance.*

> "Default-deny — nothing allowed unless explicitly permitted." — ADR-022. *Same posture as our DoD.*
