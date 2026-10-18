// pnpm check:package - the build, check-pack, attw and publint in order, each a spawn with an argument array and no shell.
import { spawnSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

import { componentSlugs, entrypoints } from './lib/entrypoints.js'
import { type Command, binOf, pnpmCommand } from './lib/tools.js'

const ROOT = process.cwd()
const manifest = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8')) as {
  name: string
  version: string
  scripts?: Record<string, string>
}

function run(label: string, { command, args }: Command): void {
  console.log(`\ncheck-package: ${label}`)
  const result = spawnSync(command, args, { cwd: ROOT, stdio: 'inherit' })
  if (result.status !== 0) {
    console.error(`\ncheck-package: ${label} failed${result.error ? ` (${result.error.message})` : ''}.`)
    process.exit(result.status ?? 1)
  }
}

const node = process.execPath
const tsx = join(ROOT, 'node_modules', 'tsx', 'dist', 'cli.mjs')

// The build lands with the feat/build step; until the two are stacked there is no dist to check.
if (manifest.scripts?.['build'] === undefined) {
  console.log('check-package: skipped. package.json has no build script yet, so there is no dist to pack;')
  console.log('check-package: once the build step is merged, this runs the build, check-pack, attw and publint.')
  process.exit(0)
}

run('pnpm build', pnpmCommand(process.env, node, ['build']))
if (!existsSync(join(ROOT, 'dist'))) {
  console.error('check-package: pnpm build wrote no dist/.')
  process.exit(1)
}

run('check-pack', { command: node, args: [tsx, join(ROOT, 'scripts', 'check-pack.ts')] })

const tarball = join(ROOT, '.pack', `${manifest.name}-${manifest.version}.tgz`)
if (!existsSync(tarball)) {
  console.error(`check-package: expected ${tarball} after check-pack.`)
  process.exit(1)
}

// attw reads the pnpm tarball, never --pack: that would pack with npm and ignore publishConfig.
run('attw', {
  command: node,
  args: [
    binOf(ROOT, '@arethetypeswrong/cli', 'attw'), tarball,
    '--profile', 'esm-only',
    '--exclude-entrypoints', './styles.css', './tokens.css',
    '--include-entrypoints', ...entrypoints(componentSlugs(ROOT)),
  ],
})

// publint 0.3.25: `publint run <tarball>` lints the packed file itself; --pack is for a directory.
run('publint', { command: node, args: [binOf(ROOT, 'publint', 'publint'), 'run', tarball, '--strict'] })

console.log('\ncheck-package: the build, the tarball, attw and publint all pass.')
