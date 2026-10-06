// pnpm new:component <name> scaffolds a component folder that already passes pnpm check.
import { spawnSync } from 'node:child_process'
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'

import { files, readSlug } from './lib/scaffold.js'

const slug = process.argv[2]

if (!slug) {
  console.error('usage: pnpm new:component <name>   (kebab-case, e.g. icon-button)')
  process.exit(1)
}

let scaffold
try {
  scaffold = readSlug(slug)
} catch (error) {
  console.error(`new-component: ${error instanceof Error ? error.message : String(error)}`)
  process.exit(1)
}

const folder = join(process.cwd(), 'src', 'components', scaffold.slug)

if (existsSync(folder)) {
  console.error(`new-component: src/components/${scaffold.slug} already exists; nothing was written`)
  process.exit(1)
}

const written = files(scaffold)
for (const [rel, content] of written) {
  const file = join(folder, rel)
  mkdirSync(dirname(file), { recursive: true })
  writeFileSync(file, content, { encoding: 'utf8' })
}

// README.md is generated, not scaffolded, and check-structure requires it, so the
// folder would fail its own gate without this (Phase 3 asks the scaffold to pass clean).
const readme = spawnSync('node', [join(process.cwd(), 'node_modules/tsx/dist/cli.mjs'), 'scripts/readme-build.ts'], {
  cwd: process.cwd(),
  encoding: 'utf8',
})
if (readme.status !== 0) {
  console.error(`new-component: readme:build failed\n${readme.stderr}`)
  process.exit(1)
}

console.log(`new-component: wrote ${String(written.size + 1)} files to src/components/${scaffold.slug}`)
console.log('Next: fill in the variants, then run pnpm check.')
