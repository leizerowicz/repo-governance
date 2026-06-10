# repo-governance — Team State

Last updated: 2026-06-10 (session 3)

## Architecture & Key Decisions

- **ICP decision (2026-05-20):** Beachhead is non-technical founders — people who "get it" but don't have the technical chops to "do it." Not corporate CTOs, not VPEs. Jeff Bruno / BModelr is the prototype.
- **Vocabulary shift:** Away from DORA, ADR coherence, governance debt (CTO vocabulary). Toward: contractor, build window, launch date, spec drift, "system holds without you" (founder vocabulary).
- **Value prop reframe:** "Technical judgment for the duration of your build" — governance is the mechanism, not the product.
- **One-pager:** Old CTO-ICP version archived as `gtm/one-pager-cto-icp.md`. New founder-ICP version is `gtm/one-pager.md`.

## Conventions

- GTM artifacts live in `gtm/`. Archive old versions with an ICP or context suffix rather than deleting.
- Positioning working notes in `gtm/positioning.md` — living doc, not finished collateral.

## Current Sprint Focus

First full sync from ai-fleet complete (2026-06-10): 35 `[PROPOSED]` markers across the templates, three new templates (governance-health, audit-deadman probe, issue-authoring), README/GETTING_STARTED/spec reconciled, GTM updated (dead-man probe → launch-window proof point; governance-health trends → compounding-claim evidence; decision-capture-with-enforcement → named onboarding component).

Next: run `/review-sync` in a fresh session to disposition the markers.

## Conventions (additions)

- **Sync commits:** `sync: from <source-repo> <YYYY-MM-DD>` — `/sync-from-repo` Step 0 finds the last sync date by grepping for this.
- **Review commits:** `sync-review: <source-repo> <date> — accepted N/M proposals` — the N/M ratio calibrates the sync skill's abstraction rules.
- **Skill pair:** `/sync-from-repo` proposes (7 steps now: pre-flight the skill itself, templates, docs reconciliation, GTM proposals gated on user feedback); `/review-sync` dispositions in a later session with fresh eyes.
- ai-fleet's governance shape as of 2026-06: audits in `docs/audits/`, audit runs in-platform (cron machine) with `audit-deadman.yml` as the watchdog, `docs/issue-authoring.md` + 3-layer enforcement, governance-health live with 8+ cycles.

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
