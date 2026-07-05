/**
 * lint:adr-readme-sync  [governance template — copy to host/scripts/ in the target repo]
 *
 * Every file matching docs/adr/NNN-*.md must have a row in docs/adr/README.md.
 * An unregistered ADR allows the next contributor to reuse the same number —
 * a numbering collision that causes confusion and audit gaps.
 *
 * Check: docs/adr/README.md contains "(NNN-filename.md)" for every NNN-*.md
 * file. The parenthesised filename is the markdown link target, which is unique
 * and unambiguous regardless of what text appears elsewhere in the README.
 *
 * GATE: exits non-zero on any unregistered ADR.
 *
 * Wiring (ai-fleet pattern):
 *   package.json:  "lint:adr-readme-sync": "node scripts/check-adr-readme-sync.mjs"
 *   check script:  && npm run lint:adr-readme-sync --prefix $ROOT/host
 *   CI (run-tests.yml):
 *     - name: ADR README sync check
 *       run: node scripts/check-adr-readme-sync.mjs
 *       working-directory: host
 *
 * For repos without an npm check script (e.g. analytics-infrastructure):
 *   Name this file lint-adr-readme-sync.mjs and add a job to ci.yml.
 *   See analytics-infrastructure/scripts/lint-adr-readme-sync.mjs for the
 *   standalone variant.
 */

import { readdirSync, readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { execSync } from 'child_process';

function repoRoot() {
  try { return execSync('git rev-parse --show-toplevel', { encoding: 'utf8' }).trim(); }
  catch { return process.cwd(); }
}

const ROOT    = repoRoot();
const ADR_DIR = join(ROOT, 'docs', 'adr');
const README  = join(ADR_DIR, 'README.md');

if (!existsSync(ADR_DIR) || !existsSync(README)) {
  console.log('OK — docs/adr/README.md not present; nothing to check.');
  process.exit(0);
}

const readmeContent = readFileSync(README, 'utf8');
let failed = false;

for (const file of readdirSync(ADR_DIR).sort()) {
  if (!/^\d{3}-.*\.md$/.test(file)) continue;

  if (!readmeContent.includes(`(${file})`)) {
    const prefix = file.match(/^(\d{3})/)[1];
    console.error(`ADR-README-SYNC VIOLATION: docs/adr/${file} is not registered in docs/adr/README.md`);
    console.error(`  The file exists but no markdown link "(${file})" was found in the README table.`);
    console.error(`  Add a row before merging:`);
    console.error(`    | [${prefix}](${file}) | <Title> | Proposed |`);
    console.error(`  Ref: governance lint:adr-readme-sync`);
    failed = true;
  }
}

if (failed) process.exit(1);

const count = readdirSync(ADR_DIR).filter(f => /^\d{3}-.*\.md$/.test(f)).length;
console.log(`OK — all ${count} ADR file(s) are registered in docs/adr/README.md.`);
