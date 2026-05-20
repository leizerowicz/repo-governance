# Case Study: BModelr — Pre-Launch Governance for an AI-Agent-Driven Build

**Status:** In progress · engagement began May 2026 · launch target June 17, 2026 · case study to be completed post-launch (~ August 2026)

> *Note: this is a working case-study document. Outcomes and Lessons sections are populated as the engagement runs. Anonymization/disclosure handled with Jeff Bruno before publishing externally.*

## Context

Jeff Bruno is launching BModelr, an AI-agent product that models and drives operational improvement in small businesses. The build:

- **Team:** non-technical founder + one contractor (or partner) + AI coding agents (Claude Code primary)
- **Build window:** four weeks, May 17 – June 14, 2026
- **Critical operating window with founder unreachable:** June 17 – June 30, 2026 (Tokyo)
- **Production target:** Railway-hosted Postgres-backed REST API providing read-only monitoring endpoints for Anthropic-hosted Claude Managed Agents
- **Initial codebase state** (per a Claude Code audit): no staging environment, ~24 failing tests, no linting configured. Claude Code flagged: *"the spec assumes patterns that don't exist in the codebase yet."*

The risk profile: a non-developer is shipping a security-relevant system, supervised by a contractor, on a tight timeline, with the critical operating window spanning the founder's two-week absence.

## Approach

vCTO advisory engagement (pro-bono, friend of the firm). Two deliverables:

1. **Spec review** — point-by-point response to founder's seven concerns about the Railway Monitoring API spec, with prompt snippets the founder could feed to Claude Code to reconcile spec and implementation. Delivered as a single reviewer-notes document organized by his original concern numbering, with framing items addressing platform-level architecture decisions and credential handling.

2. **Pre-Week-1 governance install** — Definition of Done, PR template, scheduled staleness audit, and CLAUDE.md additions installed in the BModelr repo before any contractor code lands. Practice copied from `repo-governance`; DoD customized for BModelr's work types; audit schedule offset to 09:00 Tokyo time during the founder's travel window so the on-call partner receives the audit PR at start of his day.

Key technical recommendations:

- **Staging environment + test triage + lint baseline** as pre-Week-1 preconditions, deliberately delaying Week 1's start by 2–3 days rather than running them in parallel.
- **MCP tunnels as v2 consideration** — research preview today, but the data layer should be designed cleanly enough that the REST API can be re-fronted as an MCP server later without a rewrite.
- **Vault for credentials** — load-bearing because the agents consume attacker-influenced content as part of their job (help-chat messages, model outputs); env-var-stored credentials are exfiltratable via prompt injection in a way vault credentials structurally aren't.
- **Alert coalescing** — surfaced a real bug in his original spec: a flapping agent would DOS the Slack alert channel during the founder's absence. Added as a required spec edit.
- **Dedicated Postgres role for the monitoring API** — `SELECT`-only on business tables; converts "read-only" from a convention into a database-enforced property.

## Outcomes

*Populated post-launch — placeholders below.*

- [ ] Audit findings in the first cycle: _N (P0: _, P1: _, P2: _)_
- [ ] Findings promoted to lints by Week 4: _N_
- [ ] Contractor PRs satisfying DoD on first submission vs needing iteration: _N / N_
- [ ] Incidents during the founder-unreachable window: _N (severity breakdown)_
- [ ] Audit volume trajectory: weeks 1, 4, 8, 12: _N → N → N → N_
- [ ] Time spent on DoD-required follow-ups vs estimated saving from prevented escapes: _hours / hours_

## Lessons

*Populated post-launch.*

What worked unexpectedly well:

- _TBD_

What didn't work as expected:

- _TBD_

What would be done differently in the next engagement:

- _TBD_

## Quotes

*To collect from Jeff post-launch, with permission. Candidate themes:*

- Reaction to the DoD as a "hold-the-line" tool when working with a contractor
- Experience of receiving audit PRs while in Tokyo (or, of his partner Julian receiving them)
- Comparison to how he'd otherwise have run the build
