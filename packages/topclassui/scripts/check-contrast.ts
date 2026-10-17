// R-5.6-4: contrast for every token pair in every mode. The checks live in
// lib/contrast-checks.ts so the tests can measure without spawning this script.
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

import { checkTokens, MODES } from './lib/contrast-checks.js'
import { readPalette } from './lib/tokens.js'

const TOKENS = join(process.cwd(), 'src', 'tokens.css')

if (!existsSync(TOKENS)) {
  console.log('check-contrast: ok (no tokens file yet)')
  process.exit(0)
}

const { failures, pairs, distinct } = checkTokens(readFileSync(TOKENS, 'utf8'), readPalette())

for (const f of failures) console.error(`error ${f}`)

if (failures.length) {
  console.error(`\ncheck-contrast: ${String(failures.length)} failure${failures.length === 1 ? '' : 's'}.`)
  process.exit(1)
}
console.log(`check-contrast: ok (${String(MODES.length)} modes, ${String(pairs)} pairs, ${String(distinct)} distinct colour readings)`)
