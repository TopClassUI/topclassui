// R-5.6-4: WCAG contrast of every token pair in every mode.
// A no-op until Phase 1 creates the tokens file, as PLAN.md section 19 specifies.
import { existsSync } from 'node:fs'
import { join } from 'node:path'

const TOKENS = join(process.cwd(), 'src', 'styles', 'tokens.css')

if (!existsSync(TOKENS)) {
  console.log('check-contrast: ok (no tokens file yet; this check arrives in Phase 1)')
  process.exit(0)
}

console.error('check-contrast: tokens.css exists but the check is not implemented yet (Phase 1).')
process.exit(1)
