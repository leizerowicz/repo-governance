# Product Decision Records

Why this software exists: who it serves, what bet it makes, what it deliberately will not do.

ADRs record how the code is shaped. PDRs record why there is any code at all. Every accepted PDR carries a falsifier — see `docs/definition-of-done.md` for what "accepted" means and why a decision without a falsifier cannot get there.

Every file in this directory must appear in the table below. The `lint:adr-readme-sync` check enforces it and fails the build on any unregistered record.

| # | Title | Status | Last confirmed |
|---|-------|--------|----------------|
| [001](001-who-we-serve.md) | Who we serve | Accepted | [DATE] |
| [002](002-not-building-mobile.md) | Not building mobile | Accepted | [DATE] |

<!--
Replace the rows above with your own. They are illustrative, not a starter set —
a PDR you did not decide is worse than no PDR.

Keep it to five or fewer. The corpus should cover the bets a contractor (human or AI)
could violate silently. Everything else can emerge later, which is the normal path.

Status values:
  Proposed             — written, no falsifier yet, or falsifier not yet wired
  Accepted             — live bet, falsifier present and observable
  Superseded by PDR-N  — we changed our mind; the new record cites this one
  Retired              — the falsifier fired and we decided not to replace it

Non-goals get their own number. "Not building mobile" is a decision with the same
standing as "who we serve", and it is the one the audit can most cheaply check
shipped work against.
-->
