# vCTO Positioning — Working Notes

Last updated: 2026-05-20

A working doc, not finished collateral. Captures positioning assumptions so they don't have to be re-derived every conversation.

## Buyer

**Primary:** CTO / VP Engineering / technical founder at AI-enabled mid-market companies (roughly post-Series A through ~100-person eng teams).

**Secondary:** Non-technical founders running engineering with a contractor or small team. BModelr (Jeff Bruno) is the prototype here — small, security-relevant product, AI-agent-heavy build, founder feels acute pain but doesn't have the in-house engineering depth to solve it.

**Not:** security buyers (CISO, compliance officer). The compliance angle is available later as a wedge into larger orgs, but the natural opener is engineering leadership feeling pain from AI-velocity outstripping their quality systems. Selling to security buyers requires different channels and a different vocabulary, and Greg is honestly an engineer not a security professional.

## Vocabulary

**Use:** engineering effectiveness, governance, ship faster with confidence, AI-agent oversight, change control, drift detection, audit trail, DORA metrics, change failure rate, MTTR, lead time, deployment frequency.

**Don't use:** quality debt, quality infrastructure (those are JDAQA's terms — adjacent partner, not own lane); compliance, controls, SOC2, NIST CSF (security buyer vocabulary).

## Differentiation

Three things that distinguish this from existing vCTO / engineering-advisory offerings:

1. **Working artifacts, not policy docs.** Most CTO-advisory engagements produce slide decks, frameworks, and roadmaps. This produces files that ship in repos and run in CI. The deliverable is operational from day one.

2. **Compounding dynamic.** "Each audit finding that could have been a lint becomes a lint." The system gets better over time without the operator's attention. That's a quantifiable, demoable ROI story most advisory offerings can't tell.

3. **AI-coding-era specific.** Built for teams where 50%+ of new code is AI-generated. Most traditional engineering-governance approaches predate this and break under it — they assume a human-readable PR rate and a human reviewer who reads everything carefully.

## Sales motion

- **Channels:** engineering leadership networks (other CTOs, VPEs), founder networks, AI/developer-tools community (Wayfind audience), partner-of-partner referrals (JDAQA flavor).
- **Opener:** not "I do governance" but "I built a practice for this specific problem — want to look at it together?" The methodology is the conversation starter.
- **Front door (proposed):** free 1-hour repo audit. Run the staleness audit script over the prospect's repo, manually review findings, share P0/P1 with them. Direct analog of JDAQA's "Quality Debt Call." Low-friction, demonstrates value, surfaces conversion opportunity.
- **Conversion:** from audit findings to a fixed-fee repo onboarding. The audit shows the problem; the onboarding is the answer.

## DORA mapping

Tangible outcome statements for the offering:

- **DoD violations → change failure rate.** Catches "fix without regression test" and "feature without integration test" before merge. Each prevented escape is a CFR avoidance.
- **Audit findings → MTTR.** Stale docs and drifted ADRs make incidents take longer to resolve. Audit catches this before the incident.
- **Lint coverage → lead time.** Auto-rejecting style and structural drift in CI eliminates review-cycle ping-pong on the things that shouldn't need human attention.

## Open positioning questions

- Brand it personally (Greg Leizerowicz Advisory) or under a name (something more brandable)?
- Specific pricing — repo onboarding range, retainer range, embedded vCTO day-rate or monthly?
- Tier the offering or one-size-fits-all?
- Multi-repo / org-level story — needed for selling to teams with 5+ services. Currently templates are repo-scoped. Org-level audit workflow + templates-repo-pinning pattern is a future deliverable.
- First case study — BModelr is the candidate; what does the write-up structure look like?

## Inputs to revisit

- The Anthropic "Claude in Anthropic" feature set may change the offering — newer agent capabilities could make some lint patterns obsolete or change the architecture. Monitor and update positioning quarterly.
- Once 2-3 case studies exist, revisit the "working artifacts" differentiation — competitors will copy the surface; the case studies are what's harder to replicate.
