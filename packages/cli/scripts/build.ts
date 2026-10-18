// pnpm build: the CLI into <out>/cli and the registry into <out>/registry, the layout the bin expects.
// --out defaults to dist; the library's build passes its own dist, so both land in one tarball.
import { spawnSync } from 'node:child_process'
import { chmodSync, rmSync } from 'node:fs'
import { createRequire } from 'node:module'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { parseArgs } from 'node:util'

const HERE = dirname(fileURLToPath(import.meta.url))
const ROOT = join(HERE, '..')
const { values } = parseArgs({
  options: {
    out: { type: 'string', default: join(ROOT, 'dist') },
    library: { type: 'string', default: join(ROOT, '../topclassui') },
  },
})
const out = resolve(values.out)

const run = (args: string[]) => {
  const result = spawnSync(process.execPath, args, { cwd: ROOT, stdio: 'inherit' })
  if (result.status !== 0) process.exit(result.status ?? 1)
}

rmSync(join(out, 'cli'), { recursive: true, force: true })
const tsc = createRequire(join(ROOT, 'package.json')).resolve('typescript/bin/tsc')
run([tsc, '-p', 'tsconfig.build.json', '--outDir', join(out, 'cli')])
chmodSync(join(out, 'cli/index.js'), 0o755)
const tsx = createRequire(join(ROOT, 'package.json')).resolve('tsx/cli')
run([tsx, join(HERE, 'registry-build.ts'), '--library', resolve(values.library), '--out', out])
console.log(`cli: dist/cli and dist/registry written to ${out}`)
