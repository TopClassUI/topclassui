// pnpm check:pack - packs with pnpm (which applies publishConfig) and holds the tarball to the rules of the release plan.
import { spawnSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync } from 'node:fs'
import { basename, isAbsolute, join } from 'node:path'

import { manifestProblems, pathProblems, sizeProblems, specifierProblems } from './lib/pack-checks.js'
import { readTarball } from './lib/tar.js'
import { pnpmCommand } from './lib/tools.js'

const ROOT = process.cwd()
const PACK_DIR = join(ROOT, '.pack')

if (!existsSync(join(ROOT, 'dist'))) {
  console.error('check-pack: dist/ is missing. Run pnpm build first.')
  process.exit(1)
}

mkdirSync(PACK_DIR, { recursive: true })
const pnpm = pnpmCommand(process.env, process.execPath, ['pack', '--pack-destination', PACK_DIR, '--json'])
const packed = spawnSync(pnpm.command, pnpm.args, { cwd: ROOT, encoding: 'utf8', maxBuffer: 1 << 26 })
if (packed.status !== 0) {
  console.error(packed.stdout, packed.stderr)
  console.error('check-pack: pnpm pack failed.')
  process.exit(1)
}

// pnpm prints the manifest's JSON last; an earlier line may be a warning.
const json = packed.stdout.slice(packed.stdout.indexOf('{'))
// With --pack-destination, pnpm 10.28.2 prints the tarball's full path as `filename`.
const { filename } = JSON.parse(json) as { filename: string }
const tarball = isAbsolute(filename) ? filename : join(PACK_DIR, filename)
const name = basename(tarball)

const files = readTarball(readFileSync(tarball))
const paths = [...files.keys()].map((path) => path.replace(/^package\//, ''))
const unpacked = [...files.values()].reduce((sum, body) => sum + body.length, 0)
const manifestBody = files.get('package/package.json')
const manifest = manifestBody === undefined ? {} : JSON.parse(manifestBody.toString('utf8')) as Record<string, unknown>

const problems = [
  ...(manifestBody === undefined ? ['package.json: missing from the tarball'] : []),
  ...pathProblems(paths),
  ...[...files.entries()]
    .filter(([path]) => path.endsWith('.js') || path.endsWith('.d.ts'))
    .flatMap(([path, body]) => specifierProblems(path.replace(/^package\//, ''), body.toString('utf8'))),
  ...manifestProblems(manifest, paths),
  ...sizeProblems(unpacked),
]

if (problems.length > 0) {
  for (const problem of problems) console.error(`error ${problem}`)
  console.error(`\ncheck-pack: ${String(problems.length)} problem(s) in ${name}.`)
  process.exit(1)
}

console.log(`check-pack: ${name}, ${String(paths.length)} files, ${String(unpacked)} bytes unpacked, within the rules.`)
