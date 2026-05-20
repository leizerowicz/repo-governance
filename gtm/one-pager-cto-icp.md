# vCTO Advisory: Governance for AI-Accelerated Engineering Teams

**Greg Leizerowicz** · Hainesport, NJ · serving Philadelphia / NYC / remote

---

## The problem

Your team went from a handful of human commits per week to dozens of AI-assisted commits per day. Velocity went up. The systems for keeping work *honest* — testing discipline, doc currency, architecture decisions reflected in code, change control — were built for a slower pace and quietly stopped working.

The failure mode is invisible until it isn't. A contractor's PR passes CI but the regression test is missing. An ADR moves to Accepted but the lint it promised never ships. A doc says one thing and the code does another. Six months later an engineer onboards and discovers the codebase doesn't match its own docs.

That's **governance debt** — the cost of having engineering decisions and engineering artifacts drift apart. It compounds with every AI-accelerated sprint.

## What I do

I install a working governance practice in your repo that constrains AI-agent-assisted development without slowing it down. Three layers:

**Definition of Done.** A per-work-type checklist that makes "done" explicit before a PR merges. Regression tests on bug fixes. Integration tests on features that touch a data store. `Fixes #N` on every PR that closes an issue. Specific, enforceable, and explicit enough to point to in a code review.

**PR template + lints.** The friction layer that surfaces the DoD at submission time so nobody has to remember it. Lints enforce the rules that matter most automatically — and *enforcement ships with the promise, not after it.*

**Scheduled audit.** A weekday Claude-run check for drift between ADRs, docs, and code. Opens a PR with findings categorized P0 / P1 / P2. Runs whether you're at the wheel or not. Each finding that could have been a lint becomes one — so the audit gets quieter over time without your attention.

The compounding result: **one of the only pieces of engineering infrastructure that improves autonomously.**

## What you get

- Customized Definition of Done in your repo
- PR template wired to it
- Scheduled audit running in CI, opening PRs with prioritized findings
- Initial lint suite for the rules that matter most
- DoD violations mapped to DORA outcomes (change failure rate, lead time, MTTR)
- Monthly review of audit cycles with lint candidates surfaced and prioritized

## Engagement shapes

**Repo onboarding** — fixed-fee setup for one repo: install the practice, customize the DoD for your work types, run the first audit, triage findings. 2–3 weeks elapsed.

**Governance retainer** — monthly engagement covering audit review, lint authorship, ADR review, and engineering-decision support. Right-sized to the team.

**Embedded vCTO** — fractional engagement for early-stage or non-technical-founder teams. The governance practice is the foundation; broader technical leadership (architecture, hiring, contractor management, vendor selection) is the work.

## About

Co-founder and CTO at Hopskip (hospitality SaaS, 15-person engineering org). Founder of Wayfind, an open-source developer tool addressing AI context fragmentation in engineering workflows.

The governance practice was built in production at `HopSkipInc/ai-fleet`, refined over multiple audit cycles, and is open at [github.com/leizerowicz/repo-governance](https://github.com/leizerowicz/repo-governance).

## Contact

`[email]` · `[linkedin]` · `[phone]`
