---
name: review-sync
description: Review pass over a sync-from-repo run — walk every [PROPOSED] marker file by file, accept/adapt/reject each, verify the templates are clean, and commit with the sync commit conventions
---

# Review a Sync Run

Companion to `/sync-from-repo`. That skill *applies* `[PROPOSED]` markers; this one *disposes* of them. Run it in a later session, with fresh eyes — the point of the marker format is that proposing and accepting are separate acts.

---

## Step 1: Inventory the markers

```bash
grep -rn 'PROPOSED' templates/ docs/ | grep -v '.claude/'
```

Report the count per file. If zero, check `git log --grep '^sync: from' -1` — either the sync was never run, or a previous review already cleaned up.

---

## Step 2: Walk the markers, one file at a time

For each file with markers, present every marker to the user as a numbered list: the proposed text, and a one-line recommendation — **accept**, **adapt** (with the suggested change), or **reject** (with why it doesn't generalize). Wait for the user's dispositions before editing, then move to the next file.

Disposition mechanics:

- **Accept a new item/section:** delete the `[PROPOSED from source repo]` marker text or the `<!-- [PROPOSED ...] -->` comment line; keep the content.
- **Accept a revision:** delete the comment line above it *and* the trailing `(was: ...)` parenthetical.
- **Accept a "Why" example pattern:** decide whether to keep it as an example pattern (fine for templates) or it has already been replaced with a real incident.
- **Reject a new item/section:** delete it entirely. If it was a revision, restore the `(was: ...)` text.
- **Reject a new template file:** `git rm` (or delete) the file — then see Step 3.
- **Adapt:** make the agreed edit, then strip the marker.

---

## Step 3: Re-verify cross-file consistency

Rejections can orphan references. After all dispositions:

- If a new template file was rejected: remove its row from README's "What you get" table and its `cp` line from GETTING_STARTED Step 1.
- If a path/convention proposal was rejected (e.g., `docs/audits/`): make sure README, GETTING_STARTED, and the other templates all still agree on the old convention.
- Confirm clean: `grep -rn 'PROPOSED' templates/ docs/ | grep -v '.claude/'` returns nothing.

---

## Step 4: Commit

Two commit-message conventions, both load-bearing:

- **The sync run** commits as `sync: from <source-repo> <YYYY-MM-DD>` — `/sync-from-repo` Step 0 finds the last sync date via `git log --grep '^sync: from' -1`. (Normally already committed before this skill runs.)
- **The review pass** commits as `sync-review: <source-repo> <YYYY-MM-DD> — accepted N/M proposals`. The N/M ratio is a calibration signal: if most proposals get rejected over a few cycles, `/sync-from-repo`'s abstraction rules need tightening — feed the rejection reasons back into that skill's Step 3 table.

---

## Step 5: Per-repo maintenance prompts

After the commit, generate a maintenance prompt for each governed repo that had markers in this sync run. Store each as `downstream/<client>/<repo>/YYYY-MM-DD-maintenance.md` (see `downstream/hopskip/_client.md` for the client/repo directory map).

Each prompt is a self-contained Claude Code instruction — paste it into the target repo and run it. Write it as a direct instruction, not documentation.

**Prompt structure:**

```markdown
# Governance Maintenance — <repo> — <date>

**Client:** <client name>
**Source:** greg/repo-governance sync-review <date>

You are updating this repo's governance to match the latest template improvements from `~/repos/greg/repo-governance`.

## What changed in the templates (this sync-review)
[For each accepted proposal: one sentence on what changed and why it matters]

## What to do in this repo

[Concrete ordered steps. For each:
 - Name the file to edit
 - Say what to add/change (quote the new text or describe precisely)
 - Note any adaptation needed for this repo's stack or conventions]

## Already present — skip
[Artifacts this repo already has that don't need re-applying]

## Not applicable — skip
[Proposals that don't apply to this repo's stack, with one-line reason]
```

**Scoping rules:**
- Tailor each prompt to the repo's *current state* — don't re-propose things the repo already has
- If a proposal touches an artifact the repo doesn't have yet (e.g., no `code-hygiene.md`), include the bootstrap step, not just the delta
- If a repo is early-stage, note what to defer and when to revisit (e.g., "add code-hygiene after the first audit cycle completes")
- If no accepted proposals affect a given repo, skip generating a prompt for it

---

## Notes

- **Don't rubber-stamp.** The sync skill abstracts aggressively, but "generalizes to any repo" is a judgment call only the review can make. The most common rejection reason: the rule encodes the source repo's *scale* (daily audits, label taxonomies) rather than its *lesson*.
- **Rejections are data.** Record recurring rejection patterns in this file or in `/sync-from-repo`'s abstraction table so the next sync proposes better.
- **GTM is out of scope here** — `/sync-from-repo` Step 6 already gates GTM edits behind user feedback, so there are no GTM markers to review.
