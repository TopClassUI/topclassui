// pnpm new:component <name> scaffolds a component folder that already passes pnpm check.
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

console.log(`new-component: wrote ${String(written.size)} files to src/components/${scaffold.slug}`)
console.log('Next: fill in the variants, then run pnpm check.')
