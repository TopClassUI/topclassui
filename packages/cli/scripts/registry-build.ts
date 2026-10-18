// pnpm registry:build writes dist/registry/ from the library's src/; --check only reports what would fail.
// Flags: --library <dir> (default ../topclassui), --out <dir> (default dist).
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { parseArgs } from 'node:util'

import { readLibrary, writeRegistry } from './lib/registry-io.js'
import { buildRegistry } from './lib/registry.js'

const HERE = dirname(fileURLToPath(import.meta.url))
const { values } = parseArgs({
  options: {
    library: { type: 'string', default: join(HERE, '../../topclassui') },
    out: { type: 'string', default: join(HERE, '../dist') },
    check: { type: 'boolean', default: false },
  },
})

const registry = buildRegistry(readLibrary(resolve(values.library)))
for (const error of registry.errors) console.error(`registry: ${error}`)
if (registry.errors.length > 0) process.exit(1)

if (values.check) {
  console.log(`registry: ${String(registry.items.length)} items, ${String(Object.keys(registry.icons).length)} icons, no errors`)
} else {
  const dir = writeRegistry(registry, resolve(values.out))
  console.log(`registry: ${String(registry.items.length)} items and ${String(Object.keys(registry.icons).length)} icons written to ${dir}`)
}
