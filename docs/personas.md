# Personas

**Status:** Reference — used by templates, skills, and documentation to name who does what
**Last updated:** 2026-07-23

The governance practice involves a handful of distinct roles. Most small teams and solo-founder shops collapse all of them into one person. That is fine — but the templates should name the *role*, not the *person*, so they remain portable and don't need editing when a contractor joins or a founder hands off a responsibility.

---

## The personas

### Repo owner

The person who holds the thesis for why the repo exists. Authorizes work, makes final merge decisions, and is the default for every other persona when nobody else is assigned. In a solo or small-team repo, this is the founder. In a larger org, this is the tech lead or engineering manager responsible for the repo.

**Default coverage:** Reviewer, Auditor, Remediator — when no other persona is assigned, the repo owner does all three.

### Reviewer

The person who reviews a PR before merge. For audit PRs, the reviewer reads the findings and decides what to triage, what to file, what to WONT-FIX. The reviewer may or may not be the same person who authored the PR.

In the two-phase audit lifecycle, the reviewer sits between Phase 1 (audit session) and Phase 2 (remediation session). The audit PR is not self-merging — the reviewer's judgment is the gate.

### Auditor

The person (or agent) who runs the staleness audit. Writes the audit doc, commits it to a branch, opens the PR. The auditor does not fix findings — the audit session is read-only by contract. In an automated setup, this is the scheduled CI workflow. In a manual setup, this is a person or AI agent acting on the repo owner's request.

### Remediator

The person (or agent) who applies dispositions to audit findings in the remediation session. Checks out the audit branch, fixes P0s, files issues for P1s, WONT-FIXes P2s, closes stale issues, updates the audit doc inline, and pushes to the same PR. In a solo repo, this is the repo owner. In a team, this could be a contractor or any engineer.

---

## How the personas map to the audit lifecycle

```
Phase 1: Audit session        →  Auditor (read-only scan, opens PR)
         Human review         →  Reviewer (reads findings, agrees on dispositions)
Phase 2: Remediation session  →  Remediator (fixes, files, closes, updates doc, pushes)
         Human merge          →  Reviewer or Repo owner (merges the PR)
```

When one person holds all four personas (the common case), the flow still has two sessions — the separation is temporal, not organizational. The audit session stops after the PR is open. The remediation session starts when that same person comes back, reviews the findings, and checks out the branch.

---

## How templates use these terms

- **"Repo owner"** appears wherever a template previously named a specific person. It means "whoever holds this repo's thesis and makes merge decisions."
- **"Reviewer"** appears in PR template and DoD contexts — the person who must confirm a checklist before merge.
- **"Auditor"** and **"Remediator"** appear in the audit-specific templates and skills.
- **PDR `Confirmed by`** still names a *person*, not a role — a product bet nobody will sign is a bet nobody believes. The persona abstraction applies to process roles, not to product accountability.

---

## Why define personas at all

If the templates said "Greg does X," they'd only work in Greg's repos. If they said "the user does X," that's vague enough to be useless in a multi-person team. Named personas let a one-person shop read "repo owner" and know it means them, while a five-person team can split the roles across people without rewriting the templates.

The collapse is the feature, not the bug: most governed repos will have one person playing all four roles. The personas exist so that when that changes — a contractor joins, a second engineer comes on, the founder steps back from day-to-day — the templates don't need rewriting.
